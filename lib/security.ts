/**
 * Security utilities for the Release Notes Generator
 * Implements comprehensive security measures
 */

import { NextRequest, NextResponse } from 'next/server'
import { createHash, randomBytes } from 'crypto'
import { z } from 'zod'

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function createRateLimit(options: {
  windowMs: number
  max: number
  keyGenerator?: (req: NextRequest) => string
}) {
  return async (req: NextRequest): Promise<{ success: boolean; error?: string }> => {
    const key = options.keyGenerator ? options.keyGenerator(req) : getClientIP(req)
    const now = Date.now()

    // Clean up old entries
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k)
      }
    }

    const current = rateLimitStore.get(key) || { count: 0, resetTime: now + options.windowMs }
    
    if (current.resetTime < now) {
      // Reset window
      current.count = 0
      current.resetTime = now + options.windowMs
    }

    if (current.count >= options.max) {
      return { success: false, error: 'Rate limit exceeded' }
    }

    current.count++
    rateLimitStore.set(key, current)
    
    return { success: true }
  }
}

// Default rate limiters
export const apiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
})

export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
})

export const publicRateLimit = createRateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute for public pages
})

// Security headers
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.github.com https://api.linear.app https://*.supabase.co https://*.openai.azure.com",
      "media-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ')
  )

  // Other security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // HSTS (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }

  return response
}

// Input validation schemas
export const schemas = {
  email: z.string().email().max(254),
  password: z.string().min(8).max(128).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(200).trim(),
  content: z.string().min(1).max(50000),
  url: z.string().url().max(2048),
  uuid: z.string().uuid(),
  organizationName: z.string().min(1).max(100).trim(),
  releaseNoteId: z.string().uuid(),
  githubRepo: z.string().regex(/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/),
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

// CSRF protection
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex')
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  if (!token || !sessionToken) return false
  
  const hash1 = createHash('sha256').update(token).digest('hex')
  const hash2 = createHash('sha256').update(sessionToken).digest('hex')
  
  return hash1 === hash2
}

// IP address extraction
export function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const realIP = req.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  // For NextRequest, we can't access req.ip directly
  // In production, this would be handled by the proxy/load balancer
  return 'unknown'
}

// SQL injection prevention helpers
export function escapeSQL(value: string): string {
  return value.replace(/'/g, "''")
}

// XSS prevention
export function escapeHTML(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

// Secure random string generation
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex')
}

// Password hashing utilities
export async function hashPassword(password: string): Promise<string> {
  // TODO: Implement when bcryptjs is added to dependencies
  throw new Error('Password hashing not implemented')
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // TODO: Implement when bcryptjs is added to dependencies
  throw new Error('Password verification not implemented')
}

// Environment variable validation
export function validateEnvironmentVariables(): void {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'AZURE_OPENAI_API_KEY',
    'AZURE_OPENAI_ENDPOINT',
  ]

  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

// Request validation middleware
export function validateRequest(schema: z.ZodSchema) {
  return async (req: NextRequest): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const body = await req.json()
      const data = schema.parse(body)
      return { success: true, data }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          success: false, 
          error: `Validation error: ${error.errors.map(e => e.message).join(', ')}` 
        }
      }
      return { success: false, error: 'Invalid request format' }
    }
  }
}

// Security audit helpers
export function auditSecurityHeaders(headers: Headers): {
  score: number
  issues: string[]
  recommendations: string[]
} {
  const issues: string[] = []
  const recommendations: string[] = []
  let score = 100

  // Check for security headers
  const securityHeaders = [
    'content-security-policy',
    'x-frame-options',
    'x-content-type-options',
    'x-xss-protection',
    'strict-transport-security',
    'referrer-policy'
  ]

  securityHeaders.forEach(header => {
    if (!headers.get(header)) {
      issues.push(`Missing ${header} header`)
      score -= 10
    }
  })

  // Check CSP
  const csp = headers.get('content-security-policy')
  if (csp && csp.includes("'unsafe-inline'")) {
    issues.push("CSP allows unsafe-inline")
    recommendations.push("Remove unsafe-inline from CSP")
    score -= 15
  }

  return { score, issues, recommendations }
}

// Logging for security events
export function logSecurityEvent(event: {
  type: 'rate_limit' | 'invalid_input' | 'csrf_violation' | 'suspicious_activity'
  ip: string
  userAgent?: string
  details?: any
}) {
  console.warn('Security Event:', {
    timestamp: new Date().toISOString(),
    ...event
  })
}

export default {
  createRateLimit,
  apiRateLimit,
  authRateLimit,
  publicRateLimit,
  addSecurityHeaders,
  schemas,
  sanitizeInput,
  generateCSRFToken,
  validateCSRFToken,
  getClientIP,
  escapeSQL,
  escapeHTML,
  generateSecureToken,
  hashPassword,
  verifyPassword,
  validateEnvironmentVariables,
  validateRequest,
  auditSecurityHeaders,
  logSecurityEvent
} 