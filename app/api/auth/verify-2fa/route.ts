import { NextRequest, NextResponse } from 'next/server'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: 'Please provide a valid 6-digit verification code' },
        { status: 400 }
      )
    }

    // For demo purposes, accept "123456" as valid code
    // In production, this would verify against your 2FA system
    if (code === "123456") {
      return NextResponse.json({ success: true })
    }

    // Simulate rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json(
      { error: 'Invalid verification code. Please try again.' },
      { status: 400 }
    )
  } catch (error) {
    console.error('2FA verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
