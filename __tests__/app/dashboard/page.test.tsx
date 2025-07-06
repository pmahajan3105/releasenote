import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import Dashboard from '@/app/dashboard/page'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => ({
    get: jest.fn()
  }))
}))

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  createClientComponentClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null
      })
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn().mockResolvedValue({
              data: [],
              error: null
            })
          }))
        }))
      }))
    }))
  }))
}))

// Mock components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className} data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardDescription: ({ children }: any) => <p data-testid="card-description">{children}</p>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <h3 data-testid="card-title">{children}</h3>
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className }: any) => (
    <button className={className} onClick={onClick} data-testid="button">
      {children}
    </button>
  )
}))

const mockPush = jest.fn()
const mockRouter = {
  push: mockPush,
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn()
}

describe('Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('should render dashboard title', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    })
  })

  it('should render overview description', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText(/overview of your release notes/i)).toBeInTheDocument()
    })
  })

  it('should render stats cards', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      const cards = screen.getAllByTestId('card')
      expect(cards.length).toBeGreaterThan(0)
    })
  })

  it('should render stats cards', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      const cards = screen.getAllByTestId('card')
      expect(cards.length).toBeGreaterThan(0)
    })
  })

  it('should render quick actions', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText(/quick actions/i)).toBeInTheDocument()
    })
  })

  it('should have navigation to create new release note', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      const createButton = screen.getByText(/create release note/i)
      expect(createButton).toBeInTheDocument()
    })
  })

  it('should handle loading state', async () => {
    render(<Dashboard />)
    
    // Should not show error initially
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
  })

  it('should render published notes metric', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText(/published notes/i)).toBeInTheDocument()
    })
  })

  it('should display published notes count', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Published Notes')).toBeInTheDocument()
      expect(screen.getByText('24')).toBeInTheDocument()
    })
  })

  it('should show total views metric', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Total Views')).toBeInTheDocument()
      expect(screen.getByText('12,484')).toBeInTheDocument()
    })
  })
}) 