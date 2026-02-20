'use client'

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HistoryIcon, EyeIcon, RotateCcwIcon, UserIcon, ClockIcon } from 'lucide-react'
import { format } from 'date-fns'
import type { ReleaseNote } from '@/types/database'
import { sanitizeHtmlClient } from '@/lib/sanitize-client'

interface VersionHistoryProps {
  open: boolean
  onClose: () => void
  releaseNote: ReleaseNote
  onRestore?: (versionId: string) => void
  onCompare?: (versionId1: string, versionId2: string) => void
}

interface Version {
  id: string
  version_number: number
  title: string
  content?: string | null
  content_markdown?: string | null
  content_html?: string | null
  created_at: string
  created_by?: string | null
  change_summary?: string
  is_auto_save: boolean
  author?: {
    name: string
    email: string
    avatar_url?: string
  }
}

export function VersionHistory({ 
  open, 
  onClose, 
  releaseNote, 
  onRestore,
  onCompare 
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedVersions, setSelectedVersions] = useState<string[]>([])
  const [previewVersion, setPreviewVersion] = useState<Version | null>(null)

  const loadVersions = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/release-notes/${releaseNote.id}/versions`)
      if (response.ok) {
        const data = await response.json()
        setVersions(data.versions || [])
      }
    } catch (error) {
      console.error('Failed to load versions:', error)
    } finally {
      setLoading(false)
    }
  }, [releaseNote.id])

  useEffect(() => {
    if (open && releaseNote.id) {
      void loadVersions()
    }
  }, [open, releaseNote.id, loadVersions])

  const handleVersionSelect = (versionId: string) => {
    if (selectedVersions.includes(versionId)) {
      setSelectedVersions(prev => prev.filter(id => id !== versionId))
    } else if (selectedVersions.length < 2) {
      setSelectedVersions(prev => [...prev, versionId])
    } else {
      // Replace oldest selection
      setSelectedVersions([selectedVersions[1], versionId])
    }
  }

  const handleRestore = async (versionId: string) => {
    if (window.confirm('Are you sure you want to restore this version? This will replace the current content.')) {
      onRestore?.(versionId)
      onClose()
    }
  }

  const handleCompare = () => {
    if (selectedVersions.length === 2) {
      onCompare?.(selectedVersions[0], selectedVersions[1])
    }
  }

  const getVersionBadge = (version: Version) => {
    if (version.is_auto_save) {
      return <Badge variant="outline" className="text-xs">Auto-save</Badge>
    }
    return <Badge variant="secondary" className="text-xs">v{version.version_number}</Badge>
  }

  const getCurrentVersion = () => {
    return {
      id: 'current',
      version_number: Math.max(...versions.map(v => v.version_number), 0) + 1,
      title: releaseNote.title || '',
      content: releaseNote.content,
      content_markdown: releaseNote.content_markdown,
      content_html: releaseNote.content_html,
      created_at: releaseNote.updated_at,
      created_by: releaseNote.author_id,
      change_summary: 'Current version',
      is_auto_save: false,
      author: undefined // Would need to fetch user data
    }
  }

  const allVersions = [getCurrentVersion(), ...versions]

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HistoryIcon className="w-5 h-5" />
              Version History
            </DialogTitle>
            <DialogDescription>
              View and manage versions of &quot;{releaseNote.title}&quot;
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-6 h-[70vh]">
            {/* Version List */}
            <div className="w-1/2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Versions</h3>
                {selectedVersions.length === 2 && (
                  <Button size="sm" onClick={handleCompare}>
                    Compare Selected
                  </Button>
                )}
              </div>

              <div className="h-full overflow-auto pr-1">
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">Loading versions...</p>
                    </div>
                  ) : (
                    allVersions.map((version, index) => (
                      <Card 
                        key={version.id}
                        className={`cursor-pointer transition-colors ${
                          selectedVersions.includes(version.id) 
                            ? 'ring-2 ring-blue-500 bg-blue-50' 
                            : 'hover:bg-gray-50'
                        } ${index === 0 ? 'border-green-200 bg-green-50' : ''}`}
                        onClick={() => handleVersionSelect(version.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getVersionBadge(version)}
                                {index === 0 && (
                                  <Badge className="bg-green-600 text-white text-xs">Current</Badge>
                                )}
                              </div>
                              
                              <h4 className="font-medium text-sm mb-1">
                                {version.title}
                              </h4>
                              
                              {version.change_summary && (
                                <p className="text-xs text-gray-600 mb-2">
                                  {version.change_summary}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <ClockIcon className="w-3 h-3" />
                                  <span>{format(new Date(version.created_at), 'MMM d, HH:mm')}</span>
                                </div>
                                
                                {version.author && (
                                  <div className="flex items-center gap-1">
                                    <UserIcon className="w-3 h-3" />
                                    <span>{version.author.name}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col gap-1 ml-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 px-2"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setPreviewVersion(version)
                                }}
                              >
                                <EyeIcon className="w-3 h-3" />
                              </Button>
                              
                              {index !== 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 px-2"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRestore(version.id)
                                  }}
                                >
                                  <RotateCcwIcon className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="w-1/2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Preview</h3>
                {previewVersion && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewVersion(null)}
                  >
                    Close Preview
                  </Button>
                )}
              </div>

              {previewVersion ? (
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      {getVersionBadge(previewVersion)}
                      {previewVersion.title}
                    </CardTitle>
                    <div className="text-sm text-gray-500">
                      Created {format(new Date(previewVersion.created_at), 'PPp')}
                      {previewVersion.author && ` by ${previewVersion.author.name}`}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96 overflow-auto pr-1">
                      <div className="prose prose-sm max-w-none">
                        {previewVersion.content_html ? (
                          <div dangerouslySetInnerHTML={{ __html: sanitizeHtmlClient(previewVersion.content_html) }} />
                        ) : previewVersion.content_markdown ? (
                          <pre className="whitespace-pre-wrap text-sm">
                            {previewVersion.content_markdown}
                          </pre>
                        ) : (
                          <div className="text-gray-500 italic">No content available</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <CardContent>
                    <div className="text-center text-gray-500">
                      <EyeIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a version to preview its content</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <div className="text-sm text-gray-500">
              {selectedVersions.length > 0 && (
                <span>{selectedVersions.length}/2 versions selected for comparison</span>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              
              {selectedVersions.length === 2 && (
                <Button onClick={handleCompare}>
                  Compare Versions
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
