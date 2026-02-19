import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { GitHubRepositoryManager } from '@/components/integrations/github-repository-manager'
import { server } from '@/__tests__/msw/server'

const mockRepositories = [
  {
    id: 1,
    name: 'my-app',
    full_name: 'user/my-app',
    description: 'My awesome application',
    private: false,
    html_url: 'https://github.com/user/my-app',
    default_branch: 'main',
    language: 'TypeScript',
    stargazers_count: 42,
    updated_at: '2024-01-15T10:30:00Z',
    topics: ['react', 'typescript'],
    open_issues_count: 3,
    has_issues: true,
    archived: false,
    disabled: false,
    size: 1024,
    fork: false,
    owner: {
      login: 'user',
      avatar_url: 'https://github.com/user.png',
      type: 'User'
    }
  },
  {
    id: 2,
    name: 'another-repo',
    full_name: 'user/another-repo',
    description: 'Another repository',
    private: true,
    html_url: 'https://github.com/user/another-repo',
    default_branch: 'main',
    language: 'JavaScript',
    stargazers_count: 15,
    updated_at: '2024-01-10T08:15:00Z',
    topics: ['javascript', 'node'],
    open_issues_count: 1,
    has_issues: true,
    archived: false,
    disabled: false,
    size: 512,
    fork: false,
    owner: {
      login: 'user',
      avatar_url: 'https://github.com/user.png',
      type: 'User'
    }
  }
]

const mockUser = {
  login: 'testuser',
  avatar_url: 'https://github.com/testuser.png',
  public_repos: 10,
  total_private_repos: 5,
  owned_private_repos: 3
}

const mockApiResponse = {
  repositories: mockRepositories,
  user: mockUser,
  rate_limit: {
    limit: 5000,
    remaining: 4999,
    reset: Date.now() + 3600000
  }
}

