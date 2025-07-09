import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET: Get SSO settings for the current organization (by user id for demo)
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

  const { data, error } = await supabase
    .from('organizations')
    .select('settings')
    .eq('id', userId)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const sso = (data.settings && data.settings.sso) || { url: '', code: '' }
  return NextResponse.json({ sso })
}

// PUT: Update SSO settings for org
export async function PUT(req: NextRequest) {
  const { userId, url, code } = await req.json()
  if (!userId || typeof url !== 'string' || typeof code !== 'string') {
    return NextResponse.json({ error: 'Missing userId, url, or code' }, { status: 400 })
  }
  // Fetch current settings
  const { data: org, error: fetchError } = await supabase
    .from('organizations')
    .select('settings')
    .eq('id', userId)
    .single()
  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })
  const currentSettings = org.settings || {}
  const newSettings = { ...currentSettings, sso: { url, code } }
  const { error } = await supabase
    .from('organizations')
    .update({ settings: newSettings })
    .eq('id', userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
