import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * Simple unsubscribe API
 * POST: Unsubscribe an email from organization updates
 */
export async function POST(request: NextRequest) {
  try {
    const { email, organization_slug } = await request.json()

    if (!email || !organization_slug) {
      return NextResponse.json(
        { error: 'Email and organization slug are required' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Find organization by slug
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('slug', organization_slug)
      .single()

    if (orgError || !organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Find and unsubscribe
    const { data: subscriber, error: findError } = await supabase
      .from('subscribers')
      .select('id, status')
      .eq('organization_id', organization.id)
      .eq('email', email)
      .single()

    if (findError || !subscriber) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    if (subscriber.status === 'unsubscribed') {
      return NextResponse.json({
        message: 'Already unsubscribed'
      })
    }

    // Update subscription status
    const { error: updateError } = await supabase
      .from('subscribers')
      .update({ 
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString()
      })
      .eq('id', subscriber.id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      message: `Successfully unsubscribed from ${organization.name} release notes`
    })

  } catch (error) {
    console.error('Unsubscribe error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to unsubscribe',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}