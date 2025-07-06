/**
 * Database Configuration and Connection Pooling
 * Optimized settings for production-grade Supabase connections
 */

import { initializeSupabaseCleanup } from './supabase'

/**
 * Database connection pool configuration
 * These settings optimize connection management for high-traffic applications
 */
export const DATABASE_CONFIG = {
  // Connection Pool Settings
  pool: {
    // Maximum number of connections in the pool
    max: parseInt(process.env.DB_POOL_MAX || '20'),
    
    // Minimum number of connections to maintain
    min: parseInt(process.env.DB_POOL_MIN || '2'),
    
    // Time a connection can be idle before being released (ms)
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
    
    // Maximum time to wait for a connection (ms)
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000'),
    
    // Maximum lifetime of a connection (ms)
    maxLifetimeMillis: parseInt(process.env.DB_MAX_LIFETIME || '600000'),
    
    // How often to check for idle connections (ms)
    reapIntervalMillis: parseInt(process.env.DB_REAP_INTERVAL || '1000'),
  },

  // Query Performance Settings
  query: {
    // Default timeout for queries (ms)
    timeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000'),
    
    // Maximum rows to return in a single query
    maxRows: parseInt(process.env.DB_MAX_ROWS || '1000'),
    
    // Enable query result caching
    enableCaching: process.env.DB_ENABLE_CACHING !== 'false',
    
    // Default cache TTL (seconds)
    cacheTTL: parseInt(process.env.DB_CACHE_TTL || '300'),
    
    // Log slow queries threshold (ms)
    slowQueryThreshold: parseInt(process.env.DB_SLOW_QUERY_THRESHOLD || '1000'),
  },

  // Real-time Settings
  realtime: {
    // Enable real-time subscriptions
    enabled: process.env.DB_REALTIME_ENABLED !== 'false',
    
    // Maximum events per second
    eventsPerSecond: parseInt(process.env.DB_REALTIME_EVENTS_PER_SECOND || '10'),
    
    // Heartbeat interval (ms)
    heartbeatInterval: parseInt(process.env.DB_REALTIME_HEARTBEAT || '30000'),
  },

  // Security Settings
  security: {
    // Enforce SSL connections
    ssl: process.env.DB_SSL_ENABLED !== 'false',
    
    // Row Level Security enforcement
    rls: process.env.DB_RLS_ENABLED !== 'false',
    
    // Enable prepared statements
    preparedStatements: process.env.DB_PREPARED_STATEMENTS !== 'false',
  },

  // Monitoring and Logging
  monitoring: {
    // Enable performance monitoring
    enabled: process.env.NODE_ENV === 'production',
    
    // Log all queries in development
    logQueries: process.env.NODE_ENV === 'development',
    
    // Enable connection pool monitoring
    logConnections: process.env.DB_LOG_CONNECTIONS === 'true',
    
    // Metrics collection interval (ms)
    metricsInterval: parseInt(process.env.DB_METRICS_INTERVAL || '60000'),
  },
} as const

/**
 * Database performance monitoring class
 */
export class DatabaseMonitor {
  private queryTimes: number[] = []
  private connectionCount = 0
  private slowQueries = 0
  private totalQueries = 0

  /**
   * Record query execution time
   */
  recordQuery(duration: number, query?: string) {
    this.totalQueries++
    this.queryTimes.push(duration)
    
    // Keep only last 1000 query times for memory efficiency
    if (this.queryTimes.length > 1000) {
      this.queryTimes.shift()
    }
    
    // Track slow queries
    if (duration > DATABASE_CONFIG.query.slowQueryThreshold) {
      this.slowQueries++
      
      if (DATABASE_CONFIG.monitoring.logQueries && query) {
        console.warn(`Slow query (${duration}ms):`, query.substring(0, 200))
      }
    }
  }

