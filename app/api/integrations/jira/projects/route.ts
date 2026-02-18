import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { jiraJsGetProjects } from '@/lib/integrations/jira-js'
import {
  getJiraAccessToken,
  isJiraIntegrationRecord,
  parseJiraIntegrationConfig,
  parseIntegerParam,
  resolveJiraSite,
  transformJiraProject,
} from '@/lib/integrations/jira-route-helpers'

const DEFAULT_MAX_RESULTS = 50
const MAX_ALLOWED_RESULTS = 100

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')
    const maxResults = parseIntegerParam(searchParams.get('maxResults'), DEFAULT_MAX_RESULTS, {
      min: 1,
      max: MAX_ALLOWED_RESULTS,
    })
    const startAt = parseIntegerParam(searchParams.get('startAt'), 0, { min: 0 })

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

    // Determine which site to use
    const selectedSite = resolveJiraSite(resources, siteId ?? preferredSiteId)
    if (!selectedSite) {
      return NextResponse.json({ error: 'No Jira site available' }, { status: 400 })
    }

    try {
      const projects = await jiraJsGetProjects(accessToken, selectedSite.id, {
        maxResults,
        startAt,
        expand: ['description', 'lead', 'issueTypes', 'url', 'projectKeys']
      })

      const transformedProjects = projects.values.map(transformJiraProject)

      return NextResponse.json({
        projects: transformedProjects,
        pagination: {
          startAt: projects.startAt || 0,
          maxResults: projects.maxResults || maxResults,
          total: projects.total || 0,
          isLast: projects.isLast || false
        },
        site: {
          id: selectedSite.id,
          name: selectedSite.name || 'Unknown Site'
        }
      })

    } catch (error) {
      console.error('Error fetching Jira projects:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch projects',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Jira projects API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
