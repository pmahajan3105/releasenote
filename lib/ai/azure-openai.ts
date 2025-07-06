import { AzureOpenAI } from 'openai'
// Using openai package for Azure OpenAI integration
import { AiProvider } from './types'

interface CommitData {
  message: string
  sha?: string
}

export class AzureOpenAIProvider implements AiProvider {
  private client: AzureOpenAI | null = null
  private deploymentName: string

  constructor() {
    // Don't initialize client during construction to prevent build-time errors
    this.deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o-mini'
  }

  private getClient(): AzureOpenAI {
    if (!this.client) {
      const apiKey = process.env.AZURE_OPENAI_API_KEY
      const endpoint = process.env.AZURE_OPENAI_ENDPOINT

      if (!apiKey || !endpoint) {
        throw new Error('Azure OpenAI API key and endpoint are required')
      }

      this.client = new AzureOpenAI({
        endpoint,
        apiKey,
        apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-06-01'
      })
    }
    
    return this.client
  }

  async generateText(prompt: string, options?: { 
    maxTokens?: number
    temperature?: number
    systemPrompt?: string
  }): Promise<string> {
    try {
      const client = this.getClient()
      const messages = []
      
      if (options?.systemPrompt) {
        messages.push({
          role: 'system' as const,
          content: options.systemPrompt
        })
      }
      
      messages.push({
        role: 'user' as const,
        content: prompt
      })

      const result = await client.chat.completions.create({
        model: this.deploymentName,
        messages,
        max_tokens: options?.maxTokens || 2000,
        temperature: options?.temperature || 0.7,
      })

      const choice = result.choices[0]
      if (!choice || !choice.message?.content) {
        throw new Error('No response generated from Azure OpenAI')
      }

      return choice.message.content
    } catch (error) {
      console.error('Azure OpenAI generation error:', error)
      throw new Error(`AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async generateReleaseNotes(commits: CommitData[], options?: {
    template?: string
    tone?: 'professional' | 'casual' | 'technical'
    includeBreakingChanges?: boolean
  }): Promise<string> {
    const tone = options?.tone || 'professional'
    const template = options?.template || 'traditional'
    
    const systemPrompt = `You are an expert at writing release notes. Generate ${tone} release notes based on the provided commits and GitHub data. 

Template Style: ${template}
- Traditional: Standard format with clear sections
- Modern: Engaging format with emojis and visual appeal  
- Minimal: Concise bullet points
- Technical: Detailed technical information

Guidelines:
- Focus on user-facing changes and improvements
- Group related changes together
- Use clear, professional language
- Highlight breaking changes if any
- Include relevant technical details for developers
- Format as clean HTML that can be rendered in a rich text editor`

    const commitsText = commits.map(commit => 
      `- ${commit.message} (${commit.sha?.substring(0, 7) || 'unknown'})`
    ).join('\n')

    const prompt = `Generate release notes for these commits:

${commitsText}

Additional context:
- Tone: ${tone}
- Template: ${template}
- Include breaking changes: ${options?.includeBreakingChanges ? 'Yes' : 'No'}

Please generate well-formatted release notes in HTML format.`

    return this.generateText(prompt, { 
      systemPrompt,
      maxTokens: 3000,
      temperature: 0.3 
    })
  }

  async improveContent(content: string, instructions?: string): Promise<string> {
    const systemPrompt = `You are an expert content editor. Improve the provided content while maintaining its core meaning and structure. Make it more professional, clear, and engaging.`
    
    const prompt = instructions 
      ? `Improve this content with these specific instructions: "${instructions}"\n\nContent:\n${content}`
      : `Improve this content:\n\n${content}`

    return this.generateText(prompt, { 
      systemPrompt,
      maxTokens: 2500,
      temperature: 0.4 
    })
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
    return this.generateText(userPrompt, {
      systemPrompt,
      maxTokens: options?.maxTokens || 3000,
      temperature: options?.temperature || 0.3
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
    const systemPrompt = `You are an expert content writer. Generate high-quality content based on the user's prompt. 
    
Tone: ${options?.tone || 'professional'}
Template: ${options?.template || 'traditional'}

Provide well-structured, engaging content that matches the requested tone and style.`
    
    return this.generateText(prompt, {
      systemPrompt,
      maxTokens: options?.maxTokens || 2500,
      temperature: options?.temperature || 0.4
    })
  }
}

export const azureOpenAIProvider = new AzureOpenAIProvider()