import OpenAI from 'openai'
import { AiProvider } from './types'

type ReasoningEffort = 'low' | 'medium' | 'high'

interface CommitData {
  message: string
  sha?: string
}

export class OpenAIProvider implements AiProvider {
  private client: OpenAI | null = null
  private model: string
  private reasoningEffort: ReasoningEffort

  constructor() {
    this.model = process.env.OPENAI_MODEL || 'gpt-5.2'
    this.reasoningEffort = parseReasoningEffort(process.env.OPENAI_REASONING_EFFORT) ?? 'medium'
  }

  private getClient(): OpenAI {
    if (!this.client) {
      const apiKey = process.env.OPENAI_API_KEY
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY is required')
      }

      this.client = new OpenAI({
        apiKey,
        baseURL: process.env.OPENAI_BASE_URL,
      })
    }

    return this.client
  }

  async generateText(
    prompt: string,
    options?: {
      maxTokens?: number
      temperature?: number
      systemPrompt?: string
    }
  ): Promise<string> {
    try {
      const client = this.getClient()
      const max_output_tokens = options?.maxTokens ?? 2000
      const temperature = options?.temperature ?? 0.7

      const response = await client.responses.create({
        model: this.model,
        ...(options?.systemPrompt ? { instructions: options.systemPrompt } : {}),
        input: prompt,
        max_output_tokens,
        temperature,
        reasoning: { effort: this.reasoningEffort },
      })

      const text = response.output_text
      if (!text || !text.trim()) {
        throw new Error('No response generated from OpenAI')
      }

      return text
    } catch (error) {
      console.error('OpenAI generation error:', error)
      throw new Error(`AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async generateReleaseNotes(
    commits: CommitData[],
    options?: {
      template?: string
      tone?: 'professional' | 'casual' | 'technical'
      includeBreakingChanges?: boolean
    }
  ): Promise<string> {
    const tone = options?.tone || 'professional'
    const template = options?.template || 'traditional'

    const systemPrompt = `You write crisp, user-friendly release notes for SaaS products.

Output MUST be valid HTML only (no Markdown). Use headings and bullet lists.

Tone: ${tone}
Template Style: ${template}

Rules:
- Focus on user impact (benefits), not internal implementation details.
- Do not include commit SHAs or internal IDs unless they are clearly user-facing.
- Keep it skimmable: short summary + categorized sections.
- No code blocks unless absolutely necessary.`

    const commitsText = commits
      .map((commit) => `- ${commit.message}${commit.sha ? ` (${commit.sha.substring(0, 7)})` : ''}`)
      .join('\n')

    const prompt = `Generate release notes for these commits:

${commitsText}

Include breaking changes: ${options?.includeBreakingChanges ? 'Yes' : 'No'}`

    return this.generateText(prompt, {
      systemPrompt,
      maxTokens: 2500,
      temperature: 0.3,
    })
  }

  async improveContent(content: string, instructions?: string): Promise<string> {
    const systemPrompt = `You are an expert editor. Improve clarity, structure, and polish.

Output MUST be valid HTML only (no Markdown). Preserve meaning; do not invent facts.`

    const prompt = instructions
      ? `Improve this HTML with these instructions: "${instructions}"

HTML:
${content}`
      : `Improve this HTML:

${content}`

    return this.generateText(prompt, { systemPrompt, maxTokens: 2000, temperature: 0.3 })
  }

  async generateWithTemplate(
    systemPrompt: string,
    userPrompt: string,
    options?: {
      template?: string
      tone?: 'professional' | 'casual' | 'technical' | 'enthusiastic' | 'formal'
      targetAudience?: 'developers' | 'business' | 'users' | 'mixed'
      outputFormat?: 'markdown' | 'html'
      maxTokens?: number
      temperature?: number
    }
  ): Promise<string> {
    const mergedSystemPrompt = `${systemPrompt}

Output format: ${options?.outputFormat ?? 'html'}`

    return this.generateText(userPrompt, {
      systemPrompt: mergedSystemPrompt,
      maxTokens: options?.maxTokens ?? 2500,
      temperature: options?.temperature ?? 0.3,
    })
  }

  async generateFromPrompt(
    prompt: string,
    options?: {
      template?: string
      tone?: 'professional' | 'casual' | 'technical' | 'enthusiastic' | 'formal'
      maxTokens?: number
      temperature?: number
    }
  ): Promise<string> {
    const systemPrompt = `You are an expert content writer.

Tone: ${options?.tone || 'professional'}
Template: ${options?.template || 'traditional'}

Output MUST be valid HTML only (no Markdown).`

    return this.generateText(prompt, {
      systemPrompt,
      maxTokens: options?.maxTokens ?? 2000,
      temperature: options?.temperature ?? 0.4,
    })
  }
}

export const openAIProvider = new OpenAIProvider()

function parseReasoningEffort(value: string | undefined): ReasoningEffort | null {
  switch (value) {
    case 'low':
    case 'medium':
    case 'high':
      return value
    default:
      return null
  }
}
