import Anthropic from '@anthropic-ai/sdk'
import { AiProvider, GenerationOptions } from './types'

// Ensure your Anthropic API key is set in environment variables
const apiKey = process.env.ANTHROPIC_API_KEY

if (!apiKey) {
  console.warn('Anthropic API key not found. AI generation will not work.')
}

const anthropic = apiKey ? new Anthropic({ apiKey }) : null

class ClaudeProvider implements AiProvider {
  async generateReleaseNotes(
    prompt: string,
    options?: GenerationOptions
  ): Promise<string> {
    if (!anthropic) {
      throw new Error('Anthropic client not initialized. Check API key.')
    }

    try {
      // Construct a system prompt if needed, incorporating options
      let systemPrompt = 'You are an expert technical writer specializing in release notes.'
      if (options?.companyDetails) {
        systemPrompt += ` You work for a company described as: ${options.companyDetails}.`
      }
      if (options?.tone) {
        systemPrompt += ` Write in a ${options.tone} tone.`
      }
      systemPrompt += ' Generate release notes in Markdown format based on the provided ticket details.'

      // Choose a suitable Claude model
      const model = 'claude-3-haiku-20240307' // Or claude-3-sonnet, claude-3-opus, etc.

      const response = await anthropic.messages.create({
        model: model,
        system: systemPrompt,
        max_tokens: 2048, // Adjust as needed
        messages: [
          { role: 'user', content: prompt },
        ],
      })

      // Extract the text content from the response
      // Check if response.content is an array and has elements
      if (Array.isArray(response.content) && response.content.length > 0) {
        // Find the first block with type 'text'
        const textBlock = response.content.find(block => block.type === 'text')
        if (textBlock && 'text' in textBlock) {
          return textBlock.text.trim()
        }
      }

      // Fallback or error if no text content found
      console.error('Unexpected response format from Claude:', response)
      throw new Error('Failed to extract text content from Claude response.')

    } catch (error) {
      console.error('Error calling Claude API:', error)
      throw new Error(`Failed to generate release notes with Claude: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

export const claudeProvider = new ClaudeProvider() 