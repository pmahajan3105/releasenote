'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { PlusIcon, LinkIcon, PencilIcon, EyeIcon, WifiIcon, ArrowPathIcon, UserGroupIcon } from '@heroicons/react/24/outline'

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
  const { user, plan, loading: authLoading } = useAuth()
  const [quickStats, setQuickStats] = useState<{notes: number; subscribers: number; views: number; latestDate: string | null}>({ notes: 0, subscribers: 0, views: 0, latestDate: null })
  const [recentNotes, setRecentNotes] = useState<RecentNote[]>([])
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingNotes, setLoadingNotes] = useState(true)
  const [loadingIntegrations, setLoadingIntegrations] = useState(true)

  // TODO: Implement data fetching for stats, notes, and integrations in useEffect
  useEffect(() => {
    // Simulate fetching data
    const fetchData = async () => {
      setLoadingStats(true)
      setLoadingNotes(true)
      setLoadingIntegrations(true)
      await new Promise(res => setTimeout(res, 1500)) // Simulate network delay

      // Mock data - replace with actual Supabase calls
      setQuickStats({ notes: 12, subscribers: 45, views: 1234, latestDate: '2024-04-01' })
      setRecentNotes([
        { id: '1', title: 'April Feature Update', status: 'published', published_at: '2024-04-01', slug: 'april-feature-update' },
        { id: '2', title: 'March Bug Fixes', status: 'published', published_at: '2024-03-15', slug: 'march-bug-fixes' },
        { id: '3', title: 'Q2 Roadmap Preview (Draft)', status: 'draft', slug: 'q2-roadmap-preview' },
      ])
      setIntegrations([
        { id: 'int1', type: 'jira', status: 'connected', last_synced: '2024-04-05T10:00:00Z', name: 'your-company.atlassian.net' },
        { id: 'int2', type: 'github', status: 'error', name: 'your-org/your-repo' },
      ])

      setLoadingStats(false)
      setLoadingNotes(false)
      setLoadingIntegrations(false)
    }

    if (!authLoading && user) {
      fetchData()
    }
  }, [authLoading, user])

  const getPlanName = (planId: string | null) => {
    if (planId === 'paid') return 'Paid Plan'
    return 'Free Plan'
  }

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/notes/${user?.id}/${slug}` // Adjust org slug logic later
    navigator.clipboard.writeText(url)
      .then(() => alert('Link copied to clipboard!')) // Replace with a proper toast notification later
      .catch(err => console.error('Failed to copy link: ', err))
  }

  const userName = user?.email?.split('@')[0] || 'there' // Simple name extraction

  // Determine if user is new (needs Getting Started guide)
  // TODO: Refine this logic based on actual user progress (e.g., integrations connected, first note published)
  const isNewUser = integrations.length === 0

  return (
    <div className="space-y-8">
      {/* 1. Welcome Section */}
      <section>
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
          Welcome back, {userName}!
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          You are currently on the <span className="font-semibold text-primary-600 dark:text-primary-400">{getPlanName(plan)}</span>.
          Ready to generate some awesome release notes?
        </p>
      </section>

      {/* Quick Actions - Placed near the top for visibility */} 
      <section className="flex flex-wrap gap-4">
        <Link
          href="/releases/start" // Changed from /releases/new
          className="inline-flex items-center gap-x-2 rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        >
          <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
          Create New Release Notes
        </Link>
        {integrations.length === 0 && !loadingIntegrations && (
          <Link
            href="/configuration" // Route for integrations setup
            className="inline-flex items-center gap-x-2 rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-600"
          >
            <WifiIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
            Connect Integration
          </Link>
        )}
        <Link
          href="/subscribers" // Route for subscriber management
          className="inline-flex items-center gap-x-2 rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-600"
        >
          <UserGroupIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
          Manage Subscribers
        </Link>
      </section>

      {/* 2. Quick Stats Panel */} 
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Quick Stats</h2>
        {loadingStats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-24 rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Stat Card Example */} 
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 dark:bg-gray-800">
              <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Published Notes</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">{quickStats.notes}</dd>
            </div>
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 dark:bg-gray-800">
              <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Subscribers</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">{quickStats.subscribers}</dd>
            </div>
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 dark:bg-gray-800">
              <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Total Views (Coming Soon)</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">{quickStats.views}</dd>
            </div>
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 dark:bg-gray-800">
              <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Latest Release</dt>
              <dd className="mt-1 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                {quickStats.latestDate ? new Date(quickStats.latestDate).toLocaleDateString() : 'N/A'}
              </dd>
            </div>
          </div>
        )}
      </section>

      {/* 3. Recent Release Notes */} 
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Recent Release Notes</h2>
        {loadingNotes ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
               <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 rounded-lg"></div>
            ))}
          </div>
        ) : recentNotes.length > 0 ? (
          <div className="overflow-hidden bg-white shadow sm:rounded-md dark:bg-gray-800">
            <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentNotes.map((note) => (
                <li key={note.id}>
                  <div className="block hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-medium text-primary-600 dark:text-primary-400">
                        <Link href={`/releases/${note.slug}`}>{note.title}</Link>
                      </p>
                      <div className="ml-2 flex flex-shrink-0">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${note.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}
                        >
                          {note.status.charAt(0).toUpperCase() + note.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          {note.status === 'published' && note.published_at ? 
                           `Published on ${new Date(note.published_at).toLocaleDateString()}` : 'Draft'}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center space-x-3 text-sm text-gray-500 sm:mt-0">
                         <button onClick={() => copyLink(note.slug)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                           <LinkIcon className="h-5 w-5" aria-hidden="true" />
                           <span className="sr-only">Copy link</span>
                         </button>
                         <Link href={`/releases/edit/${note.slug}`} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"> {/* Adjust edit route */}
                           <PencilIcon className="h-5 w-5" aria-hidden="true" />
                           <span className="sr-only">Edit</span>
                         </Link>
                         <Link href={`/notes/${user?.id}/${note.slug}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"> {/* Adjust view route */}
                           <EyeIcon className="h-5 w-5" aria-hidden="true" />
                           <span className="sr-only">View</span>
                         </Link>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-500 dark:text-gray-400">No release notes created yet.</p>
            <Link href="/releases/new" className="mt-2 inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
              Create your first one
              <span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>
        )}
         <div className="mt-4 text-right">
            <Link href="/releases" className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
              View all release notes
            </Link>
         </div>
      </section>

      {/* 5. Integrations Status */} 
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Integrations Status</h2>
         {loadingIntegrations ? (
           <div className="space-y-4">
             {[...Array(1)].map((_, i) => (
               <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 rounded-lg"></div>
            ))}
           </div>
        ) : integrations.length > 0 ? (
          <div className="overflow-hidden bg-white shadow sm:rounded-md dark:bg-gray-800">
            <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
              {integrations.map((integration) => (
                <li key={integration.id}>
                  <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {integration.type.charAt(0).toUpperCase() + integration.type.slice(1)}: <span className="font-normal text-gray-700 dark:text-gray-300">{integration.name}</span>
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Last synced: {integration.last_synced ? new Date(integration.last_synced).toLocaleString() : 'Never'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                       <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${integration.status === 'connected' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}
                        >
                          {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                        </span>
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <ArrowPathIcon className="h-5 w-5" aria-hidden="true" />
                        <span className="sr-only">Refresh</span>
                      </button>
                       {/* TODO: Add configure/disconnect button linked to /configuration */} 
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-500 dark:text-gray-400">No integrations connected yet.</p>
            <Link href="/configuration" className="mt-2 inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
              Connect your first integration
              <span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>
        )}
         <div className="mt-4 text-right">
            <Link href="/configuration" className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
              Manage integrations
            </Link>
         </div>
      </section>

      {/* 6. Getting Started Guide (Conditional) */}
      {isNewUser && (
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Getting Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {/* Placeholder Cards */}
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white">1. Connect Integration</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Link your Jira or GitHub account to start fetching tickets.</p>
                <Link href="/configuration" className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                  Connect now &rarr;
                </Link>
             </div>
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 opacity-50"> {/* Example disabled state */}
                <h3 className="font-semibold text-gray-900 dark:text-white">2. Create Release Notes</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Generate your first set of release notes from your tickets.</p>
             </div>
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 opacity-50"> {/* Example disabled state */}
                <h3 className="font-semibold text-gray-900 dark:text-white">3. Publish & Share</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Publish your notes to a public page or email subscribers.</p>
             </div>
          </div>
           {/* TODO: Add a dismiss button */}
        </section>
      )}
    </div>
  )
} 