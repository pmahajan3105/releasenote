import { parseEnumParam, parseIntegerParam } from '@/lib/integrations/route-utils'

type JsonObject = Record<string, unknown>

export interface GitHubIntegrationRecord {
  id: string
  created_at: string
  access_token?: string
  config?: {
    access_token?: string
  } | null
}

export type GitHubDirection = 'asc' | 'desc'
export type GitHubRepoSort = 'created' | 'updated' | 'pushed' | 'full_name'
export type GitHubPullSort = 'created' | 'updated' | 'popularity' | 'long-running'
export type GitHubPullState = 'open' | 'closed' | 'all'

const repoSortValues: readonly GitHubRepoSort[] = ['created', 'updated', 'pushed', 'full_name']
const pullSortValues: readonly GitHubPullSort[] = ['created', 'updated', 'popularity', 'long-running']
const pullStateValues: readonly GitHubPullState[] = ['open', 'closed', 'all']
const directionValues: readonly GitHubDirection[] = ['asc', 'desc']

export function isGitHubIntegrationRecord(value: unknown): value is GitHubIntegrationRecord {
  if (!isObject(value)) {
    return false
  }

  if (typeof value.id !== 'string' || typeof value.created_at !== 'string') {
    return false
  }

  if ('config' in value && value.config != null && !isObject(value.config)) {
    return false
  }

  return true
}

export function getGitHubAccessToken(integration: GitHubIntegrationRecord): string | null {
  if (typeof integration.access_token === 'string' && integration.access_token) {
    return integration.access_token
  }

  if (integration.config && typeof integration.config.access_token === 'string' && integration.config.access_token) {
    return integration.config.access_token
  }

  return null
}

export function buildGitHubHeaders(token: string): Record<string, string> {
  return {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'ReleaseNoteAI'
  }
}

export function parseGitHubRepoSort(value: string | null, fallback: GitHubRepoSort): GitHubRepoSort {
  return parseEnumParam(value, repoSortValues, fallback) ?? fallback
}

export function parseGitHubPullSort(value: string | null, fallback: GitHubPullSort): GitHubPullSort {
  return parseEnumParam(value, pullSortValues, fallback) ?? fallback
}

export function parseGitHubPullState(value: string | null, fallback: GitHubPullState): GitHubPullState {
  return parseEnumParam(value, pullStateValues, fallback) ?? fallback
}

export function parseGitHubDirection(value: string | null, fallback: GitHubDirection): GitHubDirection {
  return parseEnumParam(value, directionValues, fallback) ?? fallback
}

export function parsePerPage(value: string | null, fallback: number): number {
  return parseIntegerParam(value, fallback, { min: 1, max: 100 })
}

export function parsePage(value: string | null, fallback: number): number {
  return parseIntegerParam(value, fallback, { min: 1 })
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null
}
