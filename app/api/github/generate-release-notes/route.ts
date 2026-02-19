import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: 'Legacy API route removed',
      message:
        'Use GET /api/integrations/github/repositories/[owner]/[repo]/commits + GET /api/integrations/github/repositories/[owner]/[repo]/pulls, then POST /api/release-notes/generate.',
    },
    { status: 410 }
  )
}

