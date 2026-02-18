import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createGitHubClient, listCommits } from '@/lib/integrations/github-octokit'
import type { Database } from '@/types/database'
import type { ChangeItem } from '@/lib/integrations/change-item'
import { titleFromCommitMessage } from '@/lib/integrations/change-item'
import { cacheChangeItems } from '@/lib/integrations/ticket-cache'
import {
  getGitHubAccessToken,
  isGitHubIntegrationRecord,
  parsePage,
  parsePerPage,
} from '@/lib/integrations/github-route-helpers'

/**
 * Get commits from a specific GitHub repository
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

    const accessToken = getGitHubAccessToken(data)
    if (!accessToken) {
      return NextResponse.json(
        { error: 'GitHub access token not found' },
        { status: 400 }
      )
    }

    // Parse query parameters
    const url = new URL(request.url)
    const sha = url.searchParams.get('sha') || undefined
    const path = url.searchParams.get('path') || undefined
    const since = url.searchParams.get('since') || undefined
    const until = url.searchParams.get('until') || undefined
    const per_page = parsePerPage(url.searchParams.get('per_page'), 30)
    const page = parsePage(url.searchParams.get('page'), 1)

    const github = createGitHubClient(accessToken)
    const commits = await listCommits(github, {
      owner,
      repo,
      sha,
      path,
      since,
      until,
      per_page,
      page
    })

    const changeItems: ChangeItem[] = commits.map((commit) => ({
      provider: 'github',
      externalId: `${owner}/${repo}@${commit.sha}`,
      type: 'commit',
      title: titleFromCommitMessage(commit.message),
      description: commit.message,
      status: 'committed',
      url: commit.url,
      assignee: commit.author?.name ?? null,
      labels: [],
      createdAt: commit.author?.date ?? null,
      updatedAt: commit.author?.date ?? null,
      raw: commit,
    }))

    await cacheChangeItems(supabase, session.user.id, changeItems)

    return NextResponse.json({
      commits,
      repository: { owner, repo },
      pagination: {
        page,
        per_page,
        total: commits.length
      }
    })

  } catch (error) {
    console.error('GitHub commits fetch error:', error)
    
    if (error instanceof Error && error.message.includes('GitHub API error')) {
      return NextResponse.json(
        { error: 'Failed to fetch commits from GitHub', details: error.message },
        { status: 502 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
