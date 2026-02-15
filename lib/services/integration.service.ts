import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { GitHubClient } from '@/lib/integrations/github'
import { JiraClient } from '@/lib/integrations/jira-client'
import { LinearClient } from '@/lib/integrations/linear-client'

export interface Integration {
  id: string
  organization_id: string
  provider: 'github' | 'jira' | 'linear'
  access_token: string
  refresh_token?: string
  expires_at?: string
  user_info: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Repository {
  id: string
  name: string
  full_name: string
  description?: string
  url: string
  default_branch: string
  private: boolean
}

export interface Issue {
  id: string
  title: string
  description: string
  status: string
  assignee?: string
  labels: string[]
  url: string
  created_at: string
  updated_at: string
}

export interface PullRequest {
  id: string
  title: string
  description: string
  status: 'open' | 'closed' | 'merged'
  author: string
  url: string
  created_at: string
  updated_at: string
  merged_at?: string
}

export class IntegrationService {
  private supabase = createRouteHandlerClient({ cookies })

  /**
   * Get integration by provider for organization
   */
  async findByProvider(
    organizationId: string, 
    provider: 'github' | 'jira' | 'linear'
  ): Promise<Integration | null> {
    const { data: integration, error } = await this.supabase
      .from('oauth_credentials')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('provider', provider)
      .single()

    if (error || !integration) {
      return null
    }

    return integration
  }

