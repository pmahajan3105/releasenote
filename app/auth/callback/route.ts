import { createRouteHandlerClient } from '@/lib/supabase/ssr'
import { cookies } from 'next/headers'
import type { EmailOtpType } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const ALLOWED_OTP_TYPES: readonly EmailOtpType[] = [
  'signup',
  'invite',
  'magiclink',
  'recovery',
  'email_change',
  'email',
]

function isEmailOtpType(value: string | null): value is EmailOtpType {
  return value !== null && ALLOWED_OTP_TYPES.includes(value as EmailOtpType)
}

function readSafeRedirectPath(requestUrl: URL): string {
  const redirectTo = requestUrl.searchParams.get('redirectTo')
  if (redirectTo && redirectTo.startsWith('/')) {
    return redirectTo
  }

  const next = requestUrl.searchParams.get('next')
  if (next && next.startsWith('/')) {
    return next
  }

  return '/dashboard'
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const tokenHash = requestUrl.searchParams.get('token_hash')
  const otpType = requestUrl.searchParams.get('type')
  const redirectPath = readSafeRedirectPath(requestUrl)
  const supabase = createRouteHandlerClient({ cookies })
  let authenticated = false

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin))
    }
    authenticated = true
  }

  // Supabase magic links can arrive as token_hash + type instead of code.
  if (!authenticated && tokenHash && isEmailOtpType(otpType)) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType,
    })

    if (error) {
      console.error('Auth callback OTP verification error:', error)
      return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin))
    }
    authenticated = true
  }

  if (tokenHash && !isEmailOtpType(otpType)) {
    return NextResponse.redirect(new URL('/login?error=invalid_auth_link', requestUrl.origin))
  }

  if (authenticated) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error('Auth callback user lookup error:', userError)
      return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin))
    }

    if (user) {
      try {
        // Check if user has an organization
        const { error: orgError } = await supabase
          .from('organizations')
          .select('id, name')
          .eq('id', user.id)
          .single()

        if (orgError && orgError.code === 'PGRST116') {
          // User doesn't have an organization - need onboarding
          return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
        }

        if (orgError) {
          console.error('Organization check error:', orgError)
          // Continue to requested route even if check fails
        }
      } catch (error) {
        console.error('User setup check failed:', error)
        // Continue to requested route if checks fail
      }
    }
  }

  // Default redirect to dashboard
  return NextResponse.redirect(new URL(redirectPath, requestUrl.origin))
} 
