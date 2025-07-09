import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Check database connectivity
    const supabase = createServerComponentClient({ cookies })
    const { data: healthCheck, error: dbError } = await supabase
      .from('organizations')
      .select('id')
      .limit(1)

    const dbStatus = dbError ? 'unhealthy' : 'healthy'
    const dbLatency = Date.now() - startTime

    // Check environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'AZURE_OPENAI_API_KEY',
      'AZURE_OPENAI_ENDPOINT'
    ]
    
    const missingEnvVars = requiredEnvVars.filter(key => !process.env[key])
    const configStatus = missingEnvVars.length === 0 ? 'healthy' : 'unhealthy'

    // Check AI service availability
    let aiStatus = 'healthy'
    try {
      if (!process.env.AZURE_OPENAI_API_KEY || !process.env.AZURE_OPENAI_ENDPOINT) {
        aiStatus = 'unhealthy'
      }
    } catch {
      aiStatus = 'unhealthy'
    }

    const overallStatus = dbStatus === 'healthy' && configStatus === 'healthy' && aiStatus === 'healthy' 
      ? 'healthy' 
      : 'unhealthy'

    const healthData = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || 'unknown',
      uptime: process.uptime(),
      services: {
        database: {
          status: dbStatus,
          latency: `${dbLatency}ms`,
          error: dbError?.message
        },
        ai: {
          status: aiStatus,
          provider: 'azure-openai'
        },
        configuration: {
          status: configStatus,
          missing_vars: missingEnvVars
        }
      },
      system: {
        node_version: process.version,
        memory_usage: process.memoryUsage(),
        platform: process.platform
      }
    }

    const statusCode = overallStatus === 'healthy' ? 200 : 503

    return NextResponse.json(healthData, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      services: {
        database: { status: 'unknown' },
        ai: { status: 'unknown' },
        configuration: { status: 'unknown' }
      }
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  }
}