describe('GitHubRepositoryManager', () => {
  beforeEach(() => {
    server.use(
      rest.get('/api/integrations/github/repositories', (_req, res, ctx) =>
        res(ctx.status(200), ctx.json(mockApiResponse))
      )
    )
  })

  describe('Initial Loading', () => {
    it('renders loading state initially', async () => {
      render(<GitHubRepositoryManager />)
      
      expect(screen.getByText(/loading repositories/i)).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByText('my-app')).toBeInTheDocument()
      })
    })

    it('loads and displays repositories', async () => {
      render(<GitHubRepositoryManager />)
      
      await waitFor(() => {
        expect(screen.getByText('my-app')).toBeInTheDocument()
      })
      
      expect(screen.getByText('another-repo')).toBeInTheDocument()
      expect(screen.getByText('My awesome application')).toBeInTheDocument()
    })

    it('displays connection status', async () => {
      render(<GitHubRepositoryManager />)
      
      await waitFor(() => {
        expect(screen.getByText(/connected as @testuser/i)).toBeInTheDocument()
      })
      
      // Look for the badge with "Connected" text specifically
      const connectedElements = screen.getAllByText(/connected/i)
      expect(connectedElements.length).toBeGreaterThan(0)
      // Check that at least one is the badge (has specific classes)
      const badge = connectedElements.find(el => 
        el.closest('.bg-green-100') || el.className.includes('bg-green-100')
      )
      expect(badge).toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('filters repositories by name', async () => {
      const user = userEvent.setup()
      render(<GitHubRepositoryManager />)
      
      await waitFor(() => {
        expect(screen.getByText('my-app')).toBeInTheDocument()
      })
      
      const searchInput = screen.getByPlaceholderText(/search repositories/i)
      await user.type(searchInput, 'my-app')
      
      expect(screen.getByText('my-app')).toBeInTheDocument()
      expect(screen.queryByText('another-repo')).not.toBeInTheDocument()
    })

    it('filters repositories by description', async () => {
      const user = userEvent.setup()
      render(<GitHubRepositoryManager />)
      
      await waitFor(() => {
        expect(screen.getByText('my-app')).toBeInTheDocument()
      })
      
      const searchInput = screen.getByPlaceholderText(/search repositories/i)
      await user.type(searchInput, 'awesome')
      
      expect(screen.getByText('my-app')).toBeInTheDocument()
      expect(screen.queryByText('another-repo')).not.toBeInTheDocument()
    })

    it('shows no results message when search yields no matches', async () => {
      const user = userEvent.setup()
      render(<GitHubRepositoryManager />)
      
      await waitFor(() => {
        expect(screen.getByText('my-app')).toBeInTheDocument()
      })
      
      const searchInput = screen.getByPlaceholderText(/search repositories/i)
      await user.type(searchInput, 'nonexistent')
      
      expect(screen.getByText(/no repositories match your search/i)).toBeInTheDocument()
    })
  })

  describe('Repository Selection', () => {
    it('allows selecting repositories', async () => {
      const onRepositorySelect = jest.fn()
      const user = userEvent.setup()
      
      render(<GitHubRepositoryManager onRepositorySelect={onRepositorySelect} />)
      
      await waitFor(() => {
        expect(screen.getByText('my-app')).toBeInTheDocument()
      })
      
      // Click on the repository card (not a select button)
      const repoCard = screen.getByText('my-app').closest('div')
      await user.click(repoCard!)
      
      // In multiple selection mode, it returns an array
      expect(onRepositorySelect).toHaveBeenCalledWith([expect.objectContaining({
        name: 'my-app'
      })])
    })

    it('shows selected repositories', async () => {
      const user = userEvent.setup()
      render(<GitHubRepositoryManager selectedRepositories={[mockRepositories[0]]} />)
      
      await waitFor(() => {
        expect(screen.getByText('my-app')).toBeInTheDocument()
      })
      
      // Should show selected count in description
      expect(screen.getByText(/1 selected/i)).toBeInTheDocument()
    })
  })

  describe('Filtering', () => {
    it('filters by owned repositories', async () => {
      const user = userEvent.setup()
      render(<GitHubRepositoryManager />)
      
      await waitFor(() => {
        expect(screen.getByText('my-app')).toBeInTheDocument()
      })
      
      const ownedTab = screen.getByText(/owned/i)
      await user.click(ownedTab)
      
      // Should still show repositories since they're not forks
      expect(screen.getByText('my-app')).toBeInTheDocument()
    })

    it('filters by popular repositories', async () => {
      const user = userEvent.setup()
      render(<GitHubRepositoryManager />)
      
      await waitFor(() => {
        expect(screen.getByText('my-app')).toBeInTheDocument()
      })
      
      const popularTab = screen.getByText(/popular/i)
      await user.click(popularTab)
      
      // Should show repositories with stars
      expect(screen.getByText('my-app')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    let consoleErrorSpy: jest.SpyInstance

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleErrorSpy.mockRestore()
    })

    it('displays error message for failed requests', async () => {
      server.use(
        rest.get('/api/integrations/github/repositories', (_req, res, ctx) =>
          res(ctx.status(403), ctx.json({ error: 'Forbidden' }))
        )
      )
      
      render(<GitHubRepositoryManager />)
      
      await waitFor(() => {
        expect(screen.getByText(/connection error/i)).toBeInTheDocument()
      })
    })

    it('handles network errors', async () => {
      server.use(
        rest.get('/api/integrations/github/repositories', (_req, res, ctx) =>
          res.networkError('Network error')
        )
      )
      
      render(<GitHubRepositoryManager />)
      
      await waitFor(() => {
        expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument()
      })
    })

    it('provides retry functionality on error', async () => {
      const user = userEvent.setup()
      let attempts = 0
      server.use(
        rest.get('/api/integrations/github/repositories', (_req, res, ctx) => {
          attempts += 1
          if (attempts === 1) {
            return res.networkError('Network error')
          }
          return res(ctx.status(200), ctx.json(mockApiResponse))
        })
      )
      
      render(<GitHubRepositoryManager />)
      
      await waitFor(() => {
        expect(screen.getByText(/retry/i)).toBeInTheDocument()
      })
      
      const retryButton = screen.getByText(/retry/i)
      await user.click(retryButton)
      
      await waitFor(() => {
        expect(screen.getByText('my-app')).toBeInTheDocument()
      })
    })
  })

  describe('Refresh Functionality', () => {
    it('allows refreshing repository list', async () => {
      const user = userEvent.setup()
      let requestCount = 0
      server.use(
        rest.get('/api/integrations/github/repositories', (_req, res, ctx) => {
          requestCount += 1
          return res(ctx.status(200), ctx.json(mockApiResponse))
        })
      )

      render(<GitHubRepositoryManager />)
      
      await waitFor(() => {
        expect(screen.getByText('my-app')).toBeInTheDocument()
      })
      
      // Find the refresh button by its icon (RefreshCwIcon)
      const refreshButton = screen.getByRole('button', { name: '' })
      await user.click(refreshButton)
      
      await waitFor(() => {
        expect(requestCount).toBeGreaterThanOrEqual(2)
      })
    })
  })

  describe('Accessibility', () => {
    it('provides proper search input', async () => {
      render(<GitHubRepositoryManager />)
      
      await waitFor(() => {
        expect(screen.getByText('my-app')).toBeInTheDocument()
      })
      
      const searchInput = screen.getByPlaceholderText(/search repositories/i)
      expect(searchInput).toBeInTheDocument()
      // Input component doesn't have explicit type="text" attribute
      expect(searchInput).toHaveAttribute('placeholder', 'Search repositories...')
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<GitHubRepositoryManager />)
      
      await waitFor(() => {
        expect(screen.getByText('my-app')).toBeInTheDocument()
      })
      
      const searchInput = screen.getByPlaceholderText(/search repositories/i)
      await user.click(searchInput)
      
      await user.keyboard('my-app')
      expect(searchInput).toHaveValue('my-app')
    })

    it('provides screen reader friendly content', async () => {
      render(<GitHubRepositoryManager />)
      
      await waitFor(() => {
        expect(screen.getByText('my-app')).toBeInTheDocument()
      })
      
      // Check for accessible elements
      expect(screen.getByText(/repository selection/i)).toBeInTheDocument()
      expect(screen.getByText(/choose repositories/i)).toBeInTheDocument()
    })
  })
}) 
