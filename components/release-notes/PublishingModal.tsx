'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, ClockIcon, GlobeIcon, SendIcon, EyeIcon } from 'lucide-react'
import { format } from 'date-fns'
import type { ReleaseNote } from '@/types/database'

interface PublishingModalProps {
  open: boolean
  onClose: () => void
  releaseNote: ReleaseNote
  onPublish: (data: PublishingData) => Promise<void>
}

interface PublishingData {
  status: 'published' | 'scheduled'
  scheduledAt?: Date
  metaTitle?: string
  metaDescription?: string
  tags?: string[]
  notifySubscribers?: boolean
  socialShare?: boolean
}

export function PublishingModal({ open, onClose, releaseNote, onPublish }: PublishingModalProps) {
  const [publishingData, setPublishingData] = useState<PublishingData>({
    status: 'published',
    metaTitle: releaseNote.title || '',
    metaDescription: '',
    tags: [],
    notifySubscribers: true,
    socialShare: false
  })
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [timeInput, setTimeInput] = useState('12:00')
  const [tagInput, setTagInput] = useState('')

  const handlePublish = async () => {
    setLoading(true)
    try {
      await onPublish(publishingData)
      onClose()
    } catch (error) {
      console.error('Publishing failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSchedule = async () => {
    if (!selectedDate) return
    
    const [hours, minutes] = timeInput.split(':').map(Number)
    const scheduledDateTime = new Date(selectedDate)
    scheduledDateTime.setHours(hours, minutes)
    
    setLoading(true)
    try {
      await onPublish({
        ...publishingData,
        status: 'scheduled',
        scheduledAt: scheduledDateTime
      })
      onClose()
    } catch (error) {
      console.error('Scheduling failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !publishingData.tags?.includes(tagInput.trim())) {
      setPublishingData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setPublishingData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }))
  }

  const isScheduleValid = selectedDate && selectedDate > new Date()

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GlobeIcon className="w-5 h-5" />
            Publish Release Note
          </DialogTitle>
          <DialogDescription>
            Configure publishing settings for &quot;{releaseNote.title}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Publishing Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Publishing Options</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={publishingData.status === 'published' ? 'default' : 'outline'}
                onClick={() => setPublishingData(prev => ({ ...prev, status: 'published' }))}
                className="h-20 flex-col"
              >
                <SendIcon className="w-6 h-6 mb-2" />
                Publish Now
              </Button>
              
              <Button
                variant={publishingData.status === 'scheduled' ? 'default' : 'outline'}
                onClick={() => setPublishingData(prev => ({ ...prev, status: 'scheduled' }))}
                className="h-20 flex-col"
              >
                <ClockIcon className="w-6 h-6 mb-2" />
                Schedule
              </Button>
            </div>
          </div>

          {/* Schedule Date/Time */}
          {publishingData.status === 'scheduled' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Schedule Publishing</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={timeInput}
                    onChange={(e) => setTimeInput(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* SEO & Metadata */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">SEO & Metadata</h3>
            
            <div>
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input
                id="metaTitle"
                value={publishingData.metaTitle}
                onChange={(e) => setPublishingData(prev => ({ ...prev, metaTitle: e.target.value }))}
                placeholder="SEO title for search engines"
                maxLength={60}
              />
              <p className="text-xs text-gray-500 mt-1">
                {publishingData.metaTitle?.length || 0}/60 characters
              </p>
            </div>
            
            <div>
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={publishingData.metaDescription}
                onChange={(e) => setPublishingData(prev => ({ ...prev, metaDescription: e.target.value }))}
                placeholder="Brief description for search engines and social media"
                maxLength={160}
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                {publishingData.metaDescription?.length || 0}/160 characters
              </p>
            </div>
            
            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tags..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              
              {publishingData.tags && publishingData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {publishingData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notification Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notifications</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifySubscribers">Notify Subscribers</Label>
                <p className="text-sm text-gray-500">Send email notifications to subscribers</p>
              </div>
              <Switch
                id="notifySubscribers"
                checked={publishingData.notifySubscribers}
                onCheckedChange={(checked) => 
                  setPublishingData(prev => ({ ...prev, notifySubscribers: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="socialShare">Social Media Share</Label>
                <p className="text-sm text-gray-500">Generate social media posts</p>
              </div>
              <Switch
                id="socialShare"
                checked={publishingData.socialShare}
                onCheckedChange={(checked) => 
                  setPublishingData(prev => ({ ...prev, socialShare: checked }))
                }
              />
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Preview</h3>
            
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="space-y-2">
                <h4 className="font-medium text-blue-600">
                  {publishingData.metaTitle || releaseNote.title}
                </h4>
                <p className="text-sm text-gray-600">
                  {publishingData.metaDescription || 'No description provided'}
                </p>
                <p className="text-xs text-green-600">
                  https://yoursite.com/release-notes/{releaseNote.slug}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => {/* Open preview in new tab */}}
            >
              <EyeIcon className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </div>
          
          <div className="flex gap-2">
            {publishingData.status === 'published' ? (
              <Button 
                onClick={handlePublish} 
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                <SendIcon className="w-4 h-4 mr-2" />
                {loading ? 'Publishing...' : 'Publish Now'}
              </Button>
            ) : (
              <Button 
                onClick={handleSchedule} 
                disabled={loading || !isScheduleValid}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ClockIcon className="w-4 h-4 mr-2" />
                {loading ? 'Scheduling...' : 'Schedule'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
