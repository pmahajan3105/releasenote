import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import {
  buildGitHubHeaders,
  getGitHubAccessToken,
  isGitHubIntegrationRecord,
} from '@/lib/integrations/github-route-helpers'

interface GitHubRepoSummary {
  name?: string
  private?: boolean
  permissions?: Record<string, unknown>
  full_name?: string
}

interface GitHubRateLimitResponse {
  resources: {
    core: {
      remaining: number
      limit: number
    }
    search?: Record<string, unknown>
    graphql?: Record<string, unknown>
  }
}

export async function POST(_request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get GitHub integration
    const { data, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('organization_id', session.user.id)
      .eq('type', 'github')
      .single()

    if (integrationError || !isGitHubIntegrationRecord(data)) {
      return NextResponse.json({
        success: false,
        error: 'GitHub integration not found',
        tests: []
      }, { status: 404 })
    }

    const accessToken = getGitHubAccessToken(data)
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'GitHub access token not found',
        tests: []
      }, { status: 400 })
    }

    const tests = []
    let overallSuccess = true
    const headers = buildGitHubHeaders(accessToken)

    // Test 1: Basic Authentication
    try {
      const userResponse = await fetch('https://api.github.com/user', { headers })

      if (userResponse.ok) {
        const userData = await userResponse.json()
        tests.push({
          name: 'Authentication',
          status: 'passed',
          message: `Successfully authenticated as ${userData.login}`,
          responseTime: userResponse.headers.get('x-response-time') || 'N/A'
        })
      } else {
        overallSuccess = false
        tests.push({
          name: 'Authentication',
          status: 'failed',
          message: `Authentication failed: ${userResponse.status} ${userResponse.statusText}`,
          error: 'Invalid or expired access token'
        })
      }
    } catch (error) {
      overallSuccess = false
      tests.push({
        name: 'Authentication',
        status: 'failed',
        message: 'Network error during authentication test',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 2: Repository Access
    try {
      const reposResponse = await fetch('https://api.github.com/user/repos?per_page=5&sort=updated', { headers })

      if (reposResponse.ok) {
        const repos = await reposResponse.json() as GitHubRepoSummary[]
        tests.push({
          name: 'Repository Access',
          status: 'passed',
          message: `Successfully accessed repositories (${repos.length} found)`,
          details: repos.map((repo) => ({
            name: repo.name,
            private: repo.private,
            permissions: repo.permissions
          }))
        })
      } else {
        tests.push({
          name: 'Repository Access',
          status: 'warning',
          message: `Limited repository access: ${reposResponse.status}`,
          error: 'May need additional permissions'
        })
      }
    } catch (error) {
      tests.push({
        name: 'Repository Access',
        status: 'failed',
        message: 'Failed to test repository access',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 3: Rate Limits
    try {
      const rateLimitResponse = await fetch('https://api.github.com/rate_limit', { headers })

      if (rateLimitResponse.ok) {
        const rateLimitData = await rateLimitResponse.json() as GitHubRateLimitResponse
        const coreLimit = rateLimitData.resources.core
        const remaining = coreLimit.remaining
        const limit = coreLimit.limit
        
        let status = 'passed'
        let message = `Rate limit: ${remaining}/${limit} remaining`
        
        if (remaining < limit * 0.1) {
          status = 'warning'
          message += ' (Very low remaining requests)'
        } else if (remaining < limit * 0.25) {
          status = 'warning'
          message += ' (Low remaining requests)'
        }

        tests.push({
          name: 'Rate Limits',
          status,
          message,
          details: {
            core: coreLimit,
            search: rateLimitData.resources.search,
            graphql: rateLimitData.resources.graphql
          }
        })
      } else {
        tests.push({
          name: 'Rate Limits',
          status: 'warning',
          message: 'Unable to check rate limits',
          error: 'Rate limit endpoint not accessible'
        })
      }
    } catch (error) {
      tests.push({
        name: 'Rate Limits',
        status: 'failed',
        message: 'Failed to check rate limits',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 4: Webhook Capability (if configured)
    try {
      const hooksResponse = await fetch('https://api.github.com/user/repos?per_page=1', { headers })

      if (hooksResponse.ok) {
        const repos = await hooksResponse.json() as GitHubRepoSummary[]
        if (repos.length > 0) {
          const testRepo = repos[0]
          const webhooksResponse = await fetch(`https://api.github.com/repos/${testRepo.full_name}/hooks`, { headers })

          if (webhooksResponse.ok) {
            tests.push({
              name: 'Webhook Access',
              status: 'passed',
              message: 'Can access webhook configuration',
              details: { testedRepo: testRepo.full_name }
            })
          } else {
            tests.push({
              name: 'Webhook Access',
              status: 'warning',
              message: 'Limited webhook access - may need admin permissions',
              details: { testedRepo: testRepo.full_name }
            })
          }
        }
      }
    } catch {
      tests.push({
        name: 'Webhook Access',
        status: 'info',
        message: 'Webhook test skipped',
        error: 'No repositories available for testing'
      })
    }

    // Test 5: API Endpoints Used by Release Notes
    const endpoints = [
      { url: 'https://api.github.com/user/repos', name: 'Repositories' },
      { url: 'https://api.github.com/search/repositories?q=user:test&per_page=1', name: 'Search' }
    ]

    for (const endpoint of endpoints) {
      try {
        const endpointResponse = await fetch(endpoint.url, {
          headers
        })

        tests.push({
          name: `${endpoint.name} API`,
          status: endpointResponse.ok ? 'passed' : 'warning',
          message: endpointResponse.ok 
            ? `${endpoint.name} API accessible`
            : `${endpoint.name} API returned ${endpointResponse.status}`,
          responseTime: endpointResponse.headers.get('x-response-time') || 'N/A'
        })
      } catch (error) {
        tests.push({
          name: `${endpoint.name} API`,
          status: 'failed',
          message: `Failed to test ${endpoint.name} API`,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Update integration test timestamp
    await supabase
      .from('integrations')
      .update({ 
        updated_at: new Date().toISOString(),
        last_test_at: new Date().toISOString()
      })
      .eq('id', data.id)

    return NextResponse.json({
      success: overallSuccess,
      timestamp: new Date().toISOString(),
      integration: {
        id: data.id,
        type: 'github',
        connected_at: data.created_at
      },
      tests,
      summary: {
        total: tests.length,
        passed: tests.filter(t => t.status === 'passed').length,
        warnings: tests.filter(t => t.status === 'warning').length,
        failed: tests.filter(t => t.status === 'failed').length
      }
    })

  } catch (error) {
    console.error('GitHub connection test error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      tests: []
    }, { status: 500 })
  }
}
