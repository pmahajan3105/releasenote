import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * Send email notifications for a published release note
 * Simple endpoint - no complex queueing or background processing
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: releaseNoteId } = await params

    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the release note
    const { data: releaseNote, error: noteError } = await supabase
      .from('release_notes')
      .select('*')
      .eq('id', releaseNoteId)
      .eq('organization_id', session.user.id)
      .eq('status', 'published')
      .single()

    if (noteError || !releaseNote) {
      return NextResponse.json(
        { error: 'Release note not found or not published' },
        { status: 404 }
      )
    }

    // Get organization details
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('name, slug')
      .eq('id', releaseNote.organization_id)
      .single()

    if (orgError || !organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Get active subscribers
    const { data: subscribers, error: subscribersError } = await supabase
      .from('subscribers')
      .select('email, name')
      .eq('organization_id', releaseNote.organization_id)
      .eq('status', 'active')

    if (subscribersError) {
      console.error('Error fetching subscribers:', subscribersError)
      return NextResponse.json(
        { error: 'Failed to fetch subscribers' },
        { status: 500 }
      )
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active subscribers to notify',
        sent: 0,
        total: 0
      })
    }

    // Send emails - use dynamic import to avoid build-time issues
    const { sendReleaseNotesToSubscribers } = await import('@/lib/email')
    const result = await sendReleaseNotesToSubscribers(
      releaseNote,
      organization,
      subscribers
    )

    return NextResponse.json({
      success: result.success,
      message: `Sent ${result.sent} of ${result.total} notifications`,
      sent: result.sent,
      total: result.total,
      errors: result.errors
    })

  } catch (error) {
    console.error('Release note notification error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to send notifications',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
