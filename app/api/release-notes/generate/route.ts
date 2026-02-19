import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/ssr'
import { cookies } from 'next/headers'
import { getAiProvider, getConfiguredAiProvider } from '@/lib/ai'
import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

const window = new JSDOM('').window
const purify = DOMPurify(window)

interface PromptTicket {
  type?: string
  title?: string
  description?: string
  labels?: string[]
}

interface PromptCommit {
  message: string
  author?: string
}

/**
 * POST /api/release-notes/generate - Generate release notes with AI
 * Supports both streaming and non-streaming responses
 */

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const streaming = searchParams.get('stream') === 'true'
    
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const { data: orgMember } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', session.user.id)
      .single()

    if (!orgMember) {
      return NextResponse.json({ error: 'No organization found' }, { status: 403 })
    }

    const body = await request.json()
    const {
      tickets = [],
      commits = [],
      companyDetails,
      tone = 'professional',
      model,
      template_id: _templateId,
      template,
      customPrompt
    } = body

    if ((!tickets || tickets.length === 0) && (!commits || commits.length === 0)) {
      return NextResponse.json(
        { error: 'Tickets or commits are required for AI generation' },
        { status: 400 }
      )
    }

    const aiProvider = getAiProvider()
    let generatedContent: string
    const systemPrompt = buildReleaseNotesSystemPrompt({ tone, template })

    if (streaming) {
      // Create a ReadableStream for streaming response
      const encoder = new TextEncoder()
      
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const prompt = customPrompt || buildReleaseNotesUserPrompt({ tickets, commits, companyDetails })
            
            const content = await aiProvider.generateText(prompt, {
              systemPrompt,
              temperature: 0.3,
              maxTokens: 2500
            })
            const chunks = content.match(/.{1,256}/g) ?? []

            for (const chunk of chunks) {
              controller.enqueue(encoder.encode(chunk))
            }
            
            controller.close()
          } catch (error) {
            console.error('AI generation streaming error:', error)
            controller.enqueue(encoder.encode(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`))
            controller.close()
          }
        }
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      })
    } else {
      // Non-streaming generation
      const prompt = customPrompt || buildReleaseNotesUserPrompt({ tickets, commits, companyDetails })
      generatedContent = await aiProvider.generateText(prompt, {
        systemPrompt,
        temperature: 0.3,
        maxTokens: 2500
      })

      // Sanitize the generated content
      const sanitizedContent = purify.sanitize(generatedContent, {
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
          ticketsProcessed: tickets.length,
          commitsProcessed: commits.length,
          provider: getConfiguredAiProvider(),
          model,
          tone
        }
      })
    }

  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate release notes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function buildReleaseNotesSystemPrompt(data: {
  tone?: string
  template?: string
}): string {
  const tone = data.tone || 'professional'

  let prompt = `You are an expert product writer creating release notes for a SaaS product.

Return ONLY valid HTML (no Markdown). Do not wrap the output in code fences. Do not include <html>, <head>, or <body> tags.

Write in a ${tone} tone. Make it skimmable and user-focused.`

  prompt += `

Required structure:
- Start with a short <p> summary (1-3 sentences).
- Then include only the sections that apply, each as <h2> + <ul><li>...</li></ul>:
  - New Features
  - Improvements
  - Fixes
  - Breaking Changes (only if truly breaking)

Writing rules:
- Each <li> should be one short sentence and describe the user benefit.
- Remove internal IDs (e.g., ABC-123, commit SHAs) unless they are clearly user-facing.
- Avoid implementation details, stack names, or internal systems.
- If an item has little context, be conservative and do not invent details.`

  if (data.template) {
    prompt += `\n\nTemplate guidance (follow where it makes sense, but still output valid HTML):\n${data.template}`
  }

  return prompt
}

function buildReleaseNotesUserPrompt(data: {
  tickets?: PromptTicket[]
  commits?: PromptCommit[]
  companyDetails?: string
}): string {
  let prompt = 'Use the following items as source material:\n\n'
  
  if (data.tickets && data.tickets.length > 0) {
    // Group tickets by type
    const features = data.tickets.filter(t => t.type === 'feature')
    const bugfixes = data.tickets.filter(t => t.type === 'bugfix')
    const improvements = data.tickets.filter(t => t.type === 'improvement')
    const breaking = data.tickets.filter(t => t.type === 'breaking')
    
    if (features.length > 0) {
      prompt += 'New Features:\n'
      features.forEach(ticket => {
        prompt += `- ${ticket.title || 'Untitled'}: ${ticket.description || ''}\n`
        if (ticket.labels?.length) {
          prompt += `  Labels: ${ticket.labels.join(', ')}\n`
        }
      })
      prompt += '\n'
    }
    
    if (improvements.length > 0) {
      prompt += 'Improvements:\n'
      improvements.forEach(ticket => {
        prompt += `- ${ticket.title || 'Untitled'}: ${ticket.description || ''}\n`
        if (ticket.labels?.length) {
          prompt += `  Labels: ${ticket.labels.join(', ')}\n`
        }
      })
      prompt += '\n'
    }
    
    if (bugfixes.length > 0) {
      prompt += 'Fixes:\n'
      bugfixes.forEach(ticket => {
        prompt += `- ${ticket.title || 'Untitled'}: ${ticket.description || ''}\n`
        if (ticket.labels?.length) {
          prompt += `  Labels: ${ticket.labels.join(', ')}\n`
        }
      })
      prompt += '\n'
    }
    
    if (breaking.length > 0) {
      prompt += 'Breaking Changes:\n'
      breaking.forEach(ticket => {
        prompt += `- ${ticket.title || 'Untitled'}: ${ticket.description || ''}\n`
        if (ticket.labels?.length) {
          prompt += `  Labels: ${ticket.labels.join(', ')}\n`
        }
      })
      prompt += '\n'
    }
  }
  
  if (data.commits && data.commits.length > 0) {
    prompt += 'Commits / PRs:\n'
    data.commits.forEach((commit) => {
      prompt += `- ${commit.message}\n`
      if (commit.author) {
        prompt += `  Author: ${commit.author}\n`
      }
    })
    prompt += '\n'
  }
  
  if (data.companyDetails) {
    prompt += `\nCompany context: ${data.companyDetails}\n`
  }

  prompt += '\nNow write the release notes from this source material.'

  return prompt
}
