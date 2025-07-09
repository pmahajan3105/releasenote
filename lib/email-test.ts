/**
 * Test functions for email service validation
 * Used to verify Resend integration works correctly
 */

import { sendEmail, generateReleaseNotesEmail } from './email'

/**
 * Test basic email sending functionality
 */
export async function testBasicEmail(recipientEmail: string) {
  try {
    const result = await sendEmail({
      to: recipientEmail,
      subject: 'Test Email from ReleaseNoteAI',
      html: `
        <h1>Email Test Successful!</h1>
        <p>This is a test email from your ReleaseNoteAI application.</p>
        <p>Your Resend integration is working correctly.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `,
      text: 'Email Test Successful! This is a test email from your ReleaseNoteAI application. Your Resend integration is working correctly.'
    })

    return {
      success: true,
      result,
      message: 'Test email sent successfully'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Test email failed'
    }
  }
}

/**
 * Test release notes email template generation
 */
export function testReleaseNotesTemplate() {
  const mockReleaseNote = {
    title: 'Version 2.1.0 - New Features and Improvements',
    content_html: `
      <h2>What's New</h2>
      <ul>
        <li>Enhanced integration with GitHub</li>
        <li>Improved AI-powered content generation</li>
        <li>Better dark mode support</li>
      </ul>
      
      <h2>Bug Fixes</h2>
      <ul>
        <li>Fixed issue with template selection</li>
        <li>Resolved image upload problems</li>
      </ul>
    `,
    published_at: new Date().toISOString()
  }

  const mockOrganization = {
    name: 'ReleaseNoteAI Test Company'
  }

  const publicUrl = 'https://your-domain.com/release-notes/test'

  try {
    const template = generateReleaseNotesEmail(mockReleaseNote, mockOrganization, publicUrl)
    
    return {
      success: true,
      template,
      message: 'Release notes email template generated successfully'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Release notes email template generation failed'
    }
  }
}

/**
 * Validate email configuration
 */
export function validateEmailConfig() {
  const config = {
    resendApiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM,
    appUrl: process.env.NEXT_PUBLIC_APP_URL
  }

  const issues: string[] = []

  if (!config.resendApiKey || config.resendApiKey.includes('placeholder')) {
    issues.push('RESEND_API_KEY is missing or using placeholder value')
  }

  if (!config.fromEmail) {
    issues.push('RESEND_FROM_EMAIL or EMAIL_FROM environment variable is missing')
  }

  if (!config.appUrl) {
    issues.push('NEXT_PUBLIC_APP_URL environment variable is missing')
  }

  return {
    isValid: issues.length === 0,
    config,
    issues,
    message: issues.length === 0 ? 'Email configuration is valid' : 'Email configuration has issues'
  }
}