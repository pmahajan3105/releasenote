'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/contexts/AuthContext'
import { PlusIcon, EyeIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'

// Type for release note list item
type ReleaseNoteListItem = {
  id: string
  title: string
  status: 'draft' | 'published'
  slug: string
  published_at: string | null
  updated_at: string
}

export default function ReleasesListPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { user, loading: authLoading } = useAuth()

  const [notes, setNotes] = useState<ReleaseNoteListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchNotes = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    setError(null)
    try {
      // TODO: Adjust organization ID logic if necessary
      const orgId = user.id
      const { data, error: fetchError } = await supabase
        .from('release_notes')
        .select('id, title, status, slug, published_at, updated_at')
        .eq('organization_id', orgId)
        .order('updated_at', { ascending: false }) // Show most recent first

      if (fetchError) throw fetchError
      setNotes(data || [])

    } catch (err) {
      console.error("Failed to fetch release notes:", err)
      setError(err instanceof Error ? err.message : 'Failed to load release notes')
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    if (!authLoading) {
      fetchNotes()
    }
  }, [authLoading, fetchNotes])

  const handleDelete = async (noteId: string) => {
    if (!user || !window.confirm('Are you sure you want to delete this release note?')) {
        return
    }
    setDeletingId(noteId)
    setError(null)
    try {
        // TODO: Optionally delete associated images from storage?
        const { error: deleteError } = await supabase
            .from('release_notes')
            .delete()
            .eq('id', noteId)
            .eq('organization_id', user.id) // Ensure ownership

        if (deleteError) throw deleteError

        // Remove the note from the local state
        setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId))
        alert('Release note deleted.') // Replace with toast later

    } catch (err) {
        console.error("Failed to delete release note:", err)
        setError(err instanceof Error ? err.message : 'Failed to delete release note')
    } finally {
        setDeletingId(null)
    }
  }

  const getOrgSlug = () => {
      // Placeholder: Replace with actual logic to get org slug if needed for public URLs
      return user?.id || 'your-org' 
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Release Notes</h1>
        <Link
          href="/releases/start"
          className="inline-flex items-center gap-x-2 rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        >
          <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
          Create New
        </Link>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/50">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">Error: {error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">Loading release notes...</p>
          {/* Optional: Add spinner */}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No release notes</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating your first release note.</p>
          <div className="mt-6">
             <Link
                href="/releases/start"
                className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                Create New Release Note
             </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden bg-white shadow sm:rounded-md dark:bg-gray-800">
          <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
            {notes.map((note) => (
              <li key={note.id}>
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between space-x-4">
                   {/* Left Side: Title & Date */}
                  <div className="min-w-0 flex-1">
                    <Link href={`/releases/edit/${note.id}`} className="text-sm font-medium text-primary-600 truncate hover:underline dark:text-primary-400">
                        {note.title || 'Untitled Release Note'}
                    </Link>
                    <p className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                      {note.status === 'published' && note.published_at ? 
                        `Published: ${new Date(note.published_at).toLocaleDateString()}` : 
                        `Draft - Updated: ${new Date(note.updated_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  {/* Right Side: Status & Actions */}
                  <div className="flex items-center space-x-4 flex-shrink-0">
                     {/* Status Badge */}
                     <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${note.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}
                      >
                        {note.status.charAt(0).toUpperCase() + note.status.slice(1)}
                      </span>
                     {/* Action Buttons */}
                     <div className="flex items-center space-x-2">
                        {note.status === 'published' && (
                           <Link href={`/notes/${getOrgSlug()}/${note.slug}`} target="_blank" rel="noopener noreferrer" title="View Published Note" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                              <EyeIcon className="h-5 w-5" aria-hidden="true" />
                           </Link>
                        )}
                        <Link href={`/releases/edit/${note.id}`} title="Edit Note" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                           <PencilSquareIcon className="h-5 w-5" aria-hidden="true" />
                        </Link>
                        <button 
                            onClick={() => handleDelete(note.id)}
                            disabled={deletingId === note.id}
                            title="Delete Note"
                            className={`text-red-400 hover:text-red-600 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                             {deletingId === note.id ? (
                                <span className="animate-spin inline-block h-5 w-5 border-2 border-current border-t-transparent rounded-full" role="status" aria-label="Deleting..."></span>
                             ): (
                                <TrashIcon className="h-5 w-5" aria-hidden="true" />
                             )} 
                        </button>
                     </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
} 