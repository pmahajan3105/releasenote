import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/ssr'
import { cookies } from 'next/headers'
import { createGitHubClient, listPullRequests } from '@/lib/integrations/github-octokit'
import type { Database } from '@/types/database'
import type { ChangeItem } from '@/lib/integrations/change-item'
import { cacheChangeItems } from '@/lib/integrations/ticket-cache'
import { ensureFreshIntegrationAccessToken, IntegrationTokenError } from '@/lib/integrations/token-refresh'
import {
  getGitHubAccessToken,
  isGitHubIntegrationRecord,
  parseGitHubDirection,
  parseGitHubPullSort,
  parseGitHubPullState,
  parsePage,
  parsePerPage,
} from '@/lib/integrations/github-route-helpers'

/**
 * Get pull requests from a specific GitHub repository
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  try {
    const { owner, repo } = await params
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get GitHub integration for the user
    const { data, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('type', 'github')
      .eq('organization_id', session.user.id)
      .single()

    if (integrationError || !isGitHubIntegrationRecord(data)) {
      return NextResponse.json(
        { error: 'GitHub integration not found' },
        { status: 404 }
      )
    }

    let accessToken = getGitHubAccessToken(data)
    try {
      accessToken = await ensureFreshIntegrationAccessToken(supabase, data, accessToken)
    } catch (error) {
      if (error instanceof IntegrationTokenError) {
        return NextResponse.json({ error: error.message, code: error.code, details: error.details }, { status: error.status })
      }
      throw error
    }

    // Parse query parameters
    const url = new URL(request.url)
    const state = parseGitHubPullState(url.searchParams.get('state'), 'closed')
    const sort = parseGitHubPullSort(url.searchParams.get('sort'), 'updated')
    const direction = parseGitHubDirection(url.searchParams.get('direction'), 'desc')
    const per_page = parsePerPage(url.searchParams.get('per_page'), 30)
    const page = parsePage(url.searchParams.get('page'), 1)

    const github = createGitHubClient(accessToken)
    const pullRequests = await listPullRequests(github, {
      owner,
      repo,
      state,
      sort,
      direction,
      per_page,
      page
    })

    const changeItems: ChangeItem[] = pullRequests.map((pull) => ({
      provider: 'github',
      externalId: `${owner}/${repo}#${pull.number}`,
      type: 'pr',
      title: pull.title,
      description: pull.body ?? null,
      status: pull.state,
      url: pull.html_url,
      assignee: pull.user?.login ?? null,
      labels: [],
      createdAt: pull.created_at,
      updatedAt: pull.updated_at,
      raw: {
        id: pull.id,
        number: pull.number,
        merged_at: pull.merged_at,
        head: pull.head,
        base: pull.base,
      },
    }))

    await cacheChangeItems(supabase, session.user.id, changeItems)

    return NextResponse.json({
      pull_requests: pullRequests,
      repository: { owner, repo },
      pagination: {
        page,
        per_page,
        total: pullRequests.length
      }
    })

  } catch (error) {
    console.error('GitHub pull requests fetch error:', error)
    
    if (error instanceof Error && error.message.includes('GitHub API error')) {
      return NextResponse.json(
        { error: 'Failed to fetch pull requests from GitHub', details: error.message },
        { status: 502 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
