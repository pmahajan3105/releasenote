import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

let supabaseClient: ReturnType<typeof createClient<Database>> | null = null

/**
 * Optimized Supabase client configuration with connection pooling
 * and performance enhancements for production use
 */
export function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      // During build time, environment variables might not be available
      if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
        console.warn('Supabase environment variables not available during build')
        return null
      }
      throw new Error('Missing Supabase environment variables')
    }

    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      // Connection pooling and performance optimization
      db: {
        schema: 'public',
      },
      auth: {
        // Optimize auth token handling
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce', // More secure auth flow
      },
      global: {
        // Performance optimizations
        headers: {
          'x-client-info': 'release-notes-generator',
        },
      },
      realtime: {
        // Optimize realtime connections
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  }
  
  return supabaseClient
}

/**
 * Create a new Supabase client instance with server-side optimizations
 * Use this for server-side operations that require different configurations
 */
export function createServerSupabaseClient(serviceRoleKey?: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !key) {
    throw new Error('Missing Supabase environment variables for server client')
  }

  return createClient<Database>(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-client-info': 'release-notes-generator-server',
      },
    },
  })
}

/**
 * Create optimized client for high-frequency operations
 * with connection pooling and reduced overhead
 */
export function createOptimizedSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Reduce overhead for read-only operations
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-client-info': 'release-notes-generator-optimized',
        'cache-control': 'max-age=300', // 5 minute cache for static data
      },
    },
  })
}

// Export a function instead of direct client to avoid build-time initialization
export function createSupabaseClient() {
  return getSupabaseClient()
}

// Legacy export - only initialize if environment variables are available
export const supabase = (() => {
  try {
    return getSupabaseClient()
  } catch {
    return null
  }
})()

/**
 * Connection pooling configuration for Supabase
 * These settings optimize database connections for production workloads
 */
export const SUPABASE_CONFIG = {
  // Database connection settings
  db: {
    poolSize: 20, // Maximum number of connections in pool
    idleTimeoutMs: 30000, // 30 seconds idle timeout
    connectionTimeoutMs: 10000, // 10 seconds connection timeout
    maxLifetimeMs: 600000, // 10 minutes max connection lifetime
  },
  
  // Query optimization settings
  query: {
    maxRowsPerQuery: 1000, // Limit rows per query for performance
    defaultTimeout: 30000, // 30 seconds default query timeout
    enablePreparedStatements: true, // Use prepared statements for better performance
  },
  
  // Caching configuration
  cache: {
    enabled: true,
    defaultTTL: 300, // 5 minutes default cache TTL
    maxSize: 1000, // Maximum number of cached queries
  },
  
  // Performance monitoring
  monitoring: {
    logSlowQueries: true,
    slowQueryThreshold: 1000, // Log queries slower than 1 second
    enableMetrics: process.env.NODE_ENV === 'production',
  },
} as const

/**
 * Initialize connection cleanup for production environments
 * Automatically cleans up expired connections and cache entries
 */
export function initializeSupabaseCleanup() {
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
    // Run cleanup tasks periodically in production
    setInterval(async () => {
      try {
        const client = createServerSupabaseClient()
        const rpcClient = client as unknown as {
          rpc: (fn: string) => Promise<unknown>
        }
        
        // Cleanup expired OAuth states
        await rpcClient.rpc('cleanup_expired_oauth_states')
        
        // Cleanup old ticket cache
        await rpcClient.rpc('cleanup_expired_ticket_cache')
        
        console.log('Supabase cleanup completed successfully')
      } catch (error) {
        console.error('Supabase cleanup failed:', error)
      }
    }, 3600000) // Run every hour
  }
} 
