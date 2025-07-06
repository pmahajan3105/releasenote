/**
 * Structured logging utility for the application
 * Provides consistent logging across client and server environments
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  [key: string]: any
}

export interface Logger {
  debug(message: string, context?: LogContext): void
  info(message: string, context?: LogContext): void
  warn(message: string, context?: LogContext): void
  error(message: string, context?: LogContext): void
  dbError(operation: string, error: any, context?: LogContext): void
}

class ConsoleLogger implements Logger {
  private getCurrentLogLevel(): LogLevel {
    // Check environment variables dynamically
    if (process.env.NODE_ENV === 'development') {
      return 'debug'
    } else if (process.env.LOG_LEVEL) {
      return process.env.LOG_LEVEL as LogLevel
    }
    return 'info'
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    const currentLogLevel = this.getCurrentLogLevel()
    const currentLevelIndex = levels.indexOf(currentLogLevel)
    const messageLevel = levels.indexOf(level)
    return messageLevel >= currentLevelIndex
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...(context && { context })
    }

    try {
      // In development, use pretty printing
      if (process.env.NODE_ENV === 'development') {
        return JSON.stringify(logEntry, null, 2)
      }

      // In production, use single line JSON
      return JSON.stringify(logEntry)
    } catch (error) {
      // Handle circular references
      try {
        const safeEntry = {
          timestamp,
          level: level.toUpperCase(),
          message,
          context: '[Circular reference detected]'
        }
        return JSON.stringify(safeEntry)
      } catch (fallbackError) {
        // Final fallback
        return `${timestamp} ${level.toUpperCase()} ${message}`
      }
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, context))
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, context))
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context))
    }
  }

  error(message: string, context?: LogContext): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, context))
    }
  }

  dbError(operation: string, error: any, context?: LogContext): void {
    const errorContext = {
      operation,
      error: {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      },
      ...context
    }

    this.error(`Database operation failed: ${operation}`, errorContext)
  }
}

// Singleton logger instance
export const logger: Logger = new ConsoleLogger()

// Utility functions for common logging patterns
export function logApiRequest(method: string, path: string, context?: LogContext): void {
  logger.info(`API Request: ${method} ${path}`, context)
}

export function logApiResponse(method: string, path: string, statusCode: number, duration: number, context?: LogContext): void {
  logger.info(`API Response: ${method} ${path} - ${statusCode} (${duration}ms)`, context)
}

export function logApiError(method: string, path: string, error: any, context?: LogContext): void {
  const errorContext = {
    method,
    path,
    error: {
      message: error?.message,
      stack: error?.stack,
      statusCode: error?.statusCode
    },
    ...context
  }

  logger.error(`API Error: ${method} ${path}`, errorContext)
}

export function logUserAction(userId: string, action: string, context?: LogContext): void {
  logger.info(`User Action: ${action}`, {
    userId,
    action,
    ...context
  })
}

export function logPerformance(operation: string, duration: number, context?: LogContext): void {
  const level = duration > 5000 ? 'warn' : 'info'
  logger[level](`Performance: ${operation} took ${duration}ms`, context)
}

// Error boundary logging
export function logErrorBoundary(error: Error, errorInfo: any, context?: LogContext): void {
  logger.error('React Error Boundary caught an error', {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    errorInfo,
    ...context
  })
}

// Development helpers
export function logDevelopment(message: string, context?: LogContext): void {
  if (process.env.NODE_ENV === 'development') {
    logger.debug(`[DEV] ${message}`, context)
  }
} 