'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  LightBulbIcon,
  DocumentTextIcon,
  EyeIcon,
  ClockIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline'
import { ContentAnalysis, ContentSuggestion } from '@/lib/ai/content-enhancer'
import { cn } from '@/lib/utils'

interface ContentImproverProps {
  content: string
  onContentChange?: (content: string) => void
  className?: string
}

interface AnalysisDisplayProps {
  analysis: ContentAnalysis
  onApplySuggestion: (suggestion: ContentSuggestion) => void
}

function ScoreCard({ 
  title, 
  score, 
  icon, 
  description 
}: { 
  title: string
  score: number
  icon: React.ReactNode
  description: string 
}) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="text-gray-600">{icon}</div>
          <h4 className="font-medium text-gray-900">{title}</h4>
        </div>
        <span className={cn("text-lg font-bold", getScoreColor(score))}>
          {Math.round(score)}
        </span>
      </div>
      <Progress 
        value={score} 
        className={cn("h-2 mb-2", `[&>div]:${getProgressColor(score)}`)}
      />
      <p className="text-xs text-gray-500">{description}</p>
    </Card>
  )
}

function SuggestionCard({ 
  suggestion, 
  onApply 
}: { 
  suggestion: ContentSuggestion
  onApply: (suggestion: ContentSuggestion) => void 
}) {
  const getTypeIcon = (type: ContentSuggestion['type']) => {
    switch (type) {
      case 'clarity': return <BookOpenIcon className="w-4 h-4" />
      case 'tone': return <InformationCircleIcon className="w-4 h-4" />
      case 'engagement': return <LightBulbIcon className="w-4 h-4" />
      case 'structure': return <DocumentTextIcon className="w-4 h-4" />
      case 'grammar': return <CheckCircleIcon className="w-4 h-4" />
      default: return <InformationCircleIcon className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: ContentSuggestion['type']) => {
    switch (type) {
      case 'clarity': return 'bg-blue-100 text-blue-800'
      case 'tone': return 'bg-purple-100 text-purple-800'
      case 'engagement': return 'bg-green-100 text-green-800'
      case 'structure': return 'bg-orange-100 text-orange-800'
      case 'grammar': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const confidenceIcon = suggestion.confidence >= 0.8 
    ? <CheckCircleIcon className="w-4 h-4 text-green-500" />
    : suggestion.confidence >= 0.6
    ? <InformationCircleIcon className="w-4 h-4 text-yellow-500" />
    : <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />

  return (
    <Card className="border-l-4 border-l-blue-400">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Badge className={cn("text-xs", getTypeColor(suggestion.type))}>
              <div className="flex items-center gap-1">
                {getTypeIcon(suggestion.type)}
                <span className="capitalize">{suggestion.type}</span>
              </div>
            </Badge>
            <div className="flex items-center gap-1">
              {confidenceIcon}
              <span className="text-xs text-gray-500">
                {Math.round(suggestion.confidence * 100)}% confidence
              </span>
            </div>
          </div>
        </div>
        <CardTitle className="text-base">{suggestion.title}</CardTitle>
        <CardDescription className="text-sm">{suggestion.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        {suggestion.originalText && (
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-700 mb-1">Original:</p>
            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              {suggestion.originalText}
            </p>
          </div>
        )}
        
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-700 mb-1">Suggestion:</p>
          <p className="text-sm text-green-700 bg-green-50 p-2 rounded">
            {suggestion.suggestedText}
          </p>
        </div>
        
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-700 mb-1">Why:</p>
          <p className="text-xs text-gray-600">{suggestion.reasoning}</p>
        </div>
        
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => onApply(suggestion)}
          className="w-full"
        >
          Apply Suggestion
        </Button>
      </CardContent>
    </Card>
  )
}

function AnalysisDisplay({ analysis, onApplySuggestion }: AnalysisDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreCard
          title="Readability"
          score={analysis.readabilityScore}
          icon={<BookOpenIcon className="w-5 h-5" />}
          description="How easy your content is to read"
        />
        <ScoreCard
          title="Engagement"
          score={analysis.engagementScore}
          icon={<EyeIcon className="w-5 h-5" />}
          description="How engaging your content is"
        />
        <ScoreCard
          title="Structure"
          score={analysis.structureScore}
          icon={<DocumentTextIcon className="w-5 h-5" />}
          description="How well organized your content is"
        />
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <ClockIcon className="w-5 h-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">Reading Time</h4>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {analysis.estimatedReadingTime} min
          </p>
          <p className="text-xs text-gray-500">{analysis.wordCount} words</p>
        </Card>
      </div>

      {/* Tone Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tone Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-3">
            <Badge className="bg-purple-100 text-purple-800 capitalize">
              {analysis.toneAnalysis.detected}
            </Badge>
            <span className="text-sm text-gray-600">
              {Math.round(analysis.toneAnalysis.confidence * 100)}% confidence
            </span>
          </div>
          {analysis.toneAnalysis.suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Tone Suggestions:</p>
              {analysis.toneAnalysis.suggestions.map((suggestion, index) => (
                <p key={index} className="text-sm text-gray-600 bg-purple-50 p-2 rounded">
                  {suggestion}
                </p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggestions */}
      {analysis.suggestions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Content Suggestions ({analysis.suggestions.length})
          </h3>
          
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All ({analysis.suggestions.length})</TabsTrigger>
              <TabsTrigger value="clarity">
                Clarity ({analysis.suggestions.filter(s => s.type === 'clarity').length})
              </TabsTrigger>
              <TabsTrigger value="engagement">
                Engagement ({analysis.suggestions.filter(s => s.type === 'engagement').length})
              </TabsTrigger>
              <TabsTrigger value="structure">
                Structure ({analysis.suggestions.filter(s => s.type === 'structure').length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {analysis.suggestions.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onApply={onApplySuggestion}
                />
              ))}
            </TabsContent>
            
            <TabsContent value="clarity" className="space-y-4">
              {analysis.suggestions
                .filter(s => s.type === 'clarity')
                .map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onApply={onApplySuggestion}
                  />
                ))}
            </TabsContent>
            
            <TabsContent value="engagement" className="space-y-4">
              {analysis.suggestions
                .filter(s => s.type === 'engagement')
                .map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onApply={onApplySuggestion}
                  />
                ))}
            </TabsContent>
            
            <TabsContent value="structure" className="space-y-4">
              {analysis.suggestions
                .filter(s => s.type === 'structure')
                .map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onApply={onApplySuggestion}
                  />
                ))}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}

