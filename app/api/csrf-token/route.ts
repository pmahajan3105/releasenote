import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase/ssr'
import { cookies } from 'next/headers'
import { generateCSRFToken } from '@/lib/security'

export async function GET(_request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = generateCSRFToken(session.user.id)

    return NextResponse.json({ 
      token,
      expires: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
    })
  } catch (error) {
    console.error('CSRF token generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    )
  }
}
