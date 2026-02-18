import 'server-only'

import { LinearClient, PaginationOrderBy } from '@linear/sdk'

import { withProviderLimit } from '@/lib/http/limit'
import { HttpError, isRetryableStatus, withRetry } from '@/lib/http/request'
import type { LinearStateType } from '@/lib/integrations/linear-route-helpers'
import type {
  LinearIssueNode,
  LinearIssuesResponse,
  LinearPageInfo,
  LinearTeamNode,
  LinearTeamsResponse,
} from '@/lib/integrations/linear-route-helpers'

const DEFAULT_TIMEOUT_MS = 30_000

function toIsoString(value: Date | null | undefined): string | undefined {
  if (!value) {
    return undefined
  }

  return value.toISOString()
}

function toNullableIsoString(value: Date | null | undefined): string | null {
  if (!value) {
    return null
  }

  return value.toISOString()
}

function normalizePageInfo(pageInfo: { startCursor?: string | null; endCursor?: string | null; hasNextPage: boolean; hasPreviousPage: boolean }): LinearPageInfo {
  return {
    hasNextPage: pageInfo.hasNextPage,
    hasPreviousPage: pageInfo.hasPreviousPage,
    startCursor: pageInfo.startCursor ?? undefined,
    endCursor: pageInfo.endCursor ?? undefined,
  }
}

function toRetryableHttpError(error: unknown): HttpError | null {
  if (error && typeof error === 'object') {
    const status = typeof (error as { status?: unknown }).status === 'number' ? (error as { status: number }).status : undefined
    const retryAfterSeconds =
      typeof (error as { retryAfter?: unknown }).retryAfter === 'number' ? (error as { retryAfter: number }).retryAfter : undefined

    if (status != null && (status === 0 || isRetryableStatus(status))) {
      const message = error instanceof Error ? error.message : 'Linear API error'
      return new HttpError({
        message,
        status,
        retryAfterMs: retryAfterSeconds != null ? Math.max(0, Math.round(retryAfterSeconds * 1000)) : undefined,
      })
    }
  }

  return null
}

async function linearRequest<T>(
  accessToken: string,
  fn: (client: LinearClient) => Promise<T>,
  options: { timeoutMs?: number } = {}
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS

  return withProviderLimit('linear', () =>
    withRetry(async () => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), timeoutMs)

      try {
        const client = new LinearClient({ accessToken, signal: controller.signal })
        return await fn(client)
      } catch (error) {
        const httpError = toRetryableHttpError(error)
        if (httpError) {
          throw httpError
        }
        throw error
      } finally {
        clearTimeout(timeout)
      }
    })
  )
}

export async function listLinearTeams(
  accessToken: string,
  options: { first: number; after?: string; includeArchived: boolean }
): Promise<LinearTeamsResponse> {
  const { first, after, includeArchived } = options

  const [organization, teams] = await linearRequest(accessToken, async (client) => {
    const [org, conn] = await Promise.all([
      client.organization,
      client.teams({ first, after, includeArchived, orderBy: PaginationOrderBy.UpdatedAt }),
    ])

    return [org, conn] as const
  })

  const nodes: LinearTeamNode[] = teams.nodes.map((team) => ({
    id: team.id,
    name: team.name,
    key: team.key,
    description: team.description ?? null,
    color: team.color ?? null,
    icon: team.icon ?? null,
    private: team.private,
    issueCount: team.issueCount,
    // Our legacy GraphQL client queried `activeCycleCount`. The SDK exposes `upcomingCycleCount`.
    activeCycleCount: team.upcomingCycleCount,
    createdAt: toIsoString(team.createdAt),
    updatedAt: toIsoString(team.updatedAt),
    organization: {
      id: organization.id,
      name: organization.name,
    },
  }))

  return {
    nodes,
    pageInfo: normalizePageInfo(teams.pageInfo),
  }
}

type LinearIssueEnrichment = {
  teamsById: Map<string, { id: string; name: string; key: string }>
  statesById: Map<string, { id: string; name: string; type: string; color?: string | null }>
  usersById: Map<
    string,
    { id: string; name?: string | null; displayName?: string | null; email?: string | null; avatarUrl?: string | null }
  >
  projectsById: Map<
    string,
    {
      id: string
      name: string
      description?: string | null
      color?: string | null
      state?: string | null
      progress?: number | null
      startedAt?: Date | null
      completedAt?: Date | null
      targetDate?: string | null
    }
  >
  labelsById: Map<string, { id: string; name: string; color?: string | null }>
}

