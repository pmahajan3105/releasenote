import 'server-only'

import { HttpException, type Version3Models, Version3Client } from 'jira.js'

import { withProviderLimit } from '@/lib/http/limit'
import { HttpError, isRetryableStatus, withRetry } from '@/lib/http/request'
import type {
  JiraIssue,
  JiraIssueSearchResponse,
  JiraIssueType,
  JiraProject,
  JiraProjectIssueType,
  JiraProjectSearchResponse,
  JiraUserReference,
  JiraVersion,
} from '@/lib/integrations/jira-client'

const DEFAULT_TIMEOUT_MS = 30_000

function createClient(accessToken: string, cloudId: string): Version3Client {
  return new Version3Client({
    host: `https://api.atlassian.com/ex/jira/${cloudId}`,
    authentication: {
      oauth2: {
        accessToken,
      },
    },
    baseRequestConfig: {
      timeout: DEFAULT_TIMEOUT_MS,
    },
  })
}

function parseRetryAfterMs(value: unknown): number | undefined {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return undefined
  }

  const asString = typeof value === 'number' ? String(value) : value

  const asSeconds = Number(asString)
  if (Number.isFinite(asSeconds)) {
    return Math.max(0, Math.round(asSeconds * 1000))
  }

  const asDate = Date.parse(asString)
  if (Number.isFinite(asDate)) {
    return Math.max(0, asDate - Date.now())
  }

  return undefined
}

function getRetryAfterMsFromCause(cause: unknown): number | undefined {
  if (!cause || typeof cause !== 'object') {
    return undefined
  }

  const headers = (cause as { response?: { headers?: unknown } }).response?.headers
  if (!headers || typeof headers !== 'object') {
    return undefined
  }

  const value =
    (headers as Record<string, unknown>)['retry-after'] ??
    (headers as Record<string, unknown>)['Retry-After']

  return parseRetryAfterMs(value)
}

function toRetryableHttpError(error: unknown): HttpError | null {
  if (error instanceof HttpException) {
    if (!isRetryableStatus(error.status)) {
      return null
    }

    const retryAfterMs = getRetryAfterMsFromCause(error.cause)
    return new HttpError({
      message: error.message,
      status: error.status,
      retryAfterMs,
    })
  }

  if (error && typeof error === 'object') {
    const maybeAxios = error as { response?: { status?: unknown; headers?: unknown }; message?: unknown }
    const status =
      typeof maybeAxios.response?.status === 'number' ? maybeAxios.response.status : undefined

    if (status != null && (status === 0 || isRetryableStatus(status))) {
      const retryAfterMs = getRetryAfterMsFromCause(error)
      const message = typeof maybeAxios.message === 'string' ? maybeAxios.message : 'Jira API error'
      return new HttpError({ message, status, retryAfterMs })
    }
  }

  return null
}

async function jiraRequest<T>(accessToken: string, cloudId: string, fn: (client: Version3Client) => Promise<T>): Promise<T> {
  return withProviderLimit('jira', () =>
    withRetry(async () => {
      const client = createClient(accessToken, cloudId)

      try {
        return await fn(client)
      } catch (error) {
        const httpError = toRetryableHttpError(error)
        if (httpError) {
          throw httpError
        }
        throw error
      }
    })
  )
}

function adfToText(node: unknown): string {
  if (!node || typeof node !== 'object') {
    return ''
  }

  const text = (node as { text?: unknown }).text
  if (typeof text === 'string') {
    return text
  }

  const content = (node as { content?: unknown }).content
  if (!Array.isArray(content)) {
    return ''
  }

  return content.map(adfToText).filter(Boolean).join(' ')
}

function avatarUrlsToRecord(avatarUrls: Version3Models.AvatarUrls | undefined): Record<string, string> {
  if (!avatarUrls) {
    return {}
  }

  const out: Record<string, string> = {}
  if (avatarUrls['16x16']) out['16x16'] = avatarUrls['16x16']
  if (avatarUrls['24x24']) out['24x24'] = avatarUrls['24x24']
  if (avatarUrls['32x32']) out['32x32'] = avatarUrls['32x32']
  if (avatarUrls['48x48']) out['48x48'] = avatarUrls['48x48']
  return out
}

