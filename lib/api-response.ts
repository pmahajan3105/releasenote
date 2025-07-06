import { NextResponse } from 'next/server'

/**
 * Standard API Response Interface
 * All API responses should follow this structure for consistency
 */
export interface ApiResponse<T = unknown> {
  /** Whether the request was successful */
  success: boolean
  /** Response data (only present on success) */
  data?: T
  /** Error information (only present on failure) */
  error?: {
    /** Error message */
    message: string
    /** Error code for programmatic handling */
    code?: string
    /** Additional error details */
    details?: unknown
  }
  /** Additional metadata */
  meta?: {
    /** Request timestamp */
    timestamp: string
    /** API version */
    version?: string
    /** Pagination info */
    pagination?: {
      page: number
      per_page: number
      total: number
      has_more: boolean
    }
    /** Performance metrics */
    performance?: {
      duration_ms: number
    }
  }
}

/**
 * Standard error codes for consistent error handling
 */
export const API_ERROR_CODES = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  RESOURCE_LIMIT_EXCEEDED: 'RESOURCE_LIMIT_EXCEEDED',
  
  // External Services
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  GITHUB_API_ERROR: 'GITHUB_API_ERROR',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  
  // General
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
} as const

export type ApiErrorCode = typeof API_ERROR_CODES[keyof typeof API_ERROR_CODES]

/**
 * Create a successful API response
 */
export function createSuccessResponse<T>(
  data: T,
  options?: {
    status?: number
    meta?: ApiResponse<T>['meta']
  }
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0',
      ...options?.meta
    }
  }

  return NextResponse.json(response, { status: options?.status || 200 })
}

/**
 * Create an error API response
 */
export function createErrorResponse(
  message: string,
  options?: {
    status?: number
    code?: ApiErrorCode
    details?: unknown
    meta?: ApiResponse['meta']
  }
): NextResponse<ApiResponse> {
  const response: ApiResponse = {
    success: false,
    error: {
      message,
      code: options?.code,
      details: options?.details
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0',
      ...options?.meta
    }
  }

  return NextResponse.json(response, { status: options?.status || 500 })
}

/**
 * Create a paginated success response
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    page: number
    per_page: number
    total: number
  },
  options?: {
    status?: number
    meta?: Omit<ApiResponse<T[]>['meta'], 'pagination'>
  }
): NextResponse<ApiResponse<T[]>> {
  const response: ApiResponse<T[]> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0',
      pagination: {
        ...pagination,
        has_more: pagination.page * pagination.per_page < pagination.total
      },
      ...options?.meta
    }
  }

  return NextResponse.json(response, { status: options?.status || 200 })
}

/**
 * Common error response helpers
 */
export const ApiErrors = {
  unauthorized: (message = 'Unauthorized') => 
    createErrorResponse(message, { 
      status: 401, 
      code: API_ERROR_CODES.UNAUTHORIZED 
    }),

  forbidden: (message = 'Forbidden') => 
    createErrorResponse(message, { 
      status: 403, 
      code: API_ERROR_CODES.FORBIDDEN 
    }),

  notFound: (resource = 'Resource') => 
    createErrorResponse(`${resource} not found`, { 
      status: 404, 
      code: API_ERROR_CODES.NOT_FOUND 
    }),

  badRequest: (message = 'Bad request') => 
    createErrorResponse(message, { 
      status: 400, 
      code: API_ERROR_CODES.BAD_REQUEST 
    }),

  validation: (message: string, details?: unknown) => 
    createErrorResponse(message, { 
      status: 400, 
      code: API_ERROR_CODES.VALIDATION_ERROR,
      details 
    }),

  internalServer: (message = 'Internal server error') => 
    createErrorResponse(message, { 
      status: 500, 
      code: API_ERROR_CODES.INTERNAL_SERVER_ERROR 
    }),

  externalService: (service: string, details?: unknown) => 
    createErrorResponse(`External service error: ${service}`, { 
      status: 502, 
      code: API_ERROR_CODES.EXTERNAL_SERVICE_ERROR,
      details 
    })
}

/**
 * Performance tracking middleware helper
 */
export function withPerformanceTracking<T>(
  handler: () => Promise<NextResponse<ApiResponse<T>>>
): Promise<NextResponse<ApiResponse<T>>> {
  const startTime = Date.now()
  
  return handler().then(response => {
    const duration = Date.now() - startTime
    
    // Add performance metadata to successful responses
    if (response.status >= 200 && response.status < 300) {
      const body = response.body
      if (body) {
        try {
          const data = JSON.parse(body.toString()) as ApiResponse<T>
          if (data.meta) {
            data.meta.performance = { duration_ms: duration }
          }
          return NextResponse.json(data, { status: response.status })
        } catch {
          // If we can't parse the body, return the original response
          return response
        }
      }
    }
    
    return response
  })
} 