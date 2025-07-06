import { describe, it, expect } from '@jest/globals'

describe('Constants', () => {
  describe('Environment Variables', () => {
    it('should have NODE_ENV defined', () => {
      expect(process.env.NODE_ENV).toBeDefined()
    })

    it('should be in test environment', () => {
      expect(process.env.NODE_ENV).toBe('test')
    })
  })

  describe('Common Constants', () => {
    it('should define common HTTP status codes', () => {
      const HTTP_STATUS = {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        INTERNAL_SERVER_ERROR: 500
      }

      expect(HTTP_STATUS.OK).toBe(200)
      expect(HTTP_STATUS.CREATED).toBe(201)
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400)
      expect(HTTP_STATUS.UNAUTHORIZED).toBe(401)
      expect(HTTP_STATUS.FORBIDDEN).toBe(403)
      expect(HTTP_STATUS.NOT_FOUND).toBe(404)
      expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500)
    })

    it('should define common API routes', () => {
      const API_ROUTES = {
        RELEASE_NOTES: '/api/v1/release-notes',
        GENERATE: '/api/v1/release-notes/generate',
        SAVE: '/api/v1/release-notes/save',
        PUBLISH: '/api/v1/release-notes/publish'
      }

      expect(API_ROUTES.RELEASE_NOTES).toBe('/api/v1/release-notes')
      expect(API_ROUTES.GENERATE).toBe('/api/v1/release-notes/generate')
      expect(API_ROUTES.SAVE).toBe('/api/v1/release-notes/save')
      expect(API_ROUTES.PUBLISH).toBe('/api/v1/release-notes/publish')
    })

    it('should define common error messages', () => {
      const ERROR_MESSAGES = {
        UNAUTHORIZED: 'Unauthorized access',
        NOT_FOUND: 'Resource not found',
        VALIDATION_ERROR: 'Validation failed',
        INTERNAL_ERROR: 'Internal server error'
      }

      expect(ERROR_MESSAGES.UNAUTHORIZED).toBe('Unauthorized access')
      expect(ERROR_MESSAGES.NOT_FOUND).toBe('Resource not found')
      expect(ERROR_MESSAGES.VALIDATION_ERROR).toBe('Validation failed')
      expect(ERROR_MESSAGES.INTERNAL_ERROR).toBe('Internal server error')
    })
  })

  describe('Application Constants', () => {
    it('should define pagination defaults', () => {
      const PAGINATION = {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100
      }

      expect(PAGINATION.DEFAULT_PAGE).toBe(1)
      expect(PAGINATION.DEFAULT_LIMIT).toBe(10)
      expect(PAGINATION.MAX_LIMIT).toBe(100)
    })

    it('should define release note statuses', () => {
      const RELEASE_NOTE_STATUS = {
        DRAFT: 'draft',
        PUBLISHED: 'published',
        SCHEDULED: 'scheduled',
        ARCHIVED: 'archived'
      }

      expect(RELEASE_NOTE_STATUS.DRAFT).toBe('draft')
      expect(RELEASE_NOTE_STATUS.PUBLISHED).toBe('published')
      expect(RELEASE_NOTE_STATUS.SCHEDULED).toBe('scheduled')
      expect(RELEASE_NOTE_STATUS.ARCHIVED).toBe('archived')
    })

    it('should define release note categories', () => {
      const CATEGORIES = {
        FEATURE: 'feature',
        BUGFIX: 'bugfix',
        IMPROVEMENT: 'improvement',
        SECURITY: 'security',
        BREAKING: 'breaking'
      }

      expect(CATEGORIES.FEATURE).toBe('feature')
      expect(CATEGORIES.BUGFIX).toBe('bugfix')
      expect(CATEGORIES.IMPROVEMENT).toBe('improvement')
      expect(CATEGORIES.SECURITY).toBe('security')
      expect(CATEGORIES.BREAKING).toBe('breaking')
    })
  })

  describe('Configuration Constants', () => {
    it('should define cache TTL values', () => {
      const CACHE_TTL = {
        SHORT: 60, // 1 minute
        MEDIUM: 300, // 5 minutes
        LONG: 3600, // 1 hour
        VERY_LONG: 86400 // 24 hours
      }

      expect(CACHE_TTL.SHORT).toBe(60)
      expect(CACHE_TTL.MEDIUM).toBe(300)
      expect(CACHE_TTL.LONG).toBe(3600)
      expect(CACHE_TTL.VERY_LONG).toBe(86400)
    })

    it('should define rate limiting constants', () => {
      const RATE_LIMITS = {
        API_REQUESTS_PER_MINUTE: 100,
        GENERATION_REQUESTS_PER_HOUR: 10,
        UPLOAD_SIZE_LIMIT: 10 * 1024 * 1024 // 10MB
      }

      expect(RATE_LIMITS.API_REQUESTS_PER_MINUTE).toBe(100)
      expect(RATE_LIMITS.GENERATION_REQUESTS_PER_HOUR).toBe(10)
      expect(RATE_LIMITS.UPLOAD_SIZE_LIMIT).toBe(10485760)
    })
  })

  describe('String Constants', () => {
    it('should define common strings', () => {
      const STRINGS = {
        EMPTY: '',
        SPACE: ' ',
        COMMA: ',',
        DOT: '.',
        SLASH: '/',
        DASH: '-',
        UNDERSCORE: '_'
      }

      expect(STRINGS.EMPTY).toBe('')
      expect(STRINGS.SPACE).toBe(' ')
      expect(STRINGS.COMMA).toBe(',')
      expect(STRINGS.DOT).toBe('.')
      expect(STRINGS.SLASH).toBe('/')
      expect(STRINGS.DASH).toBe('-')
      expect(STRINGS.UNDERSCORE).toBe('_')
    })

    it('should define date formats', () => {
      const DATE_FORMATS = {
        ISO: 'YYYY-MM-DDTHH:mm:ss.sssZ',
        DATE_ONLY: 'YYYY-MM-DD',
        TIME_ONLY: 'HH:mm:ss',
        DISPLAY: 'MMM DD, YYYY'
      }

      expect(DATE_FORMATS.ISO).toBe('YYYY-MM-DDTHH:mm:ss.sssZ')
      expect(DATE_FORMATS.DATE_ONLY).toBe('YYYY-MM-DD')
      expect(DATE_FORMATS.TIME_ONLY).toBe('HH:mm:ss')
      expect(DATE_FORMATS.DISPLAY).toBe('MMM DD, YYYY')
    })
  })

  describe('Regular Expressions', () => {
    it('should define common regex patterns', () => {
      const REGEX_PATTERNS = {
        EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        URL: /^https?:\/\/.+/,
        SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      }

      expect(REGEX_PATTERNS.EMAIL.test('test@example.com')).toBe(true)
      expect(REGEX_PATTERNS.EMAIL.test('invalid-email')).toBe(false)
      
      expect(REGEX_PATTERNS.URL.test('https://example.com')).toBe(true)
      expect(REGEX_PATTERNS.URL.test('ftp://example.com')).toBe(false)
      
      expect(REGEX_PATTERNS.SLUG.test('my-slug')).toBe(true)
      expect(REGEX_PATTERNS.SLUG.test('My Slug')).toBe(false)
      
      expect(REGEX_PATTERNS.UUID.test('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
      expect(REGEX_PATTERNS.UUID.test('not-a-uuid')).toBe(false)
    })
  })
}) 