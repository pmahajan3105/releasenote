/**
 * Startup validation to ensure the application is ready for production
 */

import { validateEnvironmentVariables, logValidationResults } from './env-validation'

let hasRunValidation = false

export function runStartupValidation(): void {
  // Run validation only once
  if (hasRunValidation) return
  hasRunValidation = true

  console.log('🚀 Starting Release Notes AI application...')
  console.log('📋 Running startup validation...')

  // Validate environment variables
  const envResult = validateEnvironmentVariables()
  logValidationResults(envResult)

  // Additional startup checks
  console.log('\n🔧 System checks:')
  
  // Check Node.js version
  const nodeVersion = process.version
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
  if (majorVersion < 18) {
    console.warn(`⚠️  Node.js version ${nodeVersion} detected. Node.js 18+ is recommended.`)
  } else {
    console.log(`✅ Node.js version: ${nodeVersion}`)
  }

  // Check memory
  const memoryUsage = process.memoryUsage()
  const totalMemoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024)
  console.log(`✅ Memory usage: ${totalMemoryMB}MB`)

  // Check platform
  console.log(`✅ Platform: ${process.platform}`)

  // Environment-specific checks
  if (process.env.NODE_ENV === 'production') {
    console.log('\n🏭 Production mode checks:')
    
    if (!envResult.isValid) {
      console.error('❌ Cannot start in production with environment validation errors')
      process.exit(1)
    }
    
    console.log('✅ Environment variables validated')
    console.log('✅ Production mode configured')
  } else {
    console.log('\n🧪 Development mode active')
    if (!envResult.isValid) {
      console.warn('⚠️  Environment validation failed, but continuing in development mode')
    }
  }

  console.log('\n✅ Startup validation complete!\n')
}

// Auto-run validation when this module is imported (but not during build)
if (typeof window === 'undefined' && !process.env.NEXT_PHASE) {
  runStartupValidation()
}