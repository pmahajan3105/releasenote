import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { jiraAPI } from '@/lib/integrations/jira-client'
import {
  getJiraResources,
  isJiraIntegrationRecord,
  transformIssueTypeForDiagnostics,
} from '@/lib/integrations/jira-route-helpers'

export async function POST(_request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get Jira integration
    const { data, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('organization_id', session.user.id)
      .eq('type', 'jira')
      .single()

    if (integrationError || !isJiraIntegrationRecord(data)) {
      return NextResponse.json({
        success: false,
        error: 'Jira integration not found',
        tests: []
      }, { status: 404 })
    }
    const integration = data
    const resources = getJiraResources(integration.metadata)

    const tests = []
    let overallSuccess = true

    // Test 1: Basic Authentication & Resources
    try {
      const connectionTest = await jiraAPI.testConnection(integration.access_token)
      
      if (connectionTest.success) {
        tests.push({
          name: 'Authentication & Resources',
          status: 'passed',
          message: `Successfully authenticated. Found ${connectionTest.resources.length} accessible site(s)`,
          details: {
            sites: connectionTest.resources.map(resource => ({
              id: resource.id,
              name: resource.name,
              url: resource.url,
              scopes: resource.scopes
            })),
            user: connectionTest.user
          }
        })
      } else {
        overallSuccess = false
        tests.push({
          name: 'Authentication & Resources',
          status: 'failed',
          message: connectionTest.error || 'Authentication failed',
          error: 'Invalid or expired access token'
        })
      }
    } catch (error) {
      overallSuccess = false
      tests.push({
        name: 'Authentication & Resources',
        status: 'failed',
        message: 'Network error during authentication test',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 2: Project Access (if authentication passed)
    if (overallSuccess && resources.length > 0) {
      try {
        const firstSite = resources[0]
        const projects = await jiraAPI.getProjects(integration.access_token, firstSite.id, {
          maxResults: 10
        })

        tests.push({
          name: 'Project Access',
          status: 'passed',
          message: `Successfully accessed projects. Found ${projects.values?.length || 0} projects`,
          details: {
            totalProjects: projects.total || 0,
            sampleProjects: projects.values?.slice(0, 5).map((project) => ({
              key: project.key,
              name: project.name,
              projectTypeKey: project.projectTypeKey,
              simplified: project.simplified
            })) || []
          }
        })
      } catch (error) {
        tests.push({
          name: 'Project Access',
          status: 'warning',
          message: 'Limited project access or no projects found',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Test 3: Issue Search Capability
    if (overallSuccess && resources.length > 0) {
      try {
        const firstSite = resources[0]
        
        // Search for recent issues across all projects
        const recentIssues = await jiraAPI.searchIssues(integration.access_token, firstSite.id, {
          jql: 'updated >= -7d ORDER BY updated DESC',
          maxResults: 5
        })

        tests.push({
          name: 'Issue Search',
          status: 'passed',
          message: `Successfully searched issues. Found ${recentIssues.total || 0} recent issues`,
          details: {
            totalIssues: recentIssues.total || 0,
            sampleIssues: recentIssues.issues?.slice(0, 3).map((issue) => ({
              key: issue.key,
              summary: issue.fields.summary,
              status: issue.fields.status.name,
              issueType: issue.fields.issuetype.name,
              updated: issue.fields.updated
            })) || []
          }
        })
      } catch (error) {
        tests.push({
          name: 'Issue Search',
          status: 'warning',
          message: 'Issue search capabilities limited',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Test 4: Issue Types & Metadata
    if (overallSuccess && resources.length > 0) {
      try {
        const firstSite = resources[0]
        const issueTypes = await jiraAPI.getIssueTypes(integration.access_token, firstSite.id)

        tests.push({
          name: 'Issue Types & Metadata',
          status: 'passed',
          message: `Successfully retrieved ${issueTypes.length || 0} issue types`,
          details: {
            issueTypes: issueTypes.slice(0, 10).map((issueType) => transformIssueTypeForDiagnostics(issueType))
          }
        })
      } catch (error) {
        tests.push({
          name: 'Issue Types & Metadata',
          status: 'info',
          message: 'Issue type metadata not accessible',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Test 5: API Endpoints Performance
    const endpoints = [
      { name: 'Projects API', test: 'projects' },
      { name: 'Search API', test: 'search' },
      { name: 'User API', test: 'user' }
    ]

    for (const endpoint of endpoints) {
      if (overallSuccess && resources.length > 0) {
        try {
          const firstSite = resources[0]
          const startTime = Date.now()
          
          switch (endpoint.test) {
            case 'projects':
              await jiraAPI.getProjects(integration.access_token, firstSite.id, { maxResults: 1 })
              break
            case 'search':
              await jiraAPI.searchIssues(integration.access_token, firstSite.id, {
                jql: 'updated >= -1d',
                maxResults: 1
              })
              break
            case 'user':
              await jiraAPI.getCurrentUser(integration.access_token, firstSite.id)
              break
          }
          
          const responseTime = Date.now() - startTime

          tests.push({
            name: endpoint.name,
            status: 'passed',
            message: `${endpoint.name} responding normally`,
            responseTime: `${responseTime}ms`
          })
        } catch (error) {
          tests.push({
            name: endpoint.name,
            status: 'warning',
            message: `${endpoint.name} performance issues`,
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
      .eq('id', integration.id)

    return NextResponse.json({
      success: overallSuccess,
      timestamp: new Date().toISOString(),
      integration: {
        id: integration.id,
        type: 'jira',
        connected_at: integration.created_at,
        sites: resources.length
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
    console.error('Jira connection test error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      tests: []
    }, { status: 500 })
  }
}
