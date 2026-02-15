import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

interface GitHubRepositorySummary {
  id: number
  full_name: string
  private: boolean
}

export async function GET(_request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get the GitHub token from the integrations table
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('config')
      .eq('type', 'github')
      .eq('organization_id', session.user.id)
      .single()

    if (integrationError || !integration) {
      return NextResponse.json(
        { error: 'GitHub integration not found' },
        { status: 404 }
      )
    }

    const githubToken = integration.config.access_token

    // Fetch repositories from GitHub API
    const response = await fetch('https://api.github.com/user/repos', {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch repositories')
    }

    const repositories = await response.json() as GitHubRepositorySummary[]

    return NextResponse.json({
      repositories: repositories.map((repo) => ({
        id: repo.id,
        full_name: repo.full_name,
        private: repo.private,
      })),
    })
  } catch (error) {
    console.error('Error fetching repositories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    )
  }
} 
