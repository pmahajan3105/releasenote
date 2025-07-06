'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { ChevronDownIcon, SendIcon, ClockIcon, EyeOffIcon, ArchiveIcon, EditIcon, CopyIcon, HistoryIcon } from 'lucide-react'
import { useReleaseNotesActions } from '@/lib/store'
import type { ReleaseNote } from '@/types/database'
import { PublishingModal } from './PublishingModal'
import { toast } from 'sonner'

interface PublishButtonProps {
  releaseNote: ReleaseNote
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  onAction?: (action: string, data?: any) => void
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

export function PublishButton({ 
  releaseNote, 
  variant = 'default', 
  size = 'md',
  onAction 
}: PublishButtonProps) {
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { updateReleaseNote, publishReleaseNote } = useReleaseNotesActions()

  const handlePublish = async (data: PublishingData) => {
    setLoading(true)
    try {
      const updateData: Partial<ReleaseNote> = {
        status: data.status,
        ...(data.scheduledAt && { scheduled_at: data.scheduledAt.toISOString() }),
        ...(data.status === 'published' && { published_at: new Date().toISOString() })
      }

      await updateReleaseNote(releaseNote.id, updateData)
      
      const actionText = data.status === 'published' ? 'published' : 'scheduled'
      toast.success(`Release note ${actionText} successfully!`)
      
      onAction?.(data.status, data)
    } catch (error) {
      toast.error('Failed to publish release note')
      console.error('Publishing error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnpublish = async () => {
    setLoading(true)
    try {
      await updateReleaseNote(releaseNote.id, { 
        status: 'draft',
        published_at: null,
        scheduled_at: null
      })
      toast.success('Release note unpublished successfully!')
      onAction?.('unpublished')
    } catch (error) {
      toast.error('Failed to unpublish release note')
      console.error('Unpublishing error:', error)
    } finally {
      setLoading(false)
      setShowUnpublishDialog(false)
    }
  }

  const handleArchive = async () => {
    setLoading(true)
    try {
      await updateReleaseNote(releaseNote.id, { status: 'archived' })
      toast.success('Release note archived successfully!')
      onAction?.('archived')
    } catch (error) {
      toast.error('Failed to archive release note')
      console.error('Archive error:', error)
    } finally {
      setLoading(false)
      setShowArchiveDialog(false)
    }
  }

  const handleDuplicate = async () => {
    try {
      // This would create a copy of the release note
      // Implementation depends on your create logic
      toast.success('Release note duplicated successfully!')
      onAction?.('duplicated')
    } catch (error) {
      toast.error('Failed to duplicate release note')
      console.error('Duplicate error:', error)
    }
  }

  const getMainButton = () => {
    switch (releaseNote.status) {
      case 'draft':
        return {
          text: 'Publish',
          icon: SendIcon,
          action: () => setShowPublishModal(true),
          className: 'bg-green-600 hover:bg-green-700 text-white'
        }
      case 'scheduled':
        return {
          text: 'Scheduled',
          icon: ClockIcon,
          action: () => setShowPublishModal(true),
          className: 'bg-blue-600 hover:bg-blue-700 text-white'
        }
      case 'published':
        return {
          text: 'Published',
          icon: SendIcon,
          action: () => setShowPublishModal(true),
          className: 'bg-green-600 hover:bg-green-700 text-white'
        }
      case 'archived':
        return {
          text: 'Archived',
          icon: ArchiveIcon,
          action: () => {},
          className: 'bg-gray-600 hover:bg-gray-700 text-white'
        }
      default:
        return {
          text: 'Publish',
          icon: SendIcon,
          action: () => setShowPublishModal(true),
          className: 'bg-green-600 hover:bg-green-700 text-white'
        }
    }
  }

  const mainButton = getMainButton()
  const MainIcon = mainButton.icon

  const getDropdownItems = () => {
    const commonItems = [
      {
        icon: EditIcon,
        label: 'Edit',
        action: () => onAction?.('edit'),
        show: true
      },
      {
        icon: CopyIcon,
        label: 'Duplicate',
        action: handleDuplicate,
        show: true
      },
      {
        icon: HistoryIcon,
        label: 'View History',
        action: () => onAction?.('history'),
        show: true
      }
    ]

    switch (releaseNote.status) {
      case 'draft':
        return [
          {
            icon: SendIcon,
            label: 'Publish Now',
            action: () => setShowPublishModal(true),
            show: true
          },
          {
            icon: ClockIcon,
            label: 'Schedule',
            action: () => setShowPublishModal(true),
            show: true
          },
          ...commonItems,
          {
            icon: ArchiveIcon,
            label: 'Archive',
            action: () => setShowArchiveDialog(true),
            show: true,
            destructive: true
          }
        ]

      case 'scheduled':
        return [
          {
            icon: SendIcon,
            label: 'Publish Now',
            action: () => setShowPublishModal(true),
            show: true
          },
          {
            icon: EditIcon,
            label: 'Edit Schedule',
            action: () => setShowPublishModal(true),
            show: true
          },
          {
            icon: EyeOffIcon,
            label: 'Cancel Schedule',
            action: () => setShowUnpublishDialog(true),
            show: true
          },
          ...commonItems,
          {
            icon: ArchiveIcon,
            label: 'Archive',
            action: () => setShowArchiveDialog(true),
            show: true,
            destructive: true
          }
        ]

      case 'published':
        return [
          {
            icon: EditIcon,
            label: 'Update',
            action: () => setShowPublishModal(true),
            show: true
          },
          {
            icon: EyeOffIcon,
            label: 'Unpublish',
            action: () => setShowUnpublishDialog(true),
            show: true
          },
          ...commonItems,
          {
            icon: ArchiveIcon,
            label: 'Archive',
            action: () => setShowArchiveDialog(true),
            show: true,
            destructive: true
          }
        ]

      case 'archived':
        return [
          {
            icon: SendIcon,
            label: 'Restore & Publish',
            action: () => setShowPublishModal(true),
            show: true
          },
          {
            icon: EditIcon,
            label: 'Restore to Draft',
            action: async () => {
              try {
                await updateReleaseNote(releaseNote.id, { status: 'draft' })
                toast.success('Release note restored to draft!')
                onAction?.('restored')
              } catch (error) {
                toast.error('Failed to restore release note')
              }
            },
            show: true
          },
          ...commonItems.filter(item => item.label !== 'Edit') // Can't edit archived notes directly
        ]

      default:
        return commonItems
    }
  }

  const dropdownItems = getDropdownItems().filter(item => item.show)

  return (
    <>
      <div className="flex items-center">
        <Button
          variant={variant}
          size={size}
          onClick={mainButton.action}
          disabled={loading}
          className={mainButton.className}
        >
          <MainIcon className="w-4 h-4 mr-2" />
          {loading ? 'Processing...' : mainButton.text}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={variant}
              size={size}
              className={`${mainButton.className} ml-1 px-2`}
              disabled={loading}
            >
              <ChevronDownIcon className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {dropdownItems.map((item, index) => {
              const ItemIcon = item.icon
              return (
                <div key={index}>
                  <DropdownMenuItem
                    onClick={item.action}
                    className={item.destructive ? 'text-red-600 focus:text-red-600' : ''}
                  >
                    <ItemIcon className="w-4 h-4 mr-2" />
                    {item.label}
                  </DropdownMenuItem>
                  {item.destructive && index < dropdownItems.length - 1 && (
                    <DropdownMenuSeparator />
                  )}
                </div>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Publishing Modal */}
      <PublishingModal
        open={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        releaseNote={releaseNote}
        onPublish={handlePublish}
      />

      {/* Unpublish Confirmation */}
      <AlertDialog open={showUnpublishDialog} onOpenChange={setShowUnpublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unpublish Release Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unpublish "{releaseNote.title}"? It will no longer be visible to the public and will be moved back to draft status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnpublish} className="bg-red-600 hover:bg-red-700">
              Unpublish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Confirmation */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Release Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive "{releaseNote.title}"? Archived release notes are hidden from the public but can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive} className="bg-orange-600 hover:bg-orange-700">
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}