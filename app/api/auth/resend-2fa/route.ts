import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Simulate sending a new 2FA code
    // In production, this would integrate with your email service
    // and generate a new verification code
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    console.log('2FA code resent (demo: use 123456 to verify)')

    return NextResponse.json({ 
      success: true,
      message: 'Verification code sent successfully' 
    })
  } catch (error) {
    console.error('2FA resend error:', error)
    return NextResponse.json(
      { error: 'Failed to resend verification code' },
      { status: 500 }
    )
  }
}
