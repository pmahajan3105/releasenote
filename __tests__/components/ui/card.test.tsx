import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

describe('Card Components', () => {
  describe('Card', () => {
    it('renders card with default styles', () => {
      render(<Card data-testid="card">Card content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('rounded-lg', 'border', 'bg-card')
    })

    it('accepts custom className', () => {
      render(<Card className="custom-class" data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('custom-class')
    })

    it('forwards ref', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Card ref={ref}>Card</Card>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('CardHeader', () => {
    it('renders header with default styles', () => {
      render(<CardHeader data-testid="header">Header content</CardHeader>)
      const header = screen.getByTestId('header')
      expect(header).toBeInTheDocument()
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6')
    })

    it('accepts custom className', () => {
      render(<CardHeader className="custom-header" data-testid="header">Header</CardHeader>)
      const header = screen.getByTestId('header')
      expect(header).toHaveClass('custom-header')
    })
  })

  describe('CardTitle', () => {
    it('renders title with default styles', () => {
      render(<CardTitle data-testid="title">Card Title</CardTitle>)
      const title = screen.getByTestId('title')
      expect(title).toBeInTheDocument()
      expect(title).toHaveClass('text-2xl', 'font-semibold')
    })

    it('renders title text', () => {
      render(<CardTitle>My Card Title</CardTitle>)
      expect(screen.getByText('My Card Title')).toBeInTheDocument()
    })
  })

  describe('CardDescription', () => {
    it('renders description with default styles', () => {
      render(<CardDescription data-testid="description">Card description</CardDescription>)
      const description = screen.getByTestId('description')
      expect(description).toBeInTheDocument()
      expect(description).toHaveClass('text-sm', 'text-muted-foreground')
    })

    it('renders description text', () => {
      render(<CardDescription>This is a card description</CardDescription>)
      expect(screen.getByText('This is a card description')).toBeInTheDocument()
    })
  })

  describe('CardContent', () => {
    it('renders content with default styles', () => {
      render(<CardContent data-testid="content">Card content</CardContent>)
      const content = screen.getByTestId('content')
      expect(content).toBeInTheDocument()
      expect(content).toHaveClass('p-6', 'pt-0')
    })

    it('renders content text', () => {
      render(<CardContent>This is card content</CardContent>)
      expect(screen.getByText('This is card content')).toBeInTheDocument()
    })
  })

  describe('CardFooter', () => {
    it('renders footer with default styles', () => {
      render(<CardFooter data-testid="footer">Footer content</CardFooter>)
      const footer = screen.getByTestId('footer')
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0')
    })

    it('renders footer content', () => {
      render(<CardFooter>Footer text</CardFooter>)
      expect(screen.getByText('Footer text')).toBeInTheDocument()
    })
  })

  describe('Complete Card', () => {
    it('renders complete card with all components', () => {
      render(
        <Card data-testid="complete-card">
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Test content paragraph</p>
          </CardContent>
          <CardFooter>
            <button>Footer Button</button>
          </CardFooter>
        </Card>
      )

      expect(screen.getByTestId('complete-card')).toBeInTheDocument()
      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
      expect(screen.getByText('Test content paragraph')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Footer Button' })).toBeInTheDocument()
    })

    it('renders card with header only', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Header Only</CardTitle>
          </CardHeader>
        </Card>
      )

      expect(screen.getByText('Header Only')).toBeInTheDocument()
    })

    it('renders card with content only', () => {
      render(
        <Card>
          <CardContent>Content only card</CardContent>
        </Card>
      )

      expect(screen.getByText('Content only card')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('supports aria attributes', () => {
      render(
        <Card aria-label="Test card" data-testid="card">
          <CardContent>Accessible card</CardContent>
        </Card>
      )

      const card = screen.getByTestId('card')
      expect(card).toHaveAttribute('aria-label', 'Test card')
    })

    it('supports role attribute', () => {
      render(
        <Card role="article" data-testid="card">
          <CardContent>Article card</CardContent>
        </Card>
      )

      const card = screen.getByTestId('card')
      expect(card).toHaveAttribute('role', 'article')
    })
  })
}) 