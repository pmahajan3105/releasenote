interface RateLimit {
  limit: number
  remaining: number
  reset: number
  used: number
  resource: string
}

interface QueuedRequest {
  id: string
  priority: 'high' | 'medium' | 'low'
  request: () => Promise<Response>
  resolve: (value: Response) => void
  reject: (error: Error) => void
  retryCount: number
  createdAt: number
  organizationId?: string
}

interface RequestOptions {
  priority?: 'high' | 'medium' | 'low'
  maxRetries?: number
  timeout?: number
  organizationId?: string
}

export class GitHubRateLimiter {
  private static instance: GitHubRateLimiter
  private queue: QueuedRequest[] = []
  private rateLimits: Map<string, RateLimit> = new Map()
  private processing = false
  private requestHistory: Map<string, number[]> = new Map()
  private organizationLimits: Map<string, { dailyUsage: number; lastReset: number }> = new Map()

  // Rate limiting configuration
  private readonly BURST_LIMIT = 10 // Max concurrent requests
  private readonly DAILY_ORG_LIMIT = 4000 // Daily limit per organization (conservative)
  private readonly MIN_INTERVAL = 100 // Minimum ms between requests
  private readonly MAX_RETRIES = 3
  private readonly RETRY_DELAYS = [1000, 2000, 4000] // Exponential backoff in ms
  
  // Priority weights for queue ordering
  private readonly PRIORITY_WEIGHTS = {
    high: 3,
    medium: 2,
    low: 1
  }

  public static getInstance(): GitHubRateLimiter {
    if (!GitHubRateLimiter.instance) {
      GitHubRateLimiter.instance = new GitHubRateLimiter()
    }
    return GitHubRateLimiter.instance
  }

  private constructor() {
    // Start processing queue
    this.processQueue()
    
    // Clean up old request history every hour
    setInterval(() => this.cleanupHistory(), 3600000)
  }