function toJiraUserReference(
  user:
    | { accountId: string; displayName?: string; emailAddress?: string; avatarUrls?: Version3Models.AvatarUrls }
    | null
    | undefined
): JiraUserReference | undefined {
  if (!user) {
    return undefined
  }

  return {
    accountId: user.accountId,
    displayName: user.displayName ?? 'Unknown User',
    emailAddress: user.emailAddress,
    avatarUrls: avatarUrlsToRecord(user.avatarUrls),
  }
}

function toJiraIssueType(issueType: { id?: string; name?: string; description?: string; iconUrl?: string; subtask?: boolean } | null | undefined): JiraIssueType {
  return {
    id: issueType?.id ?? '',
    name: issueType?.name ?? 'Unknown',
    description: issueType?.description,
    iconUrl: issueType?.iconUrl,
    subtask: Boolean(issueType?.subtask),
  }
}

function toJiraProjectIssueType(issueType: { id?: string; name?: string; description?: string; iconUrl?: string; subtask?: boolean }): JiraProjectIssueType | null {
  if (!issueType.id || !issueType.name) {
    return null
  }

  return {
    id: issueType.id,
    name: issueType.name,
    description: issueType.description,
    iconUrl: issueType.iconUrl,
    subtask: Boolean(issueType.subtask),
  }
}

function toJiraVersion(version: { id?: string; name?: string; description?: string; released?: boolean; releaseDate?: string }): JiraVersion | null {
  if (!version.id || !version.name) {
    return null
  }

  return {
    id: version.id,
    name: version.name,
    description: version.description,
    released: Boolean(version.released),
    releaseDate: version.releaseDate,
  }
}

function toJiraProject(project: Version3Models.Project): JiraProject {
  return {
    id: project.id,
    key: project.key,
    name: project.name,
    description: project.description,
    projectTypeKey: project.projectTypeKey,
    simplified: project.simplified,
    style: project.style,
    isPrivate: project.isPrivate,
    self: project.self,
    avatarUrls: avatarUrlsToRecord(project.avatarUrls),
    lead: project.lead ? toJiraUserReference(project.lead) : undefined,
    issueTypes: (project.issueTypes ?? [])
      .map((issueType) => toJiraProjectIssueType(issueType))
      .filter((issueType): issueType is JiraProjectIssueType => Boolean(issueType)),
  }
}

function toJiraIssue(issue: Version3Models.Issue): JiraIssue {
  const descriptionRaw = issue.fields.description
  const description =
    typeof descriptionRaw === 'string'
      ? descriptionRaw
      : descriptionRaw
        ? adfToText(descriptionRaw)
        : undefined

  const statusCategory = issue.fields.status?.statusCategory
  const status = issue.fields.status

  const priority =
    issue.fields.priority?.id && issue.fields.priority.name
      ? {
          id: issue.fields.priority.id,
          name: issue.fields.priority.name,
          iconUrl: issue.fields.priority.iconUrl,
        }
      : undefined

  return {
    id: issue.id,
    key: issue.key,
    fields: {
      summary: issue.fields.summary,
      description,
      status: {
        id: status?.id ?? '',
        name: status?.name ?? 'Unknown',
        statusCategory: {
          id: statusCategory?.id ?? 0,
          key: statusCategory?.key ?? 'unknown',
          colorName: statusCategory?.colorName ?? 'unknown',
          name: statusCategory?.name ?? 'Unknown',
        },
      },
      issuetype: toJiraIssueType(issue.fields.issuetype),
      priority,
      assignee:
        issue.fields.assignee?.accountId && issue.fields.assignee.displayName
          ? toJiraUserReference({
              accountId: issue.fields.assignee.accountId,
              displayName: issue.fields.assignee.displayName,
              emailAddress: issue.fields.assignee.emailAddress,
              avatarUrls: issue.fields.assignee.avatarUrls ?? undefined,
            })
          : undefined,
      created: issue.fields.created,
      updated: issue.fields.updated,
      fixVersions: (issue.fields.fixVersions ?? [])
        .map((version) => toJiraVersion(version))
        .filter((version): version is JiraVersion => Boolean(version)),
      labels: issue.fields.labels ?? [],
    },
    changelog: issue.changelog?.histories
      ? {
          histories: issue.changelog.histories
            .filter((history) => Boolean(history?.id && history?.created && history?.items?.length))
            .map((history) => ({
              id: history.id as string,
              author: {
                accountId: history.author?.accountId ?? '',
                displayName: history.author?.displayName ?? 'Unknown User',
                avatarUrls: {},
              },
              created: history.created as string,
              items: (history.items ?? [])
                .filter((item) => Boolean(item?.field && item?.fieldtype))
                .map((item) => ({
                  field: item.field as string,
                  fieldtype: item.fieldtype as string,
                  fromString: item.fromString,
                  toString: item.toString,
                })),
            })),
        }
      : undefined,
  }
}

