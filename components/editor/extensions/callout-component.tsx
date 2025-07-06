'use client'

import React from 'react'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import { 
  InfoIcon, 
  AlertTriangleIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  LightbulbIcon
} from 'lucide-react'

interface CalloutComponentProps {
  node: {
    attrs: {
      type: 'info' | 'warning' | 'success' | 'error' | 'tip'
    }
  }
  updateAttributes: (attributes: Record<string, any>) => void
  selected: boolean
}

const calloutConfig = {
  info: {
    icon: InfoIcon,
    className: 'bg-blue-50 border-blue-200 text-blue-800',
    iconClassName: 'text-blue-600'
  },
  warning: {
    icon: AlertTriangleIcon,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    iconClassName: 'text-yellow-600'
  },
  success: {
    icon: CheckCircleIcon,
    className: 'bg-green-50 border-green-200 text-green-800',
    iconClassName: 'text-green-600'
  },
  error: {
    icon: XCircleIcon,
    className: 'bg-red-50 border-red-200 text-red-800',
    iconClassName: 'text-red-600'
  },
  tip: {
    icon: LightbulbIcon,
    className: 'bg-purple-50 border-purple-200 text-purple-800',
    iconClassName: 'text-purple-600'
  }
}

export function CalloutComponent({ node, updateAttributes, selected }: CalloutComponentProps) {
  const { type } = node.attrs
  const config = calloutConfig[type] || calloutConfig.info
  const Icon = config.icon

  return (
    <NodeViewWrapper 
      className={`callout relative p-4 my-4 border-l-4 rounded-r-lg ${config.className} ${
        selected ? 'ring-2 ring-blue-400' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 mt-0.5 ${config.iconClassName}`}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <NodeViewContent className="callout-content [&>*:first-child]:mt-0 [&>*:last-child]:mb-0" />
        </div>

        {/* Type Selector */}
        <div className="flex-shrink-0">
          <select
            value={type}
            onChange={(e) => updateAttributes({ type: e.target.value })}
            className="text-xs bg-transparent border-none outline-none cursor-pointer opacity-50 hover:opacity-100"
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
            <option value="tip">Tip</option>
          </select>
        </div>
      </div>
    </NodeViewWrapper>
  )
}