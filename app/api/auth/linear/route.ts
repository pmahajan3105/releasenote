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

    // Linear OAuth 2.0 configuration
    const linearAuthUrl = 'https://linear.app/oauth/authorize'
    const clientId = process.env.LINEAR_CLIENT_ID
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linear/callback`
    
    if (!clientId) {
      return NextResponse.json({ error: 'Linear OAuth not configured' }, { status: 500 })
    }

    const state = `${session.user.id}-${Date.now()}`
    
    // Store state in database for validation
    await supabase
      .from('oauth_states')
      .insert({
        state,
        provider: 'linear',
        user_id: session.user.id,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
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
    return NextResponse.json({ error: 'OAuth initiation failed' }, { status: 500 })
  }
}