import { githubRateLimiter } from './github-rate-limiter'

/**
 * GitHub API client with built-in rate limiting
 */
export class GitHubAPIClient {
  private static instance: GitHubAPIClient
  private baseURL = 'https://api.github.com'
  private userAgent = 'ReleaseNoteAI'

  public static getInstance(): GitHubAPIClient {
    if (!GitHubAPIClient.instance) {
      GitHubAPIClient.instance = new GitHubAPIClient()
    }
    return GitHubAPIClient.instance
  }

  private constructor() {}

  /**
   * Make a rate-limited GitHub API request
   */
  async request(
    endpoint: string,
    options: {
      method?: string
      headers?: Record<string, string>
      body?: string
      token?: string
      organizationId?: string
      priority?: 'high' | 'medium' | 'low'
    } = {}
  ): Promise<unknown> {
    const {
      method = 'GET',
      headers = {},
      body,
      token,
      organizationId,
      priority = 'medium'
    } = options

    if (!token) {
      throw new Error('GitHub access token is required')
    }

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`

    const requestHeaders = {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': this.userAgent,
      ...headers
    }

    const requestOptions = {
      method,
      headers: requestHeaders,
      body,
      priority,
      organizationId
    }

    try {
      const response = await githubRateLimiter.request(url, requestOptions)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new GitHubAPIError(
          `GitHub API request failed: ${response.status} ${response.statusText}`,
          response.status,
          errorData
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof GitHubAPIError) {
        throw error
      }
      throw new GitHubAPIError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0,
        { originalError: error }
      )
    }
  }

  /**
   * Get authenticated user information
   */
  async getUser(token: string, organizationId?: string): Promise<unknown> {
    return this.request('/user', {
      token,
      organizationId,
      priority: 'high'
    })
  }

  /**
   * Get user repositories
   */
  async getUserRepos(
    token: string,
    options: {
      organizationId?: string
      page?: number
      perPage?: number
      sort?: 'created' | 'updated' | 'pushed' | 'full_name'
      direction?: 'asc' | 'desc'
      type?: 'all' | 'owner' | 'public' | 'private' | 'member'
    } = {}
  ): Promise<unknown> {
    const {
      organizationId,
      page = 1,
      perPage = 30,
      sort = 'updated',
      direction = 'desc',
      type = 'all'
    } = options

    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      sort,
      direction,
      type
    })

    return this.request(`/user/repos?${params}`, {
      token,
      organizationId,
      priority: 'medium'
    })
  }

  /**
   * Get repository details
   */
  async getRepo(owner: string, repo: string, token: string, organizationId?: string): Promise<unknown> {
    return this.request(`/repos/${owner}/${repo}`, {
      token,
      organizationId,
      priority: 'high'
    })
  }

  /**
   * Get repository commits
   */
  async getCommits(
    owner: string,
    repo: string,
    token: string,
    options: {
      organizationId?: string
      since?: string
      until?: string
      sha?: string
      path?: string
      page?: number
      perPage?: number
    } = {}
  ): Promise<unknown> {
    const {
      organizationId,
      since,
      until,
      sha,
      path,
      page = 1,
      perPage = 30
    } = options

    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString()
    })

    if (since) params.append('since', since)
    if (until) params.append('until', until)
    if (sha) params.append('sha', sha)
    if (path) params.append('path', path)

    return this.request(`/repos/${owner}/${repo}/commits?${params}`, {
      token,
      organizationId,
      priority: 'medium'
    })
  }

  /**
   * Get repository pull requests
   */
  async getPullRequests(
    owner: string,
    repo: string,
    token: string,
    options: {
      organizationId?: string
      state?: 'open' | 'closed' | 'all'
      head?: string
      base?: string
      sort?: 'created' | 'updated' | 'popularity'
      direction?: 'asc' | 'desc'
      page?: number
      perPage?: number
    } = {}
  ): Promise<unknown> {
    const {
      organizationId,
      state = 'closed',
      head,
      base,
      sort = 'updated',
      direction = 'desc',
      page = 1,
      perPage = 30
    } = options

    const params = new URLSearchParams({
      state,
      sort,
      direction,
      page: page.toString(),
      per_page: perPage.toString()
    })

    if (head) params.append('head', head)
    if (base) params.append('base', base)

    return this.request(`/repos/${owner}/${repo}/pulls?${params}`, {
      token,
      organizationId,
      priority: 'medium'
    })
  }

  /**
   * Get repository releases
   */
  async getReleases(
    owner: string,
    repo: string,
    token: string,
    options: {
      organizationId?: string
      page?: number
      perPage?: number
    } = {}
  ): Promise<unknown> {
    const {
      organizationId,
      page = 1,
      perPage = 30
    } = options

    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString()
    })

    return this.request(`/repos/${owner}/${repo}/releases?${params}`, {
      token,
      organizationId,
      priority: 'medium'
    })
  }

  /**
   * Search repositories
   */
  async searchRepos(
    query: string,
    token: string,
    options: {
      organizationId?: string
      sort?: 'stars' | 'forks' | 'help-wanted-issues' | 'updated'
      order?: 'asc' | 'desc'
      page?: number
      perPage?: number
    } = {}
  ): Promise<unknown> {
    const {
      organizationId,
      sort = 'updated',
      order = 'desc',
      page = 1,
      perPage = 30
    } = options

    const params = new URLSearchParams({
      q: query,
      sort,
      order,
      page: page.toString(),
      per_page: perPage.toString()
    })

    return this.request(`/search/repositories?${params}`, {
      token,
      organizationId,
      priority: 'low'
    })
  }

  /**
   * Get rate limit status
   */
  async getRateLimit(token: string, organizationId?: string): Promise<unknown> {
    return this.request('/rate_limit', {
      token,
      organizationId,
      priority: 'high'
    })
  }

  /**
   * Get current rate limiting statistics
   */
  getRateLimitStats() {
    return {
      queueStats: githubRateLimiter.getQueueStats(),
      rateLimitStatus: githubRateLimiter.getRateLimitStatus()
    }
  }

  /**
   * Get organization usage statistics
   */
  getOrganizationUsage(organizationId: string) {
    return githubRateLimiter.getOrganizationUsage(organizationId)
  }
}

/**
 * Custom error class for GitHub API errors
 */
export class GitHubAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message)
    this.name = 'GitHubAPIError'
  }
}

// Export singleton instance
export const githubAPI = GitHubAPIClient.getInstance()
