import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Jira OAuth 2.0 configuration
    const jiraAuthUrl = 'https://auth.atlassian.com/authorize'
    const clientId = process.env.JIRA_CLIENT_ID
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/jira/callback`
    
    if (!clientId) {
      return NextResponse.json({ error: 'Jira OAuth not configured' }, { status: 500 })
    }

    const state = `${session.user.id}-${Date.now()}`
    
    // Store state in database for validation
    await supabase
      .from('oauth_states')
      .insert({
        state,
        provider: 'jira',
        user_id: session.user.id,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
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

    const authUrl = `${jiraAuthUrl}?${params.toString()}`
    return NextResponse.redirect(authUrl)

  } catch (error) {
    console.error('Jira OAuth initiation error:', error)
    return NextResponse.json({ error: 'OAuth initiation failed' }, { status: 500 })
  }
}