  /**
   * Save or update integration credentials
   */
  async saveCredentials(
    organizationId: string,
    provider: 'github' | 'jira' | 'linear',
    credentials: {
      access_token: string
      refresh_token?: string
      expires_at?: string
      user_info: Record<string, unknown>
    }
  ): Promise<Integration> {
    const { data: integration, error } = await this.supabase
      .from('oauth_credentials')
      .upsert({
        organization_id: organizationId,
        provider,
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token,
        expires_at: credentials.expires_at,
        user_info: credentials.user_info
      }, { onConflict: 'organization_id,provider' })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save credentials: ${error.message}`)
    }

    return integration
  }

  /**
   * Remove integration
   */
  async removeIntegration(
    organizationId: string,
    provider: 'github' | 'jira' | 'linear'
  ): Promise<void> {
    const { error } = await this.supabase
      .from('oauth_credentials')
      .delete()
      .eq('organization_id', organizationId)
      .eq('provider', provider)

    if (error) {
      throw new Error(`Failed to remove integration: ${error.message}`)
    }
  }

  /**
   * Test integration connection
   */
  async testConnection(
    organizationId: string,
    provider: 'github' | 'jira' | 'linear'
  ): Promise<{ success: boolean; error?: string; userInfo?: Record<string, unknown> }> {
    try {
      const integration = await this.findByProvider(organizationId, provider)
      if (!integration) {
        return { success: false, error: 'Integration not found' }
      }

      let userInfo: Record<string, unknown> | undefined

      switch (provider) {
        case 'github': {
          const client = new GitHubClient(integration.access_token)
          userInfo = IntegrationService.toRecord(await client.getUser())
          break
        }
        case 'jira': {
          const client = JiraClient.getInstance()
          const cloudId = await this.getJiraCloudId(integration.access_token)
          userInfo = IntegrationService.toRecord(await client.getCurrentUser(integration.access_token, cloudId))
          break
        }
        case 'linear': {
          const client = LinearClient.getInstance()
          userInfo = IntegrationService.toRecord(await client.getViewer(integration.access_token))
          break
        }
        default:
          return { success: false, error: 'Unknown provider' }
      }

      return { success: true, userInfo }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection test failed' 
      }
    }
  }

  /**
   * GitHub specific methods
   */
  async getGitHubRepositories(organizationId: string): Promise<Repository[]> {
    const integration = await this.findByProvider(organizationId, 'github')
    if (!integration) {
      throw new Error('GitHub integration not found')
    }

    const client = new GitHubClient(integration.access_token)
    const repositories = await client.getRepositories()
    return repositories.map((repository) => ({
      id: String(repository.id),
      name: repository.name,
      full_name: repository.full_name,
      description: repository.description,
      url: repository.html_url,
      default_branch: repository.default_branch,
      private: repository.private,
    }))
  }

  async getGitHubPullRequests(
    organizationId: string,
    owner: string,
    repo: string,
    options?: { state?: 'open' | 'closed' | 'all'; since?: string }
  ): Promise<PullRequest[]> {
    const integration = await this.findByProvider(organizationId, 'github')
    if (!integration) {
      throw new Error('GitHub integration not found')
    }

    const client = new GitHubClient(integration.access_token)
    const pullRequests = await client.getPullRequests(owner, repo, options)
    return pullRequests.map((pullRequest) => ({
      id: String(pullRequest.id),
      title: pullRequest.title,
      description: pullRequest.body ?? '',
      status: pullRequest.merged_at ? 'merged' : pullRequest.state,
      author: pullRequest.user.login,
      url: pullRequest.html_url,
      created_at: pullRequest.created_at,
      updated_at: pullRequest.updated_at,
      merged_at: pullRequest.merged_at,
    }))
  }

  async getGitHubCommits(
    organizationId: string,
    owner: string,
    repo: string,
    options?: { since?: string; until?: string; branch?: string }
  ): Promise<unknown[]> {
    const integration = await this.findByProvider(organizationId, 'github')
    if (!integration) {
      throw new Error('GitHub integration not found')
    }

    const client = new GitHubClient(integration.access_token)
    return client.getCommits(owner, repo, options)
  }

  /**
   * Jira specific methods
   */
  async getJiraProjects(organizationId: string): Promise<unknown[]> {
    const integration = await this.findByProvider(organizationId, 'jira')
    if (!integration) {
      throw new Error('Jira integration not found')
    }

    const client = JiraClient.getInstance()
    const cloudId = await this.getJiraCloudId(integration.access_token)
    const projects = await client.getProjects(integration.access_token, cloudId)
    return projects.values
  }

  async getJiraIssues(
    organizationId: string,
    jql?: string,
    options?: { maxResults?: number; startAt?: number }
  ): Promise<Issue[]> {
    const integration = await this.findByProvider(organizationId, 'jira')
    if (!integration) {
      throw new Error('Jira integration not found')
    }

    const client = JiraClient.getInstance()
    const cloudId = await this.getJiraCloudId(integration.access_token)
    const issues = await client.searchIssues(integration.access_token, cloudId, {
      jql: jql ?? 'ORDER BY updated DESC',
      maxResults: options?.maxResults,
      startAt: options?.startAt,
    })

    return issues.issues.map((issue) => ({
      id: issue.id,
      title: issue.fields.summary,
      description: issue.fields.description ?? '',
      status: issue.fields.status.name,
      assignee: issue.fields.assignee?.displayName,
      labels: issue.fields.labels ?? [],
      url: '',
      created_at: issue.fields.created,
      updated_at: issue.fields.updated,
    }))
  }

  /**
   * Linear specific methods
   */
  async getLinearTeams(organizationId: string): Promise<unknown[]> {
    const integration = await this.findByProvider(organizationId, 'linear')
    if (!integration) {
      throw new Error('Linear integration not found')
    }

    const client = LinearClient.getInstance()
    const teams = await client.getTeams(integration.access_token)
    return IntegrationService.extractNodes(teams)
  }

  async getLinearIssues(
    organizationId: string,
    teamId?: string,
    options?: { limit?: number; after?: string }
  ): Promise<Issue[]> {
    const integration = await this.findByProvider(organizationId, 'linear')
    if (!integration) {
      throw new Error('Linear integration not found')
    }

    const client = LinearClient.getInstance()
    const issues = await client.getIssues(integration.access_token, {
      teamId,
      first: options?.limit,
      after: options?.after,
    })

    return IntegrationService.extractNodes(issues).map((issue) => {
      const issueRecord = IntegrationService.toRecord(issue)
      const state = IntegrationService.toRecord(issueRecord?.state)
      const assignee = IntegrationService.toRecord(issueRecord?.assignee)
      const labels = IntegrationService.extractNodes(issueRecord?.labels)
        .map((label) => IntegrationService.toRecord(label)?.name)
        .filter((label): label is string => typeof label === 'string')

      return {
        id: IntegrationService.asString(issueRecord?.id) ?? '',
        title: IntegrationService.asString(issueRecord?.title) ?? '',
        description: IntegrationService.asString(issueRecord?.description) ?? '',
        status: IntegrationService.asString(state?.name) ?? 'Unknown',
        assignee: IntegrationService.asString(assignee?.displayName),
        labels,
        url: IntegrationService.asString(issueRecord?.url) ?? '',
        created_at: IntegrationService.asString(issueRecord?.createdAt) ?? '',
        updated_at: IntegrationService.asString(issueRecord?.updatedAt) ?? '',
      }
    })
  }

  /**
   * Get all integrations for organization
   */
  async findAllByOrganization(organizationId: string): Promise<Integration[]> {
    const { data: integrations, error } = await this.supabase
      .from('oauth_credentials')
      .select('*')
      .eq('organization_id', organizationId)

    if (error) {
      throw new Error(`Failed to fetch integrations: ${error.message}`)
    }

    return integrations || []
  }

  /**
   * Refresh token if expired
   */
  async refreshTokenIfNeeded(integration: Integration): Promise<Integration> {
    if (!integration.expires_at || !integration.refresh_token) {
      return integration
    }

    const expiresAt = new Date(integration.expires_at)
    const now = new Date()
    
    // Refresh if expires in the next 5 minutes
    if (expiresAt.getTime() - now.getTime() > 5 * 60 * 1000) {
      return integration
    }

    // Implementation would depend on the provider's refresh token flow
    // This is a placeholder for the refresh logic
    throw new Error('Token refresh not implemented for this provider')
  }

  private static toRecord(value: unknown): Record<string, unknown> | undefined {
    return typeof value === 'object' && value !== null
      ? (value as Record<string, unknown>)
      : undefined
  }

  private static asString(value: unknown): string | undefined {
    return typeof value === 'string' ? value : undefined
  }

  private static extractNodes(value: unknown): unknown[] {
    const record = IntegrationService.toRecord(value)
    const nodes = record?.nodes
    return Array.isArray(nodes) ? nodes : []
  }

  private async getJiraCloudId(accessToken: string): Promise<string> {
    const client = JiraClient.getInstance()
    const resources = await client.getAccessibleResources(accessToken)
    const cloudId = resources[0]?.id
    if (!cloudId) {
      throw new Error('No Jira cloud site available for this integration')
    }
    return cloudId
  }
}
