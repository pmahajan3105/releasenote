/**
 * Environment variable validation for production deployment
 */

interface EnvVarConfig {
  name: string
  required: boolean
  description?: string
  example?: string
}

const ENV_VARS: EnvVarConfig[] = [
  // Database
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    description: 'Supabase project URL',
    example: 'https://xxx.supabase.co'
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    description: 'Supabase anonymous key'
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    description: 'Supabase service role key (server-side only)'
  },
  
  // AI Services (at least one required)
  {
    name: 'AZURE_OPENAI_API_KEY',
    required: false,
    description: 'Azure OpenAI API key'
  },
  {
    name: 'AZURE_OPENAI_ENDPOINT',
    required: false,
    description: 'Azure OpenAI endpoint URL'
  },
  {
    name: 'ANTHROPIC_API_KEY',
    required: false,
    description: 'Anthropic Claude API key'
  },
  
  // Email Service
  {
    name: 'RESEND_API_KEY',
    required: true,
    description: 'Resend email service API key'
  },
  
  // Security
  {
    name: 'JWT_SECRET',
    required: true,
    description: 'JWT signing secret'
  },
  
  // App Configuration
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: false, // Make this optional during build, required at runtime
    description: 'Application base URL',
    example: 'https://your-app.vercel.app'
  }
]

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  missing: string[]
  recommendations: string[]
}

export function validateEnvironmentVariables(): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const missing: string[] = []
  const recommendations: string[] = []

  // Check required variables
  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.name]
    
    if (envVar.required && !value) {
      missing.push(envVar.name)
      errors.push(`Missing required environment variable: ${envVar.name}${envVar.description ? ` (${envVar.description})` : ''}`)
    }
  }

  // Special check for NEXT_PUBLIC_APP_URL - only required at runtime, not during build
  if (!process.env.NEXT_PHASE && !process.env.NEXT_PUBLIC_APP_URL) {
    missing.push('NEXT_PUBLIC_APP_URL')
    errors.push('Missing required environment variable: NEXT_PUBLIC_APP_URL (Application base URL)')
  }

  // Check AI provider availability
  const hasAzureOpenAI = process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT
  const hasAnthropic = process.env.ANTHROPIC_API_KEY
  
  if (!hasAzureOpenAI && !hasAnthropic) {
    errors.push('At least one AI provider must be configured (Azure OpenAI or Anthropic)')
    missing.push('AI_PROVIDER_KEYS')
  }

  // Validate URL formats
  const urlVars = ['NEXT_PUBLIC_SUPABASE_URL', 'AZURE_OPENAI_ENDPOINT', 'NEXT_PUBLIC_APP_URL']
  for (const varName of urlVars) {
    const value = process.env[varName]
    if (value && !isValidUrl(value)) {
      warnings.push(`${varName} should be a valid URL (current: ${value})`)
    }
  }

  // Security checks
  const jwtSecret = process.env.JWT_SECRET
  if (jwtSecret && jwtSecret.length < 32) {
    warnings.push('JWT_SECRET should be at least 32 characters long for security')
  }

  // Environment-specific checks
  if (process.env.NODE_ENV === 'production') {
    if (process.env.NEXT_PUBLIC_APP_URL?.includes('localhost')) {
      warnings.push('NEXT_PUBLIC_APP_URL should not contain localhost in production')
    }
    
    if (!process.env.REDIS_URL) {
      recommendations.push('Consider setting up Redis for production caching (REDIS_URL)')
    }
  }

  // Check for common misconfigurations
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith('service_role')) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY should be the anonymous key, not service role key')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    missing,
    recommendations
  }
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

export function logValidationResults(result: ValidationResult): void {
  if (result.isValid) {
    console.log('✅ Environment validation passed')
  } else {
    console.error('❌ Environment validation failed')
  }

  if (result.errors.length > 0) {
    console.error('\n🔴 ERRORS (must be fixed):')
    result.errors.forEach(error => console.error(`  - ${error}`))
  }

  if (result.warnings.length > 0) {
    console.warn('\n⚠️  WARNINGS:')
    result.warnings.forEach(warning => console.warn(`  - ${warning}`))
  }

  if (result.recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS:')
    result.recommendations.forEach(rec => console.log(`  - ${rec}`))
  }

  if (result.missing.length > 0) {
    console.error('\n📋 Missing variables:')
    result.missing.forEach(missing => {
      const config = ENV_VARS.find(v => v.name === missing)
      console.error(`  - ${missing}${config?.example ? ` (example: ${config.example})` : ''}`)
    })
  }
}

// Run validation on startup in production (but not during build)
if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PHASE) {
  const result = validateEnvironmentVariables()
  logValidationResults(result)
  
  if (!result.isValid) {
    process.exit(1) // Exit if validation fails in production
  }
}