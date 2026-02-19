/**
 * Simple Email Service using Resend
 * Basic functionality without complex features
 */

import { Resend } from 'resend'
import { sanitizeHtml, stripHtml } from '@/lib/sanitize'

let resend: Resend | null = null

function getResendClient(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey || apiKey === 'placeholder' || apiKey.includes('placeholder')) {
      // Check if we're in runtime vs build time
      if (typeof window === 'undefined' && process.env.NODE_ENV !== 'development') {
        throw new Error('RESEND_API_KEY environment variable is required for email functionality')
      }
      // For build time, use a placeholder to avoid build errors
      console.warn('RESEND_API_KEY not configured - email functionality will not work')
      resend = new Resend('re_placeholder_key_for_build_only')
    } else {
      resend = new Resend(apiKey)
    }
  }
  return resend
}

export interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
}

/**
 * Send a simple email
 */
export async function sendEmail(options: SendEmailOptions) {
  try {
    const client = getResendClient()
    const { data, error } = await client.emails.send({
      from: options.from || process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com',
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    if (error) {
      throw new Error(`Email send failed: ${error.message}`)
    }

    return { success: true, id: data?.id }
  } catch (error) {
    console.error('Email send error:', error)
    throw error
  }
}

/**
 * Generate simple release notes email template
 */
export function generateReleaseNotesEmail(
  releaseNote: {
    title: string
    content_html?: string
    published_at?: string
  },
  organization: {
    name: string
  },
  publicUrl: string,
  unsubscribeUrl?: string
): EmailTemplate {
  const safeContentHtml = sanitizeHtml(releaseNote.content_html || '')
  const publishedDate = releaseNote.published_at 
    ? new Date(releaseNote.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Recently'

  const subject = `New Release: ${releaseNote.title} - ${organization.name}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          text-align: center;
        }
        .content {
          margin-bottom: 30px;
        }
        .footer {
          border-top: 1px solid #eee;
          padding-top: 20px;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        .button {
          display: inline-block;
          background-color: #007bff;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .button:hover {
          background-color: #0056b3;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${organization.name}</h1>
        <h2>${releaseNote.title}</h2>
        <p>Published ${publishedDate}</p>
      </div>

      <div class="content">
        ${safeContentHtml || '<p>New release notes are available!</p>'}
      </div>

      <div style="text-align: center;">
        <a href="${publicUrl}" class="button">View Full Release Notes</a>
      </div>

      <div class="footer">
        <p>You're receiving this because you subscribed to ${organization.name} release updates.</p>
        ${unsubscribeUrl ? `<p><a href="${unsubscribeUrl}">Unsubscribe</a></p>` : ''}
        <p><small>Powered by ReleaseNoteAI</small></p>
      </div>
    </body>
    </html>
  `

  const text = `
${organization.name} - ${releaseNote.title}

Published ${publishedDate}

${safeContentHtml ? stripHtml(safeContentHtml) : 'New release notes are available!'}

View full release notes: ${publicUrl}
${unsubscribeUrl ? `\nUnsubscribe: ${unsubscribeUrl}\n` : ''}

---
You're receiving this because you subscribed to ${organization.name} release updates.
Powered by ReleaseNoteAI
  `.trim()

  return { subject, html, text }
}

/**
 * Send release notes to subscribers
 */
export async function sendReleaseNotesToSubscribers(
  releaseNote: {
    id: string
    title: string
    slug?: string
    content_html?: string
    published_at?: string
    organization_id: string
  },
  organization: {
    name: string
    slug?: string
  },
  subscribers: Array<{ email: string; name?: string }>
) {
  if (subscribers.length === 0) {
    return { success: true, sent: 0, message: 'No subscribers to notify' }
  }

  // Generate public URL
  const publicUrl = organization.slug && releaseNote.slug
    ? `${process.env.NEXT_PUBLIC_APP_URL}/notes/${organization.slug}/${releaseNote.slug}`
    : `${process.env.NEXT_PUBLIC_APP_URL}/release-notes/${releaseNote.id}`

  // Generate email template
  const template = generateReleaseNotesEmail(releaseNote, organization, publicUrl)

  // Send emails (simple approach - send individually)
  let sent = 0
  const errors: string[] = []

  for (const subscriber of subscribers) {
    try {
      await sendEmail({
        to: subscriber.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      })
      sent++
    } catch (error) {
      console.error(`Failed to send email to ${subscriber.email}:`, error)
      errors.push(`${subscriber.email}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return {
    success: errors.length === 0,
    sent,
    total: subscribers.length,
    errors: errors.length > 0 ? errors : undefined
  }
}