  /**
   * Make a rate-limited GitHub API request
   */
  async request(
    url: string,
    options: RequestInit & RequestOptions = {}
  ): Promise<Response> {
    const { priority = 'medium', timeout = 30000, organizationId, ...fetchOptions } = options

    return new Promise<Response>((resolve, reject) => {
      const requestId = this.generateRequestId()
      
      const queuedRequest: QueuedRequest = {
        id: requestId,
        priority,
        request: async () => {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), timeout)

          try {
            const response = await fetch(url, {
              ...fetchOptions,
              signal: controller.signal
            })

            clearTimeout(timeoutId)
            
            // Update rate limit info from response headers
            this.updateRateLimitFromResponse(response)
            
            // Track request for organization
            if (organizationId) {
              this.trackOrganizationUsage(organizationId)
            }

            return response
          } catch (error) {
            clearTimeout(timeoutId)
            throw error
          }
        },
        resolve,
        reject,
        retryCount: 0,
        createdAt: Date.now(),
        organizationId
      }

      // Check if organization has exceeded daily limit
      if (organizationId && this.isOrganizationLimitExceeded(organizationId)) {
        reject(new Error('Organization daily API limit exceeded'))
        return
      }

      this.queue.push(queuedRequest)
      this.sortQueue()
    })
  }

  /**
   * Process the request queue
   */
  private async processQueue(): Promise<void> {
    if (this.processing) return
    this.processing = true

    while (this.queue.length > 0) {
      const request = this.queue.shift()!
      
      try {
        // Check if we should wait before making the request
        await this.waitIfNeeded()
        
        const response = await request.request()
        
        // Handle rate limit exceeded
        if (response.status === 429) {
          await this.handleRateLimitExceeded(request, response)
          continue
        }

        // Handle other errors that might need retry
        if (!response.ok && this.shouldRetry(response.status) && request.retryCount < this.MAX_RETRIES) {
          await this.retryRequest(request)
          continue
        }

        request.resolve(response)
        
      } catch (error) {
        if (request.retryCount < this.MAX_RETRIES && this.isRetryableError(error)) {
          await this.retryRequest(request)
          continue
        }
        
        request.reject(error instanceof Error ? error : new Error('Request failed'))
      }

      // Small delay between requests to avoid overwhelming the API
      await this.sleep(this.MIN_INTERVAL)
    }

    this.processing = false
    
    // Continue processing if new requests were added
    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), 10)
    }
  }

  /**
   * Wait if needed based on rate limits
   */
  private async waitIfNeeded(): Promise<void> {
    const coreLimit = this.rateLimits.get('core')
    
    if (coreLimit) {
      // If we're very close to the limit, wait until reset
      if (coreLimit.remaining < 10) {
        const waitTime = (coreLimit.reset * 1000) - Date.now()
        if (waitTime > 0 && waitTime < 3600000) { // Max 1 hour wait
          console.log(`Rate limit nearly exhausted. Waiting ${Math.round(waitTime / 1000)}s until reset...`)
          await this.sleep(waitTime)
        }
      }
      
      // Slow down requests if remaining is low
      else if (coreLimit.remaining < 100) {
        const extraDelay = Math.max(1000, (100 - coreLimit.remaining) * 50)
        await this.sleep(extraDelay)
      }
    }
  }

  /**
   * Handle 429 rate limit exceeded response
   */
  private async handleRateLimitExceeded(request: QueuedRequest, response: Response): Promise<void> {
    const retryAfter = response.headers.get('retry-after')
    const resetTime = response.headers.get('x-ratelimit-reset')
    
    let waitTime = 60000 // Default 1 minute
    
    if (retryAfter) {
      waitTime = parseInt(retryAfter) * 1000
    } else if (resetTime) {
      waitTime = (parseInt(resetTime) * 1000) - Date.now()
    }
    
    // Cap wait time at 1 hour
    waitTime = Math.min(waitTime, 3600000)
    
    console.log(`Rate limit exceeded. Waiting ${Math.round(waitTime / 1000)}s before retry...`)
    
    // Wait and then retry
    await this.sleep(waitTime)
    this.queue.unshift(request) // Put back at front of queue
  }

  /**
   * Retry a failed request with exponential backoff
   */
  private async retryRequest(request: QueuedRequest): Promise<void> {
    request.retryCount++
    
    const delay = this.RETRY_DELAYS[Math.min(request.retryCount - 1, this.RETRY_DELAYS.length - 1)]
    await this.sleep(delay)
    
    // Add back to queue with higher priority for retries
    const retryPriority = request.priority === 'low' ? 'medium' : 'high'
    request.priority = retryPriority
    
    this.queue.unshift(request)
    this.sortQueue()
  }

  /**
   * Update rate limit information from GitHub response headers
   */
  private updateRateLimitFromResponse(response: Response): void {
    const limit = response.headers.get('x-ratelimit-limit')
    const remaining = response.headers.get('x-ratelimit-remaining')
    const reset = response.headers.get('x-ratelimit-reset')
    const used = response.headers.get('x-ratelimit-used')
    const resource = response.headers.get('x-ratelimit-resource') || 'core'

    if (limit && remaining && reset) {
      const rateLimit: RateLimit = {
        limit: parseInt(limit),
        remaining: parseInt(remaining),
        reset: parseInt(reset),
        used: used ? parseInt(used) : 0,
        resource
      }
      
      this.rateLimits.set(resource, rateLimit)
    }
  }

  /**
   * Track API usage for an organization
   */
  private trackOrganizationUsage(organizationId: string): void {
    const dayStart = new Date().setHours(0, 0, 0, 0)
    
    let orgLimits = this.organizationLimits.get(organizationId)
    
    if (!orgLimits || orgLimits.lastReset < dayStart) {
      orgLimits = {
        dailyUsage: 0,
        lastReset: dayStart
      }
    }
    
    orgLimits.dailyUsage++
    this.organizationLimits.set(organizationId, orgLimits)
  }

  /**
   * Check if organization has exceeded daily limit
   */
  private isOrganizationLimitExceeded(organizationId: string): boolean {
    const orgLimits = this.organizationLimits.get(organizationId)
    return orgLimits ? orgLimits.dailyUsage >= this.DAILY_ORG_LIMIT : false
  }

  /**
   * Sort queue by priority and age
   */
  private sortQueue(): void {
    this.queue.sort((a, b) => {
      // First sort by priority
      const priorityDiff = this.PRIORITY_WEIGHTS[b.priority] - this.PRIORITY_WEIGHTS[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      
      // Then by age (older requests first)
      return a.createdAt - b.createdAt
    })
  }

  /**
   * Check if an HTTP status should trigger a retry
   */
  private shouldRetry(status: number): boolean {
    return [408, 429, 500, 502, 503, 504].includes(status)
  }

  /**
   * Check if an error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (
      typeof error === 'object' && error !== null &&
      ('name' in error || 'code' in error)
    ) {
      const err = error as { name?: unknown; code?: unknown }
      if (err.name === 'AbortError') return false // Don't retry timeouts
      if (err.code === 'ENOTFOUND') return false // DNS errors
      if (err.code === 'ECONNREFUSED') return false // Connection refused
      return true // Retry other network errors
    }
    return false // Not retryable if not an object with expected properties
  }

  /**
   * Get current rate limit status
   */
  getRateLimitStatus(resource: string = 'core'): RateLimit | null {
    return this.rateLimits.get(resource) || null
  }

  /**
   * Get organization usage stats
   */
  getOrganizationUsage(organizationId: string): { dailyUsage: number; limit: number; resetTime: number } {
    const orgLimits = this.organizationLimits.get(organizationId)
    const dayStart = new Date().setHours(0, 0, 0, 0)
    const nextDay = dayStart + (24 * 60 * 60 * 1000)
    
    return {
      dailyUsage: orgLimits?.dailyUsage || 0,
      limit: this.DAILY_ORG_LIMIT,
      resetTime: nextDay
    }
  }

  /**
   * Get queue statistics
   */
  getQueueStats(): {
    queueLength: number
    processing: boolean
    priorityCounts: Record<string, number>
  } {
    const priorityCounts = this.queue.reduce((counts, request) => {
      counts[request.priority] = (counts[request.priority] || 0) + 1
      return counts
    }, {} as Record<string, number>)

    return {
      queueLength: this.queue.length,
      processing: this.processing,
      priorityCounts
    }
  }

  /**
   * Clear queue (for testing or emergency situations)
   */
  clearQueue(): void {
    const pendingRequests = this.queue.splice(0)
    pendingRequests.forEach(request => {
      request.reject(new Error('Request cancelled - queue cleared'))
    })
  }

  /**
   * Utility methods
   */
  private generateRequestId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private cleanupHistory(): void {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000)
    
    for (const [key, timestamps] of this.requestHistory.entries()) {
      const recentTimestamps = timestamps.filter(ts => ts > oneDayAgo)
      if (recentTimestamps.length === 0) {
        this.requestHistory.delete(key)
      } else {
        this.requestHistory.set(key, recentTimestamps)
      }
    }
  }
}

// Export singleton instance
export const githubRateLimiter = GitHubRateLimiter.getInstance()