'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline'
import { BrandVoice, CustomPrompt, DEFAULT_BRAND_VOICES, DEFAULT_CUSTOM_PROMPTS } from '@/lib/ai/custom-prompts'
import { cn } from '@/lib/utils'

interface BrandVoiceManagerProps {
  className?: string
  onBrandVoiceSelect?: (brandVoice: BrandVoice) => void
  onCustomPromptSelect?: (customPrompt: CustomPrompt) => void
}

function BrandVoiceCard({ 
  brandVoice, 
  onEdit, 
  onDelete, 
  onSelect 
}: { 
  brandVoice: BrandVoice
  onEdit: (brandVoice: BrandVoice) => void
  onDelete: (id: string) => void
  onSelect: (brandVoice: BrandVoice) => void
}) {
  return (
    <Card className={cn("cursor-pointer transition-all hover:shadow-md", !brandVoice.is_active && "opacity-60")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-medium">{brandVoice.name}</CardTitle>
            <CardDescription className="text-sm mt-1">{brandVoice.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(brandVoice) }}>
              <PencilIcon className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(brandVoice.id) }}>
              <TrashIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent onClick={() => onSelect(brandVoice)}>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge className="text-xs capitalize">{brandVoice.tone}</Badge>
            {brandVoice.useEmojis && <Badge variant="outline" className="text-xs">Emojis</Badge>}
            {brandVoice.useMetrics && <Badge variant="outline" className="text-xs">Metrics</Badge>}
          </div>
          
          {brandVoice.personality.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">Personality:</p>
              <p className="text-xs text-gray-600">{brandVoice.personality.join(', ')}</p>
            </div>
          )}
          
          {brandVoice.exampleContent && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">Example:</p>
              <p className="text-xs text-gray-600 line-clamp-2">{brandVoice.exampleContent}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function CustomPromptCard({ 
  customPrompt, 
  onEdit, 
  onDelete, 
  onSelect 
}: { 
  customPrompt: CustomPrompt
  onEdit: (customPrompt: CustomPrompt) => void
  onDelete: (id: string) => void
  onSelect: (customPrompt: CustomPrompt) => void
}) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'feature': return 'bg-blue-100 text-blue-800'
      case 'bugfix': return 'bg-red-100 text-red-800'
      case 'improvement': return 'bg-green-100 text-green-800'
      case 'security': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className={cn("cursor-pointer transition-all hover:shadow-md", !customPrompt.is_active && "opacity-60")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-base font-medium">{customPrompt.name}</CardTitle>
              <Badge className={cn("text-xs capitalize", getCategoryColor(customPrompt.category))}>
                {customPrompt.category}
              </Badge>
            </div>
            <CardDescription className="text-sm">{customPrompt.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(customPrompt) }}>
              <PencilIcon className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(customPrompt.id) }}>
              <TrashIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent onClick={() => onSelect(customPrompt)}>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>Target: {customPrompt.targetAudience}</span>
            <span>•</span>
            <span>Temp: {customPrompt.temperature}</span>
          </div>
          
          {customPrompt.variables.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">Variables:</p>
              <div className="flex flex-wrap gap-1">
                {customPrompt.variables.slice(0, 3).map((variable) => (
                  <Badge key={variable.name} variant="outline" className="text-xs">
                    {variable.name}
                  </Badge>
                ))}
                {customPrompt.variables.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{customPrompt.variables.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function BrandVoiceManager({ className, onBrandVoiceSelect, onCustomPromptSelect }: BrandVoiceManagerProps) {
  const [brandVoices, setBrandVoices] = useState<BrandVoice[]>([])
  const [customPrompts, setCustomPrompts] = useState<CustomPrompt[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, setShowCreateForm] = useState(false)
  const [, setCreateType] = useState<'brandVoice' | 'customPrompt'>('brandVoice')

  const loadBrandVoices = async () => {
    try {
      const response = await fetch('/api/brand-voices')
      if (!response.ok) throw new Error('Failed to load brand voices')
      const data = await response.json()
      setBrandVoices(data.brandVoices)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load brand voices')
    }
  }

  const loadCustomPrompts = async () => {
    try {
      const response = await fetch('/api/custom-prompts')
      if (!response.ok) throw new Error('Failed to load custom prompts')
      const data = await response.json()
      setCustomPrompts(data.customPrompts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load custom prompts')
    }
  }

  useEffect(() => {
    loadBrandVoices()
    loadCustomPrompts()
  }, [])

  const handleCreateFromDefault = async (
    defaultItem: Partial<BrandVoice> | Partial<CustomPrompt>,
    type: 'brandVoice' | 'customPrompt'
  ) => {
    setIsLoading(true)
    try {
      const endpoint = type === 'brandVoice' ? '/api/brand-voices' : '/api/custom-prompts'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(defaultItem)
      })

      if (!response.ok) throw new Error(`Failed to create ${type}`)

      if (type === 'brandVoice') {
        await loadBrandVoices()
      } else {
        await loadCustomPrompts()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to create ${type}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string, type: 'brandVoice' | 'customPrompt') => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return

    try {
      const endpoint = type === 'brandVoice' ? `/api/brand-voices/${id}` : `/api/custom-prompts/${id}`
      const response = await fetch(endpoint, { method: 'DELETE' })

      if (!response.ok) throw new Error(`Failed to delete ${type}`)

      if (type === 'brandVoice') {
        setBrandVoices(prev => prev.filter(bv => bv.id !== id))
      } else {
        setCustomPrompts(prev => prev.filter(cp => cp.id !== id))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to delete ${type}`)
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">AI Customization</h2>
          <p className="text-sm text-gray-600">
            Customize AI behavior with brand voices and custom prompts
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => { setCreateType('brandVoice'); setShowCreateForm(true) }}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Brand Voice
          </Button>
          <Button 
            variant="outline"
            onClick={() => { setCreateType('customPrompt'); setShowCreateForm(true) }}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Custom Prompt
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="brandVoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="brandVoices">
            Brand Voices ({brandVoices.length})
          </TabsTrigger>
          <TabsTrigger value="customPrompts">
            Custom Prompts ({customPrompts.length})
          </TabsTrigger>
          <TabsTrigger value="defaults">
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="brandVoices" className="space-y-4">
          {brandVoices.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <SparklesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Brand Voices Yet</h3>
                <p className="text-gray-600 mb-4">
                  Create your first brand voice to customize AI tone and style
                </p>
                <Button onClick={() => { setCreateType('brandVoice'); setShowCreateForm(true) }}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Brand Voice
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {brandVoices.map((brandVoice) => (
                <BrandVoiceCard
                  key={brandVoice.id}
                  brandVoice={brandVoice}
                  onEdit={(bv) => console.log('Edit brand voice', bv)}
                  onDelete={(id) => handleDelete(id, 'brandVoice')}
                  onSelect={(bv) => onBrandVoiceSelect?.(bv)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="customPrompts" className="space-y-4">
          {customPrompts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Custom Prompts Yet</h3>
                <p className="text-gray-600 mb-4">
                  Create custom prompts for specific release note scenarios
                </p>
                <Button onClick={() => { setCreateType('customPrompt'); setShowCreateForm(true) }}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Custom Prompt
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {customPrompts.map((customPrompt) => (
                <CustomPromptCard
                  key={customPrompt.id}
                  customPrompt={customPrompt}
                  onEdit={(cp) => console.log('Edit custom prompt', cp)}
                  onDelete={(id) => handleDelete(id, 'customPrompt')}
                  onSelect={(cp) => onCustomPromptSelect?.(cp)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="defaults" className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Default Brand Voices</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {DEFAULT_BRAND_VOICES.map((defaultVoice, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-base">{defaultVoice.name}</CardTitle>
                    <CardDescription>{defaultVoice.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="text-xs capitalize">{defaultVoice.tone}</Badge>
                        {defaultVoice.useEmojis && <Badge variant="outline" className="text-xs">Emojis</Badge>}
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleCreateFromDefault(defaultVoice, 'brandVoice')}
                        disabled={isLoading}
                      >
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Default Custom Prompts</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {DEFAULT_CUSTOM_PROMPTS.map((defaultPrompt, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-base">{defaultPrompt.name}</CardTitle>
                    <CardDescription>{defaultPrompt.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge className="text-xs capitalize">
                        {defaultPrompt.category}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleCreateFromDefault(defaultPrompt, 'customPrompt')}
                        disabled={isLoading}
                      >
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
