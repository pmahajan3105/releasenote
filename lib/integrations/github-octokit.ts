import 'server-only'

import { Octokit } from '@octokit/rest'
import { withProviderLimit } from '@/lib/http/limit'
import { fetchWithRetry } from '@/lib/http/request'
import type { GitHubCommit, GitHubPullRequest, GitHubRepository } from '@/lib/integrations/github'

type GitHubRepoSort = 'created' | 'updated' | 'pushed' | 'full_name'
type GitHubDirection = 'asc' | 'desc'
type GitHubPullState = 'open' | 'closed' | 'all'
type GitHubPullSort = 'created' | 'updated' | 'popularity' | 'long-running'

type OctokitRequestOptions = {
  timeoutMs?: number
  retries?: number
}

export function createGitHubClient(accessToken: string, options: OctokitRequestOptions = {}): Octokit {
  const timeoutMs = options.timeoutMs ?? 30000
  const retries = options.retries ?? 3

  return new Octokit({
    auth: accessToken,
    userAgent: 'ReleaseNotesApp/1.0',
    request: {
      // Use our shared concurrency + retry wrapper at the transport layer.
      fetch: async (url: string, init?: RequestInit) =>
        withProviderLimit('github', () =>
          fetchWithRetry(url, init ?? {}, {
            timeoutMs,
            retry: {
              retries,
              minTimeoutMs: 500,
              maxTimeoutMs: 8000,
              respectRetryAfter: true,
              randomize: true,
            },
          })
        ),
    },
  })
}

export async function listRepositories(
  client: Octokit,
  options: { sort: GitHubRepoSort; direction: GitHubDirection; per_page: number; page: number }
): Promise<GitHubRepository[]> {
  try {
    const { data } = await client.repos.listForAuthenticatedUser({
      sort: options.sort,
      direction: options.direction,
      per_page: options.per_page,
      page: options.page,
    })

    return data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description ?? undefined,
      private: repo.private,
      html_url: repo.html_url,
      clone_url: repo.clone_url,
      default_branch: repo.default_branch,
      created_at: repo.created_at ?? new Date().toISOString(),
      updated_at: repo.updated_at ?? new Date().toISOString(),
      language: repo.language ?? undefined,
    }))
  } catch (error) {
    throw toGitHubApiError(error)
  }
}

export async function listCommits(
  client: Octokit,
  params: {
    owner: string
    repo: string
    sha?: string
    path?: string
    since?: string
    until?: string
    per_page: number
    page: number
  }
): Promise<GitHubCommit[]> {
  try {
    const { data } = await client.repos.listCommits({
      owner: params.owner,
      repo: params.repo,
      sha: params.sha,
      path: params.path,
      since: params.since,
      until: params.until,
      per_page: params.per_page,
      page: params.page,
    })

    return data.map((commit) => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: {
        name: commit.commit.author?.name ?? 'Unknown',
        email: commit.commit.author?.email ?? '',
        date: commit.commit.author?.date ?? new Date().toISOString(),
      },
      url: commit.html_url,
    }))
  } catch (error) {
    throw toGitHubApiError(error)
  }
}

export async function listPullRequests(
  client: Octokit,
  params: {
    owner: string
    repo: string
    state: GitHubPullState
    sort: GitHubPullSort
    direction: GitHubDirection
    per_page: number
    page: number
  }
): Promise<GitHubPullRequest[]> {
  try {
    const { data } = await client.pulls.list({
      owner: params.owner,
      repo: params.repo,
      state: params.state,
      sort: params.sort,
      direction: params.direction,
      per_page: params.per_page,
      page: params.page,
    })

    return data.map((pull) => ({
      id: pull.id,
      number: pull.number,
      title: pull.title,
      body: pull.body ?? undefined,
      state: pull.state as GitHubPullRequest['state'],
      created_at: pull.created_at,
      updated_at: pull.updated_at,
      merged_at: pull.merged_at ?? undefined,
      html_url: pull.html_url,
      user: {
        login: pull.user?.login ?? 'unknown',
        avatar_url: pull.user?.avatar_url ?? '',
      },
      head: {
        ref: pull.head.ref,
        sha: pull.head.sha,
      },
      base: {
        ref: pull.base.ref,
        sha: pull.base.sha,
      },
    }))
  } catch (error) {
    throw toGitHubApiError(error)
  }
}

function toGitHubApiError(error: unknown): Error {
  if (error instanceof Error) {
    const status = getNumberField(error, 'status')
    const message = status ? `GitHub API error (${status}): ${error.message}` : `GitHub API error: ${error.message}`
    return new Error(message)
  }

  return new Error('GitHub API error: Unknown error')
}

function getNumberField(value: unknown, key: string): number | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const record = value as Record<string, unknown>
  return typeof record[key] === 'number' ? record[key] : null
}
