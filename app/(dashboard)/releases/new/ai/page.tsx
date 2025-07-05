'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { slugify } from '@/lib/utils'

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
export default function NewReleaseNotesAiPage() {
  const [integrations, setIntegrations] = useState<JiraIntegration[]>([])
  const [projects, setProjects] = useState<Array<{ key: string; name: string }>>([])
  const [tickets, setTickets] = useState<JiraTicket[]>([])
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set())
  const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(true)
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [isFetchingTickets, setIsFetchingTickets] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  const {
    register,
    handleSubmit,
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
        // In a real implementation, this would call a Jira API endpoint
        // For now, we'll simulate the API call with mock data
        const mockProjects = [
          { key: 'PROJ', name: 'Project Alpha' },
          { key: 'DEV', name: 'Development' },
          { key: 'TEST', name: 'Testing' },
          { key: 'PROD', name: 'Production' },
        ]

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setProjects(mockProjects)
      } catch (error) {
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
    setSelectedTickets(new Set())
  }

  // Fetch Jira tickets based on selected filters
  const fetchTickets = async () => {
    const formData = watch()
    setIsFetchingTickets(true)
    setError(null)
    setTickets([])
    setSelectedTickets(new Set())

    try {
      // In a real implementation, this would call a Jira API endpoint
      // For now, we'll simulate the API call with mock data
      const mockTickets: JiraTicket[] = [
        {
          id: '1',
          key: 'PROJ-123',
          title: 'Add user authentication',
          description: 'Implement user authentication with email and password',
          status: 'Closed',
          type: 'Story',
          priority: 'High',
          url: 'https://jira.example.com/browse/PROJ-123',
          assignee: 'John Doe',
          created: '2023-05-01T10:00:00Z',
          updated: '2023-05-15T14:30:00Z',
        },
        {
          id: '2',
          key: 'PROJ-124',
          title: 'Fix login page layout',
          description: 'Fix the layout issues on the login page',
          status: 'Closed',
          type: 'Bug',
          priority: 'Medium',
          url: 'https://jira.example.com/browse/PROJ-124',
          assignee: 'Jane Smith',
          created: '2023-05-05T09:15:00Z',
          updated: '2023-05-10T16:45:00Z',
        },
        {
          id: '3',
          key: 'PROJ-125',
          title: 'Add dark mode support',
          description: 'Implement dark mode for the application',
          status: 'Closed',
          type: 'Story',
          priority: 'Medium',
          url: 'https://jira.example.com/browse/PROJ-125',
          assignee: 'John Doe',
          created: '2023-05-08T11:30:00Z',
          updated: '2023-05-20T10:15:00Z',
        },
        {
          id: '4',
          key: 'PROJ-126',
          title: 'Optimize database queries',
          description: 'Optimize database queries for better performance',
          status: 'Closed',
          type: 'Task',
          priority: 'High',
          url: 'https://jira.example.com/browse/PROJ-126',
          assignee: 'Jane Smith',
          created: '2023-05-12T14:20:00Z',
          updated: '2023-05-25T09:30:00Z',
        },
      ]

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setTickets(mockTickets)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch Jira tickets')
    } finally {
      setIsFetchingTickets(false)
    }
  }

  // Toggle ticket selection
  const toggleTicketSelection = (ticketId: string) => {
    const newSelectedTickets = new Set(selectedTickets)
    
    if (newSelectedTickets.has(ticketId)) {
      newSelectedTickets.delete(ticketId)
    } else {
      newSelectedTickets.add(ticketId)
    }
    
    setSelectedTickets(newSelectedTickets)
  }

  // Select all tickets
  const selectAllTickets = () => {
    const allTicketIds = tickets.map(ticket => ticket.id)
    setSelectedTickets(new Set(allTicketIds))
  }

  // Deselect all tickets
  const deselectAllTickets = () => {
    setSelectedTickets(new Set())
  }

  // Generate release notes (modified flow)
  const generateReleaseNotes = async () => {
    const formData = watch()
    if (selectedTickets.size === 0) {
      setError('Please select at least one ticket to include in the release notes')
      return
    }
    if (!user) {
        setError('User not found, please log in again.');
        return;
    }

    setIsGenerating(true)
    setError(null)

    try {
      // --- Step 1: Gather data for AI & Draft --- 
      const selectedTicketDetails = tickets.filter(ticket => selectedTickets.has(ticket.id))
                                          .map(t => ({ key: t.key, title: t.title, description: t.description }))
      const releaseTitle = formData.title
      const initialContentPlaceholder = '<!-- Generating AI content... -->'
      const releaseSlug = slugify(releaseTitle) + '-' + Date.now().toString(36)

      // --- Step 2: Create Initial Draft in Supabase --- 
      const { data: draftNote, error: insertError } = await supabase
        .from('release_notes')
        .insert({
          organization_id: user.id,
          title: releaseTitle,
          slug: releaseSlug,
          content_html: initialContentPlaceholder,
          status: 'draft',
          source_ticket_ids: Array.from(selectedTickets),
        })
        .select('id')
        .single()

      if (insertError) {
         throw new Error(`Failed to create draft release note: ${insertError.message}`)
      }

      if (!draftNote || !draftNote.id) {
          throw new Error('Failed to create draft: No ID returned.')
      }

      // --- Step 3: (Optional but Recommended) Trigger Backend AI Generation Asynchronously ---
      // We won't generate AI content directly on the client anymore.
      // Instead, we navigate to the editor, and the editor page 
      // (or a background process triggered here) will handle fetching AI content.
      // For now, we just redirect.
      
      // Example of how you *might* trigger a background generation (needs API route):
      // fetch('/api/v1/release-notes/generate', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //      releaseNoteId: draftNote.id, 
      //      tickets: selectedTicketDetails, 
      //      title: releaseTitle,
      //      // Pass config like company details, tone if needed 
      //   }),
      // });
      // Note: This background call shouldn't block navigation.

      // --- Step 4: Redirect to the Editor Page --- 
      router.push(`/releases/edit/${draftNote.id}`)

    } catch (error) {
      console.error("Error during release note generation process:", error);
      setError(error instanceof Error ? error.message : 'Failed to start release note generation')
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
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <form className="space-y-6">
              {/* Jira Integration Selection */}
              <div>
                <label
                  htmlFor="integrationId"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Select Jira Integration
                </label>
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
                              checked={selectedTickets.has(ticket.id)}
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
                    <textarea
                      id="description"
                      rows={3}
                      {...register('description')}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                    />
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={generateReleaseNotes}
                      disabled={isGenerating || selectedTickets.size === 0}
                      className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isGenerating ? 'Generating...' : 'Generate Release Notes'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  )
} 