'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase/ssr'
import { EyeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RichTextEditor } from '@/components/editor/rich-text-editor'
import { ReleaseNotePreview } from '@/components/editor/release-note-preview'
import { toast } from '@/lib/toast'

// Assuming a type for your release note data
type ReleaseNote = {
  id: string
  title: string
  content_html: string | null
  content_json: Record<string, unknown> | null
  featured_image_url: string | null
  status: 'draft' | 'published'
  published_at?: string
  // Add other fields as needed
}

type Organization = {
  id: string
  name: string
  slug: string
  logo_url: string | null
}

const COVER_IMAGE_BUCKET = 'release-note-images' // Match bucket name

export default function EditReleasePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [contentJson, setContentJson] = useState<Record<string, unknown> | null>(null)
  const [version, setVersion] = useState('')
  const [note, setNote] = useState<ReleaseNote | null>(null)
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null)
  const [isUploadingFeatured, setIsUploadingFeatured] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const releaseNoteId = params.id
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchReleaseNote = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/release-notes/${releaseNoteId}`)
        if (response.ok) {
          const releaseNote = await response.json()
          setTitle(releaseNote.title || '')
          setContent(releaseNote.content_html || releaseNote.content || '')
          setContentJson(releaseNote.content_json || null)
          setVersion(releaseNote.version || '')
          setNote(releaseNote)
          setFeaturedImageUrl(releaseNote.featured_image_url)
        }
      } catch (error) {
        console.error('Error fetching release note:', error)
      } finally {
        setLoading(false)
      }
    }

    const fetchOrganization = async () => {
      try {
        const { data: user } = await supabase.auth.getUser()
        if (user.user) {
          const { data: orgData } = await supabase
            .from('organizations')
            .select('id, name, slug, logo_url')
            .eq('id', user.user.id)
            .single()
          setOrganization(orgData)
        }
      } catch (error) {
        console.error('Error fetching organization:', error)
      }
    }

    if (releaseNoteId) {
      fetchReleaseNote()
      fetchOrganization()
    }
  }, [releaseNoteId, supabase])

  const validateReleaseNote = () => {
    const errors: string[] = []
    
    // Title validation
    if (!title.trim()) {
      errors.push('Title is required')
    } else if (title.length < 3) {
      errors.push('Title must be at least 3 characters long')
    } else if (title.length > 200) {
      errors.push('Title must be less than 200 characters')
    }
    
    // Content validation
    if (!content.trim()) {
      errors.push('Content is required')
    } else if (content.length < 10) {
      errors.push('Content must be at least 10 characters long')
    } else if (content.length > 50000) {
      errors.push('Content must be less than 50,000 characters')
    }
    
    // Version validation (optional but validate format if provided)
    if (version && !/^v?[\d\.]+[\w\-]*$/.test(version)) {
      errors.push('Version format is invalid (e.g., v1.0.0, 1.2.3, 2.0.0-beta)')
    }
    
    setValidationErrors(errors)
    return errors.length === 0
  }

  const handleSave = async () => {
    // Validate before saving
    if (!validateReleaseNote()) {
      toast.error('Please fix the validation errors before saving')
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/release-notes/${releaseNoteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content_html: content,
          content_json: contentJson,
          version,
          featured_image_url: featuredImageUrl,
        }),
      })

      if (response.ok) {
        toast.success('Release note saved successfully')
        router.push('/dashboard/releases')
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to save release note')
      }
    } catch (error) {
      console.error('Error saving release note:', error)
      toast.error('An error occurred while saving')
    } finally {
      setLoading(false)
    }
  }

  const handleFeaturedImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return

    const file = event.target.files[0]
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.')
        return
    }

    setIsUploadingFeatured(true)
    try {
        const timestamp = Date.now()
        const fileName = `cover_${releaseNoteId}_${timestamp}_${file.name}`
        const filePath = `${fileName}` // Consider nesting

        // Delete previous cover image if it exists (optional)
        if (note?.featured_image_url) {
            const oldFileName = note.featured_image_url.split('/').pop()
            if (oldFileName) {
                await supabase.storage.from(COVER_IMAGE_BUCKET).remove([oldFileName])
            }
        }

        // Upload new image
        const { error: uploadError } = await supabase.storage
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
        setFeaturedImageUrl(urlData.publicUrl)
        // Update the note state directly for immediate feedback
        if (note) setNote({ ...note, featured_image_url: urlData.publicUrl })

        // Also update the DB record
        const { error: updateError } = await supabase
            .from('release_notes')
            .update({ featured_image_url: urlData.publicUrl, updated_at: new Date().toISOString() })
            .eq('id', releaseNoteId)

        if (updateError) throw updateError

    } catch (err) {
        console.error('Featured image upload failed:', err)
    } finally {
        setIsUploadingFeatured(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading editor...</div>
  }

  // Show preview if enabled
  if (showPreview) {
    return (
      <div className="min-h-screen">
        <div className="fixed top-4 right-4 z-50">
          <Button
            variant="outline"
            onClick={() => setShowPreview(false)}
            className="bg-white shadow-lg"
          >
            Back to Editor
          </Button>
        </div>
        <ReleaseNotePreview
          title={title}
          content={content}
          version={version}
          featuredImageUrl={featuredImageUrl}
          organization={organization ?? undefined}
          publishedAt={note?.published_at}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Release Note</CardTitle>
          <CardDescription>Update your release note details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/50">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Please fix the following errors:
                  </h3>
                  <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc pl-5">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                // Clear validation errors when user starts typing
                if (validationErrors.length > 0) {
                  setValidationErrors([])
                }
              }}
              placeholder="Release title"
              className={validationErrors.some(e => e.includes('Title')) ? 'border-red-500' : ''}
            />
          </div>
          
          <div>
            <label htmlFor="version" className="block text-sm font-medium mb-2">
              Version
            </label>
            <Input
              id="version"
              value={version}
              onChange={(e) => {
                setVersion(e.target.value)
                // Clear validation errors when user starts typing
                if (validationErrors.length > 0) {
                  setValidationErrors([])
                }
              }}
              placeholder="v1.0.0"
              className={validationErrors.some(e => e.includes('Version')) ? 'border-red-500' : ''}
            />
          </div>
          
          {/* Featured Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Featured Image</label>
            <div className="flex items-center gap-4">
              {featuredImageUrl ? (
                <Image
                  src={featuredImageUrl ?? ''}
                  alt="Featured image"
                  width={128}
                  height={80}
                  unoptimized
                  className="w-32 h-20 object-cover rounded border"
                />
              ) : (
                <div className="w-32 h-20 flex items-center justify-center bg-gray-100 dark:bg-gray-800 border rounded text-gray-400">No image</div>
              )}
              <input
                type="file"
                accept="image/*"
                id="cover-image-upload"
                style={{ display: 'none' }}
                onChange={handleFeaturedImageUpload}
                disabled={isUploadingFeatured}
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('cover-image-upload')?.click()}
                disabled={isUploadingFeatured}
              >
                {isUploadingFeatured ? 'Uploading...' : (featuredImageUrl ? 'Change Image' : 'Upload Image')}
              </Button>
              {featuredImageUrl && (
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (!featuredImageUrl) return;
                    setIsUploadingFeatured(true)
                    try {
                      // Remove from storage
                      const fileName = featuredImageUrl.split('/').pop()
                      if (fileName) {
                        await supabase.storage.from(COVER_IMAGE_BUCKET).remove([fileName]);
                      }
                      setFeaturedImageUrl(null)
                      if (note) setNote({ ...note, featured_image_url: null })
                      // Remove from DB
                      await supabase
                        .from('release_notes')
                        .update({ featured_image_url: null, updated_at: new Date().toISOString() })
                        .eq('id', releaseNoteId)
                    } catch (err) {
                      console.error('Failed to remove cover image:', err);
                    } finally {
                      setIsUploadingFeatured(false)
                    }
                  }}
                  disabled={isUploadingFeatured}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              Content
            </label>
            <RichTextEditor
              content={contentJson ?? content}
              onChange={(newContent) => {
                setContent(newContent)
                // Clear validation errors when user starts typing
                if (validationErrors.length > 0) {
                  setValidationErrors([])
                }
              }}
              onChangeJson={setContentJson}
              placeholder="Release note content"
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Apply Changes'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // Run validation before showing preview
                validateReleaseNote()
                setShowPreview(true)
              }}
              disabled={loading}
            >
              <EyeIcon className="w-4 h-4 mr-2" />
              Preview Public Page
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard/releases')}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
