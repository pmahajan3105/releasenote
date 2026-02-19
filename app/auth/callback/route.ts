import { createRouteHandlerClient } from '@/lib/supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin))
    }

    if (data.user) {
      try {
        // Check if user has an organization
        const { error: orgError } = await supabase
          .from('organizations')
          .select('id, name')
          .eq('id', data.user.id)
          .single()

        if (orgError && orgError.code === 'PGRST116') {
          // User doesn't have an organization - need onboarding
          return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
        }

        if (orgError) {
          console.error('Organization check error:', orgError)
          // Continue to dashboard even if check fails
        }

        // Check for redirect parameter
        const redirectTo = requestUrl.searchParams.get('redirectTo')
        if (redirectTo && redirectTo.startsWith('/')) {
          return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
        }

      } catch (error) {
        console.error('User setup check failed:', error)
        // Continue to dashboard if checks fail
      }
    }
  }

  // Default redirect to dashboard
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
} 
