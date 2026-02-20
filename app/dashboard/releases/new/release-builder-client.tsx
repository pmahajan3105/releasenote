'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase/ssr'
import { useAuthStore } from '@/lib/store'
import type { Database } from '@/types/database'
import { slugify } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type BuilderProvider = 'github' | 'jira' | 'linear'
type BuilderStep = 'source' | 'items' | 'generate' | 'edit' | 'publish'
type BuilderIntent = 'scratch' | 'template' | 'ai'

type GitHubRepository = {
  id: number
  full_name: string
  private: boolean
}

type JiraProject = {
  key: string
  name: string
}

type LinearTeam = {
  id: string
  key: string
  name: string
}

type BuilderItem = {
  id: string
  externalId: string
  title: string
  description: string
  status: string
  author: string
  labels: string[]
  url: string
  updatedAt: string
  kind: 'commit' | 'pr' | 'issue'
  provider: BuilderProvider
}

type GenerateTone = 'professional' | 'casual' | 'technical'

const BUILDER_STEPS: Array<{ key: BuilderStep; label: string; description: string }> = [
  { key: 'source', label: 'Source', description: 'Choose integration + filters' },
  { key: 'items', label: 'Select Items', description: 'Pick what to include' },
  { key: 'generate', label: 'Generate', description: 'Create AI draft' },
  { key: 'edit', label: 'Edit', description: 'Review rich content' },
  { key: 'publish', label: 'Publish', description: 'Go live + notify' },
]

const DEFAULT_RELEASE_TEMPLATE_HTML = `
<h2>Summary</h2>
<p>Add a short summary of what shipped in this release.</p>
<h2>New Features</h2>
<ul>
  <li>Describe the key feature and user impact.</li>
</ul>
<h2>Improvements</h2>
<ul>
  <li>Capture notable quality or workflow improvements.</li>
</ul>
<h2>Fixes</h2>
<ul>
  <li>List important bugs fixed for users.</li>
</ul>
`

function readStep(value: string | null): BuilderStep {
  if (value === 'items' || value === 'generate' || value === 'edit' || value === 'publish') {
    return value
  }
  return 'source'
}

function readIntent(value: string | null): BuilderIntent | null {
  if (value === 'scratch' || value === 'template' || value === 'ai') {
    return value
  }
  return null
}

function summarizeCommit(message: string): string {
  return message.split('\n')[0]?.trim() || 'Commit'
}

