import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const supabase = createServerComponentClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: brandVoices, error } = await supabase
      .from('brand_voices')
      .select('*')
      .eq('organization_id', session.user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(brandVoices)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Prepare brand voice for database
    const newBrandVoice = {
      name: brandVoiceData.name,
      description: brandVoiceData.description || '',
      organization_id: session.user.id,
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
      is_active: brandVoiceData.is_active !== false
    }

    const { data: createdBrandVoice, error } = await supabase
      .from('brand_voices')
      .insert([newBrandVoice])
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      message: 'Brand voice created successfully',
      brandVoice: createdBrandVoice
    })

  } catch (error) {
    console.error('Brand voice creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create brand voice' },
      { status: 500 }
    )
  }
}
