'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ReleaseNote } from '@/types/database'

interface ReleaseNotesFilters {
  status?: string
  search?: string
  page?: number
  limit?: number
}

interface CreateReleaseNoteData {
  title: string
  content_markdown: string
  content_html?: string
  status?: 'draft' | 'published'
  version?: string
}

/**
 * React Query hook for fetching release notes with caching
 * @param filters - Optional filters for the query
 * @returns Query result with release notes data, loading state, and error handling
 * @example
 * ```tsx
 * function ReleaseNotesList() {
 *   const { data, isLoading, error } = useReleaseNotesQuery({ status: 'published' })
 *   
 *   if (isLoading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *   
 *   return (
 *     <div>
 *       {data?.data.map(note => (
 *         <div key={note.id}>{note.title}</div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useReleaseNotesQuery(filters: ReleaseNotesFilters = {}) {
  return useQuery({
    queryKey: ['release-notes', filters],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      
      if (filters.status) searchParams.set('status', filters.status)
      if (filters.search) searchParams.set('search', filters.search)
      if (filters.page) searchParams.set('page', filters.page.toString())
      if (filters.limit) searchParams.set('limit', filters.limit.toString())
      
      const response = await fetch(`/api/release-notes?${searchParams}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch release notes')
      }
      
      return response.json()
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * React Query hook for fetching a single release note
 * @param id - The release note ID
 * @returns Query result with single release note data
 * @example
 * ```tsx
 * function ReleaseNoteDetail({ id }: { id: string }) {
 *   const { data: releaseNote, isLoading } = useReleaseNoteQuery(id)
 *   
 *   if (isLoading) return <div>Loading...</div>
 *   
 *   return <h1>{releaseNote?.title}</h1>
 * }
 * ```
 */
export function useReleaseNoteQuery(id: string) {
  return useQuery({
    queryKey: ['release-note', id],
    queryFn: async () => {
      const response = await fetch(`/api/release-notes/${id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch release note')
      }
      
      return response.json()
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * React Query mutation hook for creating release notes
 * @returns Mutation object with create function and state
 * @example
 * ```tsx
 * function CreateReleaseNoteForm() {
 *   const createMutation = useCreateReleaseNoteMutation()
 *   
 *   const handleSubmit = (data: CreateReleaseNoteData) => {
 *     createMutation.mutate(data, {
 *       onSuccess: () => {
 *         console.log('Release note created!')
 *       }
 *     })
 *   }
 *   
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <button disabled={createMutation.isPending}>
 *         {createMutation.isPending ? 'Creating...' : 'Create'}
 *       </button>
 *     </form>
 *   )
 * }
 * ```
 */
export function useCreateReleaseNoteMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateReleaseNoteData): Promise<ReleaseNote> => {
      const response = await fetch('/api/release-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create release note')
      }
      
      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch release notes list
      queryClient.invalidateQueries({ queryKey: ['release-notes'] })
    },
  })
}

/**
 * React Query mutation hook for updating release notes
 * @returns Mutation object with update function and state
 */
export function useUpdateReleaseNoteMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: string
      data: Partial<CreateReleaseNoteData> 
    }): Promise<ReleaseNote> => {
      const response = await fetch(`/api/release-notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update release note')
      }
      
      return response.json()
    },
    onSuccess: (data) => {
      // Update the cached data
      queryClient.setQueryData(['release-note', data.id], data)
      // Invalidate the list to refetch
      queryClient.invalidateQueries({ queryKey: ['release-notes'] })
    },
  })
}

/**
 * React Query mutation hook for publishing release notes
 * @returns Mutation object with publish function and state
 */
export function usePublishReleaseNoteMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string): Promise<ReleaseNote> => {
      const response = await fetch(`/api/release-notes/${id}/publish`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to publish release note')
      }
      
      return response.json()
    },
    onSuccess: (data) => {
      // Update the cached data
      queryClient.setQueryData(['release-note', data.id], data)
      // Invalidate the list to refetch
      queryClient.invalidateQueries({ queryKey: ['release-notes'] })
    },
  })
}

/**
 * React Query mutation hook for deleting release notes
 * @returns Mutation object with delete function and state
 */
export function useDeleteReleaseNoteMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/release-notes/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete release note')
      }
    },
    onSuccess: (_, id) => {
      // Remove from individual cache
      queryClient.removeQueries({ queryKey: ['release-note', id] })
      // Invalidate the list to refetch
      queryClient.invalidateQueries({ queryKey: ['release-notes'] })
    },
  })
}