import { NextRequest, NextResponse } from 'next/server'
import { getAiProvider } from '@/lib/ai'
import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

const window = new JSDOM('').window
const purify = DOMPurify(window)

export async function POST(request: NextRequest) {
  try {
    const { content, instructions, improvementType, targetTone } = await request.json()

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

    const aiProvider = getAiProvider()
    
    // Build improvement prompt based on type
    let systemPrompt = `You are an expert content editor. Improve the provided content to make it more engaging, clear, and professional for release notes.`
    
    if (improvementType) {
      const typeInstructions = {
        clarity: 'Focus on making the content clearer and easier to understand. Remove jargon, simplify complex sentences, and improve readability.',
        tone: `Adjust the tone to be more ${targetTone || 'professional'}. Ensure the language matches the target audience.`,
        engagement: 'Make the content more engaging by adding compelling language, questions, or calls-to-action where appropriate.',
        structure: 'Improve the structure by adding headers, bullet points, or reorganizing content for better flow.',
        grammar: 'Fix grammar, spelling, and punctuation errors while maintaining the original meaning.'
      }
      
      systemPrompt += ` ${typeInstructions[improvementType as keyof typeof typeInstructions] || ''}`
    }

    if (instructions) {
      systemPrompt += ` Additional instructions: ${instructions}`
    }

    const improvedContent = await aiProvider.generateText(
      `Please improve this release note content:\n\n${content}`,
      {
        systemPrompt,
        maxTokens: 3000,
        temperature: 0.4
      }
    )

    // Sanitize the improved content
    const sanitizedContent = purify.sanitize(improvedContent, {
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
      original: content,
      improved: sanitizedContent,
      improvementType: improvementType || 'general',
      metadata: {
        originalLength: content.length,
        improvedLength: sanitizedContent.length,
        instructions: instructions || 'General improvement'
      }
    })

  } catch (error) {
    console.error('Content improvement error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to improve content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { content, suggestions } = await request.json()

    if (!content || !Array.isArray(suggestions)) {
      return NextResponse.json(
        { error: 'Content and suggestions array are required' },
        { status: 400 }
      )
    }

    let improvedContent = content

    // Apply suggestions in order
    for (const suggestion of suggestions) {
      if (suggestion.originalText && suggestion.suggestedText) {
        improvedContent = improvedContent.replace(
          suggestion.originalText,
          suggestion.suggestedText
        )
      }
    }

    // Sanitize the final content
    const sanitizedContent = purify.sanitize(improvedContent, {
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
      original: content,
      improved: sanitizedContent,
      appliedSuggestions: suggestions.length,
      metadata: {
        originalLength: content.length,
        improvedLength: sanitizedContent.length
      }
    })

  } catch (error) {
    console.error('Bulk improvement error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to apply improvements',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}