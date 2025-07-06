import { Resend } from 'resend'
import { config } from '@/lib/config'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const resend = new Resend(config.email.resend.apiKey)

export interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

export interface Subscriber {
  email: string
  name?: string
  status: 'active' | 'unsubscribed' | 'bounced'
}

export interface ReleaseNote {
  id: string
  title: string
  content_html: string
  content_markdown: string
  published_at: string
  version?: string
}

export interface Organization {
  id: string
  name: string
  slug: string
}

export interface EmailResult {
  success: boolean
  sent: number
  total: number
  errors: string[]
}

export class EmailService {
  private supabase = createRouteHandlerClient({ cookies })

  /**
   * Send release notes to all active subscribers
   */
  async sendReleaseNotesToSubscribers(
    releaseNote: ReleaseNote,
    organization: Organization,
    subscribers: Subscriber[]
  ): Promise<EmailResult> {
    const activeSubscribers = subscribers.filter(sub => sub.status === 'active')
    
    if (activeSubscribers.length === 0) {
      return {
        success: true,
        sent: 0,
        total: 0,
        errors: []
      }
    }

    const template = this.buildReleaseNoteEmailTemplate(releaseNote, organization)
    const errors: string[] = []
    let sent = 0

    // Send emails in batches to avoid rate limits
    const batchSize = 10
    for (let i = 0; i < activeSubscribers.length; i += batchSize) {
      const batch = activeSubscribers.slice(i, i + batchSize)
      
      await Promise.all(
        batch.map(async (subscriber) => {
          try {
            await this.sendEmail({
              to: subscriber.email,
              subject: template.subject,
              html: template.html,
              text: template.text
            })
            sent++
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            errors.push(`Failed to send to ${subscriber.email}: ${errorMessage}`)
            console.error(`Email error for ${subscriber.email}:`, error)
          }
        })
      )

      // Add delay between batches
      if (i + batchSize < activeSubscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return {
      success: errors.length === 0,
      sent,
      total: activeSubscribers.length,
      errors
    }
  }

  /**
   * Send a single email
   */
  async sendEmail({
    to,
    subject,
    html,
    text,
    from
  }: {
    to: string
    subject: string
    html: string
    text?: string
    from?: string
  }): Promise<void> {
    try {
      await resend.emails.send({
        from: from || config.email.resend.from,
        to,
        subject,
        html,
        text
      })
    } catch (error) {
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Add subscriber to organization
   */
  async addSubscriber(
    organizationId: string,
    email: string,
    name?: string
  ): Promise<Subscriber> {
    // Check if subscriber already exists
    const { data: existing } = await this.supabase
      .from('subscribers')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('email', email)
      .single()

    if (existing) {
      // Reactivate if unsubscribed
      if (existing.status !== 'active') {
        const { data: updated, error } = await this.supabase
          .from('subscribers')
          .update({ status: 'active', name: name || existing.name })
          .eq('id', existing.id)
          .select()
          .single()

        if (error) {
          throw new Error(`Failed to reactivate subscriber: ${error.message}`)
        }

        return updated
      }
      
      return existing
    }

    // Create new subscriber
    const { data: subscriber, error } = await this.supabase
      .from('subscribers')
      .insert({
        organization_id: organizationId,
        email,
        name,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to add subscriber: ${error.message}`)
    }

    return subscriber
  }

  /**
   * Unsubscribe user
   */
  async unsubscribe(organizationId: string, email: string): Promise<void> {
    const { error } = await this.supabase
      .from('subscribers')
      .update({ status: 'unsubscribed' })
      .eq('organization_id', organizationId)
      .eq('email', email)

    if (error) {
      throw new Error(`Failed to unsubscribe: ${error.message}`)
    }
  }

  /**
   * Get active subscribers for organization
   */
  async getActiveSubscribers(organizationId: string): Promise<Subscriber[]> {
    const { data: subscribers, error } = await this.supabase
      .from('subscribers')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'active')

    if (error) {
      throw new Error(`Failed to fetch subscribers: ${error.message}`)
    }

    return subscribers || []
  }

  /**
   * Build email template for release notes
   */
  private buildReleaseNoteEmailTemplate(
    releaseNote: ReleaseNote,
    organization: Organization
  ): EmailTemplate {
    const subject = `${organization.name} - ${releaseNote.title}`
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { border-bottom: 2px solid #f0f0f0; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; color: #2563eb; }
            .header p { margin: 5px 0 0 0; color: #666; }
            .content { margin-bottom: 30px; }
            .footer { border-top: 1px solid #f0f0f0; padding-top: 20px; font-size: 14px; color: #666; }
            .footer a { color: #2563eb; text-decoration: none; }
            .version { background: #f8fafc; padding: 8px 12px; border-radius: 6px; font-size: 14px; color: #475569; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${organization.name}</h1>
            <p>Release Notes Update</p>
          </div>
          
          <div class="content">
            <h2>${releaseNote.title}</h2>
            ${releaseNote.version ? `<div class="version">Version: ${releaseNote.version}</div>` : ''}
            ${releaseNote.content_html}
          </div>
          
          <div class="footer">
            <p>
              Published on ${new Date(releaseNote.published_at).toLocaleDateString()}
            </p>
            <p>
              <a href="${config.app.url}/notes/${organization.slug}">View all release notes</a> |
              <a href="${config.app.url}/api/subscribers/unsubscribe?org=${organization.id}&email={{email}}">Unsubscribe</a>
            </p>
          </div>
        </body>
      </html>
    `

    // Convert HTML to plain text for text version
    const text = `
${organization.name} - Release Notes Update

${releaseNote.title}
${releaseNote.version ? `Version: ${releaseNote.version}` : ''}

${releaseNote.content_markdown}

Published on ${new Date(releaseNote.published_at).toLocaleDateString()}

View all release notes: ${config.app.url}/notes/${organization.slug}
Unsubscribe: ${config.app.url}/api/subscribers/unsubscribe?org=${organization.id}&email={{email}}
    `.trim()

    return { subject, html, text }
  }

  /**
   * Send welcome email to new subscriber
   */
  async sendWelcomeEmail(
    subscriber: Subscriber,
    organization: Organization
  ): Promise<void> {
    const subject = `Welcome to ${organization.name} updates!`
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #2563eb; margin: 0; }
            .content { margin-bottom: 30px; }
            .footer { border-top: 1px solid #f0f0f0; padding-top: 20px; font-size: 14px; color: #666; text-align: center; }
            .footer a { color: #2563eb; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Welcome to ${organization.name}!</h1>
          </div>
          
          <div class="content">
            <p>Hi${subscriber.name ? ` ${subscriber.name}` : ''},</p>
            <p>Thank you for subscribing to ${organization.name} release notes. You'll receive updates whenever we publish new features, improvements, and bug fixes.</p>
            <p>Stay tuned for exciting updates!</p>
          </div>
          
          <div class="footer">
            <p>
              <a href="${config.app.url}/notes/${organization.slug}">View release notes</a> |
              <a href="${config.app.url}/api/subscribers/unsubscribe?org=${organization.id}&email=${subscriber.email}">Unsubscribe</a>
            </p>
          </div>
        </body>
      </html>
    `

    await this.sendEmail({
      to: subscriber.email,
      subject,
      html
    })
  }
}