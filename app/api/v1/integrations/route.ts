import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    {
      error: 'Legacy API route removed',
      message: 'Use /api/integrations endpoints instead.',
    },
    { status: 410 }
  )
}
