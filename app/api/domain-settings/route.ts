import { NextResponse } from 'next/server'

function legacyDomainSettingsGone() {
  return NextResponse.json(
    {
      error: 'Legacy API route removed',
      message: 'Use /api/organizations/{id}/domain instead.',
    },
    { status: 410 }
  )
}

export async function GET() {
  return legacyDomainSettingsGone()
}

export async function PUT() {
  return legacyDomainSettingsGone()
}
