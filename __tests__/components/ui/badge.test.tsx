import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Badge } from '@/components/ui/badge'

describe('Badge Component', () => {
  describe('Basic Rendering', () => {
    it('renders badge with text', () => {
      render(<Badge>Test Badge</Badge>)
      expect(screen.getByText('Test Badge')).toBeInTheDocument()
    })

    it('renders badge with default variant', () => {
      render(<Badge data-testid="badge">Default</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('bg-primary')
    })

    it('accepts custom className', () => {
      render(<Badge className="custom-class" data-testid="badge">Custom</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('custom-class')
    })
  })

  describe('Variants', () => {
    it('renders default variant', () => {
      render(<Badge variant="default" data-testid="badge">Default</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('bg-primary')
    })

    it('renders secondary variant', () => {
      render(<Badge variant="secondary" data-testid="badge">Secondary</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('bg-secondary')
    })

    it('renders destructive variant', () => {
      render(<Badge variant="destructive" data-testid="badge">Destructive</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('bg-destructive')
    })

    it('renders outline variant', () => {
      render(<Badge variant="outline" data-testid="badge">Outline</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('text-foreground')
    })
  })

  describe('Content', () => {
    it('renders text content', () => {
      render(<Badge>Simple Text</Badge>)
      expect(screen.getByText('Simple Text')).toBeInTheDocument()
    })

    it('renders numeric content', () => {
      render(<Badge>42</Badge>)
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('renders with icon', () => {
      render(
        <Badge>
          <span>🔥</span>
          Hot
        </Badge>
      )
      expect(screen.getByText('🔥')).toBeInTheDocument()
      expect(screen.getByText('Hot')).toBeInTheDocument()
    })

    it('handles empty content', () => {
      render(<Badge data-testid="empty-badge"></Badge>)
      const badge = screen.getByTestId('empty-badge')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('accepts data attributes', () => {
      render(<Badge data-testid="test-badge" data-value="123">Badge</Badge>)
      const badge = screen.getByTestId('test-badge')
      expect(badge).toHaveAttribute('data-value', '123')
    })

    it('accepts aria attributes', () => {
      render(<Badge aria-label="Status badge" data-testid="badge">Status</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveAttribute('aria-label', 'Status badge')
    })
  })

  describe('Styling', () => {
    it('has base styling classes', () => {
      render(<Badge data-testid="badge">Styled</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full')
    })

    it('combines custom classes with default classes', () => {
      render(<Badge className="custom-padding" data-testid="badge">Combined</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('inline-flex', 'custom-padding')
    })
  })

  describe('Use Cases', () => {
    it('works as status indicator', () => {
      render(<Badge variant="secondary">Active</Badge>)
      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('works as count indicator', () => {
      render(<Badge variant="destructive">99+</Badge>)
      expect(screen.getByText('99+')).toBeInTheDocument()
    })

    it('works as category tag', () => {
      render(<Badge variant="outline">Technology</Badge>)
      expect(screen.getByText('Technology')).toBeInTheDocument()
    })
  })

  describe('Multiple Badges', () => {
    it('renders multiple badges', () => {
      render(
        <div>
          <Badge>First</Badge>
          <Badge>Second</Badge>
          <Badge>Third</Badge>
        </div>
      )
      
      expect(screen.getByText('First')).toBeInTheDocument()
      expect(screen.getByText('Second')).toBeInTheDocument()
      expect(screen.getByText('Third')).toBeInTheDocument()
    })

    it('renders badges with different variants', () => {
      render(
        <div>
          <Badge variant="default" data-testid="default-badge">Default</Badge>
          <Badge variant="secondary" data-testid="secondary-badge">Secondary</Badge>
          <Badge variant="destructive" data-testid="destructive-badge">Destructive</Badge>
        </div>
      )
      
      expect(screen.getByTestId('default-badge')).toHaveClass('bg-primary')
      expect(screen.getByTestId('secondary-badge')).toHaveClass('bg-secondary')
      expect(screen.getByTestId('destructive-badge')).toHaveClass('bg-destructive')
    })
  })

  describe('Accessibility', () => {
    it('is accessible via screen readers', () => {
      render(<Badge role="status" aria-live="polite">New</Badge>)
      const badge = screen.getByRole('status')
      expect(badge).toHaveAttribute('aria-live', 'polite')
    })

    it('supports semantic meaning', () => {
      render(<Badge aria-describedby="badge-description">Important</Badge>)
      const badge = screen.getByText('Important')
      expect(badge).toHaveAttribute('aria-describedby', 'badge-description')
    })
  })
}) 