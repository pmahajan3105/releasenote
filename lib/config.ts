/**
 * Application configuration - consolidated from Express.js server config
 * Now using Next.js environment variable patterns
 */

export const config = {
  // Supabase configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!
  },

  // AI configuration
  ai: {
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID
    },
    azure: {
      openai: {
        apiKey: process.env.AZURE_OPENAI_API_KEY,
        endpoint: process.env.AZURE_OPENAI_ENDPOINT,
        deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o-mini',
        apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-06-01',
        temperature: 0.7,
        maxTokens: 2000
      }
    }
  },

  // OAuth integrations configuration
  integrations: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      redirectUrl: process.env.GITHUB_REDIRECT_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`
    },
    jira: {
      clientId: process.env.JIRA_CLIENT_ID,
      clientSecret: process.env.JIRA_CLIENT_SECRET,
      redirectUrl: process.env.JIRA_REDIRECT_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/jira/callback`
    },
    linear: {
      clientId: process.env.LINEAR_CLIENT_ID,
      clientSecret: process.env.LINEAR_CLIENT_SECRET,
      redirectUrl: process.env.LINEAR_REDIRECT_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linear/callback`
    }
  },

  // Email configuration
  email: {
    from: process.env.EMAIL_FROM || 'noreply@releasenotes.com',
    resend: {
      apiKey: process.env.RESEND_API_KEY!,
      from: process.env.RESEND_FROM_EMAIL || 'noreply@releasenotes.com'
    }
  },

  // Application URLs
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    domain: process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost'
  },

  // Security configuration
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret',
    csrfSecret: process.env.CSRF_SECRET || 'your-csrf-secret'
  },

  // Redis configuration (optional)
  redis: {
    url: process.env.REDIS_URL,
    enabled: !!process.env.REDIS_URL
  },

  // Rate limiting configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: {
      api: parseInt(process.env.RATE_LIMIT_API || '100'),
      auth: parseInt(process.env.RATE_LIMIT_AUTH || '5'),
      public: parseInt(process.env.RATE_LIMIT_PUBLIC || '1000')
    }
  },

  // Feature flags
  features: {
    githubIntegration: process.env.FEATURE_GITHUB === 'true',
    jiraIntegration: process.env.FEATURE_JIRA === 'true',
    linearIntegration: process.env.FEATURE_LINEAR === 'true',
    customDomains: process.env.FEATURE_CUSTOM_DOMAINS === 'true',
    analytics: process.env.FEATURE_ANALYTICS === 'true'
  },

  // Environment helpers
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTesting: process.env.NODE_ENV === 'test'
}

// Validation helper
export function validateConfig() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'RESEND_API_KEY'
  ]

  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  return true
}

// AI provider availability helpers
export function isProviderAvailable(provider: 'openai' | 'anthropic' | 'azure'): boolean {
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

export default config