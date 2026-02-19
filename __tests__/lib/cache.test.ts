import { 
  getCache, 
  setCache, 
  deleteCache, 
  invalidateCache,
  getCachedReleaseNote,
  setCachedReleaseNote,
  invalidateCachedReleaseNote,
  clearCache,
  getCacheStats,
  cleanupExpiredCache
} from '@/lib/cache'

// Mock Redis client
const mockRedis = {
  get: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  keys: jest.fn(),
  ping: jest.fn(),
  info: jest.fn(),
  quit: jest.fn(),
  on: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
}

function setRedisMockDefaults() {
  mockRedis.get.mockResolvedValue(null)
  mockRedis.setex.mockResolvedValue('OK')
  mockRedis.del.mockResolvedValue(1)
  mockRedis.keys.mockResolvedValue([])
  mockRedis.ping.mockResolvedValue('PONG')
}

jest.mock('ioredis', () => ({
  Redis: jest.fn(() => mockRedis),
}))

describe('Cache', () => {
  let consoleLogSpy: jest.SpyInstance
  let consoleInfoSpy: jest.SpyInstance
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => {})
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    jest.clearAllMocks()
    setRedisMockDefaults()
    clearCache() // Clear in-memory cache
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    consoleInfoSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  describe('Basic Cache Operations', () => {
    it('gets value from cache', async () => {
      await setCache('test-key', 'cached-value')
      const result = await getCache('test-key')
      
      expect(result).toBe('cached-value')
    })

    it('returns null for non-existent key', async () => {
      const result = await getCache('non-existent-key')
      
      expect(result).toBeNull()
    })

    it('sets value in cache', async () => {
      await setCache('test-key', 'test-value')
      const result = await getCache('test-key')
      
      expect(result).toBe('test-value')
    })

    it('sets value with TTL', async () => {
      await setCache('test-key', 'test-value', 1) // 1 second TTL
      
      // Should exist immediately
      let result = await getCache('test-key')
      expect(result).toBe('test-value')
      
      // Should expire after TTL
      await new Promise(resolve => setTimeout(resolve, 1100))
      result = await getCache('test-key')
      expect(result).toBeNull()
    })

    it('deletes value from cache', async () => {
      await setCache('test-key', 'test-value')
      let result = await getCache('test-key')
      expect(result).toBe('test-value')
      
      await deleteCache('test-key')
      result = await getCache('test-key')
      expect(result).toBeNull()
    })

    it('clears entire cache', async () => {
      await setCache('key1', 'value1')
      await setCache('key2', 'value2')
      
      clearCache()
      
      expect(await getCache('key1')).toBeNull()
      expect(await getCache('key2')).toBeNull()
    })
  })

  describe('Release Note Cache', () => {
    it('caches release notes with specific key format', async () => {
      const orgSlug = 'test-org'
      const releaseSlug = 'test-release'
      const data = {
        note: { title: 'Test Release', content: 'Release content' },
        organization: { name: 'Test Org' }
      }

      await setCachedReleaseNote(orgSlug, releaseSlug, data)
      const result = await getCachedReleaseNote(orgSlug, releaseSlug)
      
      expect(result).toEqual(data)
    })

    it('returns null for non-existent release note', async () => {
      const result = await getCachedReleaseNote('non-existent-org', 'non-existent-release')
      
      expect(result).toBeNull()
    })

    it('invalidates specific release notes', async () => {
      const orgSlug = 'test-org'
      const releaseSlug = 'test-release'
      const data = { note: { title: 'Test Release' } }

      await setCachedReleaseNote(orgSlug, releaseSlug, data)
      let result = await getCachedReleaseNote(orgSlug, releaseSlug)
      expect(result).toEqual(data)

      await invalidateCachedReleaseNote(orgSlug, releaseSlug)
      result = await getCachedReleaseNote(orgSlug, releaseSlug)
      expect(result).toBeNull()
    })

    it('handles TTL for release notes', async () => {
      const orgSlug = 'test-org'
      const releaseSlug = 'test-release'
      const data = { note: { title: 'Test Release' } }

      await setCachedReleaseNote(orgSlug, releaseSlug, data, 1) // 1 second TTL
      
      // Should exist immediately
      let result = await getCachedReleaseNote(orgSlug, releaseSlug)
      expect(result).toEqual(data)
      
      // Should expire after TTL
      await new Promise(resolve => setTimeout(resolve, 1100))
      result = await getCachedReleaseNote(orgSlug, releaseSlug)
      expect(result).toBeNull()
    })
  })

  describe('JSON Object Caching', () => {
    it('stores and retrieves JSON objects', async () => {
      const testObject = { 
        id: 1, 
        name: 'Test', 
        active: true, 
        metadata: { tags: ['test', 'cache'] } 
      }
      
      await setCache('json-key', testObject)
      const result = await getCache('json-key')
      
      expect(result).toEqual(testObject)
    })

    it('handles complex nested objects', async () => {
      const complexObject = {
        user: {
          id: 1,
          profile: {
            name: 'John Doe',
            settings: {
              theme: 'dark',
              notifications: true
            }
          }
        },
        permissions: ['read', 'write'],
        lastLogin: new Date().toISOString()
      }
      
      await setCache('complex-key', complexObject)
      const result = await getCache('complex-key')
      
      expect(result).toEqual(complexObject)
    })

    it('handles arrays', async () => {
      const arrayData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' }
      ]
      
      await setCache('array-key', arrayData)
      const result = await getCache('array-key')
      
      expect(result).toEqual(arrayData)
    })
  })

  describe('Cache Statistics', () => {
    it('returns cache statistics', () => {
      const stats = getCacheStats()
      
      expect(stats).toHaveProperty('size')
      expect(stats).toHaveProperty('keys')
      expect(Array.isArray(stats.keys)).toBe(true)
    })

    it('tracks cache size correctly', async () => {
      await setCache('key1', 'value1')
      await setCache('key2', 'value2')
      await setCache('key3', 'value3')
      
      const stats = getCacheStats()
      
      expect(stats.size).toBe(3)
      expect(stats.keys).toContain('key1')
      expect(stats.keys).toContain('key2')
      expect(stats.keys).toContain('key3')
    })

    it('updates size after deletions', async () => {
      await setCache('key1', 'value1')
      await setCache('key2', 'value2')
      
      let stats = getCacheStats()
      expect(stats.size).toBe(2)
      
      await deleteCache('key1')
      
      stats = getCacheStats()
      expect(stats.size).toBe(1)
      expect(stats.keys).not.toContain('key1')
      expect(stats.keys).toContain('key2')
    })
  })

  describe('Cache Cleanup', () => {
    it('cleans up expired entries', async () => {
      await setCache('persistent-key', 'persistent-value', 3600)
      await setCache('expired-key', 'expired-value', 1)
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      cleanupExpiredCache()
      
      expect(await getCache('persistent-key')).toBe('persistent-value')
      expect(await getCache('expired-key')).toBeNull()
    })

    it('handles cleanup of multiple expired entries', async () => {
      await setCache('key1', 'value1', 1)
      await setCache('key2', 'value2', 1)
      await setCache('key3', 'value3', 3600)
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      cleanupExpiredCache()
      
      const stats = getCacheStats()
      expect(stats.size).toBe(1)
      expect(stats.keys).toContain('key3')
      expect(stats.keys).not.toContain('key1')
      expect(stats.keys).not.toContain('key2')
    })
  })

  describe('Pattern Invalidation', () => {
    it('invalidates keys matching pattern', async () => {
      await setCache('user:1:profile', 'profile1')
      await setCache('user:1:settings', 'settings1')
      await setCache('user:2:profile', 'profile2')
      await setCache('other:data', 'other')
      
      await invalidateCache('user:1:*')
      
      expect(await getCache('user:1:profile')).toBeNull()
      expect(await getCache('user:1:settings')).toBeNull()
      expect(await getCache('user:2:profile')).toBe('profile2')
      expect(await getCache('other:data')).toBe('other')
    })
  })

  describe('Error Handling', () => {
    it('handles cache errors gracefully', async () => {
      // Mock Redis error
      mockRedis.setex.mockRejectedValue(new Error('Redis connection failed'))
      
      // Should not throw error
      await expect(setCache('test-key', 'test-value')).resolves.not.toThrow()
      
      // Should still work with in-memory cache
      const result = await getCache('test-key')
      expect(result).toBe('test-value')
    })

    it('handles get errors gracefully', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis get failed'))
      
      await expect(getCache('test-key')).resolves.not.toThrow()
    })

    it('handles delete errors gracefully', async () => {
      mockRedis.del.mockRejectedValue(new Error('Redis delete failed'))
      
      await expect(deleteCache('test-key')).resolves.not.toThrow()
    })
  })

  describe('Multi-level Caching', () => {
    it('implements L1 memory cache', async () => {
      await setCache('test-key', 'test-value')
      
      // First get should store in memory cache
      const result1 = await getCache('test-key')
      expect(result1).toBe('test-value')
      
      // Second get should come from memory cache (faster)
      const result2 = await getCache('test-key')
      expect(result2).toBe('test-value')
    })

    it('falls back to Redis when memory cache misses', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify('redis-value'))
      
      const result = await getCache('redis-only-key')
      
      expect(result).toBe('redis-value')
      expect(mockRedis.get).toHaveBeenCalledWith('redis-only-key')
    })
  })

  describe('Performance', () => {
    it('handles large number of cache operations', async () => {
      const operations = []
      
      // Set 100 cache entries
      for (let i = 0; i < 100; i++) {
        operations.push(setCache(`key-${i}`, `value-${i}`))
      }
      
      await Promise.all(operations)
      
      // Verify all entries exist
      for (let i = 0; i < 100; i++) {
        const result = await getCache(`key-${i}`)
        expect(result).toBe(`value-${i}`)
      }
    })

    it('measures cache performance', async () => {
      const start = Date.now()
      
      await setCache('perf-key', 'perf-value')
      await getCache('perf-key')
      
      const end = Date.now()
      const duration = end - start
      
      expect(duration).toBeLessThan(100) // Should be fast
    })
  })
})
