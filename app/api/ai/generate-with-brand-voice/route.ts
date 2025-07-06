import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getAiProvider } from '@/lib/ai'
import { customPromptEngine, GenerationContext } from '@/lib/ai/custom-prompts'
import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

const window = new JSDOM('').window
const purify = DOMPurify(window)

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { brandVoiceId, content, userPreferences } = await request.json()

    if (!brandVoiceId) {
      return NextResponse.json(
        { error: 'Brand voice ID is required' },
        { status: 400 }
      )
    }

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Fetch the brand voice
    const { data: brandVoice, error: voiceError } = await supabase
      .from('brand_voices')
      .select('*')
      .eq('id', brandVoiceId)
      .eq('organization_id', session.user.id)
      .single()

    if (voiceError || !brandVoice) {
      return NextResponse.json(
        { error: 'Brand voice not found' },
        { status: 404 }
      )
    }

    // Convert database format to our interface format
    const brandVoiceObj = {
      ...brandVoice,
      sentenceLength: brandVoice.sentence_length,
      paragraphStyle: brandVoice.paragraph_style,
      useEmojis: brandVoice.use_emojis,
      useMetrics: brandVoice.use_metrics,
      headerStyle: brandVoice.header_style,
      bulletPointStyle: brandVoice.bullet_point_style,
      brandGuidelines: brandVoice.brand_guidelines,
      exampleContent: brandVoice.example_content
    }

    // Create generation context
    const context: GenerationContext = {
      organizationId: session.user.id,
      brandVoice: brandVoiceObj,
      userPreferences: userPreferences || {}
    }

    // Generate enhanced prompt
    const enhancedPrompt = customPromptEngine.generateEnhancedPrompt(context, content)

    // Generate content with AI
    const aiProvider = getAiProvider()
    const rawContent = await aiProvider.generateText(
      enhancedPrompt.userPrompt,
      {
        systemPrompt: enhancedPrompt.systemPrompt,
        maxTokens: enhancedPrompt.metadata.maxTokens,
        temperature: enhancedPrompt.metadata.temperature
      }
    )

    // Sanitize the generated content
    const sanitizedContent = purify.sanitize(rawContent, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'div', 'span',
        'ul', 'ol', 'li',
        'strong', 'b', 'em', 'i', 'u',
        'blockquote', 'code', 'pre',
        'a', 'img'
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class']
    })

    return NextResponse.json({
      content: sanitizedContent,
      metadata: {
        brandVoiceId,
        tone: brandVoiceObj.tone,
        targetAudience: enhancedPrompt.metadata.targetAudience,
        temperature: enhancedPrompt.metadata.temperature,
        brandVoiceName: brandVoiceObj.name
      }
    })

  } catch (error) {
    console.error('Brand voice generation error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate content with brand voice',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}