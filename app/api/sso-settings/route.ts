import { NextResponse } from 'next/server'

function legacySsoSettingsGone() {
  return NextResponse.json(
    {
      error: 'Legacy API route removed',
      message: 'Use /api/organizations/{id}/settings and /api/organizations/{id}/meta endpoints instead.',
    },
    { status: 410 }
  )
}

export async function GET() {
  return legacySsoSettingsGone()
}

export async function PUT() {
  return legacySsoSettingsGone()
}
