'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { useReleaseNotesStore, useReleaseNotesActions } from '@/lib/store'
import { PublishButton } from '@/components/release-notes/PublishButton'
import { StatusIndicator } from '@/components/release-notes/StatusIndicator'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PlusIcon, EyeIcon, EditIcon, TrashIcon, SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/ui/empty-state'

export default function ReleasesPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const releaseNotes = useReleaseNotesStore((state) => state.releaseNotes)
  const loading = useReleaseNotesStore((state) => state.isLoading)
  const error = useReleaseNotesStore((state) => state.error)
  const { deleteReleaseNote, clearError } = useReleaseNotesActions()
  
  // Helper function to get release notes by status
  const getReleaseNotesByStatus = (status: string) => {
    return releaseNotes.filter(note => note.status === status)
  }
  
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Filter and search logic
  const filteredReleaseNotes = releaseNotes.filter(note => {
    const matchesSearch = !searchTerm || 
      note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTab = activeTab === 'all' || note.status === activeTab
    
    return matchesSearch && matchesTab
  })

  const handleDelete = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this release note?')) {
      return
    }
    
    setDeletingId(noteId)
    try {
      await deleteReleaseNote(noteId)
    } catch (err) {
      console.error("Failed to delete release note:", err)
    } finally {
      setDeletingId(null)
    }
  }

  const handleAction = (action: string, releaseNote: any, data?: any) => {
    switch (action) {
      case 'edit':
        router.push(`/releases/edit/${releaseNote.id}`)
        break
      case 'view':
        // Open public view
        window.open(`/notes/${user?.id}/${releaseNote.slug}`, '_blank')
        break
      case 'history':
        // Open version history modal/page
        console.log('Show version history for:', releaseNote.id)
        break
      case 'duplicated':
        // Refresh the list or show success message
        break
      default:
        // Handle other actions
        break
    }
  }

  const getTabCounts = () => {
    return {
      all: releaseNotes.length,
      draft: getReleaseNotesByStatus('draft').length,
      scheduled: getReleaseNotesByStatus('scheduled').length,
      published: getReleaseNotesByStatus('published').length,
      archived: releaseNotes.filter(note => note.status === 'archived').length
    }
  }

  const tabCounts = getTabCounts()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Release Notes</h1>
          <p className="text-gray-600 mt-1">Manage and publish your release notes</p>
        </div>
        <Link href="/releases/start">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <PlusIcon className="w-4 h-4 mr-2" />
            Create New
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search release notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {error && (
          <Button variant="outline" onClick={clearError} className="text-red-600">
            Clear Error
          </Button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-800">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            All {tabCounts.all > 0 && `(${tabCounts.all})`}
          </TabsTrigger>
          <TabsTrigger value="draft">
            Draft {tabCounts.draft > 0 && `(${tabCounts.draft})`}
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            Scheduled {tabCounts.scheduled > 0 && `(${tabCounts.scheduled})`}
          </TabsTrigger>
          <TabsTrigger value="published">
            Published {tabCounts.published > 0 && `(${tabCounts.published})`}
          </TabsTrigger>
          <TabsTrigger value="archived">
            Archived {tabCounts.archived > 0 && `(${tabCounts.archived})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading release notes...</p>
            </div>
          ) : filteredReleaseNotes.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No matching release notes' : 'No release notes'}
                </h3>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredReleaseNotes.map((note) => (
                <Card key={note.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      {/* Left Side: Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Link 
                            href={`/releases/edit/${note.id}`}
                            className="text-lg font-medium text-gray-900 hover:text-blue-600 truncate"
                          >
                            {note.title || 'Untitled Release Note'}
                          </Link>
                          <StatusIndicator
                            status={note.status}
                            publishedAt={note.published_at}
                            scheduledAt={note.scheduled_at}
                            size="sm"
                            showTimestamp
                          />
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            Last updated: {new Date(note.updated_at).toLocaleDateString()}
                          </span>
                          {note.version && (
                            <span>Version: {note.version}</span>
                          )}
                          {note.views > 0 && (
                            <span>{note.views} views</span>
                          )}
                        </div>
                      </div>

                      {/* Right Side: Actions */}
                      <div className="flex items-center gap-3 ml-4">
                        {note.status === 'published' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction('view', note)}
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction('edit', note)}
                        >
                          <EditIcon className="w-4 h-4" />
                        </Button>
                        
                        <PublishButton
                          releaseNote={note}
                          size="sm"
                          onAction={(action, data) => handleAction(action, note, data)}
                        />
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(note.id)}
                          disabled={deletingId === note.id}
                          className="text-red-600 hover:text-red-700"
                        >
                          {deletingId === note.id ? (
                            <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                          ) : (
                            <TrashIcon className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 