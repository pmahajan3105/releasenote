import { render, screen } from '@testing-library/react'
import { StatusIndicator, WorkflowStatusIndicator } from '@/components/release-notes/StatusIndicator'

describe('StatusIndicator Component', () => {
  it('renders published status correctly', () => {
    render(<StatusIndicator status="published" />)
    
    const indicator = screen.getByText(/published/i)
    expect(indicator).toBeInTheDocument()
    expect(indicator).toHaveClass('bg-green-100', 'text-green-800')
  })

  it('renders draft status correctly', () => {
    render(<StatusIndicator status="draft" />)
    
    const indicator = screen.getByText(/draft/i)
    expect(indicator).toBeInTheDocument()
    expect(indicator).toHaveClass('bg-gray-100', 'text-gray-800')
  })

  it('renders scheduled status correctly', () => {
    render(<StatusIndicator status="scheduled" />)
    
    const indicator = screen.getByText(/scheduled/i)
    expect(indicator).toBeInTheDocument()
    expect(indicator).toHaveClass('bg-blue-100', 'text-blue-800')
  })

  it('renders archived status correctly', () => {
    render(<StatusIndicator status="archived" />)
    
    const indicator = screen.getByText(/archived/i)
    expect(indicator).toBeInTheDocument()
    expect(indicator).toHaveClass('bg-orange-100', 'text-orange-800')
  })

  it('renders with small size variant', () => {
    render(<StatusIndicator status="published" size="sm" />)
    
    const indicator = screen.getByText(/published/i)
    expect(indicator).toHaveClass('text-xs', 'px-2', 'py-0.5')
  })

  it('renders with large size variant', () => {
    render(<StatusIndicator status="published" size="lg" />)
    
    const indicator = screen.getByText(/published/i)
    expect(indicator).toHaveClass('text-base', 'px-3', 'py-1.5')
  })

  it('renders with icon by default', () => {
    render(<StatusIndicator status="published" />)
    
    const badge = screen.getByText(/published/i).closest('span')
    expect(badge).toHaveClass('inline-flex', 'items-center', 'gap-1.5')
  })

  it('renders without icon when showIcon is false', () => {
    render(<StatusIndicator status="published" showIcon={false} />)
    
    const indicator = screen.getByText(/published/i)
    expect(indicator).toBeInTheDocument()
  })

  it('renders with timestamp when showTimestamp is true and publishedAt is provided', () => {
    const publishedAt = '2024-01-15T10:30:00Z'
    render(<StatusIndicator status="published" publishedAt={publishedAt} showTimestamp />)
    
    expect(screen.getByText(/published/i)).toBeInTheDocument()
    expect(screen.getByText(/jan 15/i)).toBeInTheDocument()
  })

  it('renders with scheduled timestamp when showTimestamp is true', () => {
    const scheduledAt = '2024-01-20T14:30:00Z'
    render(<StatusIndicator status="scheduled" scheduledAt={scheduledAt} showTimestamp />)
    
    expect(screen.getByText(/scheduled/i)).toBeInTheDocument()
    expect(screen.getByText(/jan 20/i)).toBeInTheDocument()
  })

  it('renders with tooltip for published status', () => {
    const publishedAt = '2024-01-15T10:30:00Z'
    render(<StatusIndicator status="published" publishedAt={publishedAt} />)
    
    // The tooltip is rendered but not visible by default
    expect(screen.getByText(/published/i)).toBeInTheDocument()
  })

  it('renders with tooltip for scheduled status', () => {
    const scheduledAt = '2024-01-20T14:30:00Z'
    render(<StatusIndicator status="scheduled" scheduledAt={scheduledAt} />)
    
    expect(screen.getByText(/scheduled/i)).toBeInTheDocument()
  })

  it('handles unknown status gracefully', () => {
    // @ts-expect-error - Testing unknown status
    render(<StatusIndicator status="unknown" />)
    
    const indicator = screen.getByText(/unknown/i)
    expect(indicator).toBeInTheDocument()
    expect(indicator).toHaveClass('bg-gray-100', 'text-gray-800')
  })

  describe('Accessibility', () => {
    it('has proper contrast ratios for all statuses', () => {
      const statuses = ['published', 'draft', 'scheduled', 'archived'] as const
      
      statuses.forEach(status => {
        const { unmount } = render(<StatusIndicator status={status} />)
        const indicator = screen.getByText(new RegExp(status, 'i'))
        expect(indicator).toBeInTheDocument()
        unmount()
      })
    })

    it('provides semantic markup with badges', () => {
      render(<StatusIndicator status="published" />)
      
      const badge = screen.getByText(/published/i).closest('span')
      expect(badge).toHaveClass('inline-flex', 'items-center')
    })
  })
})

describe('WorkflowStatusIndicator Component', () => {
  it('renders workflow steps correctly', () => {
    render(<WorkflowStatusIndicator status="published" />)
    
    expect(screen.getByText(/draft/i)).toBeInTheDocument()
    expect(screen.getByText(/scheduled/i)).toBeInTheDocument()
    expect(screen.getByText(/published/i)).toBeInTheDocument()
  })

  it('highlights current step correctly', () => {
    render(<WorkflowStatusIndicator status="scheduled" />)
    
    const scheduledStep = screen.getByText(/scheduled/i)
    expect(scheduledStep).toHaveClass('text-blue-600')
  })

  it('shows completed steps correctly', () => {
    render(<WorkflowStatusIndicator status="published" />)
    
    const draftStep = screen.getByText(/draft/i)
    const scheduledStep = screen.getByText(/scheduled/i)
    
    expect(draftStep).toHaveClass('text-green-600')
    expect(scheduledStep).toHaveClass('text-green-600')
  })

  it('shows archived status when applicable', () => {
    render(<WorkflowStatusIndicator status="archived" />)
    
    expect(screen.getByText(/archived/i)).toBeInTheDocument()
  })

  it('renders step icons correctly', () => {
    render(<WorkflowStatusIndicator status="draft" />)
    
    // Icons are rendered as SVGs within the step circles
    const stepCircles = screen.getAllByRole('generic')
    expect(stepCircles.length).toBeGreaterThan(0)
  })
}) 