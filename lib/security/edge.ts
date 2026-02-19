import { NextRequest, NextResponse } from 'next/server'

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const realIP = req.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return 'unknown'
}

export function createRateLimit(options: {
  windowMs: number
  max: number
  keyGenerator?: (req: NextRequest) => string
}) {
  return async (req: NextRequest): Promise<{ success: boolean; error?: string }> => {
    const key = options.keyGenerator ? options.keyGenerator(req) : getClientIP(req)
    const now = Date.now()

    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k)
      }
    }

    const current = rateLimitStore.get(key) || { count: 0, resetTime: now + options.windowMs }

    if (current.resetTime < now) {
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

export const apiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
})

export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
})

export const publicRateLimit = createRateLimit({
  windowMs: 60 * 1000,
  max: 60,
})

export function addSecurityHeaders(response: NextResponse): NextResponse {
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
      'upgrade-insecure-requests',
    ].join('; ')
  )

  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }

  return response
}

export function logSecurityEvent(event: {
  type: 'rate_limit' | 'invalid_input' | 'csrf_violation' | 'suspicious_activity'
  ip: string
  userAgent?: string
  details?: unknown
}) {
  console.warn('Security Event:', {
    timestamp: new Date().toISOString(),
    ...event,
  })
}