export async function jiraJsGetProjects(
  accessToken: string,
  cloudId: string,
  options: { expand?: string[]; maxResults?: number; startAt?: number } = {}
): Promise<JiraProjectSearchResponse> {
  const { expand, maxResults = 50, startAt = 0 } = options

  const page = await jiraRequest(accessToken, cloudId, (client) =>
    client.projects.searchProjects({ expand, maxResults, startAt })
  )

  return {
    startAt: page.startAt ?? startAt,
    maxResults: page.maxResults ?? maxResults,
    total: page.total ?? 0,
    isLast: page.isLast ?? false,
    values: (page.values ?? []).map((project) => toJiraProject(project)),
  }
}

export async function jiraJsSearchIssues(
  accessToken: string,
  cloudId: string,
  options: { jql: string; startAt?: number; maxResults?: number; fields?: string[]; expand?: string[] }
): Promise<JiraIssueSearchResponse> {
  const { jql, startAt = 0, maxResults = 50, fields, expand } = options

  const result = await jiraRequest(accessToken, cloudId, (client) =>
    client.issueSearch.searchForIssuesUsingJqlPost({
      jql,
      startAt,
      maxResults,
      fields: fields ?? [
        'summary',
        'status',
        'assignee',
        'created',
        'updated',
        'description',
        'issuetype',
        'priority',
        'fixVersions',
        'labels',
      ],
      expand: expand ?? ['changelog'],
    })
  )

  return {
    startAt: result.startAt ?? startAt,
    maxResults: result.maxResults ?? maxResults,
    total: result.total ?? 0,
    issues: (result.issues ?? []).map((issue) => toJiraIssue(issue)),
  }
}

export async function jiraJsGetProjectIssues(
  accessToken: string,
  cloudId: string,
  projectKey: string,
  options: {
    issueTypes?: string[]
    statuses?: string[]
    assignee?: string
    updatedSince?: string
    maxResults?: number
    startAt?: number
  } = {}
): Promise<JiraIssueSearchResponse> {
  const { issueTypes, statuses, assignee, updatedSince, maxResults = 50, startAt = 0 } = options

  const jqlParts = [`project = "${projectKey}"`]

  if (issueTypes && issueTypes.length > 0) {
    const escapedTypes = issueTypes.map((type) => `"${type.replace(/"/g, '\\"')}"`)
    jqlParts.push(`issuetype IN (${escapedTypes.join(', ')})`)
  }

  if (statuses && statuses.length > 0) {
    const escapedStatuses = statuses.map((status) => `"${status.replace(/"/g, '\\"')}"`)
    jqlParts.push(`status IN (${escapedStatuses.join(', ')})`)
  }

  if (assignee) {
    jqlParts.push(`assignee = "${assignee.replace(/"/g, '\\"')}"`)
  }

  if (updatedSince) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}(\s\d{2}:\d{2})?$/
    if (dateRegex.test(updatedSince)) {
      jqlParts.push(`updated >= "${updatedSince}"`)
    }
  }

  const jql = jqlParts.join(' AND ') + ' ORDER BY updated DESC'

  return jiraJsSearchIssues(accessToken, cloudId, { jql, startAt, maxResults })
}
