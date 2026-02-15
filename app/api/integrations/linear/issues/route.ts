import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { linearAPI } from '@/lib/integrations/linear-client'
import {
  getLinearAccessToken,
  isLinearIntegrationRecord,
  normalizeLinearIssuesResponse,
  parseIntegerParam,
  parseLinearStateType,
  transformLinearIssue,
} from '@/lib/integrations/linear-route-helpers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('teamId')
    const assigneeId = searchParams.get('assigneeId')
    const stateType = parseLinearStateType(searchParams.get('stateType'))
    const updatedSince = searchParams.get('updatedSince')
    const first = parseIntegerParam(searchParams.get('first'), 50, { min: 1, max: 100 })
    const after = searchParams.get('after') || undefined

    // Get Linear integration
    const { data, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('organization_id', session.user.id)
      .eq('type', 'linear')
      .single()

    if (integrationError || !isLinearIntegrationRecord(data)) {
      return NextResponse.json({ error: 'Linear integration not found' }, { status: 404 })
    }
    const accessToken = getLinearAccessToken(data)
    if (!accessToken) {
      return NextResponse.json({ error: 'Linear access token not found' }, { status: 400 })
    }

    try {
      const issuesResponse = await linearAPI.getIssues(accessToken, {
        first,
        after,
        teamId: teamId || undefined,
        assigneeId: assigneeId || undefined,
        stateType,
        updatedSince: updatedSince || undefined
      })
      const issues = normalizeLinearIssuesResponse(issuesResponse)

      const transformedIssues = issues.nodes.map((issue) => transformLinearIssue(issue))

      // Cache the issues in our ticket_cache table
      if (transformedIssues.length > 0) {
        const cachePromises = transformedIssues.map(issue => 
          supabase
            .from('ticket_cache')
            .upsert({
              organization_id: session.user.id,
              integration_type: 'linear',
              ticket_id: issue.identifier,
              title: issue.title,
              description: issue.description,
              status: issue.state?.name || 'Unknown',
              assignee: issue.assignee?.displayName || null,
              created_at: issue.createdAt,
              updated_at: issue.updatedAt,
              metadata: {
                priority: issue.priority,
                estimate: issue.estimate,
                state: issue.state,
                team: issue.team,
                labels: issue.labels,
                project: issue.project,
                url: issue.url,
                completed_at: issue.completedAt,
                canceled_at: issue.canceledAt
              },
              cached_at: new Date().toISOString()
            }, {
              onConflict: 'organization_id,integration_type,ticket_id'
            })
        )

        // Execute cache updates in parallel
        await Promise.allSettled(cachePromises)
      }

      return NextResponse.json({
        issues: transformedIssues,
        pagination: issues.pageInfo
      })

    } catch (error) {
      console.error('Error fetching Linear issues:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch issues',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Linear issues API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
