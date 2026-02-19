import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    {
      error: 'Legacy API route removed',
      message: 'Use GET /api/integrations/github/repositories instead.',
    },
    { status: 410 }
  )
}

