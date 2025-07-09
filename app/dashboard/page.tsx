'use client'
import Link from 'next/link'
import { PlusIcon, LinkIcon, PencilIcon, EyeIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { Card, CardContent } from '@/components/ui/card'

export default function DashboardHomePage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section - Static */}
      <section>
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
          Welcome to Release Notes Generator
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Ready to generate some awesome release notes?
        </p>
      </section>

      {/* Quick Actions Card - Always visible and server-rendered */}
      <section>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-2 md:mb-0 md:mr-6">Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                <Link href="/dashboard/releases/new/ai" className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                  <PlusIcon className="w-4 h-4 mr-1" /> Create Release Note
                </Link>
                <Link href="/dashboard/configuration" className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                  <LinkIcon className="w-4 h-4 mr-1" /> Setup Integration
                </Link>
                <Link href="/dashboard/ai-context" className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                  <PencilIcon className="w-4 h-4 mr-1" /> AI Context Settings
                </Link>
                <Link href="/dashboard/templates" className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                  <EyeIcon className="w-4 h-4 mr-1" /> Template Management
                </Link>
                <a href="mailto:help@releasenote.ai" className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                  <UserGroupIcon className="w-4 h-4 mr-1" /> Support & Help
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Static placeholder content */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Recent Release Notes</h2>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <EyeIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-center">No release notes created yet.</p>
            <Link href="/dashboard/releases/start" className="inline-flex items-center px-4 py-2 rounded-md bg-primary-600 text-white font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors">
              <PlusIcon className="w-4 h-4 mr-2" /> Create your first one
            </Link>
          </CardContent>
        </Card>
        <div className="mt-6 text-right">
          <Link href="/dashboard/releases" className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 hover:underline">
            View all release notes →
          </Link>
        </div>
      </section>

      {/* Static integrations section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Integrations Status</h2>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LinkIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-center">No integrations connected yet.</p>
            <Link href="/dashboard/configuration" className="inline-flex items-center px-4 py-2 rounded-md bg-primary-600 text-white font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors">
              <PlusIcon className="w-4 h-4 mr-2" /> Connect your first integration
            </Link>
          </CardContent>
        </Card>
        <div className="mt-6 text-right">
          <Link href="/dashboard/configuration" className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 hover:underline">
            Manage integrations →
          </Link>
        </div>
      </section>

      {/* Getting Started Checklist */}
      <section>
        <Card>
          <div className="p-6 pb-0">
            <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Getting Started Checklist</h2>
          </div>
          <CardContent>
            <ol className="space-y-3">
              <li className="flex items-center">
                <span className="mr-2">
                  <LinkIcon className="w-5 h-5 text-primary-500" />
                </span>
                <span className="flex-1">Connect an integration (Jira, GitHub, etc.)</span>
                <Link href="/dashboard/configuration" className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 ml-2">Setup</Link>
              </li>
              <li className="flex items-center">
                <span className="mr-2">
                  <PencilIcon className="w-5 h-5 text-primary-500" />
                </span>
                <span className="flex-1">Configure your AI Context</span>
                <Link href="/dashboard/ai-context" className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 ml-2">Configure</Link>
              </li>
              <li className="flex items-center">
                <span className="mr-2">
                  <PlusIcon className="w-5 h-5 text-primary-500" />
                </span>
                <span className="flex-1">Create your first Release Note</span>
                <Link href="/dashboard/releases/new/ai" className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 ml-2">Create</Link>
              </li>
              <li className="flex items-center">
                <span className="mr-2">
                  <EyeIcon className="w-5 h-5 text-primary-500" />
                </span>
                <span className="flex-1">Explore and manage Templates</span>
                <Link href="/dashboard/templates" className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 ml-2">Templates</Link>
              </li>
            </ol>
            <div className="mt-4 text-right">
              <a href="mailto:help@releasenote.ai" className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                <UserGroupIcon className="w-4 h-4 mr-1" /> Need help? Contact Support
              </a>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}