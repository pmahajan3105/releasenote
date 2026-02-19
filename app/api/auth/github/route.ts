import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/ssr'
import { cookies } from 'next/headers'
import { createOAuthState, persistOAuthState } from '@/lib/integrations/oauth-state'
import { createPkcePair } from '@/lib/integrations/pkce'
import type { Database } from '@/types/database'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)

  const supabase = createRouteHandlerClient<Database>({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', '/dashboard/integrations')
    return NextResponse.redirect(redirectUrl)
  }

  const clientId = process.env.GITHUB_CLIENT_ID
  const redirectUri = process.env.GITHUB_REDIRECT_URL || `${requestUrl.origin}/api/auth/github/callback`
  const scopes = 'repo,user:email,read:user,read:org'

  if (!clientId) {
    const redirectUrl = new URL('/dashboard/integrations', request.url)
    redirectUrl.searchParams.set('error', 'github_not_configured')
    return NextResponse.redirect(redirectUrl)
  }

  const state = createOAuthState()
  const pkce = createPkcePair()
  await persistOAuthState(supabase, {
    provider: 'github',
    state,
    userId: session.user.id,
    pkceVerifier: pkce.verifier,
  })

  const githubOAuthUrl = new URL('https://github.com/login/oauth/authorize')
  githubOAuthUrl.searchParams.set('client_id', clientId)
  githubOAuthUrl.searchParams.set('redirect_uri', redirectUri)
  githubOAuthUrl.searchParams.set('scope', scopes)
  githubOAuthUrl.searchParams.set('state', state)
  githubOAuthUrl.searchParams.set('code_challenge', pkce.challenge)
  githubOAuthUrl.searchParams.set('code_challenge_method', pkce.method)

  return NextResponse.redirect(githubOAuthUrl.toString())
}
