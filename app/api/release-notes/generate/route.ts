import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getAiProvider } from '@/lib/ai'
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
      provider = 'anthropic',
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

    const aiProvider = getAiProvider(provider)
    let generatedContent: string

    if (streaming) {
      // Create a ReadableStream for streaming response
      const encoder = new TextEncoder()
      
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Build prompt for streaming
            const prompt = buildReleaseNotesPrompt({ tickets, commits, companyDetails, tone, template })
            
            // This would need to be implemented in the AI provider for streaming
            const response = await aiProvider.generateStreaming(prompt, {
              model,
              temperature: 0.7,
              maxTokens: 2000
            })

            const reader = response.getReader()
            
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              
              const chunk = new TextDecoder().decode(value)
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
      if (customPrompt) {
        generatedContent = await aiProvider.generateFromPrompt(customPrompt, {
          model,
          temperature: 0.7,
          maxTokens: 2000
        })
      } else if (tickets.length > 0) {
        const prompt = buildReleaseNotesPrompt({ tickets, companyDetails, tone, template })
        generatedContent = await aiProvider.generateFromPrompt(prompt, {
          model,
          temperature: 0.7,
          maxTokens: 2000
        })
      } else if (commits.length > 0) {
        generatedContent = await aiProvider.generateReleaseNotes(commits, {
          template: template || 'traditional',
          tone,
          includeBreakingChanges: true
        })
      } else {
        throw new Error('No valid input for generation')
      }

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
          provider,
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

function buildReleaseNotesPrompt(data: {
  tickets?: PromptTicket[]
  commits?: PromptCommit[]
  companyDetails?: string
  tone?: string
  template?: string
}): string {
  let prompt = 'Generate professional release notes based on the following items:\n\n'
  
  if (data.tickets && data.tickets.length > 0) {
    // Group tickets by type
    const features = data.tickets.filter(t => t.type === 'feature')
    const bugfixes = data.tickets.filter(t => t.type === 'bugfix')
    const improvements = data.tickets.filter(t => t.type === 'improvement')
    const breaking = data.tickets.filter(t => t.type === 'breaking')
    
    if (features.length > 0) {
      prompt += '## New Features\n'
      features.forEach(ticket => {
        prompt += `- **${ticket.title}**: ${ticket.description}\n`
        if (ticket.labels?.length) {
          prompt += `  Labels: ${ticket.labels.join(', ')}\n`
        }
      })
      prompt += '\n'
    }
    
    if (improvements.length > 0) {
      prompt += '## Improvements\n'
      improvements.forEach(ticket => {
        prompt += `- **${ticket.title}**: ${ticket.description}\n`
        if (ticket.labels?.length) {
          prompt += `  Labels: ${ticket.labels.join(', ')}\n`
        }
      })
      prompt += '\n'
    }
    
    if (bugfixes.length > 0) {
      prompt += '## Bug Fixes\n'
      bugfixes.forEach(ticket => {
        prompt += `- **${ticket.title}**: ${ticket.description}\n`
        if (ticket.labels?.length) {
          prompt += `  Labels: ${ticket.labels.join(', ')}\n`
        }
      })
      prompt += '\n'
    }
    
    if (breaking.length > 0) {
      prompt += '## Breaking Changes\n'
      breaking.forEach(ticket => {
        prompt += `- **${ticket.title}**: ${ticket.description}\n`
        if (ticket.labels?.length) {
          prompt += `  Labels: ${ticket.labels.join(', ')}\n`
        }
      })
      prompt += '\n'
    }
  }
  
  if (data.commits && data.commits.length > 0) {
    prompt += '## Commits\n'
    data.commits.forEach((commit) => {
      prompt += `- ${commit.message}\n`
      if (commit.author) {
        prompt += `  Author: ${commit.author}\n`
      }
    })
    prompt += '\n'
  }
  
  prompt += '\nPlease organize these into professional release notes with:\n'
  prompt += '- Clear categorization (New Features, Improvements, Bug Fixes, Breaking Changes)\n'
  prompt += '- User-friendly descriptions that explain the benefit to users\n'
  prompt += '- Proper Markdown formatting\n'
  prompt += '- A brief summary at the beginning if there are many changes\n'
  
  if (data.template) {
    prompt += `\nPlease follow this template structure:\n${data.template}\n`
  }
  
  if (data.companyDetails) {
    prompt += `\nCompany context: ${data.companyDetails}\n`
  }
  
  prompt += `\nTone: ${data.tone || 'professional'}\n`
  
  return prompt
}
