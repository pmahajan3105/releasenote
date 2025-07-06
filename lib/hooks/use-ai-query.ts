'use client'

import { useMutation, useQuery } from '@tanstack/react-query'

interface GenerateReleaseNotesData {
  tickets?: Array<{
    id: string
    title: string
    description: string
    type: 'feature' | 'bugfix' | 'improvement' | 'breaking'
    labels?: string[]
  }>
  commits?: Array<{
    id: string
    message: string
    author: string
  }>
  tone?: 'professional' | 'casual' | 'technical' | 'friendly'
  provider?: 'openai' | 'anthropic'
  template?: string
  customPrompt?: string
}

/**
 * React Query hook for AI-powered release notes generation
 * @returns Mutation object with generate function and state
 * @example
 * ```tsx
 * function AIGenerationForm() {
 *   const generateMutation = useGenerateReleaseNotesMutation()
 *   
 *   const handleGenerate = (data: GenerateReleaseNotesData) => {
 *     generateMutation.mutate(data, {
 *       onSuccess: (result) => {
 *         console.log('Generated content:', result.content)
 *       }
 *     })
 *   }
 *   
 *   return (
 *     <button 
 *       onClick={() => handleGenerate({ tickets: selectedTickets })}
 *       disabled={generateMutation.isPending}
 *     >
 *       {generateMutation.isPending ? 'Generating...' : 'Generate Release Notes'}
 *     </button>
 *   )
 * }
 * ```
 */
export function useGenerateReleaseNotesMutation() {
  return useMutation({
    mutationFn: async (data: GenerateReleaseNotesData) => {
      const response = await fetch('/api/release-notes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate release notes')
      }
      
      return response.json()
    },
    // Don't cache AI generations as they should be fresh each time
    gcTime: 0,
  })
}

/**
 * React Query hook for fetching AI initialization data
 * @returns Query result with available providers, templates, etc.
 * @example
 * ```tsx
 * function AISettings() {
 *   const { data: initData, isLoading } = useAIInitQuery()
 *   
 *   if (isLoading) return <div>Loading...</div>
 *   
 *   return (
 *     <div>
 *       <h3>Available Providers:</h3>
 *       {initData?.availableProviders.anthropic && <span>Anthropic ✓</span>}
 *       {initData?.availableProviders.openai && <span>OpenAI ✓</span>}
 *     </div>
 *   )
 * }
 * ```
 */
export function useAIInitQuery() {
  return useQuery({
    queryKey: ['ai-init'],
    queryFn: async () => {
      const response = await fetch('/api/release-notes/init')
      
      if (!response.ok) {
        throw new Error('Failed to fetch AI initialization data')
      }
      
      return response.json()
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - this data doesn't change often
  })
}

/**
 * React Query mutation hook for improving existing content with AI
 * @returns Mutation object with improve function and state
 * @example
 * ```tsx
 * function ContentImprover({ content }: { content: string }) {
 *   const improveMutation = useImproveContentMutation()
 *   
 *   const handleImprove = () => {
 *     improveMutation.mutate({
 *       content,
 *       instructions: 'Make it more engaging and user-friendly'
 *     })
 *   }
 *   
 *   return (
 *     <button onClick={handleImprove} disabled={improveMutation.isPending}>
 *       {improveMutation.isPending ? 'Improving...' : 'Improve with AI'}
 *     </button>
 *   )
 * }
 * ```
 */
export function useImproveContentMutation() {
  return useMutation({
    mutationFn: async (data: { 
      content: string
      instructions?: string
      provider?: 'openai' | 'anthropic'
    }) => {
      const response = await fetch('/api/ai/improve-content', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to improve content')
      }
      
      return response.json()
    },
    gcTime: 0, // Don't cache improvements
  })
}