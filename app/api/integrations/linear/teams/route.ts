import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { linearAPI } from '@/lib/integrations/linear-client'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeArchived = searchParams.get('includeArchived') === 'true'
    const first = parseInt(searchParams.get('first') || '50')

    // Get Linear integration
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('organization_id', session.user.id)
      .eq('type', 'linear')
      .single()

    if (integrationError || !integration) {
      return NextResponse.json({ error: 'Linear integration not found' }, { status: 404 })
    }

    try {
      const teams = await linearAPI.getTeams(integration.access_token, {
        first,
        includeArchived
      })

      // Transform teams for frontend consumption
      const transformedTeams = teams.nodes?.map((team: any) => ({
        id: team.id,
        name: team.name,
        key: team.key,
        description: team.description,
        color: team.color,
        icon: team.icon,
        private: team.private,
        issueCount: team.issueCount,
        activeCycleCount: team.activeCycleCount,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
        organization: team.organization
      })) || []

      return NextResponse.json({
        teams: transformedTeams,
        pagination: {
          hasNextPage: teams.pageInfo?.hasNextPage || false,
          hasPreviousPage: teams.pageInfo?.hasPreviousPage || false,
          startCursor: teams.pageInfo?.startCursor,
          endCursor: teams.pageInfo?.endCursor
        }
      })

    } catch (error) {
      console.error('Error fetching Linear teams:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch teams',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Linear teams API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}