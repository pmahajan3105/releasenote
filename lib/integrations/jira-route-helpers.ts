import type {
  JiraAccessibleResource,
  JiraIssue,
  JiraIssueType,
  JiraProject,
  JiraProjectIssueType,
  JiraVersion,
} from '@/lib/integrations/jira-client'
import { getAccessTokenFromEncryptedCredentials } from '@/lib/integrations/credentials'
import { isJsonObject } from '@/lib/json'
import { z } from 'zod'
export { parseCsvParam, parseIntegerParam } from '@/lib/integrations/route-utils'

export interface JiraIntegrationRecord {
  id: string
  created_at: string
  organization_id: string
  type: 'jira'
  access_token?: string
  encrypted_credentials?: unknown
  metadata?: unknown | null
  config?: unknown | null
}

export interface TransformedJiraProject {
  id: string
  key: string
  name: string
  description?: string
  projectTypeKey?: string
  simplified: boolean
  style?: string
  isPrivate: boolean
  url?: string
  avatarUrls: Record<string, string>
  lead: {
    accountId: string
    displayName: string
    emailAddress?: string
    avatarUrls: Record<string, string>
  } | null
  issueTypes: Array<{
    id: string
    name: string
    description?: string
    iconUrl?: string
    subtask: boolean
  }>
}

export interface TransformedJiraIssue {
  id: string
  key: string
  summary: string
  description: string | null
  status: {
    name: string
    id: string
    statusCategory: {
      id: number
      key: string
      colorName: string
      name: string
    }
  }
  issueType: {
    id: string
    name: string
    description?: string
    iconUrl?: string
    subtask: boolean
  }
  priority: {
    id: string
    name: string
    iconUrl?: string
  } | null
  assignee: {
    accountId: string
    displayName: string
    emailAddress?: string
    avatarUrls: Record<string, string>
  } | null
  created: string
  updated: string
  fixVersions: Array<{
    id: string
    name: string
    description?: string
    released: boolean
    releaseDate?: string
  }>
  labels: string[]
  url: string
  changelog: Array<{
    id: string
    author: {
      accountId: string
      displayName: string
    }
    created: string
    items: Array<{
      field: string
      fieldtype: string
      from?: string
      to?: string
    }>
  }>
}

export function getJiraResources(metadata: JiraIntegrationRecord['metadata']): JiraAccessibleResource[] {
  return parseJiraIntegrationConfig(metadata).resources
}

export function getJiraAccessToken(integration: JiraIntegrationRecord): string | null {
  if (typeof integration.access_token === 'string' && integration.access_token) {
    return integration.access_token
  }

  const encrypted = getAccessTokenFromEncryptedCredentials(integration.encrypted_credentials)
  if (encrypted) {
    return encrypted
  }

  return null
}

export function resolveJiraSite(
  resources: JiraAccessibleResource[],
  preferredSiteId: string | null
): JiraAccessibleResource | null {
  if (resources.length === 0) {
    return null
  }

  if (!preferredSiteId) {
    return resources[0]
  }

  return resources.find((resource) => resource.id === preferredSiteId) ?? null
}

export function isJiraIntegrationRecord(value: unknown): value is JiraIntegrationRecord {
  if (!isJsonObject(value)) {
    return false
  }

  if (typeof value.id !== 'string' || typeof value.created_at !== 'string') {
    return false
  }

  if (typeof value.organization_id !== 'string' || value.type !== 'jira') {
    return false
  }

  const hasLegacyAccessToken = typeof value.access_token === 'string' && value.access_token.length > 0
  const hasEncrypted = 'encrypted_credentials' in value && value.encrypted_credentials != null

  if (!hasLegacyAccessToken && !hasEncrypted) {
    return false
  }

  if ('metadata' in value && value.metadata != null && !isJsonObject(value.metadata)) {
    return false
  }

  if ('config' in value && value.config != null && !isJsonObject(value.config)) {
    return false
  }

  return true
}

export function transformJiraProject(project: JiraProject): TransformedJiraProject {
  return {
    id: project.id,
    key: project.key,
    name: project.name,
    description: project.description,
    projectTypeKey: project.projectTypeKey,
    simplified: Boolean(project.simplified),
    style: project.style,
    isPrivate: Boolean(project.isPrivate),
    url: project.self,
    avatarUrls: project.avatarUrls ?? {},
    lead: project.lead
      ? {
          accountId: project.lead.accountId,
          displayName: project.lead.displayName,
          emailAddress: project.lead.emailAddress,
          avatarUrls: project.lead.avatarUrls ?? {},
        }
      : null,
    issueTypes: (project.issueTypes ?? []).map((issueType) => transformProjectIssueType(issueType)),
  }
}

