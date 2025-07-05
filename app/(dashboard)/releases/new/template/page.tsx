'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/contexts/AuthContext'
import { slugify } from '@/lib/utils' // Import slugify

const DEFAULT_RELEASE_NOTES_TEMPLATE = `
# Release Notes - [Your Release Title/Version]

**Date:** [Date of Release]

## ✨ New Features

- Feature 1 description...
- Feature 2 description...

## 🐛 Bug Fixes

- Fixed an issue where...
- Corrected a problem with...

## 🚀 Improvements

- Enhanced the performance of...
- Improved the usability of...

## 📝 Notes

- [Any additional context, known issues, or migration steps]
`

export default function NewReleaseNotesTemplatePage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { user } = useAuth()
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
      router.push(`/releases/edit/${draftNote.id}`)

    } catch (err) {
      console.error("Error creating draft from template:", err);
      setError(err instanceof Error ? err.message : 'Failed to create draft')
      setIsCreating(false) // Stop loading on error
    } 
    // No need to set isCreating to false on success due to redirect
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create Release Notes from Template
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Select a template below (template selection coming soon). For now, you can start with the default.
        </p>
      </div>

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
    </div>
  )
} 