'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuthStore } from '@/lib/store/use-auth'
import { slugify } from '@/lib/utils' // Import slugify
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'

const DEFAULT_RELEASE_NOTES_TEMPLATE = `
<h1>Release Notes - [Your Release Title/Version]</h1>
<p><strong>Date:</strong> [Date of Release]</p>
<h2>New Features</h2>
<ul>
  <li>Feature 1 description...</li>
  <li>Feature 2 description...</li>
</ul>
<h2>Bug Fixes</h2>
<ul>
  <li>Fixed an issue where...</li>
  <li>Corrected a problem with...</li>
</ul>
<h2>Improvements</h2>
<ul>
  <li>Enhanced the performance of...</li>
  <li>Improved the usability of...</li>
</ul>
<h2>Notes</h2>
<ul>
  <li>[Any additional context, known issues, or migration steps]</li>
</ul>
`

export default function NewReleaseNotesTemplatePage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { user } = useAuthStore()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateFromTemplate = async () => {
    if (!user) {
        setError('User not authenticated.');
        return;
    }
    setIsCreating(true)
    setError(null)

    try {
      const defaultTitle = `New Release Notes ${new Date().toISOString().split('T')[0]}`
      const releaseSlug = slugify(defaultTitle) + '-' + Date.now().toString(36)

      // Create Initial Draft in Supabase using the template content
      const { data: draftNote, error: insertError } = await supabase
        .from('release_notes')
        .insert({
          organization_id: user.id, // Replace with actual org ID logic if needed
          title: defaultTitle,
          slug: releaseSlug,
          content_html: DEFAULT_RELEASE_NOTES_TEMPLATE, // Use the template
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
      router.push(`/dashboard/releases/edit/${draftNote.id}`)

    } catch (err) {
      console.error("Error creating draft from template:", err);
      setError(err instanceof Error ? err.message : 'Failed to create draft')
      setIsCreating(false) // Stop loading on error
    } 
    // No need to set isCreating to false on success due to redirect
  }

  return (
    <Card className="rounded-lg shadow bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
          Create Release Notes from Template
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <p className="text-gray-600 dark:text-gray-400">
          Select a template below (template selection coming soon). For now, you can start with the default.
        </p>
        {error && (
          <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/50">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">Error: {error}</p>
          </div>
        )}
        <div>
          <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">Default Template Preview</h2>
          <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-700 rounded-md text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
            <code>
              {DEFAULT_RELEASE_NOTES_TEMPLATE}
            </code>
          </pre>
        </div>
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleCreateFromTemplate}
            disabled={isCreating}
            className="inline-flex justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50"
          >
            {isCreating ? 'Creating Draft...' : 'Use Default Template'}
          </button>
        </div>
        {/* Placeholder for actual template selection UI will go here */}
      </CardContent>
    </Card>
  )
} 
