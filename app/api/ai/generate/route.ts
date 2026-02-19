import { NextResponse } from 'next/server'

function legacyRouteResponse() {
  return NextResponse.json(
    {
      error: 'Legacy API route removed',
      message: 'Use POST /api/release-notes/generate instead.'
    },
    { status: 410 }
  )
}

export async function POST() {
  return legacyRouteResponse()
}

export async function PATCH() {
  return legacyRouteResponse()
}
