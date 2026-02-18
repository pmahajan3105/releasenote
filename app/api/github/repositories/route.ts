import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { GitHubService } from '@/lib/integrations/github'
import {
  getGitHubAccessToken,
  isGitHubIntegrationRecord,
  parseGitHubDirection,
  parseGitHubRepoSort,
  parsePage,
  parsePerPage,
} from '@/lib/integrations/github-route-helpers'

type GitHubRepositorySummary = {
  id: number
  full_name: string
  private: boolean
}

/**
 * Legacy route kept for backwards compatibility.
 * Prefer GET /api/integrations/github/repositories (richer response + pagination metadata).
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('type', 'github')
      .eq('organization_id', session.user.id)
      .single()

    if (integrationError || !isGitHubIntegrationRecord(data)) {
      return NextResponse.json({ error: 'GitHub integration not found' }, { status: 404 })
    }

    const accessToken = getGitHubAccessToken(data)
    if (!accessToken) {
      return NextResponse.json({ error: 'GitHub access token not found' }, { status: 400 })
    }

    const url = new URL(request.url)
    const sort = parseGitHubRepoSort(url.searchParams.get('sort'), 'updated')
    const direction = parseGitHubDirection(url.searchParams.get('direction'), 'desc')
    const per_page = parsePerPage(url.searchParams.get('per_page'), 50)
    const page = parsePage(url.searchParams.get('page'), 1)

    const github = new GitHubService(accessToken)
    const repositories = await github.getRepositories({ sort, direction, per_page, page })

    const summaries: GitHubRepositorySummary[] = repositories.map((repo) => ({
      id: repo.id,
      full_name: repo.full_name,
      private: repo.private,
    }))

    return NextResponse.json({ repositories: summaries })
  } catch (error) {
    console.error('Error fetching repositories:', error)
    return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 500 })
  }
}
