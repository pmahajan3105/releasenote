import { toast } from './toast'

export interface ErrorContext {
  operation?: string
  component?: string
  userId?: string
  orgId?: string
  additionalData?: Record<string, unknown>
}

export interface AppErrorOptions {
  code?: string
  statusCode?: number
  isRetryable?: boolean
  context?: ErrorContext
  originalError?: unknown
}

export class AppError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly isRetryable: boolean
  public readonly context?: ErrorContext
  public readonly originalError?: unknown

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message)
    this.name = 'AppError'
    this.code = options.code || 'UNKNOWN_ERROR'
    this.statusCode = options.statusCode || 500
    this.isRetryable = options.isRetryable || false
    this.context = options.context
    this.originalError = options.originalError
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, {
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      isRetryable: false,
      context
    })
  }
}

export class NetworkError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, {
      code: 'NETWORK_ERROR',
      statusCode: 0,
      isRetryable: true,
      context
    })
  }
}

export class AuthError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, {
      code: 'AUTH_ERROR',
      statusCode: 401,
      isRetryable: false,
      context
    })
  }
}

export class ServerError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, {
      code: 'SERVER_ERROR',
      statusCode: 500,
      isRetryable: true,
      context
    })
  }
}

class ErrorHandler {
  private logError(error: Error, context?: ErrorContext) {
    const logData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...context
    }

    // In production, you would send this to a logging service
    console.error('Error logged:', logData)
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof AppError) {
      return error.message
    }
    
    if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as Record<string, unknown>).message === 'string') {
      return (error as { message: string }).message
    }
    
    if (typeof error === 'string') {
      return error
    }
    
    return 'An unexpected error occurred'
  }

  private shouldShowRetry(error: unknown): boolean {
    if (error instanceof AppError) {
      return error.isRetryable
    }
    
    if (typeof error === 'object' && error !== null) {
      if ('statusCode' in error && typeof (error as Record<string, unknown>).statusCode === 'number' && Number((error as Record<string, unknown>).statusCode) >= 500) {
        return true
      }
      if ('code' in error && (error as Record<string, unknown>).code === 'NETWORK_ERROR') {
        return true
      }
    }
    
    return false
  }

  // Handle errors with user feedback
  handle(error: unknown, context?: ErrorContext): void {
    if (error instanceof Error) {
      this.logError(error, context)
    } else {
      this.logError(new Error(this.getErrorMessage(error)), context)
    }
    const message = this.getErrorMessage(error)
    const shouldRetry = this.shouldShowRetry(error)
    
    if (shouldRetry) {
      toast.error(message, {
        action: {
          label: 'Retry',
          onClick: () => {
            // Emit a retry event or call a retry callback
            if (context?.additionalData?.retryCallback && typeof context.additionalData.retryCallback === 'function') {
              context.additionalData.retryCallback()
            }
          }
        }
      })
    } else {
      toast.error(message)
    }
  }

  // Handle validation errors
  handleValidation(error: unknown, context?: ErrorContext): void {
    if (error instanceof Error) {
      this.logError(error, context)
    } else {
      this.logError(new Error(this.getErrorMessage(error)), context)
    }
    toast.validationError(this.getErrorMessage(error))
  }

  // Handle network errors
  handleNetwork(error: unknown, context?: ErrorContext): void {
    if (error instanceof Error) {
      this.logError(error, context)
    } else {
      this.logError(new Error(this.getErrorMessage(error)), context)
    }
    toast.networkError(context?.operation)
  }

  // Handle auth errors
  handleAuth(error: unknown, context?: ErrorContext): void {
    this.logError(error, context)
    toast.error('Authentication failed. Please log in again.')
    
    // In a real app, you might redirect to login
    // window.location.href = '/login'
  }

  // Handle success operations
  handleSuccess(operation: string): void {
    toast.operationSuccess(operation)
  }

  // Handle async operations with loading states
  async handleAsync<T>(
    operation: Promise<T>,
    loadingMessage: string,
    successMessage: string,
    context?: ErrorContext
  ): Promise<T> {
    try {
      const result = await toast.promise(operation, loadingMessage, successMessage)
      return result
    } catch (error) {
      this.handle(error, context)
      throw error
    }
  }
}

export const errorHandler = new ErrorHandler()

// Utility functions for common error scenarios
export const handleApiError = (error: unknown, operation: string, component: string) => {
  const context: ErrorContext = {
    operation,
    component,
    additionalData: { timestamp: new Date().toISOString() }
  }
  
  if (typeof error === 'object' && error !== null && 'status' in error && Number((error as Record<string, unknown>).status) === 401) {
    errorHandler.handleAuth(error, context)
  } else if (
    typeof error === 'object' && error !== null &&
    'status' in error && typeof (error as Record<string, unknown>).status === 'number' && Number((error as Record<string, unknown>).status) >= 400 && Number((error as Record<string, unknown>).status) < 500
  ) {
    errorHandler.handleValidation(error, context)
  } else if (
    typeof error === 'object' && error !== null &&
    'status' in error && typeof (error as Record<string, unknown>).status === 'number' && Number((error as Record<string, unknown>).status) >= 500
  ) {
    errorHandler.handle(new ServerError('Server error occurred', context))
  } else if (!navigator.onLine) {
    errorHandler.handleNetwork(new NetworkError('Network connection lost', context))
  } else {
    errorHandler.handle(error, context)
  }
}

export const handleFormError = (error: unknown, formName: string) => {
  errorHandler.handleValidation(error, {
    operation: 'form submission',
    component: formName
  })
}

export const handleAsyncOperation = async <T>(
  operation: Promise<T>,
  operationName: string,
  componentName: string
): Promise<T> => {
  return errorHandler.handleAsync(
    operation,
    `${operationName}...`,
    `${operationName} completed successfully`,
    {
      operation: operationName,
      component: componentName
    }
  )
}