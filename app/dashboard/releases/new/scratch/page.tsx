'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuthStore } from '@/lib/store/use-auth'
import { slugify } from '@/lib/utils' // Import slugify
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'

export default function NewReleaseNotesScratchPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { user } = useAuthStore()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateFromScratch = async () => {
    if (!user) {
        setError('User not authenticated.');
        return;
    }
    setIsCreating(true)
    setError(null)

    try {
      const defaultTitle = `New Release Notes ${new Date().toISOString().split('T')[0]}`
      const releaseSlug = slugify(defaultTitle) + '-' + Date.now().toString(36)

      // Create Initial Draft in Supabase with empty content
      const { data: draftNote, error: insertError } = await supabase
        .from('release_notes')
        .insert({
          organization_id: user.id, // Replace with actual org ID logic if needed
          title: defaultTitle,
          slug: releaseSlug,
          content_html: '', // Start with empty content
          status: 'draft',
        })
        .select('id')
        .single()

      if (insertError) {
         throw new Error(`Failed to create draft release note: ${insertError.message}`)
      }

      if (!draftNote || !draftNote.id) {
          throw new Error('Failed to create draft: No ID returned.')
      }

      // Redirect to the Editor Page
      router.push(`/releases/edit/${draftNote.id}`)

    } catch (err) {
      console.error("Error creating draft from scratch:", err);
      setError(err instanceof Error ? err.message : 'Failed to create draft')
      setIsCreating(false) // Stop loading on error
    } 
    // No need to set isCreating to false on success due to redirect
  }

  return (
    <Card className="rounded-lg shadow bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
          Create Release Notes from Scratch
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <p className="text-gray-600 dark:text-gray-400">
          Start with a blank page and write your notes using the editor.
        </p>
        {error && (
          <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/50">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">Error: {error}</p>
          </div>
        )}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleCreateFromScratch}
            disabled={isCreating}
            className="inline-flex justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50"
          >
            {isCreating ? 'Creating Draft...' : 'Start Writing'}
          </button>
        </div>
      </CardContent>
    </Card>
  )
} 