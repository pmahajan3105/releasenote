import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Domain lookup API for custom domain routing
 * GET: Find organization by custom domain
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')
    
    if (!domain) {
      return NextResponse.json(
        { error: 'Domain parameter is required' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Find organization by custom domain
    const { data: organization, error } = await supabase
      .from('organizations')
      .select('id, name, slug, domain_verified')
      .eq('custom_domain', domain)
      .eq('domain_verified', true)
      .single()

    if (error || !organization) {
      return NextResponse.json(
        { error: 'Domain not found or not verified' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        verified: organization.domain_verified
      }
    })

  } catch (error) {
    console.error('Domain lookup error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to lookup domain',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}