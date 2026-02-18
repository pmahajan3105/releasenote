import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: 'Legacy API route removed',
      message: 'Use POST /api/release-notes/generate instead.',
    },
    { status: 410 }
  )
}

