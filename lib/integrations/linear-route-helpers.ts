import { parseBooleanParam, parseEnumParam, parseIntegerParam } from '@/lib/integrations/route-utils'
import { getAccessTokenFromEncryptedCredentials } from '@/lib/integrations/credentials'

type JsonObject = Record<string, unknown>

export type LinearStateType = 'backlog' | 'unstarted' | 'started' | 'completed' | 'canceled'

export interface LinearIntegrationRecord {
  id: string
  created_at: string
  access_token?: string
  encrypted_credentials?: unknown
  config?: {
    organization?: {
      name?: string
    }
  } | null
  metadata?: {
    organization?: {
      name?: string
    }
  } | null
}

export interface LinearPageInfo {
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor?: string
  endCursor?: string
}

export interface LinearTeamNode {
  id: string
  name: string
  key: string
  description?: string | null
  color?: string | null
  icon?: string | null
  private?: boolean
  issueCount?: number
  activeCycleCount?: number
  createdAt?: string
  updatedAt?: string
  organization?: {
    id?: string
    name?: string
  } | null
}

export interface LinearIssueNode {
  id: string
  identifier: string
  number?: number
  title: string
  description?: string | null
  priority?: number | null
  estimate?: number | null
  url?: string | null
  createdAt?: string
  updatedAt?: string
  completedAt?: string | null
  canceledAt?: string | null
  state?: {
    id?: string
    name?: string
    type?: string
    color?: string
  } | null
  team?: {
    id?: string
    name?: string
    key?: string
  } | null
  assignee?: {
    id?: string
    name?: string
    displayName?: string
    email?: string
    avatarUrl?: string
  } | null
  creator?: {
    id?: string
    name?: string
    displayName?: string
    email?: string
    avatarUrl?: string
  } | null
  labels?: {
    nodes?: Array<{
      id?: string
      name?: string
      color?: string
    }>
  } | null
  project?: {
    id?: string
    name?: string
    description?: string | null
    color?: string | null
    state?: string | null
    progress?: number | null
    startedAt?: string | null
    completedAt?: string | null
    targetDate?: string | null
  } | null
}

export interface LinearProjectNode {
  id: string
  name: string
  description?: string | null
  state?: string | null
  progress?: number | null
  issues?: {
    nodes?: Array<{ id?: string }>
  } | null
}

export interface LinearIssuesResponse {
  nodes: LinearIssueNode[]
  pageInfo: LinearPageInfo
}

export interface LinearTeamsResponse {
  nodes: LinearTeamNode[]
  pageInfo: LinearPageInfo
}

export interface LinearProjectsResponse {
  nodes: LinearProjectNode[]
  pageInfo: LinearPageInfo
}

export interface LinearViewer {
  id?: string
  name?: string
  displayName?: string
  email?: string
  organization?: {
    id?: string
    name?: string
    urlKey?: string
    userCount?: number
  }
}

const stateTypeValues: readonly LinearStateType[] = ['backlog', 'unstarted', 'started', 'completed', 'canceled']

export { parseIntegerParam, parseBooleanParam }

export function parseLinearStateType(value: string | null): LinearStateType | undefined {
  return parseEnumParam(value, stateTypeValues)
}

export function isLinearIntegrationRecord(value: unknown): value is LinearIntegrationRecord {
  if (!isObject(value)) {
    return false
  }

  if (typeof value.id !== 'string' || typeof value.created_at !== 'string') {
    return false
  }

  if ('metadata' in value && value.metadata != null && !isObject(value.metadata)) {
    return false
  }

  return true
}

export function getLinearAccessToken(integration: LinearIntegrationRecord): string | null {
  if (typeof integration.access_token === 'string' && integration.access_token) {
    return integration.access_token
  }

  const encrypted = getAccessTokenFromEncryptedCredentials(integration.encrypted_credentials)
  if (encrypted) {
    return encrypted
  }

  return null
}

export function getLinearOrganizationName(value: unknown): string {
  if (isObject(value) && isObject(value.organization) && typeof value.organization.name === 'string') {
    return value.organization.name
  }

  return 'Unknown Organization'
}

export function normalizeLinearViewer(value: unknown): LinearViewer {
  if (!isObject(value)) {
    return {}
  }

  const organization = isObject(value.organization)
    ? {
        id: asString(value.organization.id),
        name: asString(value.organization.name),
        urlKey: asString(value.organization.urlKey),
        userCount: asNumber(value.organization.userCount),
      }
    : undefined

  return {
    id: asString(value.id),
    name: asString(value.name),
    displayName: asString(value.displayName),
    email: asString(value.email),
    organization,
  }
}

