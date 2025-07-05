// Define options for the generation process
export type GenerationOptions = {
  companyDetails?: string
  tone?: string
  // Add other relevant options like target audience, template structure hint, etc.
}

// Interface for any AI provider we might use
export interface AiProvider {
  generateReleaseNotes(
    prompt: string,
    options?: GenerationOptions
  ): Promise<string>
} 