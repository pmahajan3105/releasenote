import Link from 'next/link'
import { PlusIcon, LinkIcon, PencilIcon, EyeIcon, WifiIcon, ArrowPathIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardClientWrapper } from '@/components/dashboard/dashboard-client-wrapper'

// Define types for data placeholders (will be refined later)
type RecentNote = {
  id: string
  title: string
  status: 'draft' | 'published'
  published_at?: string | null
  slug: string
}

type IntegrationStatus = {
  id: string
  type: 'jira' | 'github' // Add more as needed
  status: 'connected' | 'error' | 'disconnected'
  last_synced?: string | null
  name: string // e.g., Jira domain or GitHub org/repo
}

export default function DashboardHomePage() {
  return (
    <DashboardClientWrapper>
      <DashboardContent />
    </DashboardClientWrapper>
  )
}

function DashboardContent() {
  return (
    <div className="space-y-8">
      {/* Quick Actions Card - Always visible */}
      <section>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-2 md:mb-0 md:mr-6">Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
            <Link href="/releases/new/ai" className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
              <PlusIcon className="w-4 h-4 mr-1" /> Create Release Note
            </Link>
            <Link href="/configuration" className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
              <LinkIcon className="w-4 h-4 mr-1" /> Setup Integration
            </Link>
            <Link href="/ai-context" className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
              <PencilIcon className="w-4 h-4 mr-1" /> AI Context Settings
            </Link>
            <Link href="/templates" className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
              <EyeIcon className="w-4 h-4 mr-1" /> Template Management
            </Link>
            <Link href="/support" className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
              <UserGroupIcon className="w-4 h-4 mr-1" /> Support & Help
            </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
} 