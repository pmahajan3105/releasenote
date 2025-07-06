import { NextRequest, NextResponse } from 'next/server'
import { contentEnhancer, ContentImprovementOptions } from '@/lib/ai/content-enhancer'

export async function POST(request: NextRequest) {
  try {
    const { content, options } = await request.json()

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required and must be a string' },
        { status: 400 }
      )
    }

    if (content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content cannot be empty' },
        { status: 400 }
      )
    }

    if (content.length > 50000) {
      return NextResponse.json(
        { error: 'Content is too long (max 50,000 characters)' },
        { status: 400 }
      )
    }

    const improvementOptions: ContentImprovementOptions = {
      targetTone: options?.targetTone,
      targetAudience: options?.targetAudience || 'mixed',
      improvementTypes: options?.improvementTypes || ['clarity', 'tone', 'engagement', 'structure'],
      maxSuggestions: options?.maxSuggestions || 10
    }

    const analysis = await contentEnhancer.analyzeContent(content, improvementOptions)

    return NextResponse.json(analysis)

  } catch (error) {
    console.error('Content analysis error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { sentence, improvementType } = await request.json()

    if (!sentence || typeof sentence !== 'string') {
      return NextResponse.json(
        { error: 'Sentence is required and must be a string' },
        { status: 400 }
      )
    }

    if (!improvementType || !['clarity', 'tone', 'engagement', 'structure', 'grammar'].includes(improvementType)) {
      return NextResponse.json(
        { error: 'Valid improvement type is required' },
        { status: 400 }
      )
    }

    const improvedSentence = await contentEnhancer.improveSentence(sentence, improvementType)

    return NextResponse.json({
      original: sentence,
      improved: improvedSentence,
      improvementType
    })

  } catch (error) {
    console.error('Sentence improvement error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to improve sentence',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}