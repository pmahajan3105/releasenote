import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { isProviderAvailable } from '@/lib/config'
import { withOrgAuth, type AuthContext } from '@/lib/auth-helpers'

/**
 * GET /api/release-notes/init - Get initialization data (templates, categories, preferences)
 */

export const GET = withOrgAuth(async (request: NextRequest, context: AuthContext) => {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const organizationId = context.organizationId

    // Get templates (placeholder - would be from database)
    const templates = [
      {
        id: 'technical',
        name: 'Technical Release',
        description: 'Detailed technical changelog for developers'
      },
      {
        id: 'marketing',
        name: 'Marketing Release',
        description: 'User-friendly release notes for customers'
      },
      {
        id: 'minimal',
        name: 'Minimal',
        description: 'Simple bullet-point format'
      }
    ]

    // Get categories for this organization
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name')

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError)
    }

    // Get brand voices for this organization
    const { data: brandVoices, error: brandVoicesError } = await supabase
      .from('brand_voices')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name')

    if (brandVoicesError) {
      console.error('Error fetching brand voices:', brandVoicesError)
    }

    // Get custom prompts for this organization
    const { data: customPrompts, error: promptsError } = await supabase
      .from('custom_prompts')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name')

    if (promptsError) {
      console.error('Error fetching custom prompts:', promptsError)
    }

    const initData = {
      templates,
      categories: categories || [],
      brandVoices: brandVoices || [],
      customPrompts: customPrompts || [],
      availableProviders: {
        openai: isProviderAvailable('openai'),
        anthropic: isProviderAvailable('anthropic'),
        azure: isProviderAvailable('azure')
      }
    }

    return NextResponse.json(initData)

  } catch (error) {
    console.error('Get init data error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})