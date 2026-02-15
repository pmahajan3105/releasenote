'use client'

import React, { useMemo, useRef, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
// Dynamically import react-quill to avoid SSR issues
import dynamic from 'next/dynamic'
import type { ReactQuillProps } from 'react-quill'
import 'react-quill/dist/quill.snow.css' // Import Quill styles

// Dynamically import ReactQuill, disable SSR  
const ReactQuill = dynamic(() => import('react-quill').then(module => module.default), {
  ssr: false,
  loading: () => <div>Loading editor...</div>
}) as unknown as React.ComponentType<ReactQuillProps & { ref?: React.Ref<QuillComponentApi> }>

interface ReleaseNoteEditorProps {
  value: string
  onChange: (content: string) => void
  placeholder?: string
}

type QuillSelection = { index: number; length: number } | null

interface QuillEditorApi {
  getSelection: (focus?: boolean) => QuillSelection
  insertEmbed: (index: number, type: string, value: string) => void
  setSelection: (index: number, length: number) => void
}

interface QuillComponentApi {
  getEditor: () => QuillEditorApi
}

const IMAGE_BUCKET = 'release-note-images' // Match your Supabase bucket name

export default function ReleaseNoteEditor({ value, onChange, placeholder }: ReleaseNoteEditorProps) {
  const quillRef = useRef<QuillComponentApi | null>(null)
  const supabase = createClientComponentClient()

  const imageHandler = useCallback(async () => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()

    input.onchange = async () => {
      if (!input.files || input.files.length === 0) return

      const file = input.files[0]
      const editor = quillRef.current?.getEditor() // Access Quill instance
      const range = editor?.getSelection(true) // Get current cursor position

      if (!editor || range === undefined || range === null) {
          console.error("Quill editor or selection range not found.")
          alert("Could not get editor selection. Please try clicking into the editor first.")
          return;
      }

      // Show a temporary placeholder or loading state if desired
      // editor.insertEmbed(range.index, 'image', '/placeholder.gif');
      // editor.enable(false); // Disable editor during upload

      try {
        const timestamp = Date.now()
        const fileName = `${timestamp}_${file.name}`
        const filePath = `${fileName}` // You might want to nest this in user/org folders

        // Upload image to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(IMAGE_BUCKET)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          throw uploadError
        }

        // Get public URL for the uploaded image
        const { data: urlData } = supabase.storage
          .from(IMAGE_BUCKET)
          .getPublicUrl(filePath)

        if (!urlData || !urlData.publicUrl) {
           throw new Error('Could not get public URL for uploaded image.')
        }

        // Insert the image URL into the editor
        editor.insertEmbed(range.index, 'image', urlData.publicUrl)
        editor.setSelection(range.index + 1, 0) // Move cursor past the image

      } catch (error) {
        console.error('Image upload failed:', error)
        alert(`Image upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        // editor.deleteText(range.index, 1); // Remove placeholder on error
      } finally {
        // editor.enable(true); // Re-enable editor
      }
    }
  }, [supabase])

  // Memoize modules configuration to avoid re-renders
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        ['link', 'image'], // Add image button
        ['clean']
      ],
      handlers: {
        image: imageHandler // Register the custom image handler
      }
    },
    clipboard: {
      // Match visual discrepancies between clipboard and paste HTML
      matchVisual: false,
    },
  }), [imageHandler])

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
  ]

  return (
    <div>
      <ReactQuill
        ref={quillRef}
        theme="snow" // Use the Snow theme
        value={value || ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || 'Write your release notes here...'}
        style={{ minHeight: '300px' }} // Basic styling
        className="bg-white dark:bg-gray-100 dark:text-gray-900 rounded-b-md" // Add some background/text color for dark mode contrast
      />
    </div>
  )
} 
