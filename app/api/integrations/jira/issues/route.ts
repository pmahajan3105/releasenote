import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { jiraAPI } from '@/lib/integrations/jira-client'
import type { Database } from '@/types/database'
import type { ChangeItem } from '@/lib/integrations/change-item'
import { cacheChangeItems } from '@/lib/integrations/ticket-cache'
import {
  getJiraAccessToken,
  isJiraIntegrationRecord,
  parseJiraIntegrationConfig,
  parseCsvParam,
  parseIntegerParam,
  resolveJiraSite,
  transformJiraIssue,
} from '@/lib/integrations/jira-route-helpers'

const DEFAULT_MAX_RESULTS = 50
const MAX_ALLOWED_RESULTS = 100

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')
    const projectKey = searchParams.get('projectKey')
    const jql = searchParams.get('jql')
    const maxResults = parseIntegerParam(searchParams.get('maxResults'), DEFAULT_MAX_RESULTS, {
      min: 1,
      max: MAX_ALLOWED_RESULTS,
    })
    const startAt = parseIntegerParam(searchParams.get('startAt'), 0, { min: 0 })
    const issueTypes = parseCsvParam(searchParams.get('issueTypes'))
    const statuses = parseCsvParam(searchParams.get('statuses'))
    const updatedSince = searchParams.get('updatedSince') ?? undefined

    // Get Jira integration
    const { data, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('organization_id', session.user.id)
      .eq('type', 'jira')
      .single()

    if (integrationError || !isJiraIntegrationRecord(data)) {
      return NextResponse.json({ error: 'Jira integration not found' }, { status: 404 })
    }
    const integration = data
    const accessToken = getJiraAccessToken(integration)
    if (!accessToken) {
      return NextResponse.json({ error: 'Jira access token not found' }, { status: 400 })
    }

    const { resources, preferredSiteId } = parseJiraIntegrationConfig(integration.config ?? integration.metadata)
    const selectedSite = resolveJiraSite(resources, siteId ?? preferredSiteId)
    if (!selectedSite) {
      return NextResponse.json({ error: 'No Jira site available' }, { status: 400 })
    }

    try {
      let issues

      if (jql) {
        // Use custom JQL query
        issues = await jiraAPI.searchIssues(accessToken, selectedSite.id, {
          jql,
          startAt,
          maxResults,
          fields: ['summary', 'status', 'assignee', 'created', 'updated', 'description', 'issuetype', 'priority', 'fixVersions', 'labels'],
          expand: ['changelog']
        })
      } else if (projectKey) {
        // Search by project with optional filters
        issues = await jiraAPI.getProjectIssues(accessToken, selectedSite.id, projectKey, {
          issueTypes,
          statuses,
          updatedSince,
          maxResults,
          startAt
        })
      } else {
        // Default search for recent issues
        const defaultJql = updatedSince 
          ? `updated >= "${updatedSince}" ORDER BY updated DESC`
          : 'updated >= -30d ORDER BY updated DESC'
          
        issues = await jiraAPI.searchIssues(accessToken, selectedSite.id, {
          jql: defaultJql,
          startAt,
          maxResults,
          fields: ['summary', 'status', 'assignee', 'created', 'updated', 'description', 'issuetype', 'priority', 'fixVersions', 'labels'],
          expand: ['changelog']
        })
      }

      const transformedIssues = issues.issues.map((issue) => transformJiraIssue(issue, selectedSite))

      const changeItems: ChangeItem[] = transformedIssues.map((issue) => ({
        provider: 'jira',
        externalId: issue.key,
        type: 'issue',
        title: issue.summary,
        description: issue.description,
        status: issue.status.name,
        url: issue.url,
        assignee: issue.assignee?.displayName ?? null,
        labels: issue.labels,
        createdAt: issue.created,
        updatedAt: issue.updated,
        raw: {
          issueType: issue.issueType,
          priority: issue.priority,
          fixVersions: issue.fixVersions,
          changelog: issue.changelog,
        },
      }))

      await cacheChangeItems(supabase, session.user.id, changeItems)

      return NextResponse.json({
        issues: transformedIssues,
        pagination: {
          startAt: issues.startAt || 0,
          maxResults: issues.maxResults || maxResults,
          total: issues.total || 0
        },
        site: {
          id: selectedSite.id,
          name: selectedSite.name || 'Unknown Site'
        }
      })

    } catch (error) {
      console.error('Error fetching Jira issues:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch issues',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Jira issues API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
