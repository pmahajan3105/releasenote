import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createOAuthState, persistOAuthState } from '@/lib/integrations/oauth-state'
import type { Database } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Linear OAuth 2.0 configuration
    const linearAuthUrl = 'https://linear.app/oauth/authorize'
    const clientId = process.env.LINEAR_CLIENT_ID
    const redirectUri = process.env.LINEAR_REDIRECT_URL || `${new URL(request.url).origin}/api/auth/linear/callback`
    
    if (!clientId) {
      const redirectUrl = new URL('/dashboard/integrations', request.url)
      redirectUrl.searchParams.set('error', 'linear_not_configured')
      return NextResponse.redirect(redirectUrl)
    }

    const state = createOAuthState()
    
    // Store state in database for validation
    await persistOAuthState(supabase, {
      provider: 'linear',
      state,
      userId: session.user.id,
    })

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'read',
      state,
      prompt: 'consent'
    })

    const authUrl = `${linearAuthUrl}?${params.toString()}`
    return NextResponse.redirect(authUrl)

  } catch (error) {
    console.error('Linear OAuth initiation error:', error)
    const redirectUrl = new URL('/dashboard/integrations', request.url)
    redirectUrl.searchParams.set('error', 'oauth_initiation_failed')
    return NextResponse.redirect(redirectUrl)
  }
} 
