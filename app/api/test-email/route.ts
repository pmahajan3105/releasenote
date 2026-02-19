import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/ssr'
import { cookies } from 'next/headers'
import { testBasicEmail, testReleaseNotesTemplate, validateEmailConfig } from '@/lib/email-test'

/**
 * Test email functionality endpoint
 * GET /api/test-email - Validate email configuration
 * POST /api/test-email - Send test email
 */

async function requireAuthorizedUser() {
  if (process.env.NODE_ENV !== 'production') {
    return null
  }

  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return null
}

export async function GET() {
  try {
    const authError = await requireAuthorizedUser()
    if (authError) {
      return authError
    }

    const validation = validateEmailConfig()
    return NextResponse.json(validation)
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Email configuration validation failed'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAuthorizedUser()
    if (authError) {
      return authError
    }

    const body = await request.json()
    const { recipientEmail, testType = 'basic' } = body

    if (!recipientEmail) {
      return NextResponse.json(
        { success: false, error: 'recipientEmail is required' },
        { status: 400 }
      )
    }

    if (testType === 'basic') {
      const result = await testBasicEmail(recipientEmail)
      return NextResponse.json(result)
    } else if (testType === 'template') {
      const templateResult = testReleaseNotesTemplate()
      
      if (!templateResult.success) {
        return NextResponse.json(templateResult, { status: 500 })
      }

      // Send the generated template as a test email
      const { sendEmail } = await import('@/lib/email')
      const emailResult = await sendEmail({
        to: recipientEmail,
        subject: templateResult.template!.subject,
        html: templateResult.template!.html,
        text: templateResult.template!.text
      })

      return NextResponse.json({
        success: true,
        template: templateResult.template,
        emailResult,
        message: 'Release notes template email sent successfully'
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid testType. Use "basic" or "template"' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Email test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Email test failed'
      },
      { status: 500 }
    )
  }
}
