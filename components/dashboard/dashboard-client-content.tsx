'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuthStore, useAuthSelectors } from '@/lib/store'
import { PlusIcon, LinkIcon, PencilIcon, EyeIcon, WifiIcon, ArrowPathIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { createClientComponentClient } from '@/lib/supabase/ssr'
import { toast } from '@/lib/toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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

export default function DashboardClientContent() {
  const user = useAuthStore((state) => state.user)
  const { plan, isLoading: authLoading } = useAuthSelectors()
  const supabase = createClientComponentClient()
  const orgId = user?.id  // Organization context derived from auth user

  const [recentNotes, setRecentNotes] = useState<RecentNote[]>([])
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([])

  const [loadingNotes, setLoadingNotes] = useState(true)
  const [loadingIntegrations, setLoadingIntegrations] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!orgId) return  // Guard: ensure orgId is available

      setLoadingNotes(true)
      setLoadingIntegrations(true)

      try {
        // Fetch recent notes
        const { data: notesData, error: notesError } = await supabase
          .from('release_notes')
          .select('id, title, status, published_at, slug')
          .eq('organization_id', orgId)
          .order('updated_at', { ascending: false })
          .limit(5)

        if (!notesError && notesData) {
          setRecentNotes(notesData)
        }

        // Fetch integrations
        const { data: integrationsData, error: integrationsError } = await supabase
          .from('integrations')
          .select('id, type, status, last_synced, name')
          .eq('organization_id', orgId)

        if (!integrationsError && integrationsData) {
          setIntegrations(integrationsData)
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoadingNotes(false)
        setLoadingIntegrations(false)
      }
    }

    if (!authLoading && user) {
      fetchData()
    }
  }, [authLoading, user, orgId, supabase])

  const getPlanName = (planId: string | null) => {
    if (planId === 'paid') return 'Paid Plan'
    return 'Free Plan'
  }

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/notes/${user?.id}/${slug}` // Adjust org slug logic later
    navigator.clipboard.writeText(url)
      .then(() => toast.success('Link copied to clipboard!'))
      .catch(err => {
        console.error('Failed to copy link: ', err)
        toast.error('Failed to copy link')
      })
  }

  const userName = user?.email?.split('@')[0] || 'there' // Simple name extraction

  // Determine if user is new (needs Getting Started guide)
  const isNewUser = integrations.length === 0 && recentNotes.length === 0

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


      {/* 3. Recent Release Notes */} 
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Recent Release Notes</h2>
        {loadingNotes ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
               <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 rounded-xl"></div>
            ))}
          </div>
        ) : recentNotes.length > 0 ? (
          <Card>
            <CardContent className="p-0">
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
                         <Link href={`/releases/edit/${note.slug}`} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                           <PencilIcon className="h-5 w-5" aria-hidden="true" />
                           <span className="sr-only">Edit</span>
                         </Link>
                         <Link href={`/notes/${user?.id}/${note.slug}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                           <EyeIcon className="h-5 w-5" aria-hidden="true" />
                           <span className="sr-only">View</span>
                         </Link>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
              </ul>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <EyeIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4 text-center">No release notes created yet.</p>
              <Link href="/releases/new" className="inline-flex items-center px-4 py-2 rounded-md bg-primary-600 text-white font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors">
                <PlusIcon className="w-4 h-4 mr-2" /> Create your first one
              </Link>
            </CardContent>
          </Card>
        )}
         <div className="mt-6 text-right">
            <Link href="/releases" className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 hover:underline">
              View all release notes →
            </Link>
         </div>
      </section>

      {/* 5. Integrations Status */} 
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Integrations Status</h2>
         {loadingIntegrations ? (
           <div className="space-y-4">
             {[...Array(1)].map((_, i) => (
               <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 rounded-xl"></div>
            ))}
           </div>
        ) : integrations.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
              {integrations.map((integration) => (
                <li key={integration.id}>
                  <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {integration.type.charAt(0).toUpperCase() + integration.type.slice(1)}: <span className="font-normal text-gray-700 dark:text-gray-300">{integration.name}</span>
                        </p>
                        <span className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          integration.status === 'connected' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          integration.status === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                        </span>
                      </div>
                      {integration.last_synced && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Last synced: {new Date(integration.last_synced).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          // Refresh integration
                          console.log('Refreshing integration:', integration.id)
                        }}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                        title="Refresh connection"
                      >
                        <ArrowPathIcon className="h-4 w-4" />
                      </button>
                      <Link 
                        href="/configuration" 
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                        title="Configure"
                      >
                        <WifiIcon className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
              </ul>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <LinkIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4 text-center">No integrations connected yet.</p>
              <Link href="/configuration" className="inline-flex items-center px-4 py-2 rounded-md bg-primary-600 text-white font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors">
                <PlusIcon className="w-4 h-4 mr-2" /> Connect your first integration
              </Link>
            </CardContent>
          </Card>
        )}
         <div className="mt-6 text-right">
            <Link href="/configuration" className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 hover:underline">
              Manage integrations →
            </Link>
         </div>
      </section>

      {/* Onboarding/Welcome State for New Users */}
      {isNewUser && (
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Getting Started Checklist</CardTitle>
            </CardHeader>
            <CardContent>
            <ol className="space-y-3">
              <li className="flex items-center">
                <span className="mr-2">
                  <LinkIcon className="w-5 h-5 text-primary-500" />
                </span>
                <span className="flex-1">Connect an integration (Jira, GitHub, etc.)</span>
                <Link href="/configuration" className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 ml-2">Setup</Link>
              </li>
              <li className="flex items-center">
                <span className="mr-2">
                  <PencilIcon className="w-5 h-5 text-primary-500" />
                </span>
                <span className="flex-1">Configure your AI Context</span>
                <Link href="/ai-context" className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 ml-2">Configure</Link>
              </li>
              <li className="flex items-center">
                <span className="mr-2">
                  <PlusIcon className="w-5 h-5 text-primary-500" />
                </span>
                <span className="flex-1">Create your first Release Note</span>
                <Link href="/releases/new/ai" className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 ml-2">Create</Link>
              </li>
              <li className="flex items-center">
                <span className="mr-2">
                  <EyeIcon className="w-5 h-5 text-primary-500" />
                </span>
                <span className="flex-1">Explore and manage Templates</span>
                <Link href="/templates" className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 ml-2">Templates</Link>
              </li>
            </ol>
              <div className="mt-4 text-right">
                <Link href="/support" className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                  <UserGroupIcon className="w-4 h-4 mr-1" /> Need help? Contact Support
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  )
}