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

function isSafeRedirectPath(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//') && !/[\u0000-\u001F\u007F\s]/.test(value)
}

function readSafeRedirectPath(requestUrl: URL): string {
  const redirectTo = requestUrl.searchParams.get('redirectTo')
  if (redirectTo && isSafeRedirectPath(redirectTo)) {
    return redirectTo
  }

  const next = requestUrl.searchParams.get('next')
  if (next && isSafeRedirectPath(next)) {
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

  if (!authenticated && tokenHash && !isEmailOtpType(otpType)) {
    return NextResponse.redirect(new URL('/login?error=invalid_auth_link', requestUrl.origin))
  }

  if (!authenticated) {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      const loginUrl = new URL('/login', requestUrl.origin)
      loginUrl.searchParams.set('error', 'missing_auth_params')
      loginUrl.searchParams.set('redirectTo', redirectPath)
      return NextResponse.redirect(loginUrl)
    }

    authenticated = true
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
        // Check if user has any organization membership.
        const { error: membershipError } = await supabase
          .from('organization_members')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (membershipError && membershipError.code === 'PGRST116') {
          // User doesn't have an organization - need onboarding
          return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
        }

        if (membershipError) {
          console.error('Organization membership check error:', membershipError)
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
