"use client"

import React, { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import TwoFactorAuth from "../../../components/auth/two-factor-auth"
import { toast } from "../../../lib/toast"

export default function TwoFactorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const redirectTo = searchParams.get("redirectTo") || "/dashboard"

  const handleVerify = async (code: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Simulate API call to verify 2FA code
      const response = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Invalid verification code")
      }

      toast.success("Verification successful!")
      router.push(redirectTo)
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch("/api/auth/resend-2fa", {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to resend code")
      }

      toast.success("Verification code sent!")
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <TwoFactorAuth
        onVerify={handleVerify}
        onResendCode={handleResendCode}
        isLoading={isLoading}
        error={error || undefined}
      />
    </div>
  )
}
