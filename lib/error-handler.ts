export type ErrorType = 'network' | 'server' | 'validation' | 'authentication' | 'authorization' | 'notfound' | 'generic'

export interface AppError {
  type: ErrorType
  message: string
  details?: string
  statusCode?: number
}

export class AppErrorHandler {
  static fromResponse(response: Response): AppError {
    const { status } = response
    
    if (status >= 500) {
      return {
        type: 'server',
        message: 'Server error occurred. Please try again later.',
        statusCode: status
      }
    }
    
    if (status === 401) {
      return {
        type: 'authentication',
        message: 'Please log in to continue.',
        statusCode: status
      }
    }
    
    if (status === 403) {
      return {
        type: 'authorization',
        message: 'You don\'t have permission to perform this action.',
        statusCode: status
      }
    }
    
    if (status === 404) {
      return {
        type: 'notfound',
        message: 'The requested resource was not found.',
        statusCode: status
      }
    }
    
    if (status >= 400) {
      return {
        type: 'validation',
        message: 'Please check your input and try again.',
        statusCode: status
      }
    }
    
    return {
      type: 'generic',
      message: 'An unexpected error occurred.',
      statusCode: status
    }
  }
  
  static fromError(error: Error): AppError {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        type: 'network',
        message: 'Unable to connect. Please check your internet connection.',
        details: error.message
      }
    }
    
    return {
      type: 'generic',
      message: error.message || 'An unexpected error occurred.',
      details: error.stack
    }
  }
  
  static async fromAPIResponse(response: Response): Promise<AppError> {
    const baseError = AppErrorHandler.fromResponse(response)
    
    try {
      const data = await response.json()
      if (data.error) {
        baseError.message = data.error
      }
      if (data.details) {
        baseError.details = data.details
      }
    } catch {
      // Ignore JSON parsing errors, use base error
    }
    
    return baseError
  }
}

export function handleSupabaseError(error: any): AppError {
  if (error?.code) {
    switch (error.code) {
      case '23505': // unique_violation
        return {
          type: 'validation',
          message: 'This item already exists.',
          details: error.message
        }
      case '23503': // foreign_key_violation
        return {
          type: 'validation',
          message: 'Cannot complete action due to related data.',
          details: error.message
        }
      case 'PGRST116': // Row Level Security
        return {
          type: 'authorization',
          message: 'You don\'t have permission to access this data.',
          details: error.message
        }
      default:
        return {
          type: 'server',
          message: error.message || 'Database error occurred.',
          details: error.details
        }
    }
  }
  
  return {
    type: 'generic',
    message: error.message || 'An unexpected database error occurred.',
    details: error.toString()
  }
}

export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<{ data?: T; error?: AppError }> {
  try {
    const data = await operation()
    return { data }
  } catch (err) {
    let error: AppError
    
    if (err instanceof Response) {
      error = await AppErrorHandler.fromAPIResponse(err)
    } else if (err instanceof Error) {
      error = AppErrorHandler.fromError(err)
    } else {
      error = {
        type: 'generic',
        message: 'An unexpected error occurred.'
      }
    }
    
    if (context) {
      error.message = `${context}: ${error.message}`
    }
    
    console.error('Error in operation:', { error, context })
    return { error }
  }
}