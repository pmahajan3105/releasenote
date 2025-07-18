"use client"

import React, { useState, useRef, useEffect } from "react"
import { IconWithBackground } from "../ui/icon-with-background"
import { LockKeyhole } from "lucide-react"
import { TextField } from "../ui/text-field"
import { Button } from "../ui/button"
import { cn } from "../../lib/utils"

interface TwoFactorAuthProps {
  onVerify?: (code: string) => void
  onResendCode?: () => void
  isLoading?: boolean
  error?: string
}

export default function TwoFactorAuth({ 
  onVerify, 
  onResendCode, 
  isLoading = false,
  error 
}: TwoFactorAuthProps) {
  const [code, setCode] = useState<string[]>(Array(6).fill(""))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleInputChange = (index: number, value: string) => {
    // Only allow single digits
    if (value.length > 1) {
      value = value.slice(-1)
    }
    
    if (!/^\d*$/.test(value)) {
      return
    }

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    
    // Handle paste
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, "").slice(0, 6)
        const newCode = Array(6).fill("")
        for (let i = 0; i < digits.length; i++) {
          newCode[i] = digits[i]
        }
        setCode(newCode)
        
        // Focus the next empty field or last field
        const nextEmptyIndex = newCode.findIndex(c => !c)
        const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : 5
        inputRefs.current[focusIndex]?.focus()
      })
    }
  }

  const handleVerify = () => {
    const fullCode = code.join("")
    if (fullCode.length === 6) {
      onVerify?.(fullCode)
    }
  }

  const isCodeComplete = code.every(digit => digit !== "")

  return (
    <div className="container max-w-none flex h-full w-full flex-col items-center justify-center gap-4 bg-background py-12">
      <div className="flex max-w-[320px] flex-col items-center justify-center gap-6">
        <IconWithBackground 
          size="large" 
          variant="primary"
          icon={<LockKeyhole />} 
        />
        
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-semibold text-foreground text-center">
            Enter verification code
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            Type or paste the 6 digit code sent to your email inbox.
          </p>
        </div>

        {error && (
          <div className="w-full p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md text-center">
            {error}
          </div>
        )}
        
        <div className="flex w-full items-center gap-2">
          {code.map((digit, index) => (
            <TextField key={index} className="flex-1">
              <TextField.Input
                ref={(el) => {
                  inputRefs.current[index] = el
                }}
                className={cn(
                  "text-center text-lg font-mono h-12",
                  digit && "border-primary"
                )}
                placeholder={(index + 1).toString()}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                maxLength={1}
                disabled={isLoading}
              />
            </TextField>
          ))}
        </div>
        
        <div className="flex w-full flex-col items-start gap-2">
          <Button
            className="h-10 w-full"
            onClick={handleVerify}
            disabled={!isCodeComplete || isLoading}
          >
            {isLoading ? "Verifying..." : "Verify"}
          </Button>
          
          <Button
            className="h-10 w-full"
            variant="brand-tertiary"
            onClick={onResendCode}
            disabled={isLoading}
          >
            Resend code
          </Button>
        </div>
      </div>
    </div>
  )
}
