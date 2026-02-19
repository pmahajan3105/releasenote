import { AiProvider } from './types'

export type SupportedAiProvider = 'openai' | 'azure-openai'

function resolveProvider(rawProvider?: string): SupportedAiProvider {
  const normalizedProvider = rawProvider?.trim().toLowerCase()
  if (normalizedProvider === 'azure-openai') {
    return 'azure-openai'
  }
  return 'openai'
}

export function getConfiguredAiProvider(): SupportedAiProvider {
  return resolveProvider(process.env.AI_PROVIDER)
}

// Default to OpenAI GPT-5.2, keep Azure OpenAI as opt-in fallback.
const configuredProvider = getConfiguredAiProvider()

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
        // Lazy import to prevent build-time initialization
        const { azureOpenAIProvider } = require('./azure-openai')
        aiProvider = azureOpenAIProvider
        break
      default: {
        const { openAIProvider } = require('./openai')
        aiProvider = openAIProvider
        break
      }
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
 * Primary: OpenAI (gpt-5.2 by default), with Azure OpenAI fallback support.
 */
export function getEnhancedAiProvider(_provider: 'azure-openai' | 'openai' = 'openai') {
  try {
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