export function normalizeLinearIssuesResponse(value: unknown): LinearIssuesResponse {
  if (!isObject(value)) {
    return { nodes: [], pageInfo: defaultPageInfo() }
  }

  const nodes = Array.isArray(value.nodes) ? (value.nodes as LinearIssueNode[]) : []
  return {
    nodes,
    pageInfo: normalizePageInfo(value.pageInfo),
  }
}

export function normalizeLinearTeamsResponse(value: unknown): LinearTeamsResponse {
  if (!isObject(value)) {
    return { nodes: [], pageInfo: defaultPageInfo() }
  }

  const nodes = Array.isArray(value.nodes) ? (value.nodes as LinearTeamNode[]) : []
  return {
    nodes,
    pageInfo: normalizePageInfo(value.pageInfo),
  }
}

export function normalizeLinearProjectsResponse(value: unknown): LinearProjectsResponse {
  if (!isObject(value)) {
    return { nodes: [], pageInfo: defaultPageInfo() }
  }

  const nodes = Array.isArray(value.nodes) ? (value.nodes as LinearProjectNode[]) : []
  return {
    nodes,
    pageInfo: normalizePageInfo(value.pageInfo),
  }
}

export function transformLinearIssue(issue: LinearIssueNode) {
  return {
    id: issue.id,
    identifier: issue.identifier,
    number: issue.number,
    title: issue.title,
    description: issue.description ?? null,
    priority: issue.priority ?? null,
    estimate: issue.estimate ?? null,
    url: issue.url ?? null,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    completedAt: issue.completedAt ?? null,
    canceledAt: issue.canceledAt ?? null,
    state: issue.state
      ? {
          id: issue.state.id,
          name: issue.state.name,
          type: issue.state.type,
          color: issue.state.color,
        }
      : null,
    team: issue.team
      ? {
          id: issue.team.id,
          name: issue.team.name,
          key: issue.team.key,
        }
      : null,
    assignee: issue.assignee
      ? {
          id: issue.assignee.id,
          name: issue.assignee.name,
          displayName: issue.assignee.displayName,
          email: issue.assignee.email,
          avatarUrl: issue.assignee.avatarUrl,
        }
      : null,
    creator: issue.creator
      ? {
          id: issue.creator.id,
          name: issue.creator.name,
          displayName: issue.creator.displayName,
          email: issue.creator.email,
          avatarUrl: issue.creator.avatarUrl,
        }
      : null,
    labels: issue.labels?.nodes?.map((label) => ({
      id: label.id,
      name: label.name,
      color: label.color,
    })) ?? [],
    project: issue.project
      ? {
          id: issue.project.id,
          name: issue.project.name,
          description: issue.project.description ?? null,
          color: issue.project.color ?? null,
          state: issue.project.state ?? null,
          progress: issue.project.progress ?? null,
          startedAt: issue.project.startedAt ?? null,
          completedAt: issue.project.completedAt ?? null,
          targetDate: issue.project.targetDate ?? null,
        }
      : null,
  }
}

export function transformLinearTeam(team: LinearTeamNode) {
  return {
    id: team.id,
    name: team.name,
    key: team.key,
    description: team.description ?? null,
    color: team.color ?? null,
    icon: team.icon ?? null,
    private: Boolean(team.private),
    issueCount: team.issueCount ?? 0,
    activeCycleCount: team.activeCycleCount ?? 0,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
    organization: team.organization ?? null,
  }
}

export function summarizeLinearTeam(team: LinearTeamNode) {
  return {
    id: team.id,
    name: team.name,
    key: team.key,
    issueCount: team.issueCount ?? 0,
    private: Boolean(team.private),
  }
}

export function summarizeLinearIssue(issue: LinearIssueNode) {
  return {
    id: issue.id,
    identifier: issue.identifier,
    title: issue.title,
    state: issue.state?.name,
    team: issue.team?.name,
    assignee: issue.assignee?.displayName,
    priority: issue.priority ?? null,
  }
}

export function summarizeLinearProject(project: LinearProjectNode) {
  return {
    id: project.id,
    name: project.name,
    state: project.state ?? null,
    progress: project.progress ?? null,
    issueCount: project.issues?.nodes?.length ?? 0,
  }
}

function normalizePageInfo(value: unknown): LinearPageInfo {
  if (!isObject(value)) {
    return defaultPageInfo()
  }

  return {
    hasNextPage: Boolean(value.hasNextPage),
    hasPreviousPage: Boolean(value.hasPreviousPage),
    startCursor: asString(value.startCursor),
    endCursor: asString(value.endCursor),
  }
}

function defaultPageInfo(): LinearPageInfo {
  return {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: undefined,
    endCursor: undefined,
  }
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null
}
