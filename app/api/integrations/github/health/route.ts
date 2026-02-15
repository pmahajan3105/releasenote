import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import {
  buildGitHubHeaders,
  getGitHubAccessToken,
  isGitHubIntegrationRecord,
} from '@/lib/integrations/github-route-helpers'
import { parseIntegerParam } from '@/lib/integrations/route-utils'

type GitHubHealthStatus = 'healthy' | 'warning' | 'error'
type GitHubHealthIssueType = 'error' | 'warning' | 'info'

interface GitHubHealthIssue {
  type: GitHubHealthIssueType
  message: string
  solution?: string
  docs?: string
}

interface GitHubHealthResponse {
  status: GitHubHealthStatus
  lastChecked: string
  responseTime: number
  details: {
    connection: boolean
    authentication: boolean
    permissions: boolean
    rateLimit: {
      remaining: number
      limit: number
      resetAt: string
    }
  }
  metrics: {
    totalRequests: number
    successRate: number
    avgResponseTime: number
  }
  issues: GitHubHealthIssue[]
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { integrationId } = await request.json()

    // Get GitHub integration
    const { data, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', integrationId || 'github')
      .eq('organization_id', session.user.id)
      .eq('type', 'github')
      .single()

    if (integrationError || !isGitHubIntegrationRecord(data)) {
      return NextResponse.json({
        status: 'error',
        lastChecked: new Date().toISOString(),
        details: {
          connection: false,
          authentication: false,
          permissions: false
        },
        issues: [{
          type: 'error',
          message: 'GitHub integration not found or not configured',
          solution: 'Please connect your GitHub account in the integrations page',
          docs: 'https://docs.github.com/en/developers/apps'
        }]
      })
    }

    const accessToken = getGitHubAccessToken(data)
    if (!accessToken) {
      return NextResponse.json({
        status: 'error',
        lastChecked: new Date().toISOString(),
        details: {
          connection: false,
          authentication: false,
          permissions: false
        },
        issues: [{
          type: 'error',
          message: 'GitHub access token not found',
          solution: 'Please reconnect your GitHub account to refresh the access token'
        }]
      }, { status: 400 })
    }

    const startTime = Date.now()
    const headers = buildGitHubHeaders(accessToken)
    const health: GitHubHealthResponse = {
      status: 'healthy',
      lastChecked: new Date().toISOString(),
      responseTime: 0,
      details: {
        connection: true,
        authentication: true,
        permissions: true,
        rateLimit: {
          remaining: 5000,
          limit: 5000,
          resetAt: new Date(Date.now() + 3600000).toISOString()
        }
      },
      metrics: {
        totalRequests: 0,
        successRate: 100,
        avgResponseTime: 0
      },
      issues: []
    }

    try {
      // Test GitHub API connection
      const githubResponse = await fetch('https://api.github.com/user', { headers })

      health.responseTime = Date.now() - startTime

      if (!githubResponse.ok) {
        health.status = 'error'
        health.details.authentication = false
        
        if (githubResponse.status === 401) {
          health.issues.push({
            type: 'error',
            message: 'GitHub authentication token has expired or is invalid',
            solution: 'Please reconnect your GitHub account to refresh the access token',
            docs: 'https://docs.github.com/en/authentication'
          })
        } else {
          health.issues.push({
            type: 'error',
            message: `GitHub API returned ${githubResponse.status}: ${githubResponse.statusText}`,
            solution: 'Check GitHub API status and try again later'
          })
        }
      } else {
        // Check rate limits
        const rateLimitRemaining = parseIntegerParam(githubResponse.headers.get('x-ratelimit-remaining'), 0, { min: 0 })
        const rateLimitLimit = parseIntegerParam(githubResponse.headers.get('x-ratelimit-limit'), 5000, { min: 0 })
        const rateLimitReset = parseIntegerParam(githubResponse.headers.get('x-ratelimit-reset'), 0, { min: 0 })

        health.details.rateLimit = {
          remaining: rateLimitRemaining,
          limit: rateLimitLimit,
          resetAt: new Date(rateLimitReset * 1000).toISOString()
        }

        // Rate limit warnings
        const usagePercent =
          rateLimitLimit > 0 ? ((rateLimitLimit - rateLimitRemaining) / rateLimitLimit) * 100 : 100
        if (usagePercent > 90) {
          health.status = 'warning'
          health.issues.push({
            type: 'warning',
            message: 'GitHub API rate limit is almost exhausted',
            solution: 'Consider reducing API calls or wait for rate limit reset',
            docs: 'https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting'
          })
        } else if (usagePercent > 75) {
          health.issues.push({
            type: 'info',
            message: 'GitHub API rate limit usage is high',
            solution: 'Monitor API usage to avoid hitting rate limits'
          })
        }

        // Test repository access
        try {
          const reposResponse = await fetch('https://api.github.com/user/repos?per_page=1', {
            headers
          })

          if (!reposResponse.ok) {
            health.status = 'warning'
            health.details.permissions = false
            health.issues.push({
              type: 'warning',
              message: 'Limited access to repositories',
              solution: 'Check GitHub token permissions for repository access',
              docs: 'https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps'
            })
          }
        } catch {
          health.issues.push({
            type: 'info',
            message: 'Unable to test repository permissions',
            solution: 'This may not affect basic functionality'
          })
        }

        // Performance metrics (mock data for now)
        health.metrics = {
          totalRequests: Math.floor(Math.random() * 1000) + 100,
          successRate: Math.random() * 10 + 90, // 90-100%
          avgResponseTime: health.responseTime
        }
      }

    } catch {
      health.status = 'error'
      health.details.connection = false
      health.issues.push({
        type: 'error',
        message: 'Unable to connect to GitHub API',
        solution: 'Check your internet connection and GitHub API status',
        docs: 'https://www.githubstatus.com/'
      })
    }

    return NextResponse.json(health)

  } catch (error) {
    console.error('GitHub health check error:', error)
    
    return NextResponse.json({
      status: 'error',
      lastChecked: new Date().toISOString(),
      details: {
        connection: false,
        authentication: false,
        permissions: false
      },
      issues: [{
        type: 'error',
        message: 'Health check failed due to internal error',
        solution: 'Please try again or contact support if the issue persists'
      }]
    }, { status: 500 })
  }
}