  /**
   * Record connection events
   */
  recordConnection(type: 'created' | 'destroyed' | 'acquired' | 'released') {
    if (type === 'created' || type === 'acquired') {
      this.connectionCount++
    } else if (type === 'destroyed' || type === 'released') {
      this.connectionCount = Math.max(0, this.connectionCount - 1)
    }
    
    if (DATABASE_CONFIG.monitoring.logConnections) {
      console.info(`Database connection ${type}. Active: ${this.connectionCount}`)
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    const avgQueryTime = this.queryTimes.length > 0 
      ? this.queryTimes.reduce((a, b) => a + b, 0) / this.queryTimes.length 
      : 0

    return {
      totalQueries: this.totalQueries,
      slowQueries: this.slowQueries,
      slowQueryRate: this.totalQueries > 0 ? this.slowQueries / this.totalQueries : 0,
      averageQueryTime: Math.round(avgQueryTime),
      activeConnections: this.connectionCount,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Reset metrics
   */
  reset() {
    this.queryTimes = []
    this.slowQueries = 0
    this.totalQueries = 0
  }
}

// Global monitor instance
export const databaseMonitor = new DatabaseMonitor()

/**
 * Database connection health checker
 */
export class DatabaseHealthChecker {
  private lastHealthCheck = 0
  private healthCheckInterval = 30000 // 30 seconds
  private isHealthy = true

  /**
   * Check database connectivity and performance
   */
  async checkHealth(): Promise<{
    healthy: boolean
    latency: number
    timestamp: string
    errors?: string[]
  }> {
    const now = Date.now()
    
    // Skip if checked recently
    if (now - this.lastHealthCheck < this.healthCheckInterval) {
      return {
        healthy: this.isHealthy,
        latency: 0,
        timestamp: new Date().toISOString(),
      }
    }

    this.lastHealthCheck = now
    const errors: string[] = []
    const startTime = Date.now()

    try {
      // Simple connectivity test
      const { createServerSupabaseClient } = await import('./supabase')
      const supabase = createServerSupabaseClient()
      
      // Perform a lightweight query
      const { error } = await supabase
        .from('organizations')
        .select('id')
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" which is ok
        errors.push(`Database query failed: ${error.message}`)
      }

      const latency = Date.now() - startTime
      
      // Check if latency is acceptable
      if (latency > 5000) { // 5 seconds
        errors.push(`High database latency: ${latency}ms`)
      }

      this.isHealthy = errors.length === 0

      return {
        healthy: this.isHealthy,
        latency,
        timestamp: new Date().toISOString(),
        errors: errors.length > 0 ? errors : undefined,
      }
    } catch (error) {
      const latency = Date.now() - startTime
      this.isHealthy = false
      
      return {
        healthy: false,
        latency,
        timestamp: new Date().toISOString(),
        errors: [`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      }
    }
  }

  /**
   * Get current health status
   */
  isHealthyStatus(): boolean {
    return this.isHealthy
  }
}

// Global health checker instance
export const databaseHealthChecker = new DatabaseHealthChecker()

/**
 * Initialize database monitoring and cleanup
 */
export function initializeDatabaseOptimization() {
  if (typeof window === 'undefined') {
    console.info('Initializing database optimization...')
    
    // Initialize Supabase cleanup
    initializeSupabaseCleanup()
    
    // Start performance monitoring
    if (DATABASE_CONFIG.monitoring.enabled) {
      setInterval(() => {
        const metrics = databaseMonitor.getMetrics()
        console.info('Database metrics:', metrics)
        
        // Reset metrics after logging to prevent memory growth
        if (metrics.totalQueries > 10000) {
          databaseMonitor.reset()
        }
      }, DATABASE_CONFIG.monitoring.metricsInterval)
    }
    
    // Start health checking
    setInterval(async () => {
      const health = await databaseHealthChecker.checkHealth()
      
      if (!health.healthy) {
        console.error('Database health check failed:', health.errors)
      } else if (DATABASE_CONFIG.monitoring.logConnections) {
        console.info(`Database healthy - latency: ${health.latency}ms`)
      }
    }, 30000) // Check every 30 seconds
    
    console.info('Database optimization initialized successfully')
  }
}

/**
 * Utility functions for database optimization
 */
export const DatabaseUtils = {
  /**
   * Format query for logging (truncate and sanitize)
   */
  formatQueryForLogging(query: string, maxLength = 200): string {
    return query
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, maxLength) + (query.length > maxLength ? '...' : '')
  },

  /**
   * Estimate query complexity based on operations
   */
  estimateQueryComplexity(query: string): 'low' | 'medium' | 'high' {
    const lowerQuery = query.toLowerCase()
    
    // High complexity indicators
    if (lowerQuery.includes('join') && lowerQuery.includes('order by') && lowerQuery.includes('group by')) {
      return 'high'
    }
    
    // Medium complexity indicators
    if (lowerQuery.includes('join') || lowerQuery.includes('order by') || lowerQuery.includes('group by')) {
      return 'medium'
    }
    
    // Simple queries
    return 'low'
  },

  /**
   * Get optimized query timeout based on complexity
   */
  getOptimizedTimeout(query: string): number {
    const complexity = this.estimateQueryComplexity(query)
    
    switch (complexity) {
      case 'high':
        return DATABASE_CONFIG.query.timeout * 2
      case 'medium':
        return DATABASE_CONFIG.query.timeout * 1.5
      default:
        return DATABASE_CONFIG.query.timeout
    }
  },
}

// Export configuration for use in environment setup
export const ENVIRONMENT_VARIABLES = {
  // Database Pool Configuration
  DB_POOL_MAX: 'Maximum connections in pool (default: 20)',
  DB_POOL_MIN: 'Minimum connections to maintain (default: 2)',
  DB_IDLE_TIMEOUT: 'Idle connection timeout in ms (default: 30000)',
  DB_CONNECTION_TIMEOUT: 'Connection timeout in ms (default: 10000)',
  DB_MAX_LIFETIME: 'Maximum connection lifetime in ms (default: 600000)',
  DB_REAP_INTERVAL: 'Connection reaping interval in ms (default: 1000)',
  
  // Query Performance
  DB_QUERY_TIMEOUT: 'Default query timeout in ms (default: 30000)',
  DB_MAX_ROWS: 'Maximum rows per query (default: 1000)',
  DB_ENABLE_CACHING: 'Enable query caching (default: true)',
  DB_CACHE_TTL: 'Cache TTL in seconds (default: 300)',
  DB_SLOW_QUERY_THRESHOLD: 'Slow query threshold in ms (default: 1000)',
  
  // Real-time Configuration
  DB_REALTIME_ENABLED: 'Enable real-time features (default: true)',
  DB_REALTIME_EVENTS_PER_SECOND: 'Max real-time events/sec (default: 10)',
  DB_REALTIME_HEARTBEAT: 'Heartbeat interval in ms (default: 30000)',
  
  // Security
  DB_SSL_ENABLED: 'Enforce SSL connections (default: true)',
  DB_RLS_ENABLED: 'Enable Row Level Security (default: true)',
  DB_PREPARED_STATEMENTS: 'Use prepared statements (default: true)',
  
  // Monitoring
  DB_LOG_CONNECTIONS: 'Log connection events (default: false)',
  DB_METRICS_INTERVAL: 'Metrics collection interval in ms (default: 60000)',
} as const