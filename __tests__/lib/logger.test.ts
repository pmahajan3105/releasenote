import { 
  logger, 
  LogLevel, 
  LogContext,
  logApiRequest,
  logApiResponse,
  logApiError,
  logUserAction,
  logPerformance,
  logErrorBoundary,
  logDevelopment
} from '@/lib/logger'

// Mock console methods
const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
}

// Mock fs for file logging
const mockFs = {
  writeFileSync: jest.fn(),
  appendFileSync: jest.fn(),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
}

jest.mock('fs', () => mockFs)

describe('Logger', () => {
  let originalConsole: Console

  beforeEach(() => {
    jest.clearAllMocks()
    originalConsole = global.console
    global.console = mockConsole as any
  })

  afterEach(() => {
    global.console = originalConsole
  })

  describe('Basic Logging', () => {
    it('logs info messages', () => {
      logger.info('Test info message')
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('Test info message')
      )
    })

    it('logs error messages', () => {
      logger.error('Test error message')
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('Test error message')
      )
    })

    it('logs warning messages', () => {
      logger.warn('Test warning message')
      
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('Test warning message')
      )
    })

    it('logs debug messages', () => {
      const originalEnv = process.env.NODE_ENV
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true
      })
      
      logger.debug('Test debug message')
      
      expect(mockConsole.debug).toHaveBeenCalledWith(
        expect.stringContaining('Test debug message')
      )
      
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true
      })
    })
  })

  describe('Structured Logging', () => {
    it('logs with context metadata', () => {
      const context: LogContext = { 
        userId: 123, 
        action: 'login', 
        timestamp: '2024-01-15T10:30:00Z' 
      }
      
      logger.info('User action', context)
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('User action')
      )
    })

    it('logs with request context', () => {
      const requestContext: LogContext = {
        requestId: 'req-123',
        method: 'POST',
        path: '/api/release-notes',
        userAgent: 'Mozilla/5.0...'
      }
      
      logger.info('API request', requestContext)
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('API request')
      )
    })

    it('logs performance metrics', () => {
      const metrics: LogContext = {
        operation: 'generate-release-note',
        duration: 1250,
        success: true,
        cacheHit: false
      }
      
      logger.info('Performance metric', metrics)
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('Performance metric')
      )
    })
  })

  describe('Database Error Logging', () => {
    it('logs database errors with context', () => {
      const error = { 
        message: 'Connection failed', 
        code: 'ECONNREFUSED',
        details: 'Database server unavailable'
      }
      const context: LogContext = { table: 'users', operation: 'select' }
      
      logger.dbError('fetch users', error, context)
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('Database operation failed: fetch users')
      )
    })

    it('handles null database errors', () => {
      logger.dbError('test operation', null, {})
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('Database operation failed: test operation')
      )
    })

    it('logs database errors with full context', () => {
      const error = {
        message: 'Unique constraint violation',
        code: '23505',
        details: 'Key (email)=(test@example.com) already exists',
        hint: 'Use ON CONFLICT clause'
      }
      
      logger.dbError('insert user', error)
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('Database operation failed: insert user')
      )
    })
  })

  describe('API Logging Utilities', () => {
    it('logs API requests', () => {
      logApiRequest('POST', '/api/release-notes', { userId: 123 })
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('API Request: POST /api/release-notes')
      )
    })

    it('logs API responses', () => {
      logApiResponse('GET', '/api/users', 200, 150, { count: 5 })
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('API Response: GET /api/users - 200 (150ms)')
      )
    })

    it('logs API errors', () => {
      const error = new Error('Internal server error')
      error.stack = 'Error: Internal server error\n    at handler.js:1:1'
      
      logApiError('POST', '/api/users', error, { userId: 123 })
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('API Error: POST /api/users')
      )
    })
  })

  describe('User Action Logging', () => {
    it('logs user actions', () => {
      logUserAction('user-123', 'create_release_note', { noteId: 'note-456' })
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('User Action: create_release_note')
      )
    })

    it('logs user actions without context', () => {
      logUserAction('user-123', 'login')
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('User Action: login')
      )
    })
  })

  describe('Performance Logging', () => {
    it('logs fast operations as info', () => {
      logPerformance('database_query', 150, { query: 'SELECT * FROM users' })
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('Performance: database_query took 150ms')
      )
    })

    it('logs slow operations as warnings', () => {
      logPerformance('slow_operation', 6000, { operation: 'bulk_import' })
      
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('Performance: slow_operation took 6000ms')
      )
    })
  })

  describe('Error Boundary Logging', () => {
    it('logs React error boundary errors', () => {
      const error = new Error('Component crashed')
      const errorInfo = {
        componentStack: 'in Component\n    in App'
      }
      
      logErrorBoundary(error, errorInfo, { userId: 123 })
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('React Error Boundary caught an error')
      )
    })

    it('handles errors without stack traces', () => {
      const error = new Error('Simple error')
      delete error.stack
      
      logErrorBoundary(error, {}, {})
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('React Error Boundary caught an error')
      )
    })
  })

  describe('Development Logging', () => {
    it('logs development messages in development environment', () => {
      const originalEnv = process.env.NODE_ENV
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true
      })
      
      logDevelopment('Debug information', { component: 'TestComponent' })
      
      expect(mockConsole.debug).toHaveBeenCalledWith(
        expect.stringContaining('[DEV] Debug information')
      )
      
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true
      })
    })

    it('does not log development messages in production', () => {
      const originalEnv = process.env.NODE_ENV
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true
      })
      
      logDevelopment('Debug information')
      
      expect(mockConsole.debug).not.toHaveBeenCalled()
      
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true
      })
    })
  })

  describe('Log Formatting', () => {
    it('formats timestamps correctly', () => {
      logger.info('Timestamp test')
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/)
      )
    })

    it('includes log level in output', () => {
      logger.error('Level test')
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('"level":"ERROR"')
      )
    })

    it('includes message in JSON format', () => {
      logger.info('JSON test')
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('"message":"JSON test"')
      )
    })

    it('includes context in JSON format', () => {
      const context = { userId: 123, action: 'test' }
      logger.info('Context test', context)
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('"context"')
      )
    })
  })

  describe('Log Levels', () => {
    it('respects log level in development', () => {
      const originalEnv = process.env.NODE_ENV
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true
      })
      
      // All levels should be logged in development
      logger.debug('Debug message')
      logger.info('Info message')
      logger.warn('Warning message')
      logger.error('Error message')
      
      expect(mockConsole.debug).toHaveBeenCalled()
      expect(mockConsole.info).toHaveBeenCalled()
      expect(mockConsole.warn).toHaveBeenCalled()
      expect(mockConsole.error).toHaveBeenCalled()
      
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true
      })
    })

    it('respects log level in production', () => {
      const originalEnv = process.env.NODE_ENV
      const originalLogLevel = process.env.LOG_LEVEL
      
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true
      })
      Object.defineProperty(process.env, 'LOG_LEVEL', {
        value: 'warn',
        writable: true,
        configurable: true
      })
      
      // Only warn and error should be logged
      logger.debug('Debug message')
      logger.info('Info message')
      logger.warn('Warning message')
      logger.error('Error message')
      
      expect(mockConsole.debug).not.toHaveBeenCalled()
      expect(mockConsole.info).not.toHaveBeenCalled()
      expect(mockConsole.warn).toHaveBeenCalled()
      expect(mockConsole.error).toHaveBeenCalled()
      
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true
      })
      Object.defineProperty(process.env, 'LOG_LEVEL', {
        value: originalLogLevel,
        writable: true,
        configurable: true
      })
    })
  })

  describe('Error Handling', () => {
    it('handles circular references in context', () => {
      const circularContext: Record<string, unknown> = { name: 'test' }
      circularContext.self = circularContext
      
      expect(() => logger.info('Circular test', circularContext)).not.toThrow()
    })

    it('handles undefined and null context', () => {
      const logInfo = logger.info.bind(logger) as (message: string, context?: unknown) => void
      expect(() => logInfo('Null test', null)).not.toThrow()
      expect(() => logger.info('Undefined test', undefined)).not.toThrow()
    })

    it('handles very large context objects', () => {
      const largeContext = {
        data: 'x'.repeat(10000),
        nested: {
          more: 'y'.repeat(5000)
        }
      }
      
      expect(() => logger.info('Large context test', largeContext)).not.toThrow()
    })
  })

  describe('Environment-specific Behavior', () => {
    it('uses pretty printing in development', () => {
      const originalEnv = process.env.NODE_ENV
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true,
      })
      
      logger.info('Pretty print test', { key: 'value' })
      
      // Should use pretty printing (multi-line JSON)
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('{\n')
      )
      
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true,
      })
    })

    it('uses single line JSON in production', () => {
      const originalEnv = process.env.NODE_ENV
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      })
      
      logger.info('Single line test', { key: 'value' })
      
      // Should use single line JSON
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.not.stringContaining('{\n')
      )
      
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true,
      })
    })
  })
})
