/**
 * Database Query Optimization Utilities
 * Provides batching, caching, and performance monitoring for database operations
 */

import { createServerSupabaseClient, SUPABASE_CONFIG } from './supabase'


type SupabaseClient = ReturnType<typeof createServerSupabaseClient>

/**
 * Query cache implementation for frequently accessed data
 */
class QueryCache {
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>()
  private maxSize = SUPABASE_CONFIG.cache.maxSize

  set(key: string, data: unknown, ttl = SUPABASE_CONFIG.cache.defaultTTL * 1000) {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (typeof firstKey === 'string') {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get(key: string): unknown | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  delete(key: string) {
    this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  size() {
    return this.cache.size
  }

  // Clean up expired entries
  cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// Global query cache instance
const queryCache = new QueryCache()

// Clean up cache every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => queryCache.cleanup(), 300000)
}

/**
 * Query batch executor for optimizing multiple database operations
 */
export class QueryBatch {
  private queries: Array<{
    id: string
    operation: () => Promise<unknown>
    resolve: (value: unknown) => void
    reject: (error: unknown) => void
  }> = []
  private timeout: NodeJS.Timeout | null = null
  private batchDelay = 10 // 10ms delay to batch operations

  /**
   * Add a query to the batch
   */
  add<T>(id: string, operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queries.push({
        id,
        operation,
        resolve: resolve as (value: unknown) => void,
        reject: reject as (error: unknown) => void
      })

      // Schedule batch execution
      if (this.timeout) {
        clearTimeout(this.timeout)
      }

      this.timeout = setTimeout(() => {
        this.execute()
      }, this.batchDelay)
    })
  }

  /**
   * Execute all batched queries
   */
  private async execute() {
    const queries = [...this.queries]
    this.queries = []
    this.timeout = null

    const results = await Promise.allSettled(
      queries.map(query => query.operation())
    )

    // Resolve/reject each query with its result
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        queries[index].resolve(result.value)
      } else {
        queries[index].reject(result.reason)
      }
    })
  }
}

// Global batch instance
const globalBatch = new QueryBatch()

/**
 * Cached query executor with automatic cache invalidation
 */
export async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Check cache first
  const cached = queryCache.get(key)
  if (cached !== null) {
    return cached as T
  }

  // Execute query and cache result
  const result = await queryFn()
  queryCache.set(key, result, ttl)
  
  return result
}

/**
 * Batched query executor
 */
export async function batchedQuery<T>(
  id: string,
  queryFn: () => Promise<T>
): Promise<T> {
  return globalBatch.add(id, queryFn)
}

/**
 * Performance monitoring wrapper for database queries
 */
export async function monitoredQuery<T>(
  operation: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now()
  
  try {
    const result = await queryFn()
    const duration = Date.now() - startTime
    
    // Log slow queries
    if (SUPABASE_CONFIG.monitoring.logSlowQueries && 
        duration > SUPABASE_CONFIG.monitoring.slowQueryThreshold) {
      console.warn(`Slow query detected: ${operation} took ${duration}ms`)
    }
    
    // Emit metrics in production
    if (SUPABASE_CONFIG.monitoring.enableMetrics) {
      // You can integrate with your preferred metrics service here
      console.info(`Query metrics: ${operation} - ${duration}ms`)
    }
    
    return result
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`Query failed: ${operation} after ${duration}ms`, error)
    throw error
  }
}

/**
 * Optimized organization data loader with caching
 */
export class OrganizationDataLoader {
  private supabase: SupabaseClient

  constructor() {
    this.supabase = createServerSupabaseClient()
  }

  /**
   * Get organization with caching
   */
  async getOrganization(organizationId: string) {
    return cachedQuery(
      `org:${organizationId}`,
      async () => {
        const { data, error } = await this.supabase
          .from('organizations')
          .select('*')
          .eq('id', organizationId)
          .single()

        if (error) throw error
        return data
      },
      300000 // 5 minute cache
    )
  }

