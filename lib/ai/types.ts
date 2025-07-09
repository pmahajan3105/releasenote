// Define options for the generation process
export type GenerationOptions = {
  companyDetails?: string
  tone?: 'professional' | 'casual' | 'technical'
  template?: 'traditional' | 'modern' | 'minimal' | 'technical'
  includeBreakingChanges?: boolean
  maxTokens?: number
  temperature?: number
}

// Interface for any AI provider we might use
export interface AiProvider {
  generateText(
    prompt: string,
    options?: {
      maxTokens?: number
      temperature?: number
      systemPrompt?: string
    }
  ): Promise<string>
  
  generateReleaseNotes(
    commits: unknown[],
    options?: {
      template?: string
      tone?: 'professional' | 'casual' | 'technical'
      includeBreakingChanges?: boolean
    }
  ): Promise<string>
  
  improveContent(
    content: string,
    instructions?: string
  ): Promise<string>
  
  generateWithTemplate(
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
  ): Promise<string>
  
  generateFromPrompt(
    prompt: string,
    options?: {
      template?: string
      tone?: 'professional' | 'casual' | 'technical' | 'enthusiastic' | 'formal'
      maxTokens?: number
      temperature?: number
    }
  ): Promise<string>
} 