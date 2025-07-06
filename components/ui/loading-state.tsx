'use client'

import React from 'react'
import { RefreshCwIcon, LoaderIcon } from 'lucide-react'
import { Card, CardContent } from './card'

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  variant?: 'spinner' | 'dots' | 'skeleton'
}

export function LoadingState({
  message = 'Loading...',
  size = 'md',
  className = '',
  variant = 'spinner'
}: LoadingStateProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'py-4',
          icon: 'h-6 w-6',
          text: 'text-sm'
        }
      case 'lg':
        return {
          container: 'py-12',
          icon: 'h-12 w-12',
          text: 'text-lg'
        }
      default:
        return {
          container: 'py-8',
          icon: 'h-8 w-8',
          text: 'text-base'
        }
    }
  }

  const sizeClasses = getSizeClasses()

  if (variant === 'spinner') {
    return (
      <Card className={`border-gray-100 ${className}`}>
        <CardContent className={`text-center ${sizeClasses.container}`}>
          <LoaderIcon className={`${sizeClasses.icon} animate-spin mx-auto mb-4 text-[#7F56D9]`} />
          <p className={`text-[#667085] ${sizeClasses.text}`}>
            {message}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'dots') {
    return (
      <Card className={`border-gray-100 ${className}`}>
        <CardContent className={`text-center ${sizeClasses.container}`}>
          <div className="flex justify-center items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-[#7F56D9] rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-[#7F56D9] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-[#7F56D9] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className={`text-[#667085] ${sizeClasses.text}`}>
            {message}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'skeleton') {
    return (
      <Card className={`border-gray-100 ${className}`}>
        <CardContent className={`${sizeClasses.container} space-y-3`}>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}

export default LoadingState