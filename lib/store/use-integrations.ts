'use client'

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Integration } from '@/types/database'

interface IntegrationStatus {
  connected: boolean
  lastSync?: string
  error?: string
}

interface GitHubRepository {
  id: string
  name: string
  full_name: string
  owner: string
  private: boolean
  description?: string
  url: string
}

interface JiraProject {
  id: string
  key: string
  name: string
  description?: string
  projectTypeKey: string
}

interface LinearTeam {
  id: string
  name: string
  key: string
  description?: string
}

interface IntegrationsState {
  // Data
  integrations: Integration[]
  
  // GitHub
  githubRepositories: GitHubRepository[]
  selectedGitHubRepo: GitHubRepository | null
  
  // Jira
  jiraProjects: JiraProject[]
  selectedJiraProject: JiraProject | null
  
  // Linear
  linearTeams: LinearTeam[]
  selectedLinearTeam: LinearTeam | null
  
  // Status
  statuses: Record<string, IntegrationStatus>
  
  // UI State
  isLoading: boolean
  isConnecting: boolean
  isDisconnecting: boolean
  error: string | null
  
  // Actions - Data Management
  setIntegrations: (integrations: Integration[]) => void
  addIntegration: (integration: Integration) => void
  updateIntegration: (id: string, updates: Partial<Integration>) => void
  removeIntegration: (id: string) => void
  
  // Actions - GitHub
  setGitHubRepositories: (repositories: GitHubRepository[]) => void
  setSelectedGitHubRepo: (repo: GitHubRepository | null) => void
  
  // Actions - Jira
  setJiraProjects: (projects: JiraProject[]) => void
  setSelectedJiraProject: (project: JiraProject | null) => void
  
  // Actions - Linear
  setLinearTeams: (teams: LinearTeam[]) => void
  setSelectedLinearTeam: (team: LinearTeam | null) => void
  
  // Actions - Status
  setIntegrationStatus: (type: string, status: IntegrationStatus) => void
  
  // Actions - API Operations
  fetchIntegrations: (organizationId: string) => Promise<void>
  connectIntegration: (type: string, config: Record<string, any>) => Promise<Integration | null>
  disconnectIntegration: (id: string) => Promise<void>
  testConnection: (type: string, config?: Record<string, any>) => Promise<boolean>
  
  // Actions - GitHub API
  fetchGitHubRepositories: () => Promise<void>
  fetchGitHubCommits: (owner: string, repo: string, since?: string) => Promise<any[]>
  fetchGitHubPullRequests: (owner: string, repo: string, state?: string) => Promise<any[]>
  
  // Actions - Jira API
  fetchJiraProjects: () => Promise<void>
  fetchJiraIssues: (projectKey: string, jql?: string) => Promise<any[]>
  
  // Actions - Linear API
  fetchLinearTeams: () => Promise<void>
  fetchLinearIssues: (teamId: string, filter?: Record<string, any>) => Promise<any[]>
  
  // UI Actions
  setLoading: (loading: boolean) => void
  setConnecting: (connecting: boolean) => void
  setDisconnecting: (disconnecting: boolean) => void
  setError: (error: string | null) => void
  
  // Utility Actions
  clearError: () => void
  reset: () => void
}

const initialState = {
  integrations: [],
  githubRepositories: [],
  selectedGitHubRepo: null,
  jiraProjects: [],
  selectedJiraProject: null,
  linearTeams: [],
  selectedLinearTeam: null,
  statuses: {},
  isLoading: false,
  isConnecting: false,
  isDisconnecting: false,
  error: null
}

export const useIntegrationsStore = create<IntegrationsState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Data actions
        setIntegrations: (integrations) => 
          set({ integrations }, false, 'setIntegrations'),
        
        addIntegration: (integration) => 
          set((state) => ({
            integrations: [...state.integrations, integration]
          }), false, 'addIntegration'),
        
        updateIntegration: (id, updates) =>
          set((state) => ({
            integrations: state.integrations.map((integration) =>
              integration.id === id ? { ...integration, ...updates } : integration
            )
          }), false, 'updateIntegration'),
        
        removeIntegration: (id) =>
          set((state) => ({
            integrations: state.integrations.filter((integration) => integration.id !== id)
          }), false, 'removeIntegration'),
        
        // GitHub actions
        setGitHubRepositories: (repositories) => 
          set({ githubRepositories: repositories }, false, 'setGitHubRepositories'),
        
        setSelectedGitHubRepo: (repo) => 
          set({ selectedGitHubRepo: repo }, false, 'setSelectedGitHubRepo'),
        
        // Jira actions
        setJiraProjects: (projects) => 
          set({ jiraProjects: projects }, false, 'setJiraProjects'),
        
        setSelectedJiraProject: (project) => 
          set({ selectedJiraProject: project }, false, 'setSelectedJiraProject'),
        
        // Linear actions
        setLinearTeams: (teams) => 
          set({ linearTeams: teams }, false, 'setLinearTeams'),
        
        setSelectedLinearTeam: (team) => 
          set({ selectedLinearTeam: team }, false, 'setSelectedLinearTeam'),
        
        // Status actions
        setIntegrationStatus: (type, status) =>
          set((state) => ({
            statuses: { ...state.statuses, [type]: status }
          }), false, 'setIntegrationStatus'),
        
        // API Operations
        fetchIntegrations: async (organizationId: string) => {
          try {
            set({ isLoading: true, error: null }, false, 'fetchIntegrationsStart')
            const supabase = createClientComponentClient()
            
            const { data, error } = await supabase
              .from('integrations')
              .select('*')
              .eq('organization_id', organizationId)
            
            if (error) throw error
            
            set({ integrations: data || [] }, false, 'fetchIntegrationsSuccess')
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch integrations'
            set({ error: errorMessage }, false, 'fetchIntegrationsError')
          } finally {
            set({ isLoading: false }, false, 'fetchIntegrationsComplete')
          }
        },
        
        connectIntegration: async (type: string, config: Record<string, any>) => {
          try {
            set({ isConnecting: true, error: null }, false, 'connectIntegrationStart')
            const response = await fetch('/api/integrations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type, config })
            })
            
            if (!response.ok) throw new Error('Failed to connect integration')
            
            const integration = await response.json()
            get().addIntegration(integration)
            get().setIntegrationStatus(type, { connected: true })
            
            set({ isConnecting: false }, false, 'connectIntegrationSuccess')
            return integration
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to connect integration'
            set({ error: errorMessage, isConnecting: false }, false, 'connectIntegrationError')
            return null
          }
        },
        
        disconnectIntegration: async (id: string) => {
          try {
            set({ isDisconnecting: true, error: null }, false, 'disconnectIntegrationStart')
            const response = await fetch(`/api/integrations/${id}`, {
              method: 'DELETE'
            })
            
            if (!response.ok) throw new Error('Failed to disconnect integration')
            
            get().removeIntegration(id)
            set({ isDisconnecting: false }, false, 'disconnectIntegrationSuccess')
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to disconnect integration'
            set({ error: errorMessage, isDisconnecting: false }, false, 'disconnectIntegrationError')
          }
        },
        
        testConnection: async (type: string, config?: Record<string, any>) => {
          try {
            set({ isLoading: true, error: null }, false, 'testConnectionStart')
            const response = await fetch(`/api/integrations/${type}/test-connection`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ config })
            })
            
            const result = await response.json()
            
            if (!response.ok) {
              get().setIntegrationStatus(type, { connected: false, error: result.error })
              return false
            }
            
            get().setIntegrationStatus(type, { connected: true })
            return true
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Connection test failed'
            get().setIntegrationStatus(type, { connected: false, error: errorMessage })
            return false
          } finally {
            set({ isLoading: false }, false, 'testConnectionComplete')
          }
        },
        
        // GitHub API actions
        fetchGitHubRepositories: async () => {
          try {
            set({ isLoading: true, error: null }, false, 'fetchGitHubRepositoriesStart')
            const response = await fetch('/api/integrations/github/repositories')
            
            if (!response.ok) throw new Error('Failed to fetch GitHub repositories')
            
            const repositories = await response.json()
            set({ githubRepositories: repositories }, false, 'fetchGitHubRepositoriesSuccess')
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch GitHub repositories'
            set({ error: errorMessage }, false, 'fetchGitHubRepositoriesError')
          } finally {
            set({ isLoading: false }, false, 'fetchGitHubRepositoriesComplete')
          }
        },
        
        fetchGitHubCommits: async (owner: string, repo: string, since?: string) => {
          try {
            const params = new URLSearchParams({ owner, repo })
            if (since) params.append('since', since)
            
            const response = await fetch(`/api/integrations/github/repositories/${owner}/${repo}/commits?${params}`)
            
            if (!response.ok) throw new Error('Failed to fetch GitHub commits')
            
            return await response.json()
          } catch (error) {
            console.error('Error fetching GitHub commits:', error)
            return []
          }
        },
        
        fetchGitHubPullRequests: async (owner: string, repo: string, state?: string) => {
          try {
            const params = new URLSearchParams({ owner, repo })
            if (state) params.append('state', state)
            
            const response = await fetch(`/api/integrations/github/repositories/${owner}/${repo}/pulls?${params}`)
            
            if (!response.ok) throw new Error('Failed to fetch GitHub pull requests')
            
            return await response.json()
          } catch (error) {
            console.error('Error fetching GitHub pull requests:', error)
            return []
          }
        },
        
        // Jira API actions
        fetchJiraProjects: async () => {
          try {
            set({ isLoading: true, error: null }, false, 'fetchJiraProjectsStart')
            const response = await fetch('/api/integrations/jira/projects')
            
            if (!response.ok) throw new Error('Failed to fetch Jira projects')
            
            const projects = await response.json()
            set({ jiraProjects: projects }, false, 'fetchJiraProjectsSuccess')
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch Jira projects'
            set({ error: errorMessage }, false, 'fetchJiraProjectsError')
          } finally {
            set({ isLoading: false }, false, 'fetchJiraProjectsComplete')
          }
        },
        
        fetchJiraIssues: async (projectKey: string, jql?: string) => {
          try {
            const params = new URLSearchParams({ projectKey })
            if (jql) params.append('jql', jql)
            
            const response = await fetch(`/api/integrations/jira/issues?${params}`)
            
            if (!response.ok) throw new Error('Failed to fetch Jira issues')
            
            return await response.json()
          } catch (error) {
            console.error('Error fetching Jira issues:', error)
            return []
          }
        },
        
        // Linear API actions
        fetchLinearTeams: async () => {
          try {
            set({ isLoading: true, error: null }, false, 'fetchLinearTeamsStart')
            const response = await fetch('/api/integrations/linear/teams')
            
            if (!response.ok) throw new Error('Failed to fetch Linear teams')
            
            const teams = await response.json()
            set({ linearTeams: teams }, false, 'fetchLinearTeamsSuccess')
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch Linear teams'
            set({ error: errorMessage }, false, 'fetchLinearTeamsError')
          } finally {
            set({ isLoading: false }, false, 'fetchLinearTeamsComplete')
          }
        },
        
        fetchLinearIssues: async (teamId: string, filter?: Record<string, any>) => {
          try {
            const params = new URLSearchParams({ teamId })
            if (filter) {
              Object.entries(filter).forEach(([key, value]) => {
                params.append(key, String(value))
              })
            }
            
            const response = await fetch(`/api/integrations/linear/issues?${params}`)
            
            if (!response.ok) throw new Error('Failed to fetch Linear issues')
            
            return await response.json()
          } catch (error) {
            console.error('Error fetching Linear issues:', error)
            return []
          }
        },
        
        // UI actions
        setLoading: (loading) => 
          set({ isLoading: loading }, false, 'setLoading'),
        
        setConnecting: (connecting) => 
          set({ isConnecting: connecting }, false, 'setConnecting'),
        
        setDisconnecting: (disconnecting) => 
          set({ isDisconnecting: disconnecting }, false, 'setDisconnecting'),
        
        setError: (error) => 
          set({ error }, false, 'setError'),
        
        // Utility actions
        clearError: () => set({ error: null }, false, 'clearError'),
        
        reset: () => set(initialState, false, 'reset')
      }),
      {
        name: 'integrations-store',
        partialize: (state) => ({
          integrations: state.integrations,
          githubRepositories: state.githubRepositories,
          selectedGitHubRepo: state.selectedGitHubRepo,
          jiraProjects: state.jiraProjects,
          selectedJiraProject: state.selectedJiraProject,
          linearTeams: state.linearTeams,
          selectedLinearTeam: state.selectedLinearTeam,
          statuses: state.statuses
        })
      }
    ),
    {
      name: 'integrations-store'
    }
  )
)

// Selectors for computed values
export const useIntegrationsSelectors = () => {
  const store = useIntegrationsStore()
  
  return {
    // Computed values
    hasIntegrations: store.integrations.length > 0,
    connectedIntegrations: store.integrations.filter(integration => 
      store.statuses[integration.type]?.connected
    ),
    
    // Integration status helpers
    isGitHubConnected: store.statuses.github?.connected || false,
    isJiraConnected: store.statuses.jira?.connected || false,
    isLinearConnected: store.statuses.linear?.connected || false,
    
    // Data availability
    hasGitHubRepositories: store.githubRepositories.length > 0,
    hasJiraProjects: store.jiraProjects.length > 0,
    hasLinearTeams: store.linearTeams.length > 0,
    
    // Selected items
    hasSelectedGitHubRepo: !!store.selectedGitHubRepo,
    hasSelectedJiraProject: !!store.selectedJiraProject,
    hasSelectedLinearTeam: !!store.selectedLinearTeam,
    
    // Loading states
    isAnyLoading: store.isLoading || store.isConnecting || store.isDisconnecting
  }
}

// Actions hook for easier access
export const useIntegrationsActions = () => {
  const store = useIntegrationsStore()
  
  return {
    // Data actions
    fetchIntegrations: store.fetchIntegrations,
    connectIntegration: store.connectIntegration,
    disconnectIntegration: store.disconnectIntegration,
    testConnection: store.testConnection,
    
    // GitHub actions
    fetchGitHubRepositories: store.fetchGitHubRepositories,
    fetchGitHubCommits: store.fetchGitHubCommits,
    fetchGitHubPullRequests: store.fetchGitHubPullRequests,
    setSelectedGitHubRepo: store.setSelectedGitHubRepo,
    
    // Jira actions
    fetchJiraProjects: store.fetchJiraProjects,
    fetchJiraIssues: store.fetchJiraIssues,
    setSelectedJiraProject: store.setSelectedJiraProject,
    
    // Linear actions
    fetchLinearTeams: store.fetchLinearTeams,
    fetchLinearIssues: store.fetchLinearIssues,
    setSelectedLinearTeam: store.setSelectedLinearTeam,
    
    // Utility actions
    clearError: store.clearError,
    reset: store.reset
  }
} 