export function ContentImprover({ content, onContentChange, className }: ContentImproverProps) {
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeContent = async () => {
    if (!content.trim()) {
      setError('Please enter some content to analyze')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/analyze-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze content')
      }

      const analysisResult = await response.json()
      setAnalysis(analysisResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleApplySuggestion = async (suggestion: ContentSuggestion) => {
    if (!onContentChange) return

    try {
      // For now, we'll just show the suggestion - in a real implementation,
      // this would apply the suggestion to the content
      if (suggestion.originalText && suggestion.suggestedText) {
        const updatedContent = content.replace(
          suggestion.originalText, 
          suggestion.suggestedText
        )
        onContentChange(updatedContent)
      }
    } catch (err) {
      console.error('Failed to apply suggestion:', err)
    }
  }

  useEffect(() => {
    if (content.trim().length > 50) {
      const debounceTimer = setTimeout(() => {
        analyzeContent()
      }, 1000)

      return () => clearTimeout(debounceTimer)
    }
  }, [content])

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Content Analysis</h2>
          <p className="text-sm text-gray-600">
            Get AI-powered suggestions to improve your release notes
          </p>
        </div>
        <Button 
          onClick={analyzeContent}
          disabled={isAnalyzing || !content.trim()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Content'}
        </Button>
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

      {isAnalyzing && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Analyzing your content...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <AnalysisDisplay 
          analysis={analysis} 
          onApplySuggestion={handleApplySuggestion}
        />
      )}
    </div>
  )
}