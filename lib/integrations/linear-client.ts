import type { ProjectFilterInput } from '../types/linear'

/**
 * Linear API Client with GraphQL support
 */
export class LinearAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message)
    this.name = 'LinearAPIError'
  }
}

export class LinearAPIClient {
  private static instance: LinearAPIClient
  private baseURL = 'https://api.linear.app/graphql'
  
  public static getInstance(): LinearAPIClient {
    if (!LinearAPIClient.instance) {
      LinearAPIClient.instance = new LinearAPIClient()
    }
    return LinearAPIClient.instance
  }

  private constructor() {}

  /**
   * Make a GraphQL request to Linear API
   */
  private async request(
    query: string,
    variables: Record<string, unknown> = {},
    token: string
  ): Promise<unknown> {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          variables
        })
      })

      if (!response.ok) {
        // Check for rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('retry-after')
          throw new LinearAPIError(
            `Linear API rate limit exceeded. Retry after: ${retryAfter || 'unknown'}`,
            response.status,
            { retryAfter }
          )
        }
        
        throw new LinearAPIError(
          `Linear API request failed: ${response.status} ${response.statusText}`,
          response.status
        )
      }

      const data = await response.json()
      
      if (data.errors && data.errors.length > 0) {
        throw new LinearAPIError(
          `GraphQL errors: ${Array.isArray(data.errors) ? data.errors.map((e: { message?: string }) => e.message).join(', ') : ''}`,
          400,
          data.errors
        )
      }

      return data.data
    } catch (error) {
      if (error instanceof LinearAPIError) {
        throw error
      }
      throw new LinearAPIError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0,
        { originalError: error }
      )
    }
  }

  /**
   * Get current user (viewer) information
   */
  async getViewer(token: string): Promise<unknown> {
    const query = `
      query {
        viewer {
          id
          name
          email
          displayName
          avatarUrl
          isMe
          organization {
            id
            name
            urlKey
            logoUrl
            userCount
            allowedAuthServices
          }
        }
      }
    `
    
    const data = await this.request(query, {}, token)
    if (data && typeof data === 'object' && 'viewer' in data) {
      return (data as { viewer: unknown }).viewer
    }
    return undefined
  }

  /**
   * Get organization information
   */
  async getOrganization(token: string): Promise<unknown> {
    const query = `
      query {
        organization {
          id
          name
          urlKey
          logoUrl
          userCount
          allowedAuthServices
          createdAt
          updatedAt
        }
      }
    `
    
    const data = await this.request(query, {}, token)
    if (data && typeof data === 'object' && 'organization' in data) {
      return (data as { organization: unknown }).organization
    }
    return undefined
  }

  /**
   * Get teams
   */
  async getTeams(
    token: string,
    options: {
      first?: number
      after?: string
      includeArchived?: boolean
    } = {}
  ): Promise<unknown> {
    const { first = 50, after, includeArchived = false } = options
    
    const query = `
      query GetTeams($first: Int!, $after: String, $includeArchived: Boolean) {
        teams(first: $first, after: $after, includeArchived: $includeArchived) {
          nodes {
            id
            name
            key
            description
            color
            icon
            private
            issueCount
            activeCycleCount
            createdAt
            updatedAt
            organization {
              id
              name
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    `
    
    const data = await this.request(query, { first, after, includeArchived }, token)
    if (data && typeof data === 'object' && 'teams' in data) {
      return (data as { teams: unknown }).teams
    }
    return undefined
  }

  /**
   * Get issues with filters
   */
  async getIssues(
    token: string,
    options: {
      first?: number
      after?: string
      teamId?: string
      assigneeId?: string
      stateType?: 'backlog' | 'unstarted' | 'started' | 'completed' | 'canceled'
      updatedSince?: string
      orderBy?: 'createdAt' | 'updatedAt' | 'priority'
    } = {}
  ): Promise<unknown> {
    const { 
      first = 50, 
      after, 
      teamId, 
      assigneeId, 
      stateType,
      updatedSince,
      orderBy = 'updatedAt'
    } = options
    
    // Build filter conditions
    const filters: string[] = []
    if (teamId) filters.push(`team: { id: { eq: "${teamId}" } }`)
    if (assigneeId) filters.push(`assignee: { id: { eq: "${assigneeId}" } }`)
    if (stateType) filters.push(`state: { type: { eq: ${stateType} } }`)
    if (updatedSince) filters.push(`updatedAt: { gte: "${updatedSince}" }`)
    
    const filterString = filters.length > 0 ? `filter: { ${filters.join(', ')} }` : ''
    
    const query = `
      query GetIssues($first: Int!, $after: String, $orderBy: PaginationOrderBy) {
        issues(first: $first, after: $after, ${filterString}, orderBy: $orderBy) {
          nodes {
            id
            identifier
            number
            title
            description
            priority
            estimate
            url
            createdAt
            updatedAt
            completedAt
            canceledAt
            state {
              id
              name
              type
              color
            }
            team {
              id
              name
              key
            }
            assignee {
              id
              name
              displayName
              email
              avatarUrl
            }
            creator {
              id
              name
              displayName
              email
              avatarUrl
            }
            labels {
              nodes {
                id
                name
                color
              }
            }
            project {
              id
              name
              description
              color
              state
              progress
              startedAt
              completedAt
              targetDate
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    `
    
    const data = await this.request(query, { first, after, orderBy }, token)
    if (data && typeof data === 'object' && 'issues' in data) {
      return (data as { issues: unknown }).issues
    }
    return undefined
  }

  /**
   * Get issue by ID
   */
  async getIssue(token: string, issueId: string): Promise<unknown> {
    const query = `
      query GetIssue($issueId: String!) {
        issue(id: $issueId) {
          id
          identifier
          number
          title
          description
          priority
          estimate
          url
          createdAt
          updatedAt
          completedAt
          canceledAt
          state {
            id
            name
            type
            color
          }
          team {
            id
            name
            key
          }
          assignee {
            id
            name
            displayName
            email
            avatarUrl
          }
          creator {
            id
            name
            displayName
            email
            avatarUrl
          }
          labels {
            nodes {
              id
              name
              color
            }
          }
          project {
            id
            name
            description
            color
            state
            startedAt
            completedAt
            targetDate
          }
          comments {
            nodes {
              id
              body
              createdAt
              user {
                id
                name
                displayName
              }
            }
          }
          history {
            nodes {
              id
              createdAt
              actor {
                id
                name
                displayName
              }
              fromState {
                id
                name
                type
              }
              toState {
                id
                name
                type
              }
            }
          }
        }
      }
    `
    
    const data = await this.request(query, { issueId }, token)
    if (data && typeof data === 'object' && 'issue' in data) {
      return (data as { issue: unknown }).issue
    }
    return undefined
  }

  /**
   * Get projects
   */
  async getProjects(
    token: string,
    options: {
      first?: number
      after?: string
      teamId?: string
      includeArchived?: boolean
    } = {}
  ): Promise<unknown> {
    const { first = 50, after, teamId, includeArchived = false } = options
    const filter: ProjectFilterInput | undefined = teamId
      ? { team: { id: { eq: teamId } } }
      : undefined
    
    const query = `
      query GetProjects($first: Int!, $after: String, $filter: ProjectFilterInput, $includeArchived: Boolean) {
        projects(
          first: $first,
          after: $after,
          filter: $filter,
          includeArchived: $includeArchived
        ) {
          nodes {
            id
            name
            description
            color
            state
            startedAt
            completedAt
            targetDate
            progress
            url
            createdAt
            updatedAt
            lead {
              id
              name
              displayName
              email
              avatarUrl
            }
            teams {
              nodes {
                id
                name
                key
              }
            }
            members {
              nodes {
                id
                name
                displayName
                email
                avatarUrl
              }
            }
            issues {
              nodes {
                id
                identifier
                title
                state {
                  name
                  type
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    `

    const data = await this.request(query, { first, after, filter, includeArchived }, token)
    if (data && typeof data === 'object' && 'projects' in data) {
      return (data as { projects: unknown }).projects
    }
    return undefined
  }

  /**
   * Search issues
   */
  async searchIssues(
    token: string,
    query: string,
    options: {
      first?: number
      teamId?: string
      includeArchived?: boolean
    } = {}
  ): Promise<unknown> {
    const { first = 50, teamId, includeArchived = false } = options
    
    const searchQuery = `
      query SearchIssues($query: String!, $first: Int!, $teamId: String, $includeArchived: Boolean) {
        issueSearch(
          query: $query,
          first: $first,
          teamId: $teamId,
          includeArchived: $includeArchived
        ) {
          nodes {
            id
            identifier
            number
            title
            description
            priority
            url
            createdAt
            updatedAt
            state {
              id
              name
              type
              color
            }
            team {
              id
              name
              key
            }
            assignee {
              id
              name
              displayName
              avatarUrl
            }
            labels {
              nodes {
                id
                name
                color
              }
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    `
    
    const variables: Record<string, unknown> = {
      query,
      first,
      teamId: teamId ?? null,
      includeArchived
    }
    const data = await this.request(searchQuery, variables, token)
    if (data && typeof data === 'object' && 'issueSearch' in data) {
      return (data as { issueSearch: unknown }).issueSearch
    }
    return undefined
  }

  /**
   * Test connection to Linear
   */
  async testConnection(token: string): Promise<{
    success: boolean
    user?: Record<string, unknown>
    organization?: Record<string, unknown>
    error?: string
  }> {
    try {
      const viewer = await this.getViewer(token)
      
      if (!viewer) {
        return {
          success: false,
          error: 'Unable to fetch user information'
        }
      }

      const organization = (
        viewer && typeof viewer === 'object' && 'organization' in viewer
      )
        ? (viewer as { organization?: Record<string, unknown> }).organization
        : undefined

      return {
        success: true,
        user: viewer,
        organization
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Export singleton instance
export const linearAPI = LinearAPIClient.getInstance()

// Export alias for backward compatibility
export { LinearAPIClient as LinearClient }
