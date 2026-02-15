/**
 * Caching system with Redis support and in-memory fallback
 * Implements multi-level caching strategy for optimal performance
 */

import { logger } from './logger'

interface CacheItem {
  value: unknown
  expiry: number
}

class MemoryCache {
  private cache = new Map<string, CacheItem>()
  private maxSize = 1000

  get(key: string): unknown | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  set(key: string, value: unknown, ttlSeconds: number = 3600): void {
    // Clean up expired items if cache is getting full
    if (this.cache.size >= this.maxSize) {
      this.cleanup()
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttlSeconds * 1000)
    })
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }

  cleanup(): void {
    const now = Date.now()
    let cleanedCount = 0
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key)
        cleanedCount++
      }
    }
    
    if (cleanedCount > 0) {
      logger.info(`Cleaned up ${cleanedCount} expired cache entries`)
    }
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }
}

class CacheManager {
  private memoryCache = new MemoryCache()
  private redisClient: {
    get: (key: string) => Promise<string | null>
    setex: (key: string, ttlSeconds: number, value: string) => Promise<unknown>
    del: (...keys: string[]) => Promise<unknown>
    keys: (pattern: string) => Promise<string[]>
    on: (event: 'error', callback: (error: Error) => void) => void
  } | null = null
  private readonly initializationPromise: Promise<void>

  constructor() {
    this.initializationPromise = this.initializeRedis()
  }

  private async initializeRedis() {
    try {
      const redisUrl = process.env.REDIS_URL
      if (!redisUrl) {
        console.log('Redis URL not configured, using memory cache only')
        return
      }

      // Lazy load Redis to avoid build-time issues
      const { Redis } = await import('ioredis')
      this.redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        lazyConnect: true
      })

      this.redisClient.on('error', (error: Error) => {
        console.error('Redis connection error:', error)
        this.redisClient = null
      })

      console.log('Redis cache initialized successfully')
    } catch (error) {
      console.warn('Redis initialization failed, using memory cache:', error)
      this.redisClient = null
    }
  }

  private async ensureInitialized(): Promise<void> {
    await this.initializationPromise
  }

  async get(key: string): Promise<unknown | null> {
    try {
      await this.ensureInitialized()

      // L1: Memory cache (fastest)
      const memoryResult = this.memoryCache.get(key)
      if (memoryResult !== null) {
        return memoryResult
      }

      // L2: Redis cache (if available)
      if (this.redisClient) {
        const redisResult = await this.redisClient.get(key)
        if (redisResult) {
          const parsed = JSON.parse(redisResult)
          // Store in memory cache for next time
          this.memoryCache.set(key, parsed, 300) // 5 minutes in memory
          return parsed
        }
      }

      return null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number = 3600): Promise<void> {
    try {
      await this.ensureInitialized()

      // Store in memory cache
      this.memoryCache.set(key, value, Math.min(ttlSeconds, 300)) // Max 5 minutes in memory

      // Store in Redis if available
      if (this.redisClient) {
        await this.redisClient.setex(key, ttlSeconds, JSON.stringify(value))
      }
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.ensureInitialized()

      this.memoryCache.delete(key)
      
      if (this.redisClient) {
        await this.redisClient.del(key)
      }
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      await this.ensureInitialized()

      if (this.redisClient) {
        const keys = await this.redisClient.keys(pattern)
        if (Array.isArray(keys) && keys.length > 0) {
          await this.redisClient.del(...keys)
        }
      }
    } catch (error) {
      console.error('Cache invalidate error:', error)
    } finally {
      // Always invalidate the in-memory layer, even if Redis is unavailable.
      this.memoryCache.invalidatePattern(pattern)
    }
  }

  clear(): void {
    this.memoryCache.clear()
  }

  getStats(): { size: number; keys: string[] } {
    return this.memoryCache.getStats()
  }

  cleanup(): void {
    this.memoryCache.cleanup()
  }
}

// Singleton cache manager
const cacheManager = new CacheManager()

// Cache key generators
function generateCacheKey(orgSlug: string, releaseSlug: string): string {
  return `release_note:${orgSlug}:${releaseSlug}`
}

// Cache operations using the cache manager
export async function getCachedReleaseNote(
  orgSlug: string, 
  releaseSlug: string
): Promise<unknown | null> {
  const key = generateCacheKey(orgSlug, releaseSlug)
  return cacheManager.get(key)
}

export async function getTypedCachedReleaseNote<T>(
  orgSlug: string,
  releaseSlug: string
): Promise<T | null> {
  const cached = await getCachedReleaseNote(orgSlug, releaseSlug)
  return cached as T | null
}

export async function setCachedReleaseNote(
  orgSlug: string, 
  releaseSlug: string, 
  data: unknown, 
  ttlSeconds: number = 3600
): Promise<void> {
  const key = generateCacheKey(orgSlug, releaseSlug)
  return cacheManager.set(key, data, ttlSeconds)
}

export async function invalidateCachedReleaseNote(
  orgSlug: string, 
  releaseSlug: string
): Promise<void> {
  const key = generateCacheKey(orgSlug, releaseSlug)
  return cacheManager.delete(key)
}

// Cache management
export function clearCache(): void {
  cacheManager.clear()
}

export function getCacheStats(): { size: number; keys: string[] } {
  return cacheManager.getStats()
}

// Cleanup expired entries
export function cleanupExpiredCache(): void {
  cacheManager.cleanup()
}

// Auto-cleanup interval (run every 10 minutes)
if (typeof window === 'undefined') {
  setInterval(cleanupExpiredCache, 10 * 60 * 1000)
}

// General cache functions
export async function getCache(key: string) {
  return cacheManager.get(key)
}

export async function getTypedCache<T>(key: string) {
  const cached = await cacheManager.get(key)
  return cached as T | null
}

export async function setCache(key: string, value: unknown, ttlSeconds: number = 3600) {
  return cacheManager.set(key, value, ttlSeconds)
}

export async function deleteCache(key: string) {
  return cacheManager.delete(key)
}

export async function invalidateCache(pattern: string) {
  return cacheManager.invalidatePattern(pattern)
}

export { cacheManager } 
