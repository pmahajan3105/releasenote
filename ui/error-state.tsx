'use client'

import React from 'react'
import { AlertCircleIcon, RefreshCwIcon, WifiOffIcon, ServerCrashIcon } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'

interface ErrorStateProps {
  title?: string
  message?: string
  type?: 'generic' | 'network' | 'server' | 'notfound' | 'unauthorized'
  onRetry?: () => void
  showRetry?: boolean
  className?: string
}

export function ErrorState({
  title,
  message,
  type = 'generic',
  onRetry,
  showRetry = true,
  className = ''
}: ErrorStateProps) {
  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: <WifiOffIcon className="h-8 w-8 text-orange-500" />,
          defaultTitle: 'Connection Problem',
          defaultMessage: 'Unable to connect to our servers. Please check your internet connection and try again.',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-800'
        }
      case 'server':
        return {
          icon: <ServerCrashIcon className="h-8 w-8 text-red-500" />,
          defaultTitle: 'Server Error',
          defaultMessage: 'Our servers are experiencing issues. Please try again in a few moments.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800'
        }
      case 'notfound':
        return {
          icon: <AlertCircleIcon className="h-8 w-8 text-gray-500" />,
          defaultTitle: 'Not Found',
          defaultMessage: 'The item you\'re looking for doesn\'t exist or has been removed.',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800'
        }
      case 'unauthorized':
        return {
          icon: <AlertCircleIcon className="h-8 w-8 text-yellow-500" />,
          defaultTitle: 'Access Denied',
          defaultMessage: 'You don\'t have permission to view this content.',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800'
        }
      default:
        return {
          icon: <AlertCircleIcon className="h-8 w-8 text-red-500" />,
          defaultTitle: 'Something went wrong',
          defaultMessage: 'An unexpected error occurred. Please try again.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800'
        }
    }
  }

  const config = getErrorConfig()
  const displayTitle = title || config.defaultTitle
  const displayMessage = message || config.defaultMessage

  return (
    <Card className={`${config.bgColor} ${config.borderColor} ${className}`}>
      <CardContent className="pt-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            {config.icon}
          </div>
          <h3 className={`text-lg font-semibold ${config.textColor} mb-2`}>
            {displayTitle}
          </h3>
          <p className={`${config.textColor} mb-4`}>
            {displayMessage}
          </p>
          {showRetry && onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              className={`${config.borderColor} ${config.textColor} hover:${config.bgColor}`}
            >
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ErrorState