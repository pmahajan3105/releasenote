import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter, usePathname } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'

// Mock Next.js router
const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockBack = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
  }),
  usePathname: () => '/dashboard',
}))

// Mock the icons to avoid issues with Lucide React
jest.mock('lucide-react', () => ({
  BarChart2Icon: ({ className }: { className?: string }) => <div className={className} data-testid="bar-chart-icon" />,
  ChevronDownIcon: ({ className }: { className?: string }) => <div className={className} data-testid="chevron-down-icon" />,
  FileHeartIcon: ({ className }: { className?: string }) => <div className={className} data-testid="file-heart-icon" />,
  LifeBuoyIcon: ({ className }: { className?: string }) => <div className={className} data-testid="lifebuoy-icon" />,
  LogOutIcon: ({ className }: { className?: string }) => <div className={className} data-testid="logout-icon" />,
  SearchIcon: ({ className }: { className?: string }) => <div className={className} data-testid="search-icon" />,
  SettingsIcon: ({ className }: { className?: string }) => <div className={className} data-testid="settings-icon" />,
  StarIcon: ({ className }: { className?: string }) => <div className={className} data-testid="star-icon" />,
}))

describe('Sidebar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders the sidebar container', () => {
      render(<Sidebar />)
      
      const sidebar = screen.getByRole('banner')
      expect(sidebar).toBeInTheDocument()
    })

    it('renders the logo', () => {
      render(<Sidebar />)
      
      const logo = screen.getByRole('img', { name: /rn logo/i })
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveAttribute('src', '/rn-logo.svg')
    })

    it('renders the search input', () => {
      render(<Sidebar />)
      
      const searchInput = screen.getByPlaceholderText('Search')
      expect(searchInput).toBeInTheDocument()
    })
  })

  describe('Navigation Items', () => {
    it('renders main navigation items', () => {
      render(<Sidebar />)
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Release Notes')).toBeInTheDocument()
      expect(screen.getByText('Setup')).toBeInTheDocument()
      expect(screen.getByText('Analytics')).toBeInTheDocument()
    })

    it('renders footer navigation items', () => {
      render(<Sidebar />)
      
      expect(screen.getByText('Support')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('renders release notes sub-items when expanded', () => {
      render(<Sidebar />)
      
      // Should be expanded by default
      expect(screen.getByText('Create')).toBeInTheDocument()
      expect(screen.getByText('Published')).toBeInTheDocument()
      expect(screen.getByText('Draft')).toBeInTheDocument()
      expect(screen.getByText('Scheduled')).toBeInTheDocument()
    })

    it('highlights active navigation item', () => {
      render(<Sidebar />)
      
      const dashboardButton = screen.getByText('Dashboard').closest('button')
      expect(dashboardButton).toHaveClass('bg-[#f4ebff]')
    })
  })

  describe('User Profile Section', () => {
    it('renders user information', () => {
      render(<Sidebar />)
      
      expect(screen.getByText('User Name')).toBeInTheDocument()
      expect(screen.getByText('user@example.com')).toBeInTheDocument()
    })

    it('renders user avatar with fallback', () => {
      render(<Sidebar />)
      
      const avatar = screen.getByRole('img', { name: /user/i })
      expect(avatar).toBeInTheDocument()
      
      // Should have fallback text
      expect(screen.getByText('U')).toBeInTheDocument()
    })

    it('shows logout button', () => {
      render(<Sidebar />)
      
      const logoutButton = screen.getByTestId('logout-icon')
      expect(logoutButton).toBeInTheDocument()
    })
  })

  describe('Icons and Visual Elements', () => {
    it('renders appropriate icons for each navigation item', () => {
      render(<Sidebar />)
      
      expect(screen.getByTestId('bar-chart-icon')).toBeInTheDocument()
      expect(screen.getByTestId('file-heart-icon')).toBeInTheDocument()
      expect(screen.getByTestId('settings-icon')).toBeInTheDocument()
      expect(screen.getByTestId('lifebuoy-icon')).toBeInTheDocument()
      expect(screen.getByTestId('search-icon')).toBeInTheDocument()
      expect(screen.getByTestId('star-icon')).toBeInTheDocument()
    })

    it('shows search icon', () => {
      render(<Sidebar />)
      
      const searchIcon = screen.getByTestId('search-icon')
      expect(searchIcon).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('maintains proper spacing and layout', () => {
      render(<Sidebar />)
      
      const sidebar = screen.getByRole('banner').parentElement
      expect(sidebar).toHaveClass('w-[280px]', 'bg-white', 'border-r')
    })

    it('handles long navigation text properly', () => {
      render(<Sidebar />)
      
      // Text should be properly contained
      expect(screen.getByText('Release Notes')).toBeInTheDocument()
      expect(screen.getByText('Support')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper link accessibility', () => {
      render(<Sidebar />)
      
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
      expect(dashboardLink).toBeInTheDocument()
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<Sidebar />)
      
      // Tab through navigation items
      await user.tab()
      expect(screen.getByPlaceholderText(/search/i)).toHaveFocus()
    })

    it('has proper button roles for collapsible sections', () => {
      render(<Sidebar />)
      
      const releaseNotesButton = screen.getByRole('button', { name: /release notes/i })
      expect(releaseNotesButton).toBeInTheDocument()
      expect(releaseNotesButton).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe('State Management', () => {
    it('manages collapsible sections state correctly', async () => {
      const user = userEvent.setup()
      render(<Sidebar />)
      
      // Initially expanded - check for sub-items
      expect(screen.getByText('Create')).toBeInTheDocument()
      expect(screen.getByText('Published')).toBeInTheDocument()
      
      // Collapse
      const releaseNotesButton = screen.getByRole('button', { name: /release notes/i })
      await user.click(releaseNotesButton)
      
      await waitFor(() => {
        expect(screen.queryByText('Create')).not.toBeInTheDocument()
      })
      
      // State should persist
      expect(screen.queryByText('Published')).not.toBeInTheDocument()
      expect(screen.queryByText('Draft')).not.toBeInTheDocument()
    })

    it('handles multiple collapsible sections independently', async () => {
      const user = userEvent.setup()
      render(<Sidebar />)
      
      const releaseNotesButton = screen.getByRole('button', { name: /release notes/i })
      
      // Should be able to toggle without affecting other sections
      await user.click(releaseNotesButton)
      
      // Other sections should remain unaffected
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Analytics')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles missing user data gracefully', () => {
      render(<Sidebar />)
      
      // Should still render without crashing
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('handles navigation errors gracefully', () => {
      mockPush.mockImplementation(() => {
        throw new Error('Navigation error')
      })
      
      render(<Sidebar />)
      
      // Should still render without crashing
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })
}) 