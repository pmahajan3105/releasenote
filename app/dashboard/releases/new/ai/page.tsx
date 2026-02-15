'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/lib/store'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { GitHubReleaseGenerator } from '@/components/features/GitHubReleaseGenerator'
import { handleApiError } from '@/lib/error-handler-standard'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

// Define the Jira ticket type
type JiraTicket = {
  id: string
  key: string
  title: string
  description: string
  status: string
  type: string
  priority: string
  url: string
  assignee?: string
  created: string
  updated: string
}

// Define the Jira integration type
type JiraIntegration = {
  id: string
  type: 'jira'
  config: {
    domain: string
    projectKey: string
    filters?: {
      status?: string
      lookbackDays?: number
    }
  }
}

type JiraProjectResponse = {
  key: string
  name: string
}

// Define the form schema
const releaseNotesSchema = z.object({
  integrationId: z.string().min(1, 'Please select a Jira integration'),
  projectKey: z.string().min(1, 'Please select a Jira project'),
  status: z.enum(['open', 'closed', 'all']),
  lookbackDays: z.number().min(1, 'Must be at least 1 day').max(365, 'Cannot exceed 365 days'),
  title: z.string().min(1, 'Please enter a title for your release notes'),
  description: z.string().optional(),
})

type ReleaseNotesFormData = z.infer<typeof releaseNotesSchema>

// Renamed function to reflect its purpose
export default function AIReleaseNotePage() {
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])
  const [tickets, setTickets] = useState<JiraTicket[]>([])
  const [activeTab, setActiveTab] = useState<'github' | 'jira'>('github')
  const [integrations, setIntegrations] = useState<JiraIntegration[]>([])
  const [projects, setProjects] = useState<Array<{ key: string; name: string }>>([])
  const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(true)
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [isFetchingTickets, setIsFetchingTickets] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthStore()
  const supabase = createClientComponentClient()

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReleaseNotesFormData>({
    resolver: zodResolver(releaseNotesSchema),
    defaultValues: {
      status: 'closed' as const,
      lookbackDays: 30,
    },
  })

  // Watch for integration changes to load projects
  const selectedIntegrationId = watch('integrationId')

  // Load Jira integrations on component mount
  useEffect(() => {
    const loadIntegrations = async () => {
      try {
        const { data, error } = await supabase
          .from('integrations')
          .select('*')
          .eq('organization_id', user?.id)
          .eq('type', 'jira')

        if (error) throw error

        setIntegrations(data || [])
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load Jira integrations')
      } finally {
        setIsLoadingIntegrations(false)
      }
    }

    if (user) {
      loadIntegrations()
    }
  }, [user, supabase])

  // Load Jira projects when integration changes
  useEffect(() => {
    const loadProjects = async () => {
      if (!selectedIntegrationId) return

      setIsLoadingProjects(true)
      setError(null)

      try {
        const response = await fetch('/api/integrations/jira/projects')
        
        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Transform the API response to match the expected format
        const transformedProjects = data.projects?.map((project: JiraProjectResponse) => ({
          key: project.key,
          name: project.name
        })) || []
        
        setProjects(transformedProjects)
      } catch (error) {
        handleApiError(error, 'load Jira projects', 'AIReleaseNotePage')
        setError(error instanceof Error ? error.message : 'Failed to load Jira projects')
      } finally {
        setIsLoadingProjects(false)
      }
    }

    loadProjects()
  }, [selectedIntegrationId])

  // Handle integration selection
  const handleIntegrationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const integrationId = e.target.value
    setValue('integrationId', integrationId)
    
    // Reset project selection
    setValue('projectKey', '')
    
    // Clear tickets and selected tickets
    setTickets([])
    setSelectedTickets([])
  }

  // Fetch Jira tickets based on selected filters
  const fetchTickets = async () => {
    const formData = watch()
    setIsFetchingTickets(true)
    setError(null)
    setTickets([])
    setSelectedTickets([])

    try {
      if (!formData.projectKey) {
        setError('Please select a project first')
        return
      }

      // Build query parameters
      const params = new URLSearchParams()
      params.set('projectKey', formData.projectKey)
      params.set('maxResults', '50')
      params.set('startAt', '0')
      
      // Add status filter
      if (formData.status !== 'all') {
        const statusFilter = formData.status === 'closed' ? 'Done,Closed,Resolved' : 'Open,In Progress,To Do'
        params.set('statuses', statusFilter)
      }
      
      // Add lookback filter
      if (formData.lookbackDays) {
        const lookbackDate = new Date()
        lookbackDate.setDate(lookbackDate.getDate() - formData.lookbackDays)
        params.set('updatedSince', lookbackDate.toISOString().split('T')[0])
      }

      const response = await fetch(`/api/integrations/jira/issues?${params}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tickets: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Transform the API response to match the expected JiraTicket format
      const transformedTickets: JiraTicket[] = data.issues?.map((issue: {
        id: string
        key: string
        summary: string
        description?: string
        status: { name: string }
        issueType: { name: string }
        priority?: { name: string }
        url: string
        assignee?: { displayName?: string }
        created: string
        updated: string
      }) => ({
        id: issue.id,
        key: issue.key,
        title: issue.summary,
        description: issue.description || '',
        status: issue.status.name,
        type: issue.issueType.name,
        priority: issue.priority?.name || 'Medium',
        url: issue.url,
        assignee: issue.assignee?.displayName || 'Unassigned',
        created: issue.created,
        updated: issue.updated,
      })) || []
      
      setTickets(transformedTickets)
    } catch (error) {
      handleApiError(error, 'fetch Jira tickets', 'AIReleaseNotePage')
      setError(error instanceof Error ? error.message : 'Failed to fetch Jira tickets')
    } finally {
      setIsFetchingTickets(false)
    }
  }

  // Toggle ticket selection
  const toggleTicketSelection = (ticketId: string) => {
    setSelectedTickets((currentSelection) => (
      currentSelection.includes(ticketId)
        ? currentSelection.filter((id) => id !== ticketId)
        : [...currentSelection, ticketId]
    ))
  }

  // Select all tickets
  const selectAllTickets = () => {
    const allTicketIds = tickets.map(ticket => ticket.id)
    setSelectedTickets(allTicketIds)
  }

  // Deselect all tickets
  const deselectAllTickets = () => {
    setSelectedTickets([])
  }

  // Generate release notes (modified flow)
  const generateReleaseNote = async () => {
    try {
      setIsGenerating(true)
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tickets: selectedTickets,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setValue('description', result.content || '')
      }
    } catch (error) {
      console.error('Error generating release note:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white shadow dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Generate Release Notes with AI
          </h1>
        </div>
      </header>

      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('github')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'github'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                  }`}
                >
                  GitHub Integration
                </button>
                <button
                  onClick={() => setActiveTab('jira')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'jira'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                  }`}
                >
                  Jira Integration
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'github' ? (
            <GitHubReleaseGenerator />
          ) : (
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <form className="space-y-6">
              {/* Jira Integration Selection */}
              <div>
                <Label htmlFor="integrationId">
                  Select Jira Integration
                </Label>
                <select
                  id="integrationId"
                  {...register('integrationId')}
                  onChange={handleIntegrationChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  disabled={isLoadingIntegrations}
                >
                  <option value="">Select a Jira integration</option>
                  {integrations.map((integration) => (
                    <option key={integration.id} value={integration.id}>
                      {integration.config.domain}
                    </option>
                  ))}
                </select>
                {errors.integrationId && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.integrationId.message}
                  </p>
                )}
                {isLoadingIntegrations && (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Loading Jira integrations...
                  </p>
                )}
              </div>

              {/* Jira Project Selection */}
              {selectedIntegrationId && (
                <div>
                  <label
                    htmlFor="projectKey"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Select Jira Project
                  </label>
                  <select
                    id="projectKey"
                    {...register('projectKey')}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                    disabled={isLoadingProjects}
                  >
                    <option value="">Select a Jira project</option>
                    {projects.map((project) => (
                      <option key={project.key} value={project.key}>
                        {project.name} ({project.key})
                      </option>
                    ))}
                  </select>
                  {errors.projectKey && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {errors.projectKey.message}
                    </p>
                  )}
                  {isLoadingProjects && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Loading Jira projects...
                    </p>
                  )}
                </div>
              )}

              {/* Filters */}
              {selectedIntegrationId && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Ticket Status
                    </label>
                    <select
                      id="status"
                      {...register('status')}
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                    >
                      <option value="closed">Closed</option>
                      <option value="open">Open</option>
                      <option value="all">All</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="lookbackDays"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Lookback Period (days)
                    </label>
                    <input
                      type="number"
                      id="lookbackDays"
                      {...register('lookbackDays', { valueAsNumber: true })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                    />
                    {errors.lookbackDays && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        {errors.lookbackDays.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Fetch Tickets Button */}
              {selectedIntegrationId && (
                <div>
                  <button
                    type="button"
                    onClick={fetchTickets}
                    disabled={isFetchingTickets}
                    className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isFetchingTickets ? 'Fetching Jira Tickets...' : 'Fetch Jira Tickets'}
                  </button>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/50">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                        {error}
                      </h3>
                    </div>
                  </div>
                </div>
              )}

              {/* Tickets List */}
              {tickets.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Select Jira Tickets to Include
                    </h3>
                    <div className="space-x-2">
                      <button
                        type="button"
                        onClick={selectAllTickets}
                        className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={deselectAllTickets}
                        className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {tickets.map((ticket) => (
                        <li key={ticket.id} className="flex items-start p-4">
                          <div className="flex h-5 items-center">
                            <input
                              id={`ticket-${ticket.id}`}
                              type="checkbox"
                              checked={selectedTickets.includes(ticket.id)}
                              onChange={() => toggleTicketSelection(ticket.id)}
                              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                            />
                          </div>
                          <div className="ml-3">
                            <label
                              htmlFor={`ticket-${ticket.id}`}
                              className="text-sm font-medium text-gray-900 dark:text-white"
                            >
                              {ticket.key}: {ticket.title}
                            </label>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              {ticket.description}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                {ticket.type}
                              </span>
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                {ticket.status}
                              </span>
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                {ticket.priority}
                              </span>
                            </div>
                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                              Assigned to: {ticket.assignee || 'Unassigned'} | Updated: {new Date(ticket.updated).toLocaleDateString()}
                            </div>
                            <a
                              href={ticket.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 text-xs text-primary-600 hover:text-primary-500 dark:text-primary-400"
                            >
                              View in Jira →
                            </a>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Release Notes Title and Description */}
              {tickets.length > 0 && (
                <div className="mt-6 space-y-6">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Release Notes Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      {...register('title')}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                    />
                    {errors.title && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Description (Optional)
                    </label>
                    <Textarea
                      id="description"
                      rows={3}
                      {...register('description')}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Button
                      type="button"
                      onClick={generateReleaseNote}
                      disabled={isGenerating || selectedTickets.length === 0}
                    >
                      {isGenerating ? 'Generating...' : 'Generate Release Notes'}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>
          )}
        </div>
      </main>
    </div>
  )
} 
