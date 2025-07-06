import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * Simple subscriber management API
 * POST: Add a new subscriber
 * GET: List subscribers (for authenticated users)
 */

export async function POST(request: NextRequest) {
  try {
    const { email, name, organization_slug } = await request.json()

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

    // Check if subscriber already exists
    const { data: existingSubscriber } = await supabase
      .from('subscribers')
      .select('id, status')
      .eq('organization_id', organization.id)
      .eq('email', email)
      .single()

    if (existingSubscriber) {
      if (existingSubscriber.status === 'active') {
        return NextResponse.json(
          { message: 'Already subscribed', subscriber_id: existingSubscriber.id },
          { status: 200 }
        )
      } else {
        // Reactivate subscription
        const { error: updateError } = await supabase
          .from('subscribers')
          .update({ 
            status: 'active',
            subscribed_at: new Date().toISOString(),
            unsubscribed_at: null
          })
          .eq('id', existingSubscriber.id)

        if (updateError) {
          throw updateError
        }

        return NextResponse.json({
          success: true,
          message: 'Subscription reactivated',
          subscriber_id: existingSubscriber.id
        })
      }
    }

    // Add new subscriber
    const { data: newSubscriber, error: insertError } = await supabase
      .from('subscribers')
      .insert([{
        organization_id: organization.id,
        email,
        name,
        status: 'active'
      }])
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    return NextResponse.json({
      success: true,
      message: `Successfully subscribed to ${organization.name} release notes`,
      subscriber_id: newSubscriber.id
    }, { status: 201 })

  } catch (error) {
    console.error('Subscriber creation error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to subscribe',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get subscribers for user's organization
    const { data: subscribers, error: subscribersError } = await supabase
      .from('subscribers')
      .select('id, email, name, status, subscribed_at, unsubscribed_at')
      .eq('organization_id', session.user.id)
      .order('subscribed_at', { ascending: false })

    if (subscribersError) {
      throw subscribersError
    }

    return NextResponse.json({
      subscribers: subscribers || [],
      total: subscribers?.length || 0
    })

  } catch (error) {
    console.error('Subscribers fetch error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch subscribers',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}