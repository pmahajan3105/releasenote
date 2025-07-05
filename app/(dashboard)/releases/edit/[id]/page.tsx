'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/contexts/AuthContext'
import ReleaseNoteEditor from '@/components/features/ReleaseNoteEditor' // Import the editor
import { ArrowUpTrayIcon, PhotoIcon } from '@heroicons/react/24/outline'

// Assuming a type for your release note data
type ReleaseNote = {
  id: string
  title: string
  content_html: string | null
  cover_image_url: string | null
  status: 'draft' | 'published'
  // Add other fields as needed
}

const COVER_IMAGE_BUCKET = 'release-note-images' // Match bucket name
const PLACEHOLDER_CONTENT = '<!-- Generating AI content... -->'

export default function EditReleaseNotePage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClientComponentClient()
  const { user } = useAuth()
  const releaseNoteId = params.id as string

  const [note, setNote] = useState<ReleaseNote | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)

  // Fetch release note data and trigger AI generation if needed
  const fetchNoteAndGenerate = useCallback(async () => {
    if (!releaseNoteId || !user) return
    setIsLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('release_notes')
        .select('id, title, content_html, cover_image_url, status, source_ticket_ids') // Select source_ticket_ids too
        .eq('id', releaseNoteId)
        .eq('organization_id', user.id) // Ensure user owns the note
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
            throw new Error('Release note not found or you do not have permission to edit it.')
        }
        throw error
      }

      if (data) {
        setNote(data)
        setTitle(data.title || '')
        setContent(data.content_html || '') // Set initial content
        setCoverImageUrl(data.cover_image_url)

        // --- Trigger AI Generation if content is the placeholder --- 
        if (data.content_html === PLACEHOLDER_CONTENT) {
          setIsGeneratingAi(true);
          try {
            const response = await fetch('/api/v1/release-notes/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ releaseNoteId: data.id }),
            });

            if (!response.ok) {
              const errorBody = await response.json();
              throw new Error(errorBody.error || `API Error: ${response.statusText}`);
            }

            const result = await response.json();
            if (result.success && result.generatedContent) {
                setContent(result.generatedContent); // Update editor state
                // Optionally update the note state as well if needed elsewhere
                setNote(prev => prev ? { ...prev, content_html: result.generatedContent } : null);
            } else {
                 throw new Error('AI generation succeeded but no content was returned.');
            }
          } catch (genError) {
            console.error('AI Generation failed:', genError);
            setError(`Failed to generate AI content: ${genError instanceof Error ? genError.message : 'Unknown error'}`);
            // Optionally set content to an error message or leave placeholder?
            setContent('Error generating AI content. Please try saving and refreshing, or edit manually.')
          } finally {
              setIsGeneratingAi(false);
          }
        }
        // --- End AI Generation Trigger --- 
      }
    } catch (err) {
      console.error('Failed to fetch release note:', err)
      setError(err instanceof Error ? err.message : 'Failed to load release note')
    } finally {
      setIsLoading(false)
    }
  }, [releaseNoteId, user, supabase])

  useEffect(() => {
    fetchNoteAndGenerate()
  }, [fetchNoteAndGenerate])

  const handleCoverImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return

    const file = event.target.files[0]
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.')
        return
    }

    setIsUploadingCover(true)
    setError(null)

    try {
        const timestamp = Date.now()
        const fileName = `cover_${releaseNoteId}_${timestamp}_${file.name}`
        const filePath = `${fileName}` // Consider nesting

        // Delete previous cover image if it exists (optional)
        if (note?.cover_image_url) {
            const oldFileName = note.cover_image_url.split('/').pop()
            if (oldFileName) {
                await supabase.storage.from(COVER_IMAGE_BUCKET).remove([oldFileName])
            }
        }

        // Upload new image
        const { data, error: uploadError } = await supabase.storage
            .from(COVER_IMAGE_BUCKET)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
            })

        if (uploadError) throw uploadError

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(COVER_IMAGE_BUCKET)
            .getPublicUrl(filePath)

        if (!urlData || !urlData.publicUrl) {
            throw new Error('Could not get public URL for cover image.')
        }

        // Update state and potentially save URL to DB immediately or on main save
        setCoverImageUrl(urlData.publicUrl)
        // Update the note state directly for immediate feedback
        if (note) setNote({...note, cover_image_url: urlData.publicUrl });

        // Also update the DB record
        const { error: updateError } = await supabase
            .from('release_notes')
            .update({ cover_image_url: urlData.publicUrl, updated_at: new Date().toISOString() })
            .eq('id', releaseNoteId)

        if (updateError) throw updateError

    } catch (err) {
        console.error('Cover image upload failed:', err)
        setError(`Cover image upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
        setIsUploadingCover(false)
    }
  }

  const handleSave = async (publish: boolean = false) => {
    if (!note || !user) return
    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/release-notes/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              releaseNoteId: note.id,
              title: title, 
              content_html: content, 
              publish: publish 
          }),
      });

      const result = await response.json();

      if (!response.ok) {
          throw new Error(result.error || `API Error: ${response.statusText}`);
      }

      if (result.success && result.updatedNote) {
          // Update local state with the potentially modified data from the server
          setNote(prev => prev ? { ...prev, ...result.updatedNote } : null);
          // Update individual states if necessary, though reading from `note` state is often better
          setTitle(result.updatedNote.title);
          // setContent(result.updatedNote.content_html); // Content state is already updated by editor onChange
          
          alert(publish ? 'Release note published successfully!' : 'Draft saved successfully!') // Use toast later
          if (publish) {
            // Maybe redirect to published note or releases list
             router.push('/releases')
             router.refresh() // Ensure list page refetches
          }
      } else {
          throw new Error(result.error || 'Save operation failed, but no specific error returned.');
      }

    } catch (err) {
      console.error('Failed to save release note:', err)
      setError(`Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="p-6">Loading editor...</div>
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>
  }

  if (!note) {
      return <div className="p-6">Release note not found.</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Release Note</h1>

      {/* Title Input */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
          Title
        </label>
        <input
          type="text"
          name="title"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Enter release note title"
          disabled={isSaving}
        />
      </div>

      {/* Cover Image Upload */}
      <div>
        <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white mb-1">
          Cover Image (Optional)
        </label>
        <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 dark:border-gray-600">
          {coverImageUrl ? (
            <div className="text-center">
               <img src={coverImageUrl} alt="Cover preview" className="mx-auto h-48 w-auto object-cover rounded-md mb-4" />
               <button
                  type="button"
                  onClick={() => document.getElementById('cover-image-upload')?.click()}
                  disabled={isUploadingCover}
                  className="relative cursor-pointer rounded-md bg-white font-semibold text-primary-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-600 focus-within:ring-offset-2 hover:text-primary-500 disabled:opacity-50 dark:bg-gray-700 dark:text-primary-400"
                >
                  <span>{isUploadingCover ? 'Uploading...' : 'Change image'}</span>
                  <input id="cover-image-upload" name="cover-image-upload" type="file" className="sr-only" accept="image/*" onChange={handleCoverImageUpload} disabled={isUploadingCover} />
                </button>
            </div>
          ) : (
            <div className="text-center">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-500" aria-hidden="true" />
              <div className="mt-4 flex text-sm leading-6 text-gray-600 dark:text-gray-400">
                <label
                  htmlFor="cover-image-upload"
                  className="relative cursor-pointer rounded-md bg-white font-semibold text-primary-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-600 focus-within:ring-offset-2 hover:text-primary-500 disabled:opacity-50 dark:bg-gray-700 dark:text-primary-400"
                >
                  <span>{isUploadingCover ? 'Uploading...' : 'Upload an image'}</span>
                  <input id="cover-image-upload" name="cover-image-upload" type="file" className="sr-only" accept="image/*" onChange={handleCoverImageUpload} disabled={isUploadingCover}/>
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs leading-5 text-gray-600 dark:text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div>
        <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white mb-1">
          Content
        </label>
        {isGeneratingAi ? (
            <div className="p-4 rounded-md bg-gray-100 dark:bg-gray-700 min-h-[300px] flex items-center justify-center">
                <p className="text-gray-600 dark:text-gray-300 animate-pulse">Generating AI content...</p>
            </div>
        ) : (
            <ReleaseNoteEditor
                value={content}
                onChange={setContent}
                placeholder="Start writing your release notes..."
            />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
         {error && <p className="text-sm text-red-600 self-center mr-auto">Error: {error}</p>}
         <button
          type="button"
          onClick={() => handleSave(false)}
          disabled={isSaving}
          className="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-600"
        >
          {isSaving ? 'Saving...' : 'Save Draft'}
        </button>
        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={isSaving}
          className="inline-flex justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50"
        >
          {isSaving ? 'Publishing...' : 'Publish'}
        </button>
      </div>
    </div>
  )
} 