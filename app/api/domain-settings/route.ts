import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET: Get domain settings for the current organization (by user id for demo)
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

  const { data, error } = await supabase
    .from('organizations')
    .select('settings, custom_domain, public_portal_url')
    .eq('id', userId)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({
    custom_domain: data.custom_domain || '',
    public_portal_url: data.public_portal_url || '',
    settings: data.settings || {},
  })
}

// PUT: Update domain settings (custom domain) for org
export async function PUT(req: NextRequest) {
  const { userId, custom_domain } = await req.json()
  if (!userId || typeof custom_domain !== 'string') {
    return NextResponse.json({ error: 'Missing userId or custom_domain' }, { status: 400 })
  }
  const { error } = await supabase
    .from('organizations')
    .update({ custom_domain })
    .eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