  /**
   * Get organization members with role caching
   */
  async getOrganizationMembers(organizationId: string) {
    return cachedQuery(
      `org_members:${organizationId}`,
      async () => {
        const { data, error } = await this.supabase
          .from('organization_members')
          .select(`
            *,
            user:users(id, email, name)
          `)
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false })

        if (error) throw error
        return data
      },
      600000 // 10 minute cache
    )
  }

  /**
   * Get organization integrations with status caching
   */
  async getOrganizationIntegrations(organizationId: string) {
    return cachedQuery(
      `org_integrations:${organizationId}`,
      async () => {
        const { data, error } = await this.supabase
          .from('integrations')
          .select('*')
          .eq('org_id', organizationId)
          .order('created_at', { ascending: false })

        if (error) throw error
        return data
      },
      300000 // 5 minute cache
    )
  }

  /**
   * Invalidate organization cache
   */
  invalidateOrganizationCache(organizationId: string) {
    queryCache.delete(`org:${organizationId}`)
    queryCache.delete(`org_members:${organizationId}`)
    queryCache.delete(`org_integrations:${organizationId}`)
  }
}

/**
 * Utility functions for database optimization
 */
export const QueryOptimizer = {
  /**
   * Create a cache key from query parameters
   */
  createCacheKey(prefix: string, params: Record<string, unknown>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&')
    return `${prefix}:${sortedParams}`
  },

  /**
   * Invalidate cache by pattern
   */
  invalidateCachePattern(pattern: string) {
    for (const key of queryCache['cache'].keys()) {
      if (key.includes(pattern)) {
        queryCache.delete(key)
      }
    }
  },

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: queryCache.size(),
      maxSize: SUPABASE_CONFIG.cache.maxSize,
      hitRatio: 0, // Would need to implement hit/miss tracking
    }
  },

  /**
   * Warm up cache with common queries
   */
  async warmUpCache(organizationId: string) {
    const loader = new OrganizationDataLoader()
    
    // Pre-load common organization data
    await Promise.all([
      loader.getOrganization(organizationId),
      loader.getOrganizationMembers(organizationId),
      loader.getOrganizationIntegrations(organizationId),
    ])
  }
}

/**
 * Database query patterns for common operations
 */
export const QueryPatterns = {
  /**
   * Paginated query with counting optimization
   */
  async paginatedQuery<T>(
    supabase: SupabaseClient,
    tableName: string,
    options: {
      select?: string
      filters?: Record<string, unknown>
      orderBy?: { column: string; ascending?: boolean }
      page: number
      limit: number
    }
  ): Promise<{ data: T[]; total: number; pages: number }> {
    const { select = '*', filters = {}, orderBy, page, limit } = options
    const offset = (page - 1) * limit

    // TypeScript can't guarantee tableName is a valid table at runtime, so this is a runtime risk.
    // TypeScript limitation: dynamic tableName means strict typing is not possible here
    let query = (supabase as unknown as { from: (table: string) => any })
      .from(tableName)
      .select(typeof select === 'string' ? select : '*', { count: 'exact' })
      .range(offset, offset + limit - 1)

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      // TypeScript can't check key/value types here due to dynamic filters
      query = query.eq(key, value)
    })

    // Apply ordering
    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false })
    }

    const { data, error, count } = await query

    if (error) throw error

    return {
      data: data as T[],
      total: count || 0,
      pages: Math.ceil((count || 0) / limit)
    }
  },

  /**
   * Bulk insert with conflict resolution
   */
  async bulkInsert<T>(
    supabase: SupabaseClient,
    tableName: string,
    records: T[],
    options: {
      onConflict?: string
      batchSize?: number
    } = {}
  ): Promise<T[]> {
    const { onConflict, batchSize = 100 } = options
    const results: T[] = []

    // Process in batches to avoid hitting query size limits
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize)
      
      // TypeScript limitation: dynamic tableName means strict typing is not possible here
      let query = (supabase as unknown as { from: (table: string) => any })
        .from(tableName)
        .insert(batch)
        .select()

      if (onConflict) {
        // Type assertion needed for upsert
      query = query as unknown as { upsert: (arg: unknown) => unknown }
      }

      const { data, error } = await query

      if (error) throw error
      results.push(...(data as T[]))
    }

    return results
  }
}

export { queryCache }