function uniq(values: Array<string | null | undefined>): string[] {
  return Array.from(new Set(values.filter((value): value is string => typeof value === 'string' && value.length > 0)))
}

function uniqFromArray(values: Array<string[] | null | undefined>): string[] {
  const out = new Set<string>()
  for (const arr of values) {
    if (!arr) continue
    for (const value of arr) {
      if (typeof value === 'string' && value.length > 0) {
        out.add(value)
      }
    }
  }
  return Array.from(out)
}

function buildIssuesFilter(options: {
  teamId?: string
  assigneeId?: string
  stateType?: LinearStateType
  updatedSince?: string
}): Record<string, unknown> | undefined {
  const filter: Record<string, unknown> = {}

  if (options.teamId) {
    filter.team = { id: { eq: options.teamId } }
  }

  if (options.assigneeId) {
    filter.assignee = { id: { eq: options.assigneeId } }
  }

  if (options.stateType) {
    filter.state = { type: { eq: options.stateType } }
  }

  if (options.updatedSince) {
    filter.updatedAt = { gte: options.updatedSince }
  }

  return Object.keys(filter).length > 0 ? filter : undefined
}

async function fetchLinearIssueEnrichment(accessToken: string, issues: Array<{ teamId?: string; stateId?: string; assigneeId?: string; creatorId?: string; projectId?: string; labelIds: string[] }>): Promise<LinearIssueEnrichment> {
  const teamIds = uniq(issues.map((issue) => issue.teamId))
  const stateIds = uniq(issues.map((issue) => issue.stateId))
  const projectIds = uniq(issues.map((issue) => issue.projectId))
  const userIds = uniq([...issues.map((issue) => issue.assigneeId), ...issues.map((issue) => issue.creatorId)])
  const labelIds = uniqFromArray(issues.map((issue) => issue.labelIds))

  const [teams, states, users, projects, labels] = await Promise.all([
    teamIds.length
      ? linearRequest(accessToken, (client) =>
          client.teams({
            first: Math.min(250, teamIds.length),
            filter: { id: { in: teamIds } },
            includeArchived: true,
            orderBy: PaginationOrderBy.UpdatedAt,
          })
        )
      : Promise.resolve(null),
    stateIds.length
      ? linearRequest(accessToken, (client) =>
          client.workflowStates({
            first: Math.min(250, stateIds.length),
            filter: { id: { in: stateIds } },
            includeArchived: true,
            orderBy: PaginationOrderBy.UpdatedAt,
          })
        )
      : Promise.resolve(null),
    userIds.length
      ? linearRequest(accessToken, (client) =>
          client.users({
            first: Math.min(250, userIds.length),
            filter: { id: { in: userIds } },
            includeDisabled: true,
            includeArchived: true,
            orderBy: PaginationOrderBy.UpdatedAt,
          })
        )
      : Promise.resolve(null),
    projectIds.length
      ? linearRequest(accessToken, (client) =>
          client.projects({
            first: Math.min(250, projectIds.length),
            filter: { id: { in: projectIds } },
            includeArchived: true,
            orderBy: PaginationOrderBy.UpdatedAt,
          })
        )
      : Promise.resolve(null),
    labelIds.length
      ? linearRequest(accessToken, (client) =>
          client.issueLabels({
            first: Math.min(250, labelIds.length),
            filter: { id: { in: labelIds } },
            includeArchived: true,
            orderBy: PaginationOrderBy.UpdatedAt,
          })
        )
      : Promise.resolve(null),
  ])

  return {
    teamsById: new Map(
      (teams?.nodes ?? []).map((team) => [team.id, { id: team.id, name: team.name, key: team.key }])
    ),
    statesById: new Map(
      (states?.nodes ?? []).map((state) => [
        state.id,
        { id: state.id, name: state.name, type: state.type, color: state.color ?? null },
      ])
    ),
    usersById: new Map(
      (users?.nodes ?? []).map((user) => [
        user.id,
        {
          id: user.id,
          name: user.name ?? null,
          displayName: user.displayName ?? null,
          email: user.email ?? null,
          avatarUrl: user.avatarUrl ?? null,
        },
      ])
    ),
    projectsById: new Map(
      (projects?.nodes ?? []).map((project) => [
        project.id,
        {
          id: project.id,
          name: project.name,
          description: project.description ?? null,
          color: project.color ?? null,
          state: project.state ?? null,
          progress: project.progress ?? null,
          startedAt: project.startedAt ?? null,
          completedAt: project.completedAt ?? null,
          targetDate: project.targetDate ?? null,
        },
      ])
    ),
    labelsById: new Map(
      (labels?.nodes ?? []).map((label) => [label.id, { id: label.id, name: label.name, color: label.color ?? null }])
    ),
  }
}

export async function listLinearIssues(
  accessToken: string,
  options: {
    first: number
    after?: string
    teamId?: string
    assigneeId?: string
    stateType?: LinearStateType
    updatedSince?: string
  }
): Promise<LinearIssuesResponse> {
  const { first, after } = options

  const filter = buildIssuesFilter(options)
  const issues = await linearRequest(accessToken, (client) =>
    client.issues({
      first,
      after,
      filter,
      orderBy: PaginationOrderBy.UpdatedAt,
    })
  )

  const enrichment = await fetchLinearIssueEnrichment(
    accessToken,
    issues.nodes.map((issue) => ({
      teamId: issue.teamId,
      stateId: issue.stateId,
      assigneeId: issue.assigneeId,
      creatorId: issue.creatorId,
      projectId: issue.projectId,
      labelIds: issue.labelIds,
    }))
  )

  const nodes: LinearIssueNode[] = issues.nodes.map((issue) => {
    const state = issue.stateId ? enrichment.statesById.get(issue.stateId) : undefined
    const team = issue.teamId ? enrichment.teamsById.get(issue.teamId) : undefined
    const assignee = issue.assigneeId ? enrichment.usersById.get(issue.assigneeId) : undefined
    const creator = issue.creatorId ? enrichment.usersById.get(issue.creatorId) : undefined
    const project = issue.projectId ? enrichment.projectsById.get(issue.projectId) : undefined

    return {
      id: issue.id,
      identifier: issue.identifier,
      number: issue.number,
      title: issue.title,
      description: issue.description ?? null,
      priority: issue.priority ?? null,
      estimate: issue.estimate ?? null,
      url: issue.url ?? null,
      createdAt: toIsoString(issue.createdAt),
      updatedAt: toIsoString(issue.updatedAt),
      completedAt: toNullableIsoString(issue.completedAt),
      canceledAt: toNullableIsoString(issue.canceledAt),
      state: state
        ? {
            id: state.id,
            name: state.name,
            type: state.type,
            color: state.color ?? undefined,
          }
        : null,
      team: team
        ? {
            id: team.id,
            name: team.name,
            key: team.key,
          }
        : null,
      assignee: assignee
        ? {
            id: assignee.id,
            name: assignee.name ?? undefined,
            displayName: assignee.displayName ?? undefined,
            email: assignee.email ?? undefined,
            avatarUrl: assignee.avatarUrl ?? undefined,
          }
        : null,
      creator: creator
        ? {
            id: creator.id,
            name: creator.name ?? undefined,
            displayName: creator.displayName ?? undefined,
            email: creator.email ?? undefined,
            avatarUrl: creator.avatarUrl ?? undefined,
          }
        : null,
      labels: {
        nodes: issue.labelIds
          .map((labelId) => enrichment.labelsById.get(labelId))
          .filter((label): label is NonNullable<typeof label> => Boolean(label))
          .map((label) => ({ id: label.id, name: label.name, color: label.color ?? undefined })),
      },
      project: project
        ? {
            id: project.id,
            name: project.name,
            description: project.description ?? null,
            color: project.color ?? null,
            state: project.state ?? null,
            progress: project.progress ?? null,
            startedAt: toNullableIsoString(project.startedAt),
            completedAt: toNullableIsoString(project.completedAt),
            targetDate: project.targetDate ?? null,
          }
        : null,
    }
  })

  return {
    nodes,
    pageInfo: normalizePageInfo(issues.pageInfo),
  }
}

