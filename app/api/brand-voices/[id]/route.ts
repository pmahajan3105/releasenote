import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/ssr'
import { cookies } from 'next/headers'
import { customPromptEngine } from '@/lib/ai/custom-prompts'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: brandVoice, error } = await supabase
      .from('brand_voices')
      .select('*')
      .eq('id', id)
      .eq('organization_id', session.user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Brand voice not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ brandVoice })

  } catch (error) {
    console.error('Brand voice fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch brand voice' },
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
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const brandVoiceData = await request.json()

    // Validate the brand voice data
    const validationErrors = customPromptEngine.validateBrandVoice(brandVoiceData)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData = {
      name: brandVoiceData.name,
      description: brandVoiceData.description || '',
      tone: brandVoiceData.tone,
      personality: brandVoiceData.personality || [],
      vocabulary: brandVoiceData.vocabulary || { preferred: [], avoided: [], replacements: {} },
      sentence_length: brandVoiceData.sentenceLength || 'medium',
      paragraph_style: brandVoiceData.paragraphStyle || 'balanced',
      use_emojis: brandVoiceData.useEmojis || false,
      use_metrics: brandVoiceData.useMetrics || false,
      header_style: brandVoiceData.headerStyle || 'traditional',
      bullet_point_style: brandVoiceData.bulletPointStyle || 'simple',
      brand_guidelines: brandVoiceData.brandGuidelines || '',
      example_content: brandVoiceData.exampleContent || '',
      is_active: brandVoiceData.is_active !== false,
      updated_at: new Date().toISOString()
    }

    const { data: updatedBrandVoice, error } = await supabase
      .from('brand_voices')
      .update(updateData)
      .eq('id', id)
      .eq('organization_id', session.user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Brand voice not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({
      message: 'Brand voice updated successfully',
      brandVoice: updatedBrandVoice
    })

  } catch (error) {
    console.error('Brand voice update error:', error)
    return NextResponse.json(
      { error: 'Failed to update brand voice' },
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
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('brand_voices')
      .delete()
      .eq('id', id)
      .eq('organization_id', session.user.id)

    if (error) {
      throw error
    }

    return NextResponse.json({
      message: 'Brand voice deleted successfully'
    })

  } catch (error) {
    console.error('Brand voice deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete brand voice' },
      { status: 500 }
    )
  }
}
