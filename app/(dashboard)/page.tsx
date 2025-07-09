import Link from 'next/link'
import { PlusIcon, LinkIcon, PencilIcon, EyeIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import dynamic from 'next/dynamic'

// Dynamically import the client wrapper to avoid SSR issues
const DashboardClientContent = dynamic(() => import('@/components/dashboard/dashboard-client-content'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-xl" />
})

export default function DashboardHomePage() {
  return (
    <div className="space-y-8">
      {/* Quick Actions Card - Always visible and server-rendered */}
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

      {/* Client-side content loaded dynamically */}
      <DashboardClientContent />
    </div>
  )
} 