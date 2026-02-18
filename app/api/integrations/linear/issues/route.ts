import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { listLinearIssues } from '@/lib/integrations/linear-sdk'
import type { Database } from '@/types/database'
import type { ChangeItem } from '@/lib/integrations/change-item'
import { cacheChangeItems } from '@/lib/integrations/ticket-cache'
import {
  getLinearAccessToken,
  isLinearIntegrationRecord,
  parseIntegerParam,
  parseLinearStateType,
  transformLinearIssue,
} from '@/lib/integrations/linear-route-helpers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
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
      const issues = await listLinearIssues(accessToken, {
        first,
        after,
        teamId: teamId || undefined,
        assigneeId: assigneeId || undefined,
        stateType,
        updatedSince: updatedSince || undefined
      })

      const transformedIssues = issues.nodes.map((issue) => transformLinearIssue(issue))

      const changeItems: ChangeItem[] = transformedIssues.map((issue) => ({
        provider: 'linear',
        externalId: issue.identifier,
        type: 'issue',
        title: issue.title,
        description: issue.description,
        status: issue.state?.name ?? 'Unknown',
        url: issue.url ?? null,
        assignee: issue.assignee?.displayName ?? null,
        labels: (issue.labels ?? []).map((label) => label.name).filter((label): label is string => Boolean(label)),
        createdAt: issue.createdAt ?? null,
        updatedAt: issue.updatedAt ?? null,
        raw: {
          priority: issue.priority,
          estimate: issue.estimate,
          state: issue.state,
          team: issue.team,
          labels: issue.labels,
          project: issue.project,
          completedAt: issue.completedAt,
          canceledAt: issue.canceledAt,
        },
      }))

      await cacheChangeItems(supabase, session.user.id, changeItems)

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
