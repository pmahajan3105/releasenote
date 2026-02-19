import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/ssr'
import { cookies } from 'next/headers'
import { verifyUnsubscribeToken } from '@/lib/subscribers/unsubscribe-token'

/**
 * Simple unsubscribe API
 * POST: Unsubscribe via signed token, or legacy email+org_slug payload.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const token = typeof body?.token === 'string' ? body.token : null
    const email = typeof body?.email === 'string' ? body.email : null
    const organization_slug = typeof body?.organization_slug === 'string' ? body.organization_slug : null

    const supabase = createRouteHandlerClient({ cookies })

    if (token) {
      const verified = verifyUnsubscribeToken(token)
      if (!verified) {
        return NextResponse.json({ error: 'Invalid unsubscribe token' }, { status: 400 })
      }

      const { data: subscriber, error: findError } = await supabase
        .from('subscribers')
        .select('id, status, organization_id')
        .eq('id', verified.subscriberId)
        .single()

      if (findError || !subscriber) {
        return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
      }

      const { data: organization } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', subscriber.organization_id)
        .single()

      if (subscriber.status === 'unsubscribed') {
        return NextResponse.json({
          success: true,
          message: `Already unsubscribed from ${organization?.name ?? 'this'} release notes`,
        })
      }

      const { error: updateError } = await supabase
        .from('subscribers')
        .update({
          status: 'unsubscribed',
          unsubscribed_at: new Date().toISOString(),
        })
        .eq('id', subscriber.id)

      if (updateError) {
        throw updateError
      }

      return NextResponse.json({
        success: true,
        message: `Successfully unsubscribed from ${organization?.name ?? 'this'} release notes`,
      })
    }

    if (!email || !organization_slug) {
      return NextResponse.json({ error: 'Email and organization slug are required' }, { status: 400 })
    }

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
