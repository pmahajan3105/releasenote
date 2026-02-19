import { AiProvider } from './types'

// Primary provider as specified in PRD: Azure OpenAI with GPT-4o-mini
const configuredProvider = process.env.AI_PROVIDER || 'azure-openai'

let aiProvider: AiProvider | null = null

function initializeProvider(): AiProvider {
  if (!aiProvider) {
    switch (configuredProvider) {
      case 'openai': {
        // Lazy import to prevent build-time initialization
        const { openAIProvider } = require('./openai')
        aiProvider = openAIProvider
        break
      }
      case 'azure-openai':
      default:
        // Lazy import to prevent build-time initialization
        const { azureOpenAIProvider } = require('./azure-openai')
        aiProvider = azureOpenAIProvider
        break;
    }
  }
  return aiProvider!
}

/**
 * Gets the legacy AI provider instance (for backward compatibility)
 */
export function getAiProvider(): AiProvider {
  try {
    return initializeProvider()
  } catch (error) {
    console.error('AI Provider initialization failed:', error)
    throw new Error('AI Provider could not be initialized.')
  }
}

// Enhanced AI system with multiple providers
// Server AI controller removed - using Next.js service layer

/**
 * Gets the enhanced AI provider with support for multiple models
 * Primary: Azure OpenAI as specified in PRD
 */
export function getEnhancedAiProvider(_provider: 'azure-openai' | 'openai' = 'azure-openai') {
  try {
    // Use Azure OpenAI as primary provider per PRD specifications
    return getAiProvider()
  } catch (error) {
    console.error('AI provider not available:', error)
    throw new Error('AI provider initialization failed')
  }
}

// Export the Azure OpenAI provider for direct use (lazy loaded)
export function getAzureOpenAIProvider() {
  const { azureOpenAIProvider } = require('./azure-openai')
  return azureOpenAIProvider
} 
