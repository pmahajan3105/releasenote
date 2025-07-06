import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchFilter } from '@/components/public/search-filter'

const mockReleaseNotes = [
  {
    id: '1',
    title: 'Feature Update',
    slug: 'feature-update',
    published_at: '2024-01-15T10:30:00Z',
    content_html: '<p>New features added</p>',
    category: 'feature',
    tags: ['ui', 'enhancement']
  },
  {
    id: '2',
    title: 'Bug Fix Release',
    slug: 'bug-fix-release',
    published_at: '2024-01-10T08:15:00Z',
    content_html: '<p>Critical bugs fixed</p>',
    category: 'bugfix',
    tags: ['bug', 'fix']
  },
  {
    id: '3',
    title: 'Security Update',
    slug: 'security-update',
    published_at: '2024-01-05T14:20:00Z',
    content_html: '<p>Security improvements</p>',
    category: 'security',
    tags: ['security', 'patch']
  }
]

describe('SearchFilter Component', () => {
  const defaultProps = {
    releaseNotes: mockReleaseNotes,
    onFilter: jest.fn(),
    className: ''
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders search input', () => {
      render(<SearchFilter {...defaultProps} />)
      
      expect(screen.getByPlaceholderText(/search release notes/i)).toBeInTheDocument()
    })

    it('renders filter button', () => {
      render(<SearchFilter {...defaultProps} />)
      
      expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument()
    })

    it('shows filter count badge when filters are active', async () => {
      const user = userEvent.setup()
      render(<SearchFilter {...defaultProps} />)
      
      const filterButton = screen.getByRole('button', { name: /filter/i })
      await user.click(filterButton)
      await user.click(screen.getByText('feature'))
      
      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument()
      })
    })
  })

  describe('Search Functionality', () => {
    it('handles search input changes', async () => {
      const user = userEvent.setup()
      render(<SearchFilter {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText(/search release notes/i)
      await user.type(searchInput, 'feature')
      
      expect(searchInput).toHaveValue('feature')
    })

    it('calls onFilter when search query changes', async () => {
      const user = userEvent.setup()
      const onFilter = jest.fn()
      render(<SearchFilter {...defaultProps} onFilter={onFilter} />)
      
      const searchInput = screen.getByPlaceholderText(/search release notes/i)
      await user.type(searchInput, 'bug')
      
      await waitFor(() => {
        expect(onFilter).toHaveBeenCalled()
      })
    })

    it('filters by title', async () => {
      const user = userEvent.setup()
      const onFilter = jest.fn()
      render(<SearchFilter {...defaultProps} onFilter={onFilter} />)
      
      const searchInput = screen.getByPlaceholderText(/search release notes/i)
      await user.type(searchInput, 'Feature Update')
      
      await waitFor(() => {
        expect(onFilter).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ title: 'Feature Update' })
          ])
        )
      })
    })

    it('filters by content', async () => {
      const user = userEvent.setup()
      const onFilter = jest.fn()
      render(<SearchFilter {...defaultProps} onFilter={onFilter} />)
      
      const searchInput = screen.getByPlaceholderText(/search release notes/i)
      await user.type(searchInput, 'Critical bugs')
      
      await waitFor(() => {
        expect(onFilter).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ title: 'Bug Fix Release' })
          ])
        )
      })
    })

    it('is case insensitive', async () => {
      const user = userEvent.setup()
      const onFilter = jest.fn()
      render(<SearchFilter {...defaultProps} onFilter={onFilter} />)
      
      const searchInput = screen.getByPlaceholderText(/search release notes/i)
      await user.type(searchInput, 'SECURITY')
      
      await waitFor(() => {
        expect(onFilter).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ title: 'Security Update' })
          ])
        )
      })
    })

    it('clears search when input is empty', async () => {
      const user = userEvent.setup()
      const onFilter = jest.fn()
      render(<SearchFilter {...defaultProps} onFilter={onFilter} />)
      
      const searchInput = screen.getByPlaceholderText(/search release notes/i)
      
      // Type and then clear
      await user.type(searchInput, 'test')
      await user.clear(searchInput)
      
      await waitFor(() => {
        expect(onFilter).toHaveBeenLastCalledWith(mockReleaseNotes)
      })
    })
  })

  describe('Filter Dropdown', () => {
    it('opens filter dropdown when clicked', async () => {
      const user = userEvent.setup()
      render(<SearchFilter {...defaultProps} />)
      
      const filterButton = screen.getByRole('button', { name: /filter/i })
      await user.click(filterButton)
      
      await waitFor(() => {
        expect(screen.getByText(/date range/i)).toBeInTheDocument()
      })
    })

    it('shows category filters', async () => {
      const user = userEvent.setup()
      render(<SearchFilter {...defaultProps} />)
      
      const filterButton = screen.getByRole('button', { name: /filter/i })
      await user.click(filterButton)
      
      await waitFor(() => {
        expect(screen.getByText(/category/i)).toBeInTheDocument()
        expect(screen.getByText(/feature/i)).toBeInTheDocument()
        expect(screen.getByText(/bugfix/i)).toBeInTheDocument()
        expect(screen.getByText(/security/i)).toBeInTheDocument()
      })
    })

    it('shows date range filters', async () => {
      const user = userEvent.setup()
      render(<SearchFilter {...defaultProps} />)
      
      const filterButton = screen.getByRole('button', { name: /filter/i })
      await user.click(filterButton)
      
      await waitFor(() => {
        expect(screen.getByText(/date range/i)).toBeInTheDocument()
        expect(screen.getByText('All Time')).toBeInTheDocument()
        expect(screen.getByText('Past Week')).toBeInTheDocument()
        expect(screen.getByText('Past Month')).toBeInTheDocument()
      })
    })
  })

  describe('Category Filtering', () => {
    it('filters by category', async () => {
      const user = userEvent.setup()
      const onFilter = jest.fn()
      render(<SearchFilter {...defaultProps} onFilter={onFilter} />)
      
      const filterButton = screen.getByRole('button', { name: /filter/i })
      await user.click(filterButton)
      
      await waitFor(() => {
        expect(screen.getByText('feature')).toBeInTheDocument()
      })
      
      await user.click(screen.getByText('feature'))
      
      await waitFor(() => {
        expect(onFilter).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ category: 'feature' })
          ])
        )
      })
    })

    it('shows active category filter as badge', async () => {
      const user = userEvent.setup()
      render(<SearchFilter {...defaultProps} />)
      
      const filterButton = screen.getByRole('button', { name: /filter/i })
      await user.click(filterButton)
      
      await user.click(screen.getByText('bugfix'))
      
      await waitFor(() => {
        expect(screen.getByText('Category: bugfix')).toBeInTheDocument()
      })
    })

    it('removes category filter when badge is clicked', async () => {
      const user = userEvent.setup()
      const onFilter = jest.fn()
      render(<SearchFilter {...defaultProps} onFilter={onFilter} />)
      
      // Add category filter
      const filterButton = screen.getByRole('button', { name: /filter/i })
      await user.click(filterButton)
      await user.click(screen.getByText('security'))
      
      // Remove category filter by clicking the badge
      await waitFor(() => {
        expect(screen.getByText('Category: security')).toBeInTheDocument()
      })
      
      const categoryBadge = screen.getByText('Category: security').closest('div')
      await user.click(categoryBadge!)
      
      await waitFor(() => {
        expect(screen.queryByText('Category: security')).not.toBeInTheDocument()
        expect(onFilter).toHaveBeenLastCalledWith(mockReleaseNotes)
      })
    })
  })

  describe('Combined Filtering', () => {
    it('combines search and category filters', async () => {
      const user = userEvent.setup()
      const onFilter = jest.fn()
      render(<SearchFilter {...defaultProps} onFilter={onFilter} />)
      
      // Add search
      const searchInput = screen.getByPlaceholderText(/search release notes/i)
      await user.type(searchInput, 'update')
      
      // Add category filter
      const filterButton = screen.getByRole('button', { name: /filter/i })
      await user.click(filterButton)
      await user.click(screen.getByText('feature'))
      
      await waitFor(() => {
        expect(onFilter).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ 
              title: 'Feature Update',
              category: 'feature'
            })
          ])
        )
      })
    })
  })

  describe('Clear All Filters', () => {
    it('shows clear filters button in dropdown when filters are active', async () => {
      const user = userEvent.setup()
      render(<SearchFilter {...defaultProps} />)
      
      const filterButton = screen.getByRole('button', { name: /filter/i })
      await user.click(filterButton)
      await user.click(screen.getByText('feature'))
      
      // Open dropdown again to see clear filters button
      await user.click(filterButton)
      
      await waitFor(() => {
        expect(screen.getByText(/clear filters/i)).toBeInTheDocument()
      })
    })

    it('clears all filters when clear filters is clicked', async () => {
      const user = userEvent.setup()
      const onFilter = jest.fn()
      render(<SearchFilter {...defaultProps} onFilter={onFilter} />)
      
      // Add multiple filters
      const searchInput = screen.getByPlaceholderText(/search release notes/i)
      await user.type(searchInput, 'test')
      
      const filterButton = screen.getByRole('button', { name: /filter/i })
      await user.click(filterButton)
      await user.click(screen.getByText('feature'))
      
      // Clear all filters from dropdown
      await user.click(filterButton)
      await user.click(screen.getByText(/clear filters/i))
      
      await waitFor(() => {
        expect(searchInput).toHaveValue('')
        expect(screen.queryByText('Category: feature')).not.toBeInTheDocument()
        expect(onFilter).toHaveBeenLastCalledWith(mockReleaseNotes)
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles empty release notes array', () => {
      render(<SearchFilter {...defaultProps} releaseNotes={[]} />)
      
      expect(screen.getByPlaceholderText(/search release notes/i)).toBeInTheDocument()
    })

    it('handles release notes without categories', async () => {
      const notesWithoutCategories = [
        {
          id: '1',
          title: 'No Category',
          slug: 'no-category',
          published_at: '2024-01-15T10:30:00Z'
        }
      ]
      
      const user = userEvent.setup()
      render(<SearchFilter {...defaultProps} releaseNotes={notesWithoutCategories} />)
      
      const filterButton = screen.getByRole('button', { name: /filter/i })
      await user.click(filterButton)
      
      // Should not crash and should show date range options
      expect(screen.getByText(/date range/i)).toBeInTheDocument()
    })

    it('handles release notes without tags', async () => {
      const notesWithoutTags = [
        {
          id: '1',
          title: 'No Tags',
          slug: 'no-tags',
          published_at: '2024-01-15T10:30:00Z'
        }
      ]
      
      const user = userEvent.setup()
      render(<SearchFilter {...defaultProps} releaseNotes={notesWithoutTags} />)
      
      const filterButton = screen.getByRole('button', { name: /filter/i })
      await user.click(filterButton)
      
      // Should not crash and should show date range options
      expect(screen.getByText(/date range/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper aria labels', () => {
      render(<SearchFilter {...defaultProps} />)
      
      expect(screen.getByRole('textbox')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument()
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<SearchFilter {...defaultProps} />)
      
      // Tab to search input
      await user.tab()
      expect(screen.getByPlaceholderText(/search release notes/i)).toHaveFocus()
      
      // Tab to filter button
      await user.tab()
      expect(screen.getByRole('button', { name: /filter/i })).toHaveFocus()
    })

    it('opens dropdown with Enter key', async () => {
      const user = userEvent.setup()
      render(<SearchFilter {...defaultProps} />)
      
      const filterButton = screen.getByRole('button', { name: /filter/i })
      filterButton.focus()
      
      await user.keyboard('{Enter}')
      
      await waitFor(() => {
        expect(screen.getByText(/date range/i)).toBeInTheDocument()
      })
    })
  })
}) 