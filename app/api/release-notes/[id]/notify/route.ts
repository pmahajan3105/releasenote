import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createUnsubscribeToken } from '@/lib/subscribers/unsubscribe-token'

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
      .select('id, email, name')
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

    // Record notification intent (idempotency). Existing rows are left as-is.
    const rows = subscribers.map((subscriber) => ({
      release_note_id: releaseNoteId,
      subscriber_id: subscriber.id,
      status: 'pending' as const,
    }))

    const { error: upsertError } = await supabase
      .from('release_note_notifications')
      .upsert(rows, {
        onConflict: 'release_note_id,subscriber_id',
        ignoreDuplicates: true,
      })

    if (upsertError) {
      console.error('Failed to record notification log rows:', upsertError)
      return NextResponse.json({ error: 'Failed to prepare notifications' }, { status: 500 })
    }

    const { data: sentRows } = await supabase
      .from('release_note_notifications')
      .select('subscriber_id')
      .eq('release_note_id', releaseNoteId)
      .eq('status', 'sent')

    const sentSubscriberIds = new Set((sentRows ?? []).map((row) => row.subscriber_id))
    const toSend = subscribers.filter((subscriber) => !sentSubscriberIds.has(subscriber.id))

    if (toSend.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All active subscribers have already been notified',
        sent: 0,
        total: subscribers.length,
      })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    if (!appUrl) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_APP_URL is required to send subscriber emails' },
        { status: 500 }
      )
    }

    const publicUrl =
      organization.slug && releaseNote.slug
        ? `${appUrl}/notes/${organization.slug}/${releaseNote.slug}`
        : `${appUrl}/release-notes/${releaseNote.id}`

    // Send emails - dynamic import to avoid build-time issues.
    const { generateReleaseNotesEmail, sendEmail } = await import('@/lib/email')

    let sent = 0
    const errors: string[] = []

    for (const subscriber of toSend) {
      try {
        const token = createUnsubscribeToken(subscriber.id)
        const unsubscribeUrl = `${appUrl}/unsubscribe?token=${encodeURIComponent(token)}`
        const template = generateReleaseNotesEmail(releaseNote, organization, publicUrl, unsubscribeUrl)

        await sendEmail({
          to: subscriber.email,
          subject: template.subject,
          html: template.html,
          text: template.text,
        })

        sent++

        const { error: updateError } = await supabase
          .from('release_note_notifications')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            error: null,
          })
          .eq('release_note_id', releaseNoteId)
          .eq('subscriber_id', subscriber.id)

        if (updateError) {
          console.error('Failed to mark notification as sent:', updateError)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`${subscriber.email}: ${message}`)

        const { error: updateError } = await supabase
          .from('release_note_notifications')
          .update({
            status: 'failed',
            error: message,
          })
          .eq('release_note_id', releaseNoteId)
          .eq('subscriber_id', subscriber.id)

        if (updateError) {
          console.error('Failed to mark notification as failed:', updateError)
        }
      }

      // Avoid provider rate limiting (small-SaaS "good enough" throttle).
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    return NextResponse.json({
      success: errors.length === 0,
      message: `Sent ${sent} of ${toSend.length} notifications`,
      sent,
      total: toSend.length,
      errors: errors.length > 0 ? errors : undefined,
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
