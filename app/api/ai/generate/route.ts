import { NextRequest } from 'next/server'
import { getAiProvider } from '@/lib/ai'
import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import { createSuccessResponse, ApiErrors, withPerformanceTracking } from '@/lib/api-response'

const window = new JSDOM('').window
const purify = DOMPurify(window)

export async function POST(request: NextRequest) {
  return withPerformanceTracking(async () => {
    try {
      const { commits, options, systemPrompt, prompt } = await request.json()

      const aiProvider = getAiProvider()
      let rawContent: string

      // Handle different generation modes
      if (systemPrompt && prompt) {
        // Template-based generation
        rawContent = await aiProvider.generateWithTemplate(systemPrompt, prompt, options)
      } else if (commits && Array.isArray(commits)) {
        // Commit-based generation
        rawContent = await aiProvider.generateReleaseNotes(commits, {
          template: options?.template || 'traditional',
          tone: options?.tone || 'professional',
          includeBreakingChanges: options?.includeBreakingChanges || false
        })
      } else if (prompt) {
        // Simple prompt-based generation
        rawContent = await aiProvider.generateFromPrompt(prompt, options)
      } else {
        return ApiErrors.badRequest('Either commits array, prompt, or systemPrompt+prompt is required')
      }

      // Sanitize the generated HTML content
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

      return createSuccessResponse({
        content: sanitizedContent,
        metadata: {
          commitsProcessed: commits?.length || 0,
          template: options?.template || 'traditional',
          tone: options?.tone || 'professional',
          outputFormat: options?.outputFormat || 'html'
        }
      })

    } catch (error) {
      console.error('AI generation error:', error)
      
      if (error instanceof Error && error.message.includes('AI generation failed')) {
        return ApiErrors.externalService('AI Provider', error.message)
      }
      
      return ApiErrors.internalServer('Failed to generate content')
    }
  })
}

export async function PATCH(request: NextRequest) {
  return withPerformanceTracking(async () => {
    try {
      const { content, instructions } = await request.json()

      if (!content) {
        return ApiErrors.badRequest('Content is required')
      }

      const aiProvider = getAiProvider()
      
      // Improve existing content
      const improvedContent = await aiProvider.improveContent(content, instructions)

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

      return createSuccessResponse({
        content: sanitizedContent,
        originalLength: content.length,
        improvedLength: sanitizedContent.length
      })

    } catch (error) {
      console.error('Content improvement error:', error)
      
      if (error instanceof Error && error.message.includes('AI generation failed')) {
        return ApiErrors.externalService('AI Provider', error.message)
      }
      
      return ApiErrors.internalServer('Failed to improve content')
    }
  })
}