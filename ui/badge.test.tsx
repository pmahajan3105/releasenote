import React from 'react'
import { render, screen } from '@testing-library/react'
import { Badge } from './badge'

describe('Badge Component', () => {
  it('renders with default variant', () => {
    render(<Badge>Default Badge</Badge>)
    const badge = screen.getByText('Default Badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full', 'border')
  })

  it('renders with secondary variant', () => {
    render(<Badge variant="secondary">Secondary Badge</Badge>)
    const badge = screen.getByText('Secondary Badge')
    expect(badge).toHaveClass('bg-secondary', 'text-secondary-foreground')
  })

  it('renders with destructive variant', () => {
    render(<Badge variant="destructive">Destructive Badge</Badge>)
    const badge = screen.getByText('Destructive Badge')
    expect(badge).toHaveClass('bg-destructive', 'text-destructive-foreground')
  })

  it('renders with outline variant', () => {
    render(<Badge variant="outline">Outline Badge</Badge>)
    const badge = screen.getByText('Outline Badge')
    expect(badge).toHaveClass('text-foreground')
  })

  it('applies custom className', () => {
    render(<Badge className="custom-class">Custom Badge</Badge>)
    const badge = screen.getByText('Custom Badge')
    expect(badge).toHaveClass('custom-class')
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Badge onClick={handleClick}>Clickable Badge</Badge>)
    const badge = screen.getByText('Clickable Badge')
    
    badge.click()
    expect(handleClick).toHaveBeenCalled()
  })

  it('renders children correctly', () => {
    render(
      <Badge>
        <span>Badge with</span>
        <strong>multiple children</strong>
      </Badge>
    )
    
    expect(screen.getByText('Badge with')).toBeInTheDocument()
    expect(screen.getByText('multiple children')).toBeInTheDocument()
  })

  it('applies additional HTML attributes', () => {
    render(<Badge data-testid="test-badge" title="Test Badge">Badge</Badge>)
    const badge = screen.getByTestId('test-badge')
    expect(badge).toHaveAttribute('title', 'Test Badge')
  })

  it('renders as div element', () => {
    render(<Badge>Badge Content</Badge>)
    const badge = screen.getByText('Badge Content')
    expect(badge.tagName).toBe('DIV')
  })

  it('handles empty content', () => {
    const { container } = render(<Badge />)
    const badge = container.firstChild
    expect(badge).toBeInTheDocument()
    expect(badge).toBeEmptyDOMElement()
  })

  it('combines variant classes with custom classes correctly', () => {
    render(<Badge variant="secondary" className="extra-class">Test</Badge>)
    const badge = screen.getByText('Test')
    expect(badge).toHaveClass('bg-secondary', 'extra-class')
  })
}) 