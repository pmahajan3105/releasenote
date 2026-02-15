import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { linearAPI } from '@/lib/integrations/linear-client'
import {
  getLinearAccessToken,
  getLinearOrganizationName,
  isLinearIntegrationRecord,
  normalizeLinearIssuesResponse,
  normalizeLinearProjectsResponse,
  normalizeLinearTeamsResponse,
  normalizeLinearViewer,
  summarizeLinearIssue,
  summarizeLinearProject,
  summarizeLinearTeam,
} from '@/lib/integrations/linear-route-helpers'

export async function POST(_request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get Linear integration
    const { data, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('organization_id', session.user.id)
      .eq('type', 'linear')
      .single()

    if (integrationError || !isLinearIntegrationRecord(data)) {
      return NextResponse.json({
        success: false,
        error: 'Linear integration not found',
        tests: []
      }, { status: 404 })
    }
    const accessToken = getLinearAccessToken(data)
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'Linear access token not found',
        tests: []
      }, { status: 400 })
    }

    const tests = []
    let overallSuccess = true

    // Test 1: Basic Authentication & User Info
    try {
      const connectionTest = await linearAPI.testConnection(accessToken)
      const viewer = normalizeLinearViewer(connectionTest.user)
      
      if (connectionTest.success) {
        tests.push({
          name: 'Authentication & User Info',
          status: 'passed',
          message: `Successfully authenticated as ${viewer.displayName || viewer.name || 'Unknown User'}`,
          details: {
            user: {
              id: viewer.id,
              name: viewer.name,
              displayName: viewer.displayName,
              email: viewer.email
            },
            organization: viewer.organization ?? null
          }
        })
      } else {
        overallSuccess = false
        tests.push({
          name: 'Authentication & User Info',
          status: 'failed',
          message: connectionTest.error || 'Authentication failed',
          error: 'Invalid or expired access token'
        })
      }
    } catch (error) {
      overallSuccess = false
      tests.push({
        name: 'Authentication & User Info',
        status: 'failed',
        message: 'Network error during authentication test',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 2: Teams Access
    if (overallSuccess) {
      try {
        const teamsResponse = await linearAPI.getTeams(accessToken, {
          first: 10
        })
        const teams = normalizeLinearTeamsResponse(teamsResponse)

        tests.push({
          name: 'Teams Access',
          status: 'passed',
          message: `Successfully accessed teams. Found ${teams.nodes?.length || 0} teams`,
          details: {
            totalTeams: teams.nodes?.length || 0,
            sampleTeams: teams.nodes?.slice(0, 3).map((team) => summarizeLinearTeam(team)) || []
          }
        })
      } catch (error) {
        tests.push({
          name: 'Teams Access',
          status: 'warning',
          message: 'Limited teams access or no teams found',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Test 3: Issues Access
    if (overallSuccess) {
      try {
        const issuesResponse = await linearAPI.getIssues(accessToken, {
          first: 10,
          orderBy: 'updatedAt'
        })
        const issues = normalizeLinearIssuesResponse(issuesResponse)

        tests.push({
          name: 'Issues Access',
          status: 'passed',
          message: `Successfully accessed issues. Found ${issues.nodes?.length || 0} recent issues`,
          details: {
            sampleIssues: issues.nodes?.slice(0, 3).map((issue) => summarizeLinearIssue(issue)) || []
          }
        })
      } catch (error) {
        tests.push({
          name: 'Issues Access',
          status: 'warning',
          message: 'Issues access capabilities limited',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Test 4: Projects Access
    if (overallSuccess) {
      try {
        const projectsResponse = await linearAPI.getProjects(accessToken, {
          first: 10
        })
        const projects = normalizeLinearProjectsResponse(projectsResponse)

        tests.push({
          name: 'Projects Access',
          status: 'passed',
          message: `Successfully retrieved ${projects.nodes?.length || 0} projects`,
          details: {
            sampleProjects: projects.nodes?.slice(0, 3).map((project) => summarizeLinearProject(project)) || []
          }
        })
      } catch (error) {
        tests.push({
          name: 'Projects Access',
          status: 'info',
          message: 'Project metadata not accessible',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Test 5: GraphQL API Performance
    const apiTests = [
      { name: 'User Query', method: 'getViewer' },
      { name: 'Teams Query', method: 'getTeams' },
      { name: 'Issues Query', method: 'getIssues' }
    ]

    for (const apiTest of apiTests) {
      if (overallSuccess) {
        try {
          const startTime = Date.now()
          
          switch (apiTest.method) {
            case 'getViewer':
              await linearAPI.getViewer(accessToken)
              break
            case 'getTeams':
              await linearAPI.getTeams(accessToken, { first: 1 })
              break
            case 'getIssues':
              await linearAPI.getIssues(accessToken, { first: 1 })
              break
          }
          
          const responseTime = Date.now() - startTime

          tests.push({
            name: `${apiTest.name} Performance`,
            status: responseTime < 2000 ? 'passed' : 'warning',
            message: `${apiTest.name} completed in ${responseTime}ms`,
            responseTime: `${responseTime}ms`
          })
        } catch (error) {
          tests.push({
            name: `${apiTest.name} Performance`,
            status: 'warning',
            message: `${apiTest.name} performance issues`,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
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
        type: 'linear',
        connected_at: data.created_at,
        organization: getLinearOrganizationName(data.metadata)
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
    console.error('Linear connection test error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      tests: []
    }, { status: 500 })
  }
}
