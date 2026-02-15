import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getAiProvider } from '@/lib/ai'
import { customPromptEngine, GenerationContext, type PromptVariable } from '@/lib/ai/custom-prompts'
import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

const window = new JSDOM('').window
const purify = DOMPurify(window)

const isPromptVariableValue = (
  value: unknown
): value is PromptVariable['value'] =>
  typeof value === 'string' ||
  typeof value === 'number' ||
  typeof value === 'boolean' ||
  (Array.isArray(value) && value.every(item => typeof item === 'string'))

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { customPromptId, variables, content } = await request.json()

    if (!customPromptId) {
      return NextResponse.json(
        { error: 'Custom prompt ID is required' },
        { status: 400 }
      )
    }

    // Fetch the custom prompt
    const { data: customPrompt, error: promptError } = await supabase
      .from('custom_prompts')
      .select('*')
      .eq('id', customPromptId)
      .eq('organization_id', session.user.id)
      .single()

    if (promptError || !customPrompt) {
      return NextResponse.json(
        { error: 'Custom prompt not found' },
        { status: 404 }
      )
    }

    // Fetch brand voice if specified
    let brandVoice = null
    if (customPrompt.brand_voice_id) {
      const { data: bv } = await supabase
        .from('brand_voices')
        .select('*')
        .eq('id', customPrompt.brand_voice_id)
        .eq('organization_id', session.user.id)
        .single()
      
      if (bv) brandVoice = bv
    }

    // Convert database format to our interface format
    const promptObj = {
      ...customPrompt,
      systemPrompt: customPrompt.system_prompt,
      userPromptTemplate: customPrompt.user_prompt_template,
      maxTokens: customPrompt.max_tokens,
      targetAudience: customPrompt.target_audience,
      brandVoiceId: customPrompt.brand_voice_id
    }

    const brandVoiceObj = brandVoice ? {
      ...brandVoice,
      sentenceLength: brandVoice.sentence_length,
      paragraphStyle: brandVoice.paragraph_style,
      useEmojis: brandVoice.use_emojis,
      useMetrics: brandVoice.use_metrics,
      headerStyle: brandVoice.header_style,
      bulletPointStyle: brandVoice.bullet_point_style,
      brandGuidelines: brandVoice.brand_guidelines,
      exampleContent: brandVoice.example_content
    } : undefined

    // Create generation context
    const promptVariables: PromptVariable[] = Object.entries(variables ?? {})
      .flatMap(([name, value]) =>
        isPromptVariableValue(value) ? [{ name, value }] : []
      )

    const context: GenerationContext = {
      organizationId: session.user.id,
      customPrompt: promptObj,
      brandVoice: brandVoiceObj,
      variables: promptVariables
    }

    // Generate enhanced prompt
    const enhancedPrompt = customPromptEngine.generateEnhancedPrompt(
      context, 
      content || 'Generate release notes content'
    )

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
        customPromptId,
        brandVoiceId: customPrompt.brand_voice_id,
        targetAudience: enhancedPrompt.metadata.targetAudience,
        temperature: enhancedPrompt.metadata.temperature,
        variablesUsed: Object.keys(variables || {})
      }
    })

  } catch (error) {
    console.error('Custom prompt generation error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate content with custom prompt',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
