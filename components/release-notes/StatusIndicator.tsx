'use client'

import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ClockIcon, GlobeIcon, FileTextIcon, ArchiveIcon, CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'

interface StatusIndicatorProps {
  status: 'draft' | 'scheduled' | 'published' | 'archived'
  publishedAt?: string | null
  scheduledAt?: string | null
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  showTimestamp?: boolean
}

export function StatusIndicator({ 
  status, 
  publishedAt, 
  scheduledAt,
  size = 'md',
  showIcon = true,
  showTimestamp = false
}: StatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'draft':
        return {
          label: 'Draft',
          icon: FileTextIcon,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          description: 'This release note is in draft mode and not visible to the public'
        }
      case 'scheduled':
        return {
          label: 'Scheduled',
          icon: ClockIcon,
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          description: scheduledAt 
            ? `Scheduled to publish on ${format(new Date(scheduledAt), 'PPp')}`
            : 'Scheduled to publish'
        }
      case 'published':
        return {
          label: 'Published',
          icon: GlobeIcon,
          className: 'bg-green-100 text-green-800 border-green-200',
          description: publishedAt 
            ? `Published on ${format(new Date(publishedAt), 'PPp')}`
            : 'Live and visible to the public'
        }
      case 'archived':
        return {
          label: 'Archived',
          icon: ArchiveIcon,
          className: 'bg-orange-100 text-orange-800 border-orange-200',
          description: 'This release note has been archived and is no longer visible'
        }
      default:
        return {
          label: 'Unknown',
          icon: FileTextIcon,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          description: 'Unknown status'
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const badge = (
    <Badge 
      variant="outline" 
      className={`${config.className} ${sizeClasses[size]} inline-flex items-center gap-1.5 font-medium`}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
      {showTimestamp && (status === 'published' && publishedAt) && (
        <span className="text-xs opacity-75">
          {format(new Date(publishedAt), 'MMM d')}
        </span>
      )}
      {showTimestamp && (status === 'scheduled' && scheduledAt) && (
        <span className="text-xs opacity-75">
          {format(new Date(scheduledAt), 'MMM d')}
        </span>
      )}
    </Badge>
  )

  if (config.description) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{config.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return badge
}

// Status indicator with progress for different workflow states
export function WorkflowStatusIndicator({ 
  status, 
  publishedAt, 
  scheduledAt 
}: Omit<StatusIndicatorProps, 'size' | 'showIcon' | 'showTimestamp'>) {
  const steps = [
    { key: 'draft', label: 'Draft', icon: FileTextIcon },
    { key: 'scheduled', label: 'Scheduled', icon: CalendarIcon },
    { key: 'published', label: 'Published', icon: GlobeIcon }
  ]

  const getCurrentStepIndex = () => {
    switch (status) {
      case 'draft': return 0
      case 'scheduled': return 1
      case 'published': return 2
      case 'archived': return 3
      default: return 0
    }
  }

  const currentStepIndex = getCurrentStepIndex()

  return (
    <div className="flex items-center space-x-2">
      {steps.map((step, index) => {
        const isActive = index === currentStepIndex
        const isCompleted = index < currentStepIndex
        const Icon = step.icon

        return (
          <div key={step.key} className="flex items-center">
            <div
              className={`
                flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors
                ${isActive ? 'border-blue-500 bg-blue-500 text-white' : ''}
                ${isCompleted ? 'border-green-500 bg-green-500 text-white' : ''}
                ${!isActive && !isCompleted ? 'border-gray-300 bg-white text-gray-400' : ''}
              `}
            >
              <Icon className="w-4 h-4" />
            </div>
            
            <span
              className={`
                ml-2 text-sm font-medium
                ${isActive ? 'text-blue-600' : ''}
                ${isCompleted ? 'text-green-600' : ''}
                ${!isActive && !isCompleted ? 'text-gray-400' : ''}
              `}
            >
              {step.label}
            </span>
            
            {index < steps.length - 1 && (
              <div
                className={`
                  mx-4 h-0.5 w-8 transition-colors
                  ${index < currentStepIndex ? 'bg-green-500' : 'bg-gray-300'}
                `}
              />
            )}
          </div>
        )
      })}

      {status === 'archived' && (
        <div className="flex items-center ml-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-orange-500 bg-orange-500 text-white">
            <ArchiveIcon className="w-4 h-4" />
          </div>
          <span className="ml-2 text-sm font-medium text-orange-600">Archived</span>
        </div>
      )}
    </div>
  )
}