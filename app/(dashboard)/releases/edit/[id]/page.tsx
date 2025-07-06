'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuthStore } from '@/lib/store/use-auth'
import ReleaseNoteEditor from '@/components/features/ReleaseNoteEditor' // Import the editor
import { ArrowUpTrayIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

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

export default function EditReleasePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [version, setVersion] = useState('')
  const [note, setNote] = useState<ReleaseNote | null>(null)

  useEffect(() => {
    const fetchReleaseNote = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/release-notes/${params.id}`)
        if (response.ok) {
          const releaseNote = await response.json()
          setTitle(releaseNote.title || '')
          setContent(releaseNote.content || '')
          setVersion(releaseNote.version || '')
          setNote(releaseNote)
          setCoverImageUrl(releaseNote.cover_image_url)
        }
      } catch (error) {
        console.error('Error fetching release note:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchReleaseNote()
    }
  }, [params.id])

  const handleSave = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/release-notes/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          version,
        }),
      })

      if (response.ok) {
        router.push('/dashboard/releases')
      }
    } catch (error) {
      console.error('Error saving release note:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCoverImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return

    const file = event.target.files[0]
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.')
        return
    }

    setIsUploadingCover(true)
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
    } finally {
        setIsUploadingCover(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading editor...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Release Note</CardTitle>
          <CardDescription>Update your release note details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Release title"
            />
          </div>
          
          <div>
            <label htmlFor="version" className="block text-sm font-medium mb-2">
              Version
            </label>
            <Input
              id="version"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="v1.0.0"
            />
          </div>
          
          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              Content
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Release note content"
              rows={10}
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
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