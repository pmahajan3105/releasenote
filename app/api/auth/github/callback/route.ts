import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const supabase = createRouteHandlerClient({ cookies })

  if (code) {
    // Exchange the code for GitHub access token
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return NextResponse.redirect(
        `${requestUrl.origin}/integrations/new?error=${encodeURIComponent(error.message)}`
      )
    }

    // Get the GitHub access token from the session
    const { data: { session } } = await supabase.auth.getSession()
    const githubToken = session?.provider_token

    if (githubToken) {
      // Store the GitHub token in the integrations table
      const { error: insertError } = await supabase.from('integrations').insert({
        type: 'github',
        config: {
          access_token: githubToken,
        },
        organization_id: session.user.id, // This should be the actual organization ID in production
      })

      if (insertError) {
        return NextResponse.redirect(
          `${requestUrl.origin}/integrations/new?error=${encodeURIComponent(insertError.message)}`
        )
      }
    }
  }

  // Redirect back to the integrations page
  return NextResponse.redirect(`${requestUrl.origin}/integrations/new`)
} 