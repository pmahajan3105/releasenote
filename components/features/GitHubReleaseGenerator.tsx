'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase/ssr'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { generateSlug } from '@/lib/utils'
import type { Database } from '@/types/database'

interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description?: string
  private: boolean
}

type GitHubCommit = {
  sha: string
  message: string
  author?: {
    name?: string
  }
}

type GitHubPullRequest = {
  number: number
  title: string
  body?: string | null
  merged_at?: string | null
  user?: {
    login?: string
  }
}

export function GitHubReleaseGenerator() {
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()
  const [repositories, setRepositories] = useState<GitHubRepository[]>([])
  const [selectedRepo, setSelectedRepo] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingRepos, setLoadingRepos] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [draftId, setDraftId] = useState<string | null>(null)
  const [error, setError] = useState('')

  // Load user's GitHub repositories
  const loadRepositories = async () => {
    setLoadingRepos(true)
    setError('')
    
    try {
      const response = await fetch('/api/integrations/github/repositories')
      
      if (!response.ok) {
        throw new Error('Failed to load repositories')
      }
      
      const data = await response.json()
      setRepositories(data.repositories || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load repositories')
    } finally {
      setLoadingRepos(false)
    }
  }

  // Generate release notes from selected repository
  const generateReleaseNotes = async () => {
    if (!selectedRepo) {
      setError('Please select a repository')
      return
    }

    setLoading(true)
    setError('')
    setGeneratedContent('')
    setDraftId(null)

    try {
      const [owner, repo] = selectedRepo.split('/')

      if (!owner || !repo) {
        throw new Error('Invalid repository selection')
      }

      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

      const commitsResponse = await fetch(
        `/api/integrations/github/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?since=${encodeURIComponent(since)}&per_page=50&page=1`
      )

      if (!commitsResponse.ok) {
        const data = await commitsResponse.json().catch(() => ({}))
        const message = typeof data?.error === 'string' ? data.error : 'Failed to fetch commits'
        throw new Error(message)
      }

      const commitsPayload = await commitsResponse.json()
      const commits = Array.isArray(commitsPayload?.commits) ? (commitsPayload.commits as GitHubCommit[]) : []

      const pullsResponse = await fetch(
        `/api/integrations/github/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls?state=closed&sort=updated&direction=desc&per_page=20&page=1`
      )

      if (!pullsResponse.ok) {
        const data = await pullsResponse.json().catch(() => ({}))
        const message = typeof data?.error === 'string' ? data.error : 'Failed to fetch pull requests'
        throw new Error(message)
      }

      const pullsPayload = await pullsResponse.json()
      const pullRequests = Array.isArray(pullsPayload?.pull_requests)
        ? (pullsPayload.pull_requests as GitHubPullRequest[])
        : []

      const mergedPullRequests = pullRequests.filter((pr) => Boolean(pr.merged_at)).slice(0, 10)

      if (commits.length === 0 && mergedPullRequests.length === 0) {
        throw new Error('No recent commits or merged pull requests found for this repository')
      }

      const promptCommits = [
        ...commits.map((commit) => ({
          message: commit.message,
          author: commit.author?.name,
          sha: commit.sha,
        })),
        ...mergedPullRequests.map((pr) => ({
          message: `PR #${pr.number}: ${pr.title}${pr.body ? ` — ${pr.body.substring(0, 200)}` : ''}`,
          author: pr.user?.login,
          sha: String(pr.number),
        })),
      ]
      
      const response = await fetch('/api/release-notes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commits: promptCommits,
          template: 'traditional',
          tone: 'professional'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate release notes')
      }

      const data = await response.json()
      const generatedHtml = typeof data?.content === 'string' ? data.content : ''
      if (!generatedHtml) {
        throw new Error('AI generation returned empty content')
      }

      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError || !authData.user) {
        throw new Error('User not authenticated')
      }

      const title = `${repo} Release Notes - ${new Date().toLocaleDateString()}`
      const slug = `${generateSlug(title)}-${Date.now().toString(36)}`

      const sourceTicketIds: string[] = [
        ...commits.map((c) => c.sha),
        ...mergedPullRequests.map((pr) => String(pr.number)),
      ]

      const { data: draftNote, error: insertError } = await supabase
        .from('release_notes')
        .insert({
          organization_id: authData.user.id,
          author_id: authData.user.id,
          title,
          slug,
          status: 'draft',
          content_html: generatedHtml,
          content_markdown: '',
          source_ticket_ids: sourceTicketIds,
        })
        .select('id')
        .single()

      if (insertError) {
        throw insertError
      }

      if (!draftNote?.id) {
        throw new Error('Failed to create draft release note')
      }

      setGeneratedContent(generatedHtml)
      setDraftId(draftNote.id)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate release notes')
    } finally {
      setLoading(false)
    }
  }

  // Save generated content as a new release note
  const saveAsReleaseNote = async () => {
    if (!draftId) return
    router.push(`/dashboard/releases/edit/${draftId}`)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Release Notes from GitHub</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Load Repositories */}
          <div>
            <Button 
              onClick={loadRepositories} 
              disabled={loadingRepos}
              variant="outline"
            >
              {loadingRepos ? 'Loading...' : 'Load My Repositories'}
            </Button>
          </div>

          {/* Repository Selection */}
          {repositories.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Repository:</label>
              <select 
                className="w-full p-2 border rounded"
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
              >
                <option value="">Choose a repository...</option>
                {repositories.map((repo) => (
                  <option key={repo.id} value={repo.full_name}>
                    {repo.full_name} {repo.private ? '(Private)' : '(Public)'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Generate Button */}
          {selectedRepo && (
            <Button 
              onClick={generateReleaseNotes} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Generating...' : 'Generate Release Notes'}
            </Button>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Content */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Release Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className="p-4 bg-gray-50 border rounded min-h-[200px] prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: generatedContent }}
            />
            
            <div className="flex gap-2">
              <Button onClick={saveAsReleaseNote} disabled={!draftId}>
                Open Draft Editor
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setGeneratedContent('')}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Help */}
      <Card>
        <CardContent className="text-sm text-gray-600 pt-6">
          <p><strong>How it works:</strong></p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Load your GitHub repositories</li>
            <li>Select a repository to analyze</li>
            <li>AI will generate release notes from recent commits and PRs</li>
            <li>Review and save as a draft release note</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
