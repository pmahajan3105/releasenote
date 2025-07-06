'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import Highlight from '@tiptap/extension-highlight'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { Callout } from './extensions/callout'
import { CodeBlockEnhanced } from './extensions/code-block-enhanced'
import { Button } from '@/components/ui/button'
import { 
  BoldIcon, 
  ItalicIcon, 
  UnderlineIcon, 
  StrikethroughIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  CodeIcon,
  UndoIcon,
  RedoIcon,
  LinkIcon,
  ImageIcon,
  TableIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  HighlighterIcon,
  WandIcon,
  InfoIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  LightbulbIcon
} from 'lucide-react'
import { useState, useCallback } from 'react'

interface RichTextEditorProps {
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
  className?: string
  enableAI?: boolean
  onAIGenerate?: () => void
}

export function RichTextEditor({ 
  content = '', 
  onChange, 
  placeholder = 'Start writing your release notes...', 
  className = '',
  enableAI = true,
  onAIGenerate
}: RichTextEditorProps) {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable default code block to use our enhanced version
        codeBlock: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#7F56D9] underline hover:text-[#6941C6]',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Highlight.configure({
        HTMLAttributes: {
          class: 'bg-yellow-200 rounded px-1',
        },
      }),
      TextStyle,
      Color,
      Callout,
      CodeBlockEnhanced,
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none min-h-[300px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:')
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href
    const url = window.prompt('Enter URL:', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const addTable = useCallback(() => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }, [editor])

  const addCallout = useCallback((type: 'info' | 'warning' | 'success' | 'error' | 'tip' = 'info') => {
    editor?.chain().focus().setCallout({ type }).run()
  }, [editor])

  const addCodeBlock = useCallback(() => {
    editor?.chain().focus().toggleCodeBlock().run()
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div className={`border border-[#d0d5dd] rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-[#e4e7ec] p-3 bg-gray-50 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <div className="flex gap-1 mr-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-gray-200' : ''}
          >
            <BoldIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-gray-200' : ''}
          >
            <ItalicIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'bg-gray-200' : ''}
          >
            <StrikethroughIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={editor.isActive('highlight') ? 'bg-gray-200' : ''}
          >
            <HighlighterIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Headings */}
        <div className="flex gap-1 mr-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}
          >
            <Heading1Icon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}
          >
            <Heading2Icon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}
          >
            <Heading3Icon className="h-4 w-4" />
          </Button>
        </div>

        {/* Lists */}
        <div className="flex gap-1 mr-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
          >
            <ListIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
          >
            <ListOrderedIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Other Formatting */}
        <div className="flex gap-1 mr-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'bg-gray-200' : ''}
          >
            <QuoteIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={addCodeBlock}
            className={editor.isActive('codeBlockEnhanced') ? 'bg-gray-200' : ''}
          >
            <CodeIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Callouts */}
        <div className="flex gap-1 mr-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => addCallout('info')}
            className={editor.isActive('callout', { type: 'info' }) ? 'bg-blue-100' : ''}
            title="Add Info Callout"
          >
            <InfoIcon className="h-4 w-4 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => addCallout('warning')}
            className={editor.isActive('callout', { type: 'warning' }) ? 'bg-yellow-100' : ''}
            title="Add Warning Callout"
          >
            <AlertTriangleIcon className="h-4 w-4 text-yellow-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => addCallout('success')}
            className={editor.isActive('callout', { type: 'success' }) ? 'bg-green-100' : ''}
            title="Add Success Callout"
          >
            <CheckCircleIcon className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => addCallout('error')}
            className={editor.isActive('callout', { type: 'error' }) ? 'bg-red-100' : ''}
            title="Add Error Callout"
          >
            <XCircleIcon className="h-4 w-4 text-red-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => addCallout('tip')}
            className={editor.isActive('callout', { type: 'tip' }) ? 'bg-purple-100' : ''}
            title="Add Tip Callout"
          >
            <LightbulbIcon className="h-4 w-4 text-purple-600" />
          </Button>
        </div>

        {/* Media & Links */}
        <div className="flex gap-1 mr-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={setLink}
            className={editor.isActive('link') ? 'bg-gray-200' : ''}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={addImage}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={addTable}
          >
            <TableIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1 mr-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <UndoIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <RedoIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* AI Assistant */}
        {enableAI && (
          <div className="flex gap-1 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onAIGenerate}
              className="text-[#7F56D9] border-[#7F56D9] hover:bg-[#7F56D9] hover:text-white"
            >
              <WandIcon className="h-4 w-4 mr-1" />
              AI Assist
            </Button>
          </div>
        )}
      </div>

      {/* Editor Content */}
      <div className="min-h-[300px]">
        <EditorContent 
          editor={editor} 
          className="focus-within:outline-none"
        />
      </div>

      {/* Placeholder when empty */}
      {editor.isEmpty && (
        <div className="absolute top-20 left-4 text-gray-400 pointer-events-none">
          {placeholder}
        </div>
      )}
    </div>
  )
}