import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/ssr'
import { cookies } from 'next/headers'
import { customPromptEngine } from '@/lib/ai/custom-prompts'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const category = url.searchParams.get('category')

    let query = supabase
      .from('custom_prompts')
      .select('*')
      .eq('organization_id', session.user.id)
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    const { data: customPrompts, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      customPrompts: customPrompts || [],
      total: customPrompts?.length || 0
    })

  } catch (error) {
    console.error('Custom prompts fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch custom prompts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const promptData = await request.json()

    // Validate the custom prompt data
    const validationErrors = customPromptEngine.validateCustomPrompt(promptData)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      )
    }

    // Prepare custom prompt for database
    const newCustomPrompt = {
      name: promptData.name,
      description: promptData.description || '',
      organization_id: session.user.id,
      system_prompt: promptData.systemPrompt,
      user_prompt_template: promptData.userPromptTemplate,
      category: promptData.category || 'general',
      variables: promptData.variables || [],
      temperature: promptData.temperature || 0.7,
      max_tokens: promptData.maxTokens || 2000,
      target_audience: promptData.targetAudience || 'mixed',
      brand_voice_id: promptData.brandVoiceId || null,
      is_active: promptData.is_active !== false,
      created_by: session.user.id
    }

    const { data: createdPrompt, error } = await supabase
      .from('custom_prompts')
      .insert([newCustomPrompt])
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      message: 'Custom prompt created successfully',
      customPrompt: createdPrompt
    })

  } catch (error) {
    console.error('Custom prompt creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create custom prompt' },
      { status: 500 }
    )
  }
}
