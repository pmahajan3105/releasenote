import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/ssr'
import { cookies } from 'next/headers'
import { consumeOAuthState } from '@/lib/integrations/oauth-state'
import { encryptCredentials } from '@/lib/integrations/credentials'
import { exchangeAuthorizationCodeForTokens } from '@/lib/integrations/oauth-client'
import type { Database } from '@/types/database'

type GitHubUserResponse = {
  id?: number
  login?: string
  name?: string | null
  email?: string | null
  avatar_url?: string | null
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const state = requestUrl.searchParams.get('state')
  const oauthError = requestUrl.searchParams.get('error')

  if (oauthError) {
    const redirectUrl = new URL('/dashboard/integrations', request.url)
    redirectUrl.searchParams.set('error', 'oauth_denied')
    return NextResponse.redirect(redirectUrl)
  }

  if (!code || !state) {
    const redirectUrl = new URL('/dashboard/integrations', request.url)
    redirectUrl.searchParams.set('error', 'invalid_callback')
    return NextResponse.redirect(redirectUrl)
  }

  const supabase = createRouteHandlerClient<Database>({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const stateResult = await consumeOAuthState(supabase, {
    provider: 'github',
    state,
    userId: session.user.id,
  })

  if (!stateResult.ok) {
    const redirectUrl = new URL('/dashboard/integrations', request.url)
    redirectUrl.searchParams.set('error', stateResult.error)
    return NextResponse.redirect(redirectUrl)
  }

  const codeVerifier = stateResult.record.pkce_verifier ?? undefined

  try {
    const clientId = process.env.GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET
    const redirectUri = process.env.GITHUB_REDIRECT_URL || `${requestUrl.origin}/api/auth/github/callback`

    if (!clientId || !clientSecret) {
      const redirectUrl = new URL('/dashboard/integrations', request.url)
      redirectUrl.searchParams.set('error', 'github_not_configured')
      return NextResponse.redirect(redirectUrl)
    }

    const tokenData = await exchangeAuthorizationCodeForTokens('github', {
      code,
      redirectUri,
      codeVerifier,
    })

    const accessToken = tokenData.access_token

    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'ReleaseNoteAI',
      },
    })

    if (!userResponse.ok) {
      const redirectUrl = new URL('/dashboard/integrations', request.url)
      redirectUrl.searchParams.set('error', 'user_fetch_failed')
      return NextResponse.redirect(redirectUrl)
    }

    const githubUser = (await userResponse.json()) as GitHubUserResponse
    const externalId = typeof githubUser.id === 'number' ? String(githubUser.id) : null

    const expiresAt =
      typeof tokenData.expires_in === 'number'
        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        : null

    const encryptedCredentials = encryptCredentials({
      access_token: accessToken,
      token_type: tokenData.token_type,
      scope: tokenData.scope,
      refresh_token: tokenData.refresh_token,
      expires_at: expiresAt,
    })

    const { error: integrationError } = await supabase
      .from('integrations')
      .upsert(
        {
          organization_id: session.user.id,
          type: 'github',
          external_id: externalId,
          encrypted_credentials: encryptedCredentials,
          config: {
            user: githubUser,
            scope: tokenData.scope,
            token_type: tokenData.token_type,
          },
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'organization_id,type' }
      )

    if (integrationError) {
      const redirectUrl = new URL('/dashboard/integrations', request.url)
      redirectUrl.searchParams.set('error', 'save_failed')
      redirectUrl.searchParams.set('details', integrationError.message)
      return NextResponse.redirect(redirectUrl)
    }

    const redirectUrl = new URL('/dashboard/integrations', request.url)
    redirectUrl.searchParams.set('success', 'github_connected')
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('GitHub OAuth callback error:', error)
    const redirectUrl = new URL('/dashboard/integrations', request.url)
    redirectUrl.searchParams.set('error', 'callback_failed')
    return NextResponse.redirect(redirectUrl)
  }
}
