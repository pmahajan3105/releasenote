import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { listLinearTeams } from '@/lib/integrations/linear-sdk'
import {
  getLinearAccessToken,
  isLinearIntegrationRecord,
  parseBooleanParam,
  parseIntegerParam,
  transformLinearTeam,
} from '@/lib/integrations/linear-route-helpers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeArchived = parseBooleanParam(searchParams.get('includeArchived'), false)
    const first = parseIntegerParam(searchParams.get('first'), 50, { min: 1, max: 100 })

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
      const teams = await listLinearTeams(accessToken, { first, includeArchived })

      const transformedTeams = teams.nodes.map((team) => transformLinearTeam(team))

      return NextResponse.json({
        teams: transformedTeams,
        pagination: teams.pageInfo
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
