import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/ssr'
import { cookies } from 'next/headers'

// POST: Uploads logo or favicon for an organization
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createRouteHandlerClient({ cookies })
  const { id: orgId } = await params
  const formData = await req.formData()
  const file = formData.get('file') as File
  const type = formData.get('type') as string // 'logo' or 'favicon'

  if (!file || (type !== 'logo' && type !== 'favicon')) {
    return NextResponse.json({ error: 'Missing file or type' }, { status: 400 })
  }

  // Validate file type and size (max 1MB, PNG/JPEG/SVG/ICO)
  const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/x-icon']
  if (!allowedTypes.includes(file.type) || file.size > 1024 * 1024) {
    return NextResponse.json({ error: 'Invalid file type or size' }, { status: 400 })
  }

  // Generate storage path
  const ext = file.name.split('.').pop()
  const filename = `${type}.${ext}`
  const storagePath = `org-assets/${orgId}/${filename}`

  // Upload to Supabase Storage
  const { error } = await supabase.storage.from('org-assets').upload(storagePath, file, { upsert: true, contentType: file.type })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from('org-assets').getPublicUrl(storagePath)
  const publicUrl = urlData?.publicUrl

  // Update org metadata
  const updateField = type === 'logo' ? { logo_url: publicUrl } : { favicon_url: publicUrl }
  const { error: updateError } = await supabase.from('organizations').update(updateField).eq('id', orgId)
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ url: publicUrl })
}
