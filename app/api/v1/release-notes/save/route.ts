import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: 'Legacy API route removed',
      message: 'Use /api/release-notes CRUD endpoints instead.',
    },
    { status: 410 }
  )
}

