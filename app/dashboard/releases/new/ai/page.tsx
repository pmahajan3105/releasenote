'use client'

import { useState, useEffect, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase/ssr'
import { GitHubReleaseGenerator } from '@/components/features/GitHubReleaseGenerator'
import { handleApiError } from '@/lib/error-handler-standard'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
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
  config: Record<string, unknown>
}

type JiraProjectResponse = {
  key: string
  name: string
}

type LinearTeam = {
  id: string
  name: string
  key: string
}

type LinearIssue = {
  id: string
  identifier: string
  title: string
  description?: string | null
  state?: { name?: string } | null
  assignee?: { displayName?: string } | null
  labels?: Array<{ id?: string; name?: string; color?: string }>
  url?: string | null
  createdAt?: string
  updatedAt?: string
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
  const router = useRouter()
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])
  const [tickets, setTickets] = useState<JiraTicket[]>([])
  const [activeTab, setActiveTab] = useState<'github' | 'jira' | 'linear'>('github')
  const [integrations, setIntegrations] = useState<JiraIntegration[]>([])
  const [projects, setProjects] = useState<Array<{ key: string; name: string }>>([])
  const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(true)
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [isFetchingTickets, setIsFetchingTickets] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [linearTeams, setLinearTeams] = useState<LinearTeam[]>([])
  const [selectedLinearTeamId, setSelectedLinearTeamId] = useState('')
  const [linearIssues, setLinearIssues] = useState<LinearIssue[]>([])
  const [selectedLinearIssues, setSelectedLinearIssues] = useState<string[]>([])
  const [linearTitle, setLinearTitle] = useState('')
  const [linearDescription, setLinearDescription] = useState('')
  const [linearLookbackDays, setLinearLookbackDays] = useState(30)
  const [linearStateType, setLinearStateType] = useState<string>('')
  const [isLoadingLinearTeams, setIsLoadingLinearTeams] = useState(false)
  const [isFetchingLinearIssues, setIsFetchingLinearIssues] = useState(false)
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
  const handleIntegrationChange = (e: ChangeEvent<HTMLSelectElement>) => {
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
      const formData = watch()
      const selected = tickets.filter((ticket) => selectedTickets.includes(ticket.id))

      if (!user) {
        setError('User not authenticated')
        return
      }

      if (!formData.title?.trim()) {
        setError('Please enter a release notes title')
        return
      }

      if (selected.length === 0) {
        setError('Please select at least one ticket')
        return
      }

      const promptTickets = selected.map((ticket) => ({
        type: mapJiraIssueType(ticket.type),
        title: `${ticket.key}: ${ticket.title}`,
        description: ticket.description,
        labels: [ticket.status, ticket.priority].filter(Boolean),
      }))

      const response = await fetch('/api/release-notes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tickets: promptTickets,
          tone: 'professional',
        }),
      })

      if (response.ok) {
        const result = await response.json()
        const generatedHtml = result.content as string | undefined
        if (!generatedHtml) {
          setError('AI generation returned empty content')
          return
        }

        const slug = `${slugify(formData.title)}-${Date.now().toString(36)}`

        const { data: draftNote, error: insertError } = await supabase
          .from('release_notes')
          .insert({
            organization_id: user.id,
            author_id: user.id,
            title: formData.title,
            slug,
            status: 'draft',
            content_html: generatedHtml,
            content_markdown: '',
            source_ticket_ids: selected.map((ticket) => ticket.key),
          })
          .select('id')
          .single()

        if (insertError) {
          throw insertError
        }

        if (!draftNote?.id) {
          throw new Error('Failed to create draft release note')
        }

        router.push(`/dashboard/releases/edit/${draftNote.id}`)
      }
    } catch (error) {
      console.error('Error generating release note:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate release note')
    } finally {
      setIsGenerating(false)
    }
  }

  const mapJiraIssueType = (issueType: string) => {
    const normalized = issueType.toLowerCase()
    if (normalized.includes('bug')) return 'bugfix'
    if (normalized.includes('break')) return 'breaking'
    if (normalized.includes('improve')) return 'improvement'
    if (normalized.includes('feature') || normalized.includes('story') || normalized.includes('task')) return 'feature'
    return 'improvement'
  }

  const getJiraIntegrationLabel = (integration: JiraIntegration) => {
    const config = integration.config
    if (!isObject(config) || !Array.isArray(config.resources) || config.resources.length === 0) {
      return 'Jira'
    }

    const first = config.resources[0]
    if (isObject(first) && typeof first.name === 'string' && first.name.trim()) {
      return first.name
    }

    return 'Jira'
  }

  const loadLinearTeams = async () => {
    try {
      setIsLoadingLinearTeams(true)
      setError(null)

      const response = await fetch('/api/integrations/linear/teams?first=50&includeArchived=false')
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        const message = isObject(data) && typeof data.error === 'string' ? data.error : 'Failed to load Linear teams'
        throw new Error(message)
      }

      const data = await response.json()
      const teams = isObject(data) && Array.isArray(data.teams) ? (data.teams as LinearTeam[]) : []
      setLinearTeams(teams)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load Linear teams')
    } finally {
      setIsLoadingLinearTeams(false)
    }
  }

  const fetchLinearIssues = async () => {
    if (!selectedLinearTeamId) {
      setError('Please select a team first')
      return
    }

    setIsFetchingLinearIssues(true)
    setError(null)
    setLinearIssues([])
    setSelectedLinearIssues([])

    try {
      const params = new URLSearchParams()
      params.set('teamId', selectedLinearTeamId)
      params.set('first', '50')

      if (linearStateType) {
        params.set('stateType', linearStateType)
      }

      if (linearLookbackDays) {
        const lookbackDate = new Date()
        lookbackDate.setDate(lookbackDate.getDate() - linearLookbackDays)
        params.set('updatedSince', lookbackDate.toISOString())
      }

      const response = await fetch(`/api/integrations/linear/issues?${params}`)
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        const message = isObject(data) && typeof data.error === 'string' ? data.error : 'Failed to fetch Linear issues'
        throw new Error(message)
      }

      const data = await response.json()
      const issues = isObject(data) && Array.isArray(data.issues) ? (data.issues as LinearIssue[]) : []
      setLinearIssues(issues)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch Linear issues')
    } finally {
      setIsFetchingLinearIssues(false)
    }
  }

  const mapLinearIssueType = (issue: LinearIssue) => {
    const labels =
      issue.labels
        ?.map((label) => label.name?.toLowerCase())
        .filter((label): label is string => Boolean(label)) ?? []
    const title = issue.title.toLowerCase()

    if (labels.some((label) => label.includes('bug')) || title.includes('fix')) return 'bugfix'
    if (labels.some((label) => label.includes('breaking'))) return 'breaking'
    if (labels.some((label) => label.includes('improvement'))) return 'improvement'
    return 'feature'
  }

  const generateLinearReleaseNote = async () => {
    try {
      setIsGenerating(true)
      setError(null)

      if (!user) {
        setError('User not authenticated')
        return
      }

      if (!linearTitle.trim()) {
        setError('Please enter a release notes title')
        return
      }

      const selected = linearIssues.filter((issue) => selectedLinearIssues.includes(issue.id))
      if (selected.length === 0) {
        setError('Please select at least one issue')
        return
      }

      const promptTickets = selected.map((issue) => ({
        type: mapLinearIssueType(issue),
        title: `${issue.identifier}: ${issue.title}`,
        description: issue.description ?? '',
        labels: issue.labels?.map((label) => label.name).filter((label): label is string => Boolean(label)) ?? [],
      }))

      const response = await fetch('/api/release-notes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tickets: promptTickets,
          tone: 'professional',
          companyDetails: linearDescription || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        const message = isObject(data) && typeof data.error === 'string' ? data.error : 'Failed to generate release notes'
        throw new Error(message)
      }

      const result = await response.json()
      const generatedHtml = result.content as string | undefined
      if (!generatedHtml) {
        setError('AI generation returned empty content')
        return
      }

      const slug = `${slugify(linearTitle)}-${Date.now().toString(36)}`
      const { data: draftNote, error: insertError } = await supabase
        .from('release_notes')
        .insert({
          organization_id: user.id,
          author_id: user.id,
          title: linearTitle,
          slug,
          status: 'draft',
          content_html: generatedHtml,
          content_markdown: '',
          source_ticket_ids: selected.map((issue) => issue.identifier),
        })
        .select('id')
        .single()

      if (insertError) {
        throw insertError
      }

      if (!draftNote?.id) {
        throw new Error('Failed to create draft release note')
      }

      router.push(`/dashboard/releases/edit/${draftNote.id}`)
    } catch (error) {
      console.error('Error generating Linear release note:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate release note')
    } finally {
      setIsGenerating(false)
    }
  }

  function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
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
                <button
                  onClick={() => setActiveTab('linear')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'linear'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                  }`}
                >
                  Linear Integration
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'github' ? (
            <GitHubReleaseGenerator />
          ) : activeTab === 'jira' ? (
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
                      {getJiraIntegrationLabel(integration)}
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
          ) : (
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="space-y-6">
              <div>
                <Label>Linear Team</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={loadLinearTeams}
                    disabled={isLoadingLinearTeams}
                  >
                    {isLoadingLinearTeams ? 'Loading...' : 'Load Teams'}
                  </Button>
                  {linearTeams.length > 0 && (
                    <select
                      value={selectedLinearTeamId}
                      onChange={(event) => {
                        setSelectedLinearTeamId(event.target.value)
                        setLinearIssues([])
                        setSelectedLinearIssues([])
                      }}
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                    >
                      <option value="">Select a team</option>
                      {linearTeams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name} ({team.key})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    State Type
                  </label>
                  <select
                    value={linearStateType}
                    onChange={(event) => setLinearStateType(event.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  >
                    <option value="">Any</option>
                    <option value="backlog">Backlog</option>
                    <option value="unstarted">Unstarted</option>
                    <option value="started">Started</option>
                    <option value="completed">Completed</option>
                    <option value="canceled">Canceled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Lookback Period (days)
                  </label>
                  <input
                    type="number"
                    value={linearLookbackDays}
                    min={1}
                    max={365}
                    onChange={(event) => setLinearLookbackDays(Number(event.target.value || 30))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <Button
                  type="button"
                  onClick={fetchLinearIssues}
                  disabled={!selectedLinearTeamId || isFetchingLinearIssues}
                >
                  {isFetchingLinearIssues ? 'Fetching Issues...' : 'Fetch Linear Issues'}
                </Button>
              </div>

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

              {linearIssues.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Select Linear Issues to Include
                    </h3>
                    <div className="space-x-2">
                      <button
                        type="button"
                        onClick={() => setSelectedLinearIssues(linearIssues.map((issue) => issue.id))}
                        className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedLinearIssues([])}
                        className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {linearIssues.map((issue) => (
                        <li key={issue.id} className="flex items-start p-4">
                          <div className="flex h-5 items-center">
                            <input
                              id={`linear-issue-${issue.id}`}
                              type="checkbox"
                              checked={selectedLinearIssues.includes(issue.id)}
                              onChange={() => {
                                setSelectedLinearIssues((current) =>
                                  current.includes(issue.id)
                                    ? current.filter((id) => id !== issue.id)
                                    : [...current, issue.id]
                                )
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                            />
                          </div>
                          <div className="ml-3">
                            <label
                              htmlFor={`linear-issue-${issue.id}`}
                              className="text-sm font-medium text-gray-900 dark:text-white"
                            >
                              {issue.identifier}: {issue.title}
                            </label>
                            {issue.description && (
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {issue.description}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-2">
                              {issue.state?.name && (
                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                  {issue.state.name}
                                </span>
                              )}
                              {issue.labels?.slice(0, 4).map((label) => (
                                <span
                                  key={label.id || label.name}
                                  className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                >
                                  {label.name}
                                </span>
                              ))}
                            </div>
                            {issue.url && (
                              <a
                                href={issue.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 block text-xs text-primary-600 hover:text-primary-500 dark:text-primary-400"
                              >
                                View in Linear →
                              </a>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Release Notes Title
                      </label>
                      <input
                        type="text"
                        value={linearTitle}
                        onChange={(event) => setLinearTitle(event.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description (Optional)
                      </label>
                      <Textarea
                        value={linearDescription}
                        onChange={(event) => setLinearDescription(event.target.value)}
                        rows={3}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Button
                        type="button"
                        onClick={generateLinearReleaseNote}
                        disabled={isGenerating || selectedLinearIssues.length === 0}
                      >
                        {isGenerating ? 'Generating...' : 'Generate Release Notes'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      </main>
    </div>
  )
} 
