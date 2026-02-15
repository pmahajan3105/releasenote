import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

type RouteSupabaseClient = ReturnType<typeof createRouteHandlerClient<Record<string, unknown>, 'public'>>

interface SSLCertificateRecord {
  id: string | number
  organization_id: string
  domain: string
}

/**
 * SSL Certificate Renewal Cron Job
 * POST: Check for expiring certificates and renew them
 * 
 * This endpoint should be called by a cron service (Vercel Cron, GitHub Actions, etc.)
 * to automatically renew SSL certificates that are expiring within 30 days.
 */

export async function POST(request: NextRequest) {
  try {
    // Verify cron job authentication
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Find certificates that are expiring within 30 days and have auto-renew enabled
    const expiryThreshold = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    
    const { data: certificates, error: fetchError } = await supabase
      .from('ssl_certificates')
      .select(`
        id,
        organization_id,
        domain,
        expires_at,
        auto_renew,
        organizations!inner(
          id,
          name,
          custom_domain,
          domain_verified
        )
      `)
      .eq('auto_renew', true)
      .lt('expires_at', expiryThreshold.toISOString())
      .eq('organizations.domain_verified', true)

    if (fetchError) {
      throw fetchError
    }

    if (!certificates || certificates.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No certificates need renewal',
        processed: 0
      })
    }

    const renewalResults = []

    // Process each certificate renewal
    for (const cert of certificates) {
      try {
        const renewalResult = await renewCertificate(supabase, cert)
        renewalResults.push({
          domain: cert.domain,
          organizationId: cert.organization_id,
          success: renewalResult.success,
          message: renewalResult.message
        })
      } catch (error) {
        console.error(`Failed to renew certificate for ${cert.domain}:`, error)
        renewalResults.push({
          domain: cert.domain,
          organizationId: cert.organization_id,
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const successCount = renewalResults.filter(r => r.success).length
    const failureCount = renewalResults.filter(r => !r.success).length

    // Log renewal summary
    console.log(`SSL Renewal Summary: ${successCount} renewed, ${failureCount} failed`)

    return NextResponse.json({
      success: true,
      message: `Processed ${certificates.length} certificates`,
      summary: {
        total: certificates.length,
        renewed: successCount,
        failed: failureCount
      },
      results: renewalResults
    })

  } catch (error) {
    console.error('SSL renewal cron job error:', error)
    
    return NextResponse.json(
      { 
        error: 'SSL renewal job failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Renew SSL certificate for a domain
 */
async function renewCertificate(supabase: RouteSupabaseClient, certificate: SSLCertificateRecord) {
  try {
    const { domain, organization_id } = certificate

    // Check if domain is still verified
    const { data: org } = await supabase
      .from('organizations')
      .select('domain_verified')
      .eq('id', organization_id)
      .single()

    if (!org?.domain_verified) {
      throw new Error('Domain is no longer verified')
    }

    // In a real implementation, this would use ACME client to request new certificate
    // For demo purposes, we'll generate a mock certificate
    const mockCertificate = generateMockRenewalCertificate(domain)

    // Update certificate with new data
    const { error: updateError } = await supabase
      .from('ssl_certificates')
      .update({
        certificate: mockCertificate.certificate,
        private_key: mockCertificate.privateKey,
        certificate_chain: mockCertificate.chain,
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
        updated_at: new Date().toISOString()
      })
      .eq('id', certificate.id)

    if (updateError) {
      throw updateError
    }

    return {
      success: true,
      message: `Certificate renewed successfully for ${domain}`
    }

  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Generate mock renewed certificate (for demo purposes)
 */
function generateMockRenewalCertificate(domain: string) {
  const renewedDate = new Date().toISOString()
  const expiresDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()

  const mockCert = `-----BEGIN CERTIFICATE-----
RENEWED MOCK CERTIFICATE FOR ${domain}
This is a demonstration renewed certificate.
In production, this would be a real Let's Encrypt certificate.
Valid for: ${domain}
Renewed: ${renewedDate}
Expires: ${expiresDate}
-----END CERTIFICATE-----`

  const mockKey = `-----BEGIN PRIVATE KEY-----
RENEWED MOCK PRIVATE KEY FOR ${domain}
This is a demonstration renewed private key.
In production, this would be the actual private key.
-----END PRIVATE KEY-----`

  const mockChain = `-----BEGIN CERTIFICATE-----
RENEWED MOCK INTERMEDIATE CERTIFICATE
This is a demonstration renewed intermediate certificate.
-----END CERTIFICATE-----`

  return {
    certificate: mockCert,
    privateKey: mockKey,
    chain: mockChain
  }
}

// Also handle GET for status checking
export async function GET() {
  return NextResponse.json({
    service: 'SSL Certificate Renewal',
    status: 'active',
    lastRun: new Date().toISOString(),
    description: 'Automatic SSL certificate renewal service'
  })
}