export function transformJiraIssue(
  issue: JiraIssue,
  site: JiraAccessibleResource | null
): TransformedJiraIssue {
  return {
    id: issue.id,
    key: issue.key,
    summary: issue.fields.summary,
    description: issue.fields.description ?? null,
    status: {
      name: issue.fields.status.name,
      id: issue.fields.status.id,
      statusCategory: issue.fields.status.statusCategory,
    },
    issueType: {
      id: issue.fields.issuetype.id,
      name: issue.fields.issuetype.name,
      description: issue.fields.issuetype.description,
      iconUrl: issue.fields.issuetype.iconUrl,
      subtask: Boolean(issue.fields.issuetype.subtask),
    },
    priority: issue.fields.priority
      ? {
          id: issue.fields.priority.id,
          name: issue.fields.priority.name,
          iconUrl: issue.fields.priority.iconUrl,
        }
      : null,
    assignee: issue.fields.assignee
      ? {
          accountId: issue.fields.assignee.accountId,
          displayName: issue.fields.assignee.displayName,
          emailAddress: issue.fields.assignee.emailAddress,
          avatarUrls: issue.fields.assignee.avatarUrls ?? {},
        }
      : null,
    created: issue.fields.created,
    updated: issue.fields.updated,
    fixVersions: (issue.fields.fixVersions ?? []).map((version) => transformVersion(version)),
    labels: issue.fields.labels ?? [],
    url: buildIssueUrl(site, issue.key),
    changelog: (issue.changelog?.histories ?? []).map((history) => ({
      id: history.id,
      author: {
        accountId: history.author.accountId,
        displayName: history.author.displayName,
      },
      created: history.created,
      items: history.items.map((item) => ({
        field: item.field,
        fieldtype: item.fieldtype,
        from: item.fromString,
        to: item.toString,
      })),
    })),
  }
}

export function transformIssueTypeForDiagnostics(issueType: JiraIssueType): {
  id: string
  name: string
  description?: string
  subtask: boolean
} {
  return {
    id: issueType.id,
    name: issueType.name,
    description: issueType.description,
    subtask: Boolean(issueType.subtask),
  }
}

function transformProjectIssueType(issueType: JiraProjectIssueType) {
  return {
    id: issueType.id,
    name: issueType.name,
    description: issueType.description,
    iconUrl: issueType.iconUrl,
    subtask: Boolean(issueType.subtask),
  }
}

function transformVersion(version: JiraVersion) {
  return {
    id: version.id,
    name: version.name,
    description: version.description,
    released: Boolean(version.released),
    releaseDate: version.releaseDate,
  }
}

function buildIssueUrl(site: JiraAccessibleResource | null, issueKey: string): string {
  if (!site?.url) {
    return ''
  }

  return `${site.url.replace(/\/$/, '')}/browse/${issueKey}`
}

const jiraIntegrationConfigSchema = z
  .object({
    resources: z
      .array(
        z
          .object({
            id: z.string().min(1),
            name: z.string().optional(),
            url: z.string().optional(),
            scopes: z.array(z.string()).optional(),
            avatarUrl: z.string().optional(),
          })
          .passthrough()
      )
      .optional(),
    preferredSiteId: z.string().nullable().optional(),
  })
  .passthrough()

export function parseJiraIntegrationConfig(value: unknown): {
  resources: JiraAccessibleResource[]
  preferredSiteId: string | null
} {
  const result = jiraIntegrationConfigSchema.safeParse(value)
  if (!result.success) {
    return { resources: [], preferredSiteId: null }
  }

  const resources: JiraAccessibleResource[] = (result.data.resources ?? []).map((resource) => ({
    id: resource.id,
    name: resource.name ?? 'Unknown Site',
    url: resource.url ?? '',
    scopes: resource.scopes ?? [],
    avatarUrl: resource.avatarUrl,
  }))

  return {
    resources,
    preferredSiteId: result.data.preferredSiteId ?? null,
  }
}
