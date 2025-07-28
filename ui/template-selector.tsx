'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/components/Button'
import { Badge } from '@/components/ui/badge'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { AITemplate } from '@/lib/ai/templates'
import { cn } from '@/lib/utils'

interface TemplateSelectorProps {
  templates: AITemplate[]
  selectedTemplateId?: string
  onTemplateSelect: (templateId: string) => void
  className?: string
}

export function TemplateSelector({ 
  templates, 
  selectedTemplateId, 
  onTemplateSelect,
  className 
}: TemplateSelectorProps) {
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null)

  const handleTemplateSelect = (templateId: string) => {
    onTemplateSelect(templateId)
  }

  const toggleExpanded = (templateId: string) => {
    setExpandedTemplate(expandedTemplate === templateId ? null : templateId)
  }

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'professional': return 'bg-blue-100 text-blue-800'
      case 'casual': return 'bg-green-100 text-green-800'
      case 'technical': return 'bg-purple-100 text-purple-800'
      case 'enthusiastic': return 'bg-orange-100 text-orange-800'
      case 'formal': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAudienceColor = (audience: string) => {
    switch (audience) {
      case 'developers': return 'bg-indigo-100 text-indigo-800'
      case 'business': return 'bg-emerald-100 text-emerald-800'
      case 'users': return 'bg-pink-100 text-pink-800'
      case 'mixed': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Choose Template Style
        </h3>
        <span className="text-sm text-gray-500">
          {templates.length} templates available
        </span>
      </div>

      <div className="grid gap-3">
        {templates.map((template) => {
          const isSelected = selectedTemplateId === template.id
          const isExpanded = expandedTemplate === template.id

          return (
            <Card 
              key={template.id} 
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md",
                isSelected && "ring-2 ring-blue-500 bg-blue-50"
              )}
              onClick={() => handleTemplateSelect(template.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{template.icon}</div>
                    <div>
                      <CardTitle className="text-base font-medium flex items-center gap-2">
                        {template.name}
                        {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 mt-1">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleExpanded(template.id)
                    }}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={cn("text-xs", getToneColor(template.tone))}>
                    {template.tone}
                  </Badge>
                  <Badge className={cn("text-xs", getAudienceColor(template.targetAudience))}>
                    {template.targetAudience}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {template.outputFormat}
                  </Badge>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {template.exampleOutput && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Example Output:
                        </h4>
                        <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600 max-h-40 overflow-y-auto">
                          <pre className="whitespace-pre-wrap font-mono text-xs">
                            {template.exampleOutput.substring(0, 300)}
                            {template.exampleOutput.length > 300 && '...'}
                          </pre>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Category:</span>
                        <span className="ml-2 text-gray-600 capitalize">{template.category}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Format:</span>
                        <span className="ml-2 text-gray-600 uppercase">{template.outputFormat}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}