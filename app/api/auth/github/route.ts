import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const supabase = createRouteHandlerClient({ cookies })

  const { data: { url }, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${requestUrl.origin}/api/auth/github/callback`,
      scopes: 'repo', // Required for accessing private repositories
    },
  })

  if (error) {
    return NextResponse.redirect(`${requestUrl.origin}/integrations/new?error=${error.message}`)
  }

  return NextResponse.redirect(url)
} 