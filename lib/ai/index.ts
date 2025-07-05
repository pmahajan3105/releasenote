import { claudeProvider } from './claude'
// Import other providers like openAiProvider here when added
import { AiProvider } from './types'

// Configuration logic (could come from environment variables or database settings)
const configuredProvider = process.env.AI_PROVIDER || 'claude' // Default to Claude

let aiProvider: AiProvider

switch (configuredProvider) {
  // case 'openai':
  //   aiProvider = openAiProvider;
  //   break;
  case 'claude':
  default:
    aiProvider = claudeProvider
    break;
}

/**
 * Gets the currently configured AI provider instance.
 */
export function getAiProvider(): AiProvider {
  if (!aiProvider) {
    // This might happen if the default case failed, e.g., Claude key missing
    throw new Error('AI Provider could not be initialized.')
  }
  return aiProvider
} 