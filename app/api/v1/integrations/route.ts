import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    {
      error: 'Legacy API route removed',
      message:
        'Use /api/integrations/github/*, /api/integrations/jira/*, or /api/integrations/linear/* endpoints instead.',
    },
    { status: 410 }
  )
}
