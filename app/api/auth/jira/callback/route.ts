import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { consumeOAuthState } from '@/lib/integrations/oauth-state'
import { encryptCredentials } from '@/lib/integrations/credentials'
import type { Database } from '@/types/database'

type JiraTokenResponse = {
  access_token: string
  expires_in: number
  refresh_token?: string
  scope?: string
  token_type?: string
}

type JiraAccessibleResource = {
  id?: string
  name?: string
  url?: string
  scopes?: string[]
  avatarUrl?: string
}

type JiraUserResponse = {
  accountId?: string
  displayName?: string
  emailAddress?: string
  avatarUrls?: Record<string, string>
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
      provider: 'jira',
      state,
      userId: session.user.id,
    })

    if (!stateResult.ok) {
      const redirectUrl = new URL('/dashboard/integrations', request.url)
      redirectUrl.searchParams.set('error', stateResult.error)
      return NextResponse.redirect(redirectUrl)
    }

    const codeVerifier = stateResult.record.pkce_verifier ?? undefined

    const clientId = process.env.JIRA_CLIENT_ID
    const clientSecret = process.env.JIRA_CLIENT_SECRET
    const redirectUri = process.env.JIRA_REDIRECT_URL || `${new URL(request.url).origin}/api/auth/jira/callback`

    if (!clientId || !clientSecret) {
      const redirectUrl = new URL('/dashboard/integrations', request.url)
      redirectUrl.searchParams.set('error', 'jira_not_configured')
      return NextResponse.redirect(redirectUrl)
    }

    const tokenResponse = await fetch('https://auth.atlassian.com/oauth/token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    })

    if (!tokenResponse.ok) {
      const redirectUrl = new URL('/dashboard/integrations', request.url)
      redirectUrl.searchParams.set('error', 'token_exchange_failed')
      return NextResponse.redirect(redirectUrl)
    }

    const tokenData = (await tokenResponse.json()) as JiraTokenResponse

    const resourcesResponse = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/json',
      },
    })

    const resources = resourcesResponse.ok ? ((await resourcesResponse.json()) as JiraAccessibleResource[]) : []

    const preferredSiteId = typeof resources[0]?.id === 'string' ? resources[0].id : null

    let jiraUser: JiraUserResponse | null = null
    if (preferredSiteId) {
      const userResponse = await fetch(`https://api.atlassian.com/ex/jira/${preferredSiteId}/rest/api/3/myself`, {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: 'application/json',
        },
      })

      if (userResponse.ok) {
        jiraUser = (await userResponse.json()) as JiraUserResponse
      }
    }

    const externalId = typeof jiraUser?.accountId === 'string' ? jiraUser.accountId : null
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString()

    const encryptedCredentials = encryptCredentials({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: expiresAt,
      scope: tokenData.scope,
      token_type: tokenData.token_type,
    })

    const config = {
      resources,
      user: jiraUser,
      scopes: tokenData.scope ? tokenData.scope.split(' ') : [],
      token_type: tokenData.token_type,
      preferredSiteId,
    }

    const { error: integrationError } = await supabase
      .from('integrations')
      .upsert(
        {
          organization_id: session.user.id,
          type: 'jira',
          external_id: externalId,
          encrypted_credentials: encryptedCredentials,
          config,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'organization_id,type' }
      )

    if (integrationError) {
      console.error('Failed to save Jira integration:', integrationError)
      const redirectUrl = new URL('/dashboard/integrations', request.url)
      redirectUrl.searchParams.set('error', 'save_failed')
      return NextResponse.redirect(redirectUrl)
    }

    const redirectUrl = new URL('/dashboard/integrations', request.url)
    redirectUrl.searchParams.set('success', 'jira_connected')
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Jira OAuth callback error:', error)
    const redirectUrl = new URL('/dashboard/integrations', request.url)
    redirectUrl.searchParams.set('error', 'callback_failed')
    return NextResponse.redirect(redirectUrl)
  }
}
