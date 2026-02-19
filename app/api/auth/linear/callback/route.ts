import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/ssr'
import { cookies } from 'next/headers'
import { consumeOAuthState } from '@/lib/integrations/oauth-state'
import { encryptCredentials } from '@/lib/integrations/credentials'
import { exchangeAuthorizationCodeForTokens } from '@/lib/integrations/oauth-client'
import type { Database } from '@/types/database'

type LinearViewer = {
  id?: string
  name?: string
  email?: string
  displayName?: string
  avatarUrl?: string
  organization?: {
    id?: string
    name?: string
    urlKey?: string
    logoUrl?: string
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { searchParams } = new URL(request.url)

    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const oauthError = searchParams.get('error')

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

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const stateResult = await consumeOAuthState(supabase, {
      provider: 'linear',
      state,
      userId: session.user.id,
    })

    if (!stateResult.ok) {
      const redirectUrl = new URL('/dashboard/integrations', request.url)
      redirectUrl.searchParams.set('error', stateResult.error)
      return NextResponse.redirect(redirectUrl)
    }

    const codeVerifier = stateResult.record.pkce_verifier ?? undefined

    const clientId = process.env.LINEAR_CLIENT_ID
    const clientSecret = process.env.LINEAR_CLIENT_SECRET
    const redirectUri = process.env.LINEAR_REDIRECT_URL || `${new URL(request.url).origin}/api/auth/linear/callback`

    if (!clientId || !clientSecret) {
      const redirectUrl = new URL('/dashboard/integrations', request.url)
      redirectUrl.searchParams.set('error', 'linear_not_configured')
      return NextResponse.redirect(redirectUrl)
    }

    const tokenData = await exchangeAuthorizationCodeForTokens('linear', {
      code,
      redirectUri,
      codeVerifier,
    })

    let linearUser: LinearViewer | null = null
    try {
      const userResponse = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              viewer {
                id
                name
                email
                displayName
                avatarUrl
                organization {
                  id
                  name
                  urlKey
                  logoUrl
                }
              }
            }
          `,
        }),
      })

      if (userResponse.ok) {
        const userData = (await userResponse.json()) as { data?: { viewer?: LinearViewer } }
        linearUser = userData.data?.viewer ?? null
      }
    } catch (error) {
      console.error('Failed to fetch Linear user info:', error)
    }

    const externalId = typeof linearUser?.id === 'string' ? linearUser.id : null
    const expiresAt =
      typeof tokenData.expires_in === 'number'
        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        : null

    const encryptedCredentials = encryptCredentials({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: expiresAt,
      scope: tokenData.scope,
      token_type: tokenData.token_type,
    })

    const config = {
      user: linearUser,
      organization: linearUser?.organization,
      scopes: tokenData.scope ? tokenData.scope.split(' ') : ['read'],
      token_type: tokenData.token_type,
    }

    const { error: integrationError } = await supabase
      .from('integrations')
      .upsert(
        {
          organization_id: session.user.id,
          type: 'linear',
          external_id: externalId,
          encrypted_credentials: encryptedCredentials,
          config,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'organization_id,type' }
      )

    if (integrationError) {
      console.error('Failed to save Linear integration:', integrationError)
      const redirectUrl = new URL('/dashboard/integrations', request.url)
      redirectUrl.searchParams.set('error', 'save_failed')
      return NextResponse.redirect(redirectUrl)
    }

    const redirectUrl = new URL('/dashboard/integrations', request.url)
    redirectUrl.searchParams.set('success', 'linear_connected')
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Linear OAuth callback error:', error)
    const redirectUrl = new URL('/dashboard/integrations', request.url)
    redirectUrl.searchParams.set('error', 'callback_failed')
    return NextResponse.redirect(redirectUrl)
  }
}
