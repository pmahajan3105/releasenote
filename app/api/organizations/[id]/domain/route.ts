import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/ssr'
import { cookies } from 'next/headers'
import crypto from 'crypto'

/**
 * Custom domain management API
 * GET: Retrieve current custom domain settings
 * PUT: Configure custom domain for organization
 * DELETE: Remove custom domain
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id, slug, custom_domain, domain_verified')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single()

    if (orgError || !organization) {
      return NextResponse.json(
        { error: 'Organization not found or access denied' },
        { status: 404 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    const publicPortalUrl = organization.custom_domain
      ? `https://${organization.custom_domain}`
      : `${baseUrl}/notes/${organization.slug}`

    return NextResponse.json({
      custom_domain: organization.custom_domain || '',
      domain_verified: Boolean(organization.domain_verified),
      public_portal_url: publicPortalUrl,
    })
  } catch (error) {
    console.error('Domain settings fetch error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch domain settings',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { domain } = await request.json()
    
    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      )
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/
    if (!domainRegex.test(domain)) {
      return NextResponse.json(
        { error: 'Invalid domain format' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if domain is already taken
    const { data: existingDomain } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('custom_domain', domain)
      .neq('id', id)
      .single()

    if (existingDomain) {
      return NextResponse.json(
        { error: 'Domain is already in use by another organization' },
        { status: 409 }
      )
    }

    // Verify user owns the organization
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, custom_domain')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single()

    if (orgError || !organization) {
      return NextResponse.json(
        { error: 'Organization not found or access denied' },
        { status: 404 }
      )
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')

    // Start transaction: update organization and create verification record
    const { error: updateError } = await supabase
      .from('organizations')
      .update({ 
        custom_domain: domain,
        domain_verified: false
      })
      .eq('id', id)

    if (updateError) {
      throw updateError
    }

    // Delete existing verification records for this org
    await supabase
      .from('domain_verifications')
      .delete()
      .eq('organization_id', id)

    // Create new verification record
    const { error: verificationError } = await supabase
      .from('domain_verifications')
      .insert([{
        organization_id: id,
        domain,
        verification_token: verificationToken,
        verification_method: 'dns'
      }])
      .select()
      .single()

    if (verificationError) {
      throw verificationError
    }

    return NextResponse.json({
      success: true,
      domain,
      verification: {
        token: verificationToken,
        txtRecord: `releasenotes-verify=${verificationToken}`,
        instructions: [
          `Add a TXT record to your DNS settings:`,
          `Name: _releasenotes-verify.${domain}`,
          `Value: ${verificationToken}`,
          `TTL: 300 (or default)`
        ]
      }
    })

  } catch (error) {
    console.error('Domain configuration error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to configure domain',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user owns the organization
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id, custom_domain')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single()

    if (orgError || !organization) {
      return NextResponse.json(
        { error: 'Organization not found or access denied' },
        { status: 404 }
      )
    }

    // Remove custom domain
    const { error: updateError } = await supabase
      .from('organizations')
      .update({ 
        custom_domain: null,
        domain_verified: false
      })
      .eq('id', id)

    if (updateError) {
      throw updateError
    }

    // Delete verification records
    await supabase
      .from('domain_verifications')
      .delete()
      .eq('organization_id', id)

    return NextResponse.json({
      success: true,
      message: 'Custom domain removed successfully'
    })

  } catch (error) {
    console.error('Domain removal error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to remove domain',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
