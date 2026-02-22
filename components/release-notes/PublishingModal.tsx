'use client'

import { useEffect, useMemo, useState } from 'react'
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
import { toast } from 'sonner'
import { isSafeLinkHref } from '@/lib/url-safety'
import { isUnsafeAttributeName, isUnsafeAttributeValue } from '@/lib/sanitize-policies'

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

type PrePublishCheck = {
  id: string
  level: 'pass' | 'warning' | 'error'
  message: string
}

function plainTextFromHtml(input: string): string {
  return input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function sectionHasListItems(html: string, sectionName: string): boolean {
  const pattern = new RegExp(`<h2[^>]*>\\s*${sectionName}\\s*<\\/h2>([\\s\\S]*?)(<h2|$)`, 'i')
  const match = html.match(pattern)
  if (!match) {
    return true
  }
  return /<li[\s>]/i.test(match[1] || '')
}

function extractAnchorHrefs(html: string): string[] {
  if (!html.trim()) {
    return []
  }

  const doc = new DOMParser().parseFromString(html, 'text/html')
  return Array.from(doc.querySelectorAll('a[href]'))
    .map((anchor) => anchor.getAttribute('href')?.trim() || '')
    .filter(Boolean)
}

function hasUnsafeMarkupSignals(html: string): boolean {
  if (!html.trim()) {
    return false
  }

  const doc = new DOMParser().parseFromString(html, 'text/html')
  const blockedSelectors = ['script', 'style', 'iframe', 'object', 'embed', 'form', 'meta']

  if (blockedSelectors.some((selector) => doc.querySelector(selector))) {
    return true
  }

  for (const element of Array.from(doc.querySelectorAll('*'))) {
    for (const attr of Array.from(element.attributes)) {
      if (isUnsafeAttributeName(attr.name)) {
        return true
      }

      if (isUnsafeAttributeValue(attr.name, attr.value)) {
        return true
      }
    }
  }

  return false
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
  const [subscriberCount, setSubscriberCount] = useState(0)
  const [loadingSubscribers, setLoadingSubscribers] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [sendingTestEmail, setSendingTestEmail] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }

    setLoadingSubscribers(true)
    fetch('/api/subscribers')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to load subscribers')
        }
        const data = (await response.json()) as {
          subscribers?: Array<{ status?: string }>
          total?: number
        }
        const activeCount = (data.subscribers ?? []).filter(
          (subscriber) => subscriber.status === 'active'
        ).length

        if (Array.isArray(data.subscribers)) {
          setSubscriberCount(activeCount)
          return
        }

        setSubscriberCount(typeof data.total === 'number' ? data.total : 0)
      })
      .catch(() => {
        setSubscriberCount(0)
      })
      .finally(() => {
        setLoadingSubscribers(false)
      })
  }, [open])

  const checks = useMemo<PrePublishCheck[]>(() => {
    const nextChecks: PrePublishCheck[] = []
    const title = (releaseNote.title || '').trim()
    const html = releaseNote.content_html || ''
    const text = plainTextFromHtml(html)

    if (!title) {
      nextChecks.push({
        id: 'missing-title',
        level: 'error',
        message: 'Title is missing. Add a clear release note title before publishing.',
      })
    } else {
      nextChecks.push({
        id: 'title',
        level: 'pass',
        message: 'Title is present.',
      })
    }

    if (!text) {
      nextChecks.push({
        id: 'missing-content',
        level: 'error',
        message: 'Content is empty. Generate or write content before publishing.',
      })
    } else {
      nextChecks.push({
        id: 'content',
        level: 'pass',
        message: 'Content is present.',
      })
    }

    if (hasUnsafeMarkupSignals(html)) {
      nextChecks.push({
        id: 'unsafe-markup',
        level: 'error',
        message: 'Potentially unsafe markup detected in content.',
      })
    } else {
      nextChecks.push({
        id: 'unsafe-markup-pass',
        level: 'pass',
        message: 'No unsafe markup detected.',
      })
    }

    const firstParagraph = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1] || ''
    const firstParagraphText = plainTextFromHtml(firstParagraph)
    if (firstParagraphText.length > 320) {
      nextChecks.push({
        id: 'long-intro',
        level: 'warning',
        message: 'Intro paragraph is long. Consider trimming for better scan readability.',
      })
    }

    const invalidLinks = extractAnchorHrefs(html).filter((href) => !isSafeLinkHref(href))
    if (invalidLinks.length > 0) {
      nextChecks.push({
        id: 'invalid-links',
        level: 'warning',
        message: `Detected ${invalidLinks.length} link(s) that may be broken or malformed.`,
      })
    }

    const releaseSections = ['New Features', 'Improvements', 'Fixes', 'Breaking Changes']
    for (const section of releaseSections) {
      if (!sectionHasListItems(html, section)) {
        nextChecks.push({
          id: `empty-${section.toLowerCase().replace(/\s+/g, '-')}`,
          level: 'warning',
          message: `${section} section appears empty.`,
        })
      }
    }

    return nextChecks
  }, [releaseNote.content_html, releaseNote.title])

  const hasBlockingChecks = checks.some((check) => check.level === 'error')

  const handlePublish = async () => {
    if (hasBlockingChecks) {
      toast.error('Resolve blocking pre-publish checks before publishing.')
      return
    }

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
    if (hasBlockingChecks) {
      toast.error('Resolve blocking pre-publish checks before scheduling.')
      return
    }
    
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

  const handleSendTestEmail = async () => {
    const recipientEmail = testEmail.trim()
    if (!recipientEmail) {
      toast.error('Enter a recipient email for the test send.')
      return
    }

    setSendingTestEmail(true)
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail,
          testType: 'template',
        }),
      })

      const data = (await response.json().catch(() => ({}))) as {
        success?: boolean
        message?: string
        error?: string
      }

      if (!response.ok || data.success === false) {
        throw new Error(data.error || data.message || 'Failed to send test email')
      }

      toast.success(`Test email sent to ${recipientEmail}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send test email')
    } finally {
      setSendingTestEmail(false)
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

          {/* Pre-publish Checks */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Pre-publish Checks</h3>
            <div className="rounded-lg border border-[#e4e7ec] bg-[#f9fafb] p-4">
              <div className="mb-3 flex items-center gap-2">
                <Badge variant={hasBlockingChecks ? 'destructive' : 'secondary'}>
                  {hasBlockingChecks ? 'Blocking issues found' : 'Ready to publish'}
                </Badge>
              </div>
              <ul className="space-y-2 text-sm">
                {checks.map((check) => (
                  <li key={check.id} className="flex items-start gap-2">
                    <span
                      className={`mt-1 inline-block h-2.5 w-2.5 rounded-full ${
                        check.level === 'error'
                          ? 'bg-red-500'
                          : check.level === 'warning'
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }`}
                    />
                    <span>{check.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

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

            <div className="rounded-lg border border-[#e4e7ec] bg-[#f9fafb] p-3 text-sm text-[#475467]">
              {loadingSubscribers ? (
                <span>Loading subscriber count...</span>
              ) : (
                <span>
                  This release will notify <strong>{subscriberCount}</strong> active subscriber
                  {subscriberCount === 1 ? '' : 's'} if notifications are enabled.
                </span>
              )}
            </div>
            
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

            <div className="space-y-2 rounded-lg border border-[#e4e7ec] p-4">
              <Label htmlFor="testEmail">Send test email first</Label>
              <div className="flex gap-2">
                <Input
                  id="testEmail"
                  value={testEmail}
                  onChange={(event) => setTestEmail(event.target.value)}
                  placeholder="you@company.com"
                  type="email"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendTestEmail}
                  disabled={sendingTestEmail}
                >
                  {sendingTestEmail ? 'Sending...' : 'Send Test'}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Use this to verify template rendering and deliverability before notifying all subscribers.
              </p>
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
                disabled={loading || hasBlockingChecks}
                className="bg-green-600 hover:bg-green-700"
              >
                <SendIcon className="w-4 h-4 mr-2" />
                {loading ? 'Publishing...' : 'Publish Now'}
              </Button>
            ) : (
              <Button 
                onClick={handleSchedule} 
                disabled={loading || !isScheduleValid || hasBlockingChecks}
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
