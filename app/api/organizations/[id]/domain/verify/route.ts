import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/ssr'
import { cookies } from 'next/headers'
import { promises as dns } from 'dns'

/**
 * Domain verification API
 * POST: Verify domain ownership via DNS TXT record
 */

export async function POST(
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

    // Get organization and verification details
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, custom_domain, domain_verified')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single()

    if (orgError || !organization) {
      return NextResponse.json(
        { error: 'Organization not found or access denied' },
        { status: 404 }
      )
    }

    if (!organization.custom_domain) {
      return NextResponse.json(
        { error: 'No custom domain configured' },
        { status: 400 }
      )
    }

    if (organization.domain_verified) {
      return NextResponse.json({
        success: true,
        verified: true,
        message: 'Domain is already verified'
      })
    }

    // Get verification record
    const { data: verification, error: verificationError } = await supabase
      .from('domain_verifications')
      .select('*')
      .eq('organization_id', id)
      .eq('domain', organization.custom_domain)
      .single()

    if (verificationError || !verification) {
      return NextResponse.json(
        { error: 'Verification record not found' },
        { status: 404 }
      )
    }

    // Perform DNS verification
    const verificationDomain = `_releasenotes-verify.${organization.custom_domain}`
    
    try {
      const txtRecords = await dns.resolveTxt(verificationDomain)
      const flatRecords = txtRecords.flat()
      
      const isVerified = flatRecords.some(record => 
        record === verification.verification_token
      )

      if (isVerified) {
        // Update organization as verified
        const { error: updateOrgError } = await supabase
          .from('organizations')
          .update({ domain_verified: true })
          .eq('id', id)

        if (updateOrgError) {
          throw updateOrgError
        }

        // Update verification record
        const { error: updateVerificationError } = await supabase
          .from('domain_verifications')
          .update({ verified_at: new Date().toISOString() })
          .eq('id', verification.id)

        if (updateVerificationError) {
          console.error('Failed to update verification record:', updateVerificationError)
        }

        return NextResponse.json({
          success: true,
          verified: true,
          message: 'Domain verified successfully!',
          domain: organization.custom_domain
        })
      } else {
        return NextResponse.json({
          success: false,
          verified: false,
          message: 'DNS verification failed. Please ensure the TXT record is correctly configured.',
          expectedRecord: verification.verification_token,
          foundRecords: flatRecords,
          instructions: [
            `Add a TXT record to your DNS settings:`,
            `Name: _releasenotes-verify.${organization.custom_domain}`,
            `Value: ${verification.verification_token}`,
            `TTL: 300 (or default)`,
            `Note: DNS changes can take up to 24 hours to propagate.`
          ]
        }, { status: 400 })
      }

    } catch (dnsError) {
      console.error('DNS lookup error:', dnsError)
      
      return NextResponse.json({
        success: false,
        verified: false,
        message: 'Could not verify DNS records. Please ensure the TXT record is configured and DNS has propagated.',
        instructions: [
          `Add a TXT record to your DNS settings:`,
          `Name: _releasenotes-verify.${organization.custom_domain}`,
          `Value: ${verification.verification_token}`,
          `TTL: 300 (or default)`,
          `Note: DNS changes can take up to 24 hours to propagate.`
        ]
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Domain verification error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to verify domain',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
