import { getAiProvider } from '@/lib/ai'
import { config } from '@/lib/config'
import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

const window = new JSDOM('').window
const purify = DOMPurify(window)

export interface Ticket {
  id: string
  title: string
  description: string
  type: 'feature' | 'bugfix' | 'improvement' | 'breaking'
  labels?: string[]
  url?: string
}

export interface Commit {
  id: string
  message: string
  author: string
  url?: string
  files?: string[]
}

export interface GenerationOptions {
  provider?: 'openai' | 'anthropic' | 'azure'
  model?: string
  temperature?: number
  maxTokens?: number
  tone?: 'professional' | 'casual' | 'technical' | 'friendly'
  template?: string
  companyDetails?: string
}

export interface GenerationResult {
  content: string
  metadata: {
    provider: string
    model?: string
    tokensUsed?: number
    processingTime?: number
  }
}

export class AIService {
  /**
   * Generate release notes from tickets
   */
  async generateFromTickets(
    tickets: Ticket[], 
    options: GenerationOptions = {}
  ): Promise<GenerationResult> {
    if (!tickets || tickets.length === 0) {
      throw new Error('At least one ticket is required for generation')
    }

    const startTime = Date.now()
    const provider = this.getProvider(options.provider)
    const prompt = this.buildTicketsPrompt(tickets, options)

    try {
      const content = await provider.generateFromPrompt(prompt, {
        model: options.model,
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens || 2000
      })

      const sanitizedContent = this.sanitizeContent(content)
      const processingTime = Date.now() - startTime

      return {
        content: sanitizedContent,
        metadata: {
          provider: options.provider || 'anthropic',
          model: options.model,
          processingTime
        }
      }
    } catch (error) {
      throw new Error(`AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate release notes from commits
   */
  async generateFromCommits(
    commits: Commit[], 
    options: GenerationOptions = {}
  ): Promise<GenerationResult> {
    if (!commits || commits.length === 0) {
      throw new Error('At least one commit is required for generation')
    }

    const startTime = Date.now()
    const provider = this.getProvider(options.provider)

    try {
      const content = await provider.generateReleaseNotes(commits, {
        template: options.template || 'traditional',
        tone: options.tone || 'professional',
        includeBreakingChanges: true
      })

      const sanitizedContent = this.sanitizeContent(content)
      const processingTime = Date.now() - startTime

      return {
        content: sanitizedContent,
        metadata: {
          provider: options.provider || 'anthropic',
          model: options.model,
          processingTime
        }
      }
    } catch (error) {
      throw new Error(`AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate content from custom prompt
   */
  async generateFromPrompt(
    prompt: string, 
    options: GenerationOptions = {}
  ): Promise<GenerationResult> {
    if (!prompt.trim()) {
      throw new Error('Prompt cannot be empty')
    }

    const startTime = Date.now()
    const provider = this.getProvider(options.provider)

    try {
      const content = await provider.generateFromPrompt(prompt, {
        model: options.model,
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens || 2000
      })

      const sanitizedContent = this.sanitizeContent(content)
      const processingTime = Date.now() - startTime

      return {
        content: sanitizedContent,
        metadata: {
          provider: options.provider || 'anthropic',
          model: options.model,
          processingTime
        }
      }
    } catch (error) {
      throw new Error(`AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Improve existing content
   */
  async improveContent(
    content: string, 
    instructions?: string,
    options: GenerationOptions = {}
  ): Promise<GenerationResult> {
    if (!content.trim()) {
      throw new Error('Content cannot be empty')
    }

    const startTime = Date.now()
    const provider = this.getProvider(options.provider)

    try {
      const improvedContent = await provider.improveContent(content, instructions)
      const sanitizedContent = this.sanitizeContent(improvedContent)
      const processingTime = Date.now() - startTime

      return {
        content: sanitizedContent,
        metadata: {
          provider: options.provider || 'anthropic',
          model: options.model,
          processingTime
        }
      }
    } catch (error) {
      throw new Error(`Content improvement failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate streaming response (for real-time UI updates)
   */
  async generateStreaming(
    tickets: Ticket[], 
    options: GenerationOptions & { onChunk?: (chunk: string) => void } = {}
  ): Promise<ReadableStream> {
    const provider = this.getProvider(options.provider)
    const prompt = this.buildTicketsPrompt(tickets, options)

    return provider.generateStreaming(prompt, {
      model: options.model,
      temperature: options.temperature || 0.7,
      maxTokens: options.maxTokens || 2000
    })
  }

  /**
   * Check if AI provider is available
   */
  isProviderAvailable(provider: 'openai' | 'anthropic' | 'azure'): boolean {
    switch (provider) {
      case 'openai':
        return !!config.ai.openai.apiKey
      case 'anthropic':
        return !!config.ai.anthropic.apiKey
      case 'azure':
        return !!(config.ai.azure.openai.apiKey && config.ai.azure.openai.endpoint)
      default:
        return false
    }
  }

  /**
   * Get available models for a provider
   */
  getAvailableModels(provider: 'openai' | 'anthropic' | 'azure'): string[] {
    switch (provider) {
      case 'openai':
        return ['gpt-3.5-turbo', 'gpt-3.5-turbo-16k', 'gpt-4', 'gpt-4-turbo']
      case 'anthropic':
        return ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229', 'claude-3-opus-20240229']
      case 'azure':
        return [config.ai.azure.openai.deploymentName]
      default:
        return []
    }
  }

  /**
   * Private helper methods
   */
  private getProvider(providerName?: string) {
    return getAiProvider(providerName as 'openai' | 'anthropic')
  }

  private buildTicketsPrompt(tickets: Ticket[], options: GenerationOptions): string {
    let prompt = 'Generate professional release notes based on the following completed items:\n\n'
    
    // Group tickets by type
    const features = tickets.filter(t => t.type === 'feature')
    const bugfixes = tickets.filter(t => t.type === 'bugfix')
    const improvements = tickets.filter(t => t.type === 'improvement')
    const breaking = tickets.filter(t => t.type === 'breaking')
    
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
    
    prompt += '\nPlease organize these into professional release notes with:\n'
    prompt += '- Clear categorization (New Features, Improvements, Bug Fixes, Breaking Changes)\n'
    prompt += '- User-friendly descriptions that explain the benefit to users\n'
    prompt += '- Proper Markdown formatting\n'
    prompt += '- A brief summary at the beginning if there are many changes\n'
    
    if (options.template) {
      prompt += `\nPlease follow this template structure:\n${options.template}\n`
    }
    
    if (options.companyDetails) {
      prompt += `\nCompany context: ${options.companyDetails}\n`
    }
    
    prompt += `\nTone: ${options.tone || 'professional'}\n`
    
    return prompt
  }

  private sanitizeContent(content: string): string {
    return purify.sanitize(content, {
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
  }
}