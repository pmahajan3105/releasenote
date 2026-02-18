import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createOAuthState, persistOAuthState } from '@/lib/integrations/oauth-state'
import { createPkcePair } from '@/lib/integrations/pkce'
import type { Database } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Jira OAuth 2.0 configuration
    const jiraAuthUrl = 'https://auth.atlassian.com/authorize'
    const clientId = process.env.JIRA_CLIENT_ID
    const redirectUri = process.env.JIRA_REDIRECT_URL || `${new URL(request.url).origin}/api/auth/jira/callback`
    
    if (!clientId) {
      const redirectUrl = new URL('/dashboard/integrations', request.url)
      redirectUrl.searchParams.set('error', 'jira_not_configured')
      return NextResponse.redirect(redirectUrl)
    }

    const state = createOAuthState()
    const pkce = createPkcePair()
    
    // Store state in database for validation
    await persistOAuthState(supabase, {
      provider: 'jira',
      state,
      userId: session.user.id,
      pkceVerifier: pkce.verifier,
    })

    const params = new URLSearchParams({
      audience: 'api.atlassian.com',
      client_id: clientId,
      scope: 'read:jira-work read:jira-user read:jira-project offline_access',
      redirect_uri: redirectUri,
      state,
      response_type: 'code',
      prompt: 'consent'
    })
    params.set('code_challenge', pkce.challenge)
    params.set('code_challenge_method', pkce.method)

    const authUrl = `${jiraAuthUrl}?${params.toString()}`
    return NextResponse.redirect(authUrl)

  } catch (error) {
    console.error('Jira OAuth initiation error:', error)
    const redirectUrl = new URL('/dashboard/integrations', request.url)
    redirectUrl.searchParams.set('error', 'oauth_initiation_failed')
    return NextResponse.redirect(redirectUrl)
  }
} 