function textFromHtml(input: string): string {
  return input.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function toRelativeDate(value: string | null): string {
  if (!value) {
    return 'Never'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Unknown'
  }

  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

function inferTicketType(item: BuilderItem): 'feature' | 'bugfix' | 'improvement' | 'breaking' {
  const title = item.title.toLowerCase()
  const labels = item.labels.map((label) => label.toLowerCase())

  if (title.includes('break') || labels.some((label) => label.includes('breaking'))) {
    return 'breaking'
  }

  if (
    title.includes('fix') ||
    title.includes('bug') ||
    labels.some((label) => label.includes('bug'))
  ) {
    return 'bugfix'
  }

  if (title.includes('improve') || labels.some((label) => label.includes('improvement'))) {
    return 'improvement'
  }

  return 'feature'
}

export default function ReleaseBuilderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient<Database>()
  const user = useAuthStore((state) => state.user)
  const authInitialized = useAuthStore((state) => state.isInitialized)

  const [provider, setProvider] = useState<BuilderProvider>('github')
  const [step, setStep] = useState<BuilderStep>(() => readStep(searchParams.get('step')))
  const [error, setError] = useState<string | null>(null)

  const [repositories, setRepositories] = useState<GitHubRepository[]>([])
  const [selectedRepository, setSelectedRepository] = useState('')
  const [githubLookbackDays, setGithubLookbackDays] = useState(30)

  const [jiraProjects, setJiraProjects] = useState<JiraProject[]>([])
  const [selectedJiraProject, setSelectedJiraProject] = useState('')
  const [jiraLookbackDays, setJiraLookbackDays] = useState(30)
  const [jiraStatus, setJiraStatus] = useState<'closed' | 'open' | 'all'>('closed')

  const [linearTeams, setLinearTeams] = useState<LinearTeam[]>([])
  const [selectedLinearTeamId, setSelectedLinearTeamId] = useState('')
  const [linearLookbackDays, setLinearLookbackDays] = useState(30)
  const [linearStateType, setLinearStateType] = useState('')

  const [loadingSource, setLoadingSource] = useState(false)
  const [fetchingItems, setFetchingItems] = useState(false)
  const [generatingDraft, setGeneratingDraft] = useState(false)
  const [sourceLoadedAt, setSourceLoadedAt] = useState<string | null>(null)
  const [itemsLoadedAt, setItemsLoadedAt] = useState<string | null>(null)

  const [items, setItems] = useState<BuilderItem[]>([])
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const [title, setTitle] = useState('')
  const [companyDetails, setCompanyDetails] = useState('')
  const [tone, setTone] = useState<GenerateTone>('professional')
  const [draftId, setDraftId] = useState<string | null>(null)
  const [quickDraftMode, setQuickDraftMode] = useState<'scratch' | 'template' | null>(null)
  const processedIntentRef = useRef<BuilderIntent | null>(null)

  const selectedItems = useMemo(
    () => items.filter((item) => selectedItemIds.includes(item.id)),
    [items, selectedItemIds]
  )

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) {
      return items
    }

    return items.filter((item) => {
      return (
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query) ||
        item.labels.some((label) => label.toLowerCase().includes(query))
      )
    })
  }, [items, searchQuery])

  const canContinueToItems = useMemo(() => {
    if (provider === 'github') {
      return selectedRepository.length > 0
    }

    if (provider === 'jira') {
      return selectedJiraProject.length > 0
    }

    return selectedLinearTeamId.length > 0
  }, [provider, selectedRepository, selectedJiraProject, selectedLinearTeamId])

  const canContinueToGenerate = selectedItems.length > 0
  const canContinueToEdit = Boolean(draftId)

  const canAccessStep = useCallback(
    (nextStep: BuilderStep) => {
      if (nextStep === 'source') return true
      if (nextStep === 'items') return canContinueToItems
      if (nextStep === 'generate') return canContinueToGenerate
      if (nextStep === 'edit') return canContinueToEdit
      if (nextStep === 'publish') return canContinueToEdit
      return false
    },
    [canContinueToItems, canContinueToGenerate, canContinueToEdit]
  )

  const setStepWithUrl = useCallback(
    (nextStep: BuilderStep) => {
      if (!canAccessStep(nextStep)) return
      setStep(nextStep)
      router.replace(`/dashboard/releases/new?step=${nextStep}`, { scroll: false })
    },
    [canAccessStep, router]
  )

  useEffect(() => {
    const nextStep = readStep(searchParams.get('step'))
    if (nextStep !== step && canAccessStep(nextStep)) {
      setStep(nextStep)
    }
  }, [searchParams, step, canAccessStep])

  const createQuickDraft = useCallback(
    async (mode: 'scratch' | 'template') => {
      if (!user) {
        setError('You need to be signed in to create a draft')
        return
      }

      setQuickDraftMode(mode)
      setError(null)

      try {
        const dateLabel = new Date().toISOString().slice(0, 10)
        const draftTitle =
          mode === 'template'
            ? `Release Notes Template ${dateLabel}`
            : `New Release Notes ${dateLabel}`
        const slug = `${slugify(draftTitle)}-${Date.now().toString(36)}`

        const { data: inserted, error: insertError } = await supabase
          .from('release_notes')
          .insert({
            organization_id: user.id,
            author_id: user.id,
            title: draftTitle,
            slug,
            status: 'draft',
            content_html: mode === 'template' ? DEFAULT_RELEASE_TEMPLATE_HTML.trim() : '',
            content_markdown: '',
            source_ticket_ids: [],
          })
          .select('id')
          .single()

        if (insertError || !inserted?.id) {
          throw new Error(insertError?.message || 'Failed to create draft')
        }

        router.push(`/dashboard/releases/edit/${inserted.id}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create draft')
      } finally {
        setQuickDraftMode(null)
      }
    },
    [router, supabase, user]
  )

  useEffect(() => {
    const intent = readIntent(searchParams.get('intent'))
    if (!authInitialized || !intent || intent === 'ai' || processedIntentRef.current === intent) {
      return
    }

    processedIntentRef.current = intent
    void createQuickDraft(intent)
  }, [authInitialized, createQuickDraft, searchParams])

  useEffect(() => {
    if (provider !== 'github') {
      return
    }

    if (repositories.length > 0) {
      return
    }

    const load = async () => {
      setLoadingSource(true)
      setError(null)

      try {
        const response = await fetch('/api/integrations/github/repositories?per_page=100&page=1')
        if (!response.ok) {
          throw new Error('Unable to load GitHub repositories')
        }

        const data = (await response.json()) as { repositories?: GitHubRepository[] }
        setRepositories(data.repositories ?? [])
        setSourceLoadedAt(new Date().toISOString())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load repositories')
      } finally {
        setLoadingSource(false)
      }
    }

    void load()
  }, [provider, repositories.length])

  useEffect(() => {
    if (provider !== 'jira') {
      return
    }

    if (jiraProjects.length > 0) {
      return
    }

    const load = async () => {
      setLoadingSource(true)
      setError(null)

      try {
        const response = await fetch('/api/integrations/jira/projects?maxResults=100')
        if (!response.ok) {
          throw new Error('Unable to load Jira projects')
        }

        const data = (await response.json()) as { projects?: JiraProject[] }
        setJiraProjects(data.projects ?? [])
        setSourceLoadedAt(new Date().toISOString())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Jira projects')
      } finally {
        setLoadingSource(false)
      }
    }

    void load()
  }, [provider, jiraProjects.length])

  useEffect(() => {
    if (provider !== 'linear') {
      return
    }

    if (linearTeams.length > 0) {
      return
    }

    const load = async () => {
      setLoadingSource(true)
      setError(null)

      try {
        const response = await fetch('/api/integrations/linear/teams?first=100&includeArchived=false')
        if (!response.ok) {
          throw new Error('Unable to load Linear teams')
        }

        const data = (await response.json()) as { teams?: LinearTeam[] }
        setLinearTeams(data.teams ?? [])
        setSourceLoadedAt(new Date().toISOString())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Linear teams')
      } finally {
        setLoadingSource(false)
      }
    }

    void load()
  }, [provider, linearTeams.length])

  const refreshSources = async () => {
    setError(null)

    if (provider === 'github') {
      setRepositories([])
      return
    }

    if (provider === 'jira') {
      setJiraProjects([])
      return
    }

    setLinearTeams([])
  }

  const fetchItems = async () => {
    setError(null)
    setFetchingItems(true)
    setItems([])
    setSelectedItemIds([])

    try {
      let nextItems: BuilderItem[] = []

      if (provider === 'github') {
        const [owner, repo] = selectedRepository.split('/')
        if (!owner || !repo) {
          throw new Error('Select a valid GitHub repository')
        }

        const since = new Date(Date.now() - githubLookbackDays * 24 * 60 * 60 * 1000).toISOString()
        const commitsResponse = await fetch(
          `/api/integrations/github/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?since=${encodeURIComponent(since)}&per_page=100&page=1`
        )
        if (!commitsResponse.ok) {
          throw new Error('Failed to fetch GitHub commits')
        }

        const pullsResponse = await fetch(
          `/api/integrations/github/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls?state=closed&sort=updated&direction=desc&per_page=100&page=1`
        )
        if (!pullsResponse.ok) {
          throw new Error('Failed to fetch GitHub pull requests')
        }

        const commitsPayload = (await commitsResponse.json()) as {
          commits?: Array<{
            sha: string
            message: string
            author?: { name?: string; date?: string }
            url?: string
          }>
        }

        const pullsPayload = (await pullsResponse.json()) as {
          pull_requests?: Array<{
            number: number
            title: string
            body?: string
            state: string
            merged_at?: string
            updated_at?: string
            html_url?: string
            user?: { login?: string }
          }>
        }

        const commitItems = (commitsPayload.commits ?? []).map((commit) => ({
          id: `commit-${commit.sha}`,
          externalId: commit.sha,
          title: summarizeCommit(commit.message),
          description: commit.message,
          status: 'Committed',
          author: commit.author?.name ?? 'Unknown',
          labels: ['commit'],
          url: commit.url ?? '',
          updatedAt: commit.author?.date ?? new Date().toISOString(),
          kind: 'commit' as const,
          provider: 'github' as const,
        }))

        const pullItems = (pullsPayload.pull_requests ?? [])
          .filter((pull) => Boolean(pull.merged_at))
          .map((pull) => ({
            id: `pr-${pull.number}`,
            externalId: `PR-${pull.number}`,
            title: `PR #${pull.number}: ${pull.title}`,
            description: pull.body ?? '',
            status: pull.state,
            author: pull.user?.login ?? 'Unknown',
            labels: ['pull-request', 'merged'],
            url: pull.html_url ?? '',
            updatedAt: pull.updated_at ?? new Date().toISOString(),
            kind: 'pr' as const,
            provider: 'github' as const,
          }))

        nextItems = [...pullItems, ...commitItems]
      }

      if (provider === 'jira') {
        if (!selectedJiraProject) {
          throw new Error('Select a Jira project first')
        }

        const params = new URLSearchParams({
          projectKey: selectedJiraProject,
          maxResults: '100',
          startAt: '0',
        })

        if (jiraStatus !== 'all') {
          params.set(
            'statuses',
            jiraStatus === 'closed' ? 'Done,Closed,Resolved' : 'Open,In Progress,To Do'
          )
        }

        const updatedSince = new Date(Date.now() - jiraLookbackDays * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10)
        params.set('updatedSince', updatedSince)

        const response = await fetch(`/api/integrations/jira/issues?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Failed to fetch Jira issues')
        }

        const payload = (await response.json()) as {
          issues?: Array<{
            id: string
            key: string
            summary: string
            description?: string | null
            status?: { name?: string }
            issueType?: { name?: string }
            assignee?: { displayName?: string } | null
            labels?: string[]
            updated?: string
            url?: string
          }>
        }

        nextItems = (payload.issues ?? []).map((issue) => ({
          id: issue.id,
          externalId: issue.key,
          title: `${issue.key}: ${issue.summary}`,
          description: issue.description ?? '',
          status: issue.status?.name ?? 'Unknown',
          author: issue.assignee?.displayName ?? 'Unassigned',
          labels: [issue.issueType?.name ?? 'issue', ...(issue.labels ?? [])],
          url: issue.url ?? '',
          updatedAt: issue.updated ?? new Date().toISOString(),
          kind: 'issue' as const,
          provider: 'jira' as const,
        }))
      }

      if (provider === 'linear') {
        if (!selectedLinearTeamId) {
          throw new Error('Select a Linear team first')
        }

        const params = new URLSearchParams({
          teamId: selectedLinearTeamId,
          first: '100',
        })

        if (linearStateType) {
          params.set('stateType', linearStateType)
        }

        const updatedSince = new Date(Date.now() - linearLookbackDays * 24 * 60 * 60 * 1000).toISOString()
        params.set('updatedSince', updatedSince)

        const response = await fetch(`/api/integrations/linear/issues?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Failed to fetch Linear issues')
        }

        const payload = (await response.json()) as {
          issues?: Array<{
            id: string
            identifier: string
            title: string
            description?: string | null
            state?: { name?: string }
            assignee?: { displayName?: string } | null
            labels?: Array<{ name?: string }>
            url?: string
            updatedAt?: string
          }>
        }

        nextItems = (payload.issues ?? []).map((issue) => ({
          id: issue.id,
          externalId: issue.identifier,
          title: `${issue.identifier}: ${issue.title}`,
          description: issue.description ?? '',
          status: issue.state?.name ?? 'Unknown',
          author: issue.assignee?.displayName ?? 'Unassigned',
          labels: (issue.labels ?? [])
            .map((label) => label.name)
            .filter((label): label is string => Boolean(label)),
          url: issue.url ?? '',
          updatedAt: issue.updatedAt ?? new Date().toISOString(),
          kind: 'issue' as const,
          provider: 'linear' as const,
        }))
      }

      setItems(nextItems)
      setSelectedItemIds(nextItems.map((item) => item.id))
      setItemsLoadedAt(new Date().toISOString())
      setTitle(`${provider.toUpperCase()} Release Notes - ${new Date().toLocaleDateString()}`)
      setStepWithUrl('items')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch source items')
    } finally {
      setFetchingItems(false)
    }
  }

  const generateDraft = async () => {
    if (!user) {
      setError('You need to be signed in to generate a draft')
      return
    }

    if (!title.trim()) {
      setError('Provide a release note title before generating')
      return
    }

    if (selectedItems.length === 0) {
      setError('Select at least one item before generating')
      return
    }

    setGeneratingDraft(true)
    setError(null)

    try {
      const commits = selectedItems
        .filter((item) => item.kind === 'commit' || item.kind === 'pr')
        .map((item) => ({
          message:
            item.kind === 'pr'
              ? `${item.title}${item.description ? ` — ${item.description.slice(0, 220)}` : ''}`
              : item.description || item.title,
          author: item.author,
        }))

      const tickets = selectedItems
        .filter((item) => item.kind === 'issue')
        .map((item) => ({
          type: inferTicketType(item),
          title: item.title,
          description: item.description,
          labels: item.labels,
        }))

      const generateResponse = await fetch('/api/release-notes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commits,
          tickets,
          tone,
          companyDetails: companyDetails.trim() || undefined,
        }),
      })

      if (!generateResponse.ok) {
        const data = (await generateResponse.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error || 'Failed to generate release note draft')
      }

      const generatePayload = (await generateResponse.json()) as { content?: string }
      if (!generatePayload.content) {
        throw new Error('AI returned empty content')
      }

      const slug = `${slugify(title)}-${Date.now().toString(36)}`
      const { data: inserted, error: insertError } = await supabase
        .from('release_notes')
        .insert({
          organization_id: user.id,
          author_id: user.id,
          title: title.trim(),
          slug,
          status: 'draft',
          content_html: generatePayload.content,
          content_markdown: '',
          source_ticket_ids: selectedItems.map((item) => item.externalId),
        })
        .select('id')
        .single()

      if (insertError || !inserted?.id) {
        throw new Error(insertError?.message || 'Failed to save generated draft')
      }

      setDraftId(inserted.id)
      setStep('edit')
      router.replace('/dashboard/releases/new?step=edit', { scroll: false })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate draft')
    } finally {
      setGeneratingDraft(false)
    }
  }

  const onToggleItem = (id: string) => {
    setSelectedItemIds((current) =>
      current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id]
    )
  }

  const selectAllItems = () => setSelectedItemIds(items.map((item) => item.id))
  const clearSelectedItems = () => setSelectedItemIds([])

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[#101828]">Release Builder</h1>
        <p className="text-[#667085]">
          Fast path to published notes: choose source, select changes, generate, edit, and publish.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-3 sm:grid-cols-5">
            {BUILDER_STEPS.map((builderStep, index) => {
              const isActive = step === builderStep.key
              const isClickable = canAccessStep(builderStep.key)

              return (
                <button
                  key={builderStep.key}
                  type="button"
                  onClick={() => setStepWithUrl(builderStep.key)}
                  disabled={!isClickable}
                  className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                    isActive
                      ? 'border-[#7F56D9] bg-[#f4ebff]'
                      : 'border-[#e4e7ec] bg-white hover:bg-gray-50'
                  } ${!isClickable ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#667085]">Step {index + 1}</p>
                  <p className="text-sm font-semibold text-[#101828]">{builderStep.label}</p>
                  <p className="text-xs text-[#667085]">{builderStep.description}</p>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4 text-sm text-red-700">{error}</CardContent>
        </Card>
      )}

      {step === 'source' && (
        <Card>
          <CardHeader>
            <CardTitle>1. Select Source</CardTitle>
            <CardDescription>
              Connect data from GitHub, Jira, or Linear. Data fetches are cached for faster follow-up runs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-[#e4e7ec] bg-[#f9fafb] p-4">
              <p className="text-sm font-medium text-[#101828]">Quick start</p>
              <p className="mt-1 text-sm text-[#475467]">
                Need a manual draft? Start from a blank editor or load a starter template instantly.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={quickDraftMode !== null}
                  onClick={() => {
                    void createQuickDraft('scratch')
                  }}
                >
                  {quickDraftMode === 'scratch' ? 'Creating Blank Draft...' : 'Start from Scratch'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={quickDraftMode !== null}
                  onClick={() => {
                    void createQuickDraft('template')
                  }}
                >
                  {quickDraftMode === 'template' ? 'Creating Template Draft...' : 'Start from Template'}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(['github', 'jira', 'linear'] as BuilderProvider[]).map((item) => (
                <Button
                  key={item}
                  type="button"
                  variant={provider === item ? 'default' : 'outline'}
                  onClick={() => {
                    setProvider(item)
                    setItems([])
                    setSelectedItemIds([])
                    setError(null)
                  }}
                >
                  {item.toUpperCase()}
                </Button>
              ))}

              <Button type="button" variant="outline" onClick={refreshSources} disabled={loadingSource}>
                {loadingSource ? 'Refreshing...' : 'Refresh Source'}
              </Button>
            </div>

            <div className="rounded-lg border border-[#e4e7ec] p-4">
              {provider === 'github' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="githubRepo">Repository</Label>
                    <select
                      id="githubRepo"
                      value={selectedRepository}
                      onChange={(event) => setSelectedRepository(event.target.value)}
                      className="mt-1 w-full rounded-md border border-[#d0d5dd] px-3 py-2"
                    >
                      <option value="">Select repository...</option>
                      {repositories.map((repository) => (
                        <option key={repository.id} value={repository.full_name}>
                          {repository.full_name} {repository.private ? '(Private)' : '(Public)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="githubLookback">Lookback days</Label>
                    <Input
                      id="githubLookback"
                      type="number"
                      min={1}
                      max={365}
                      value={githubLookbackDays}
                      onChange={(event) => setGithubLookbackDays(Number(event.target.value || 30))}
                    />
                  </div>
                </div>
              )}

              {provider === 'jira' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="jiraProject">Project</Label>
                    <select
                      id="jiraProject"
                      value={selectedJiraProject}
                      onChange={(event) => setSelectedJiraProject(event.target.value)}
                      className="mt-1 w-full rounded-md border border-[#d0d5dd] px-3 py-2"
                    >
                      <option value="">Select project...</option>
                      {jiraProjects.map((project) => (
                        <option key={project.key} value={project.key}>
                          {project.name} ({project.key})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="jiraStatus">Status</Label>
                      <select
                        id="jiraStatus"
                        value={jiraStatus}
                        onChange={(event) => setJiraStatus(event.target.value as 'closed' | 'open' | 'all')}
                        className="mt-1 w-full rounded-md border border-[#d0d5dd] px-3 py-2"
                      >
                        <option value="closed">Closed</option>
                        <option value="open">Open</option>
                        <option value="all">All</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="jiraLookback">Lookback days</Label>
                      <Input
                        id="jiraLookback"
                        type="number"
                        min={1}
                        max={365}
                        value={jiraLookbackDays}
                        onChange={(event) => setJiraLookbackDays(Number(event.target.value || 30))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {provider === 'linear' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="linearTeam">Team</Label>
                    <select
                      id="linearTeam"
                      value={selectedLinearTeamId}
                      onChange={(event) => setSelectedLinearTeamId(event.target.value)}
                      className="mt-1 w-full rounded-md border border-[#d0d5dd] px-3 py-2"
                    >
                      <option value="">Select team...</option>
                      {linearTeams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name} ({team.key})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="linearState">State</Label>
                      <select
                        id="linearState"
                        value={linearStateType}
                        onChange={(event) => setLinearStateType(event.target.value)}
                        className="mt-1 w-full rounded-md border border-[#d0d5dd] px-3 py-2"
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
                      <Label htmlFor="linearLookback">Lookback days</Label>
                      <Input
                        id="linearLookback"
                        type="number"
                        min={1}
                        max={365}
                        value={linearLookbackDays}
                        onChange={(event) => setLinearLookbackDays(Number(event.target.value || 30))}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-[#f9fafb] p-3">
              <div className="flex flex-wrap items-center gap-2 text-sm text-[#475467]">
                <Badge variant="outline">Source loaded {toRelativeDate(sourceLoadedAt)}</Badge>
                <Badge variant="outline">Last item fetch {toRelativeDate(itemsLoadedAt)}</Badge>
                <span>Results are cached by integration routes for faster retries.</span>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="button" onClick={fetchItems} disabled={!canContinueToItems || fetchingItems}>
                {fetchingItems ? 'Fetching Changes...' : 'Fetch Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'items' && (
        <Card>
          <CardHeader>
            <CardTitle>2. Select Items</CardTitle>
            <CardDescription>
              Pick the changes that should appear in this release note.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search selected source items..."
                className="max-w-lg"
              />
              <Button type="button" variant="outline" onClick={selectAllItems}>
                Select All
              </Button>
              <Button type="button" variant="outline" onClick={clearSelectedItems}>
                Clear Selection
              </Button>
              <Badge>{selectedItems.length} selected</Badge>
            </div>

            <div className="max-h-[440px] overflow-auto rounded-lg border border-[#e4e7ec]">
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#667085]">No items match the current filter.</div>
              ) : (
                <ul className="divide-y divide-[#eaecf0]">
                  {filteredItems.map((item) => (
                    <li key={item.id} className="flex items-start gap-3 p-4">
                      <input
                        type="checkbox"
                        checked={selectedItemIds.includes(item.id)}
                        onChange={() => onToggleItem(item.id)}
                        className="mt-1 h-4 w-4"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-[#101828]">{item.title}</p>
                          <Badge variant="outline">{item.kind}</Badge>
                          {item.status && <Badge variant="outline">{item.status}</Badge>}
                        </div>

                        {item.description && (
                          <p className="mt-1 line-clamp-2 text-sm text-[#667085]">{item.description}</p>
                        )}

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#667085]">
                          <span>Author: {item.author || 'Unknown'}</span>
                          <span>Updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
                          {item.url && (
                            <a
                              className="text-[#7F56D9] hover:underline"
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open source item
                            </a>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStepWithUrl('source')}>
                Back to Source
              </Button>
              <Button type="button" onClick={() => setStepWithUrl('generate')} disabled={!canContinueToGenerate}>
                Continue to Generate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'generate' && (
        <Card>
          <CardHeader>
            <CardTitle>3. Generate Draft</CardTitle>
            <CardDescription>
              AI will generate rich HTML from {selectedItems.length} selected source items.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="releaseTitle">Release note title</Label>
              <Input
                id="releaseTitle"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="January 2026 Product Updates"
              />
            </div>

            <div>
              <Label htmlFor="releaseTone">Tone</Label>
              <select
                id="releaseTone"
                value={tone}
                onChange={(event) => setTone(event.target.value as GenerateTone)}
                className="mt-1 w-full rounded-md border border-[#d0d5dd] px-3 py-2"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="technical">Technical</option>
              </select>
            </div>

            <div>
              <Label htmlFor="companyContext">Company context (optional)</Label>
              <Textarea
                id="companyContext"
                value={companyDetails}
                onChange={(event) => setCompanyDetails(event.target.value)}
                placeholder="Any product context or audience details to guide the output."
                rows={3}
              />
            </div>

            <div className="rounded-lg border border-[#e4e7ec] bg-[#f9fafb] p-4 text-sm text-[#475467]">
              <p className="font-medium text-[#101828]">Selection summary</p>
              <p className="mt-1">{selectedItems.length} items selected</p>
              <p>
                {selectedItems.filter((item) => item.kind === 'commit').length} commits,{' '}
                {selectedItems.filter((item) => item.kind === 'pr').length} pull requests,{' '}
                {selectedItems.filter((item) => item.kind === 'issue').length} issues
              </p>
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStepWithUrl('items')}>
                Back to Items
              </Button>
              <Button type="button" onClick={generateDraft} disabled={generatingDraft || selectedItems.length === 0}>
                {generatingDraft ? 'Generating Draft...' : 'Generate and Save Draft'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'edit' && (
        <Card>
          <CardHeader>
            <CardTitle>4. Edit Draft</CardTitle>
            <CardDescription>
              Your draft is ready. Open the rich editor to refine language, add media, and polish final formatting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              Draft created successfully.
            </div>

            {draftId && (
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href={`/dashboard/releases/edit/${draftId}`}>Open Editor</Link>
                </Button>
                <Button variant="outline" onClick={() => setStepWithUrl('publish')}>
                  Continue to Publish Checklist
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 'publish' && (
        <Card>
          <CardHeader>
            <CardTitle>5. Publish</CardTitle>
            <CardDescription>
              Publishing is done from the draft editor so you can review final output and notify subscribers safely.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-[#475467]">
            <ol className="list-inside list-decimal space-y-2">
              <li>Open your draft editor.</li>
              <li>Run the publish modal checks and metadata fields.</li>
              <li>Publish and optionally notify subscribers.</li>
            </ol>

            <div className="flex flex-wrap gap-3">
              {draftId && (
                <Button asChild>
                  <Link href={`/dashboard/releases/edit/${draftId}`}>Open Draft to Publish</Link>
                </Button>
              )}
              <Button asChild variant="outline">
                <Link href="/dashboard/releases">Back to Releases</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6 text-sm text-[#475467]">
          <p className="font-medium text-[#101828]">Why this flow is faster</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Single guided path from source selection to draft editor.</li>
            <li>Integration API responses are cached for quick re-runs.</li>
            <li>Draft creation is deterministic and always opens editable rich HTML.</li>
          </ul>
          {draftId && (
            <p className="mt-3">
              Current draft ID: <code>{draftId}</code>
            </p>
          )}
          {companyDetails && (
            <p className="mt-2 text-xs text-[#667085]">
              Context preview: {textFromHtml(companyDetails).slice(0, 120)}
              {textFromHtml(companyDetails).length > 120 ? '…' : ''}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
