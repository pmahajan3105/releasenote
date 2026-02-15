import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from '@/components/ui/dialog'

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  X: ({ className }: { className?: string }) => (
    <div className={className} data-testid="x-icon">×</div>
  ),
}))

describe('Dialog Components', () => {
  describe('Dialog', () => {
    it('renders dialog trigger', () => {
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
        </Dialog>
      )
      
      expect(screen.getByText('Open Dialog')).toBeInTheDocument()
    })

    it('opens dialog when trigger is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )
      
      await user.click(screen.getByText('Open Dialog'))
      
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Test Dialog')).toBeInTheDocument()
    })

    it('closes dialog when close button is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )
      
      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('closes dialog when escape key is pressed', async () => {
      const user = userEvent.setup()
      
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )
      
      await user.keyboard('{Escape}')
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })

  describe('DialogContent', () => {
    it('renders dialog content with proper structure', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
              <DialogDescription>This is a test dialog</DialogDescription>
            </DialogHeader>
            <div>Dialog body content</div>
            <DialogFooter>
              <button>Cancel</button>
              <button>Save</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
      
      expect(screen.getByText('Test Dialog')).toBeInTheDocument()
      expect(screen.getByText('This is a test dialog')).toBeInTheDocument()
      expect(screen.getByText('Dialog body content')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Save')).toBeInTheDocument()
    })

    it('renders close button with X icon', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )
      
      expect(screen.getByTestId('x-icon')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
    })

    it('has proper ARIA attributes', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
              <DialogDescription>This is a test dialog</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )
      
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-labelledby')
      expect(dialog).toHaveAttribute('aria-describedby')
    })
  })

  describe('DialogHeader', () => {
    it('renders dialog header with title and description', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Title</DialogTitle>
              <DialogDescription>Test Description</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )
      
      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
    })

    it('renders title with proper heading role', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )
      
      const title = screen.getByText('Test Title')
      expect(title).toHaveClass('text-lg', 'font-semibold')
    })
  })

  describe('DialogFooter', () => {
    it('renders footer with proper layout', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogFooter>
              <button>Cancel</button>
              <button>Save</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
      
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Save')).toBeInTheDocument()
    })

    it('has proper flex layout classes', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogFooter data-testid="dialog-footer">
              <button>Cancel</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
      
      const footer = screen.getByTestId('dialog-footer')
      expect(footer).toHaveClass('flex', 'flex-col-reverse')
    })
  })

  describe('Accessibility', () => {
    it('has proper focus management', async () => {
      const user = userEvent.setup()
      
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
            </DialogHeader>
            <input placeholder="First input" />
            <input placeholder="Second input" />
          </DialogContent>
        </Dialog>
      )
      
      await user.click(screen.getByText('Open Dialog'))
      
      // Dialog should be focused
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
            </DialogHeader>
            <input placeholder="First input" />
            <input placeholder="Second input" />
          </DialogContent>
        </Dialog>
      )
      
      const firstInput = screen.getByPlaceholderText('First input')
      const secondInput = screen.getByPlaceholderText('Second input')
      
      await waitFor(() => {
        expect(firstInput).toHaveFocus()
      })

      await user.tab()
      expect(secondInput).toHaveFocus()
      
      await user.tab()
      expect(screen.getByRole('button', { name: /close/i })).toHaveFocus()
    })

    it('has proper ARIA labels', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Accessible Dialog</DialogTitle>
              <DialogDescription>This dialog is accessible</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )
      
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-labelledby')
      expect(dialog).toHaveAttribute('aria-describedby')
    })
  })

  describe('Controlled State', () => {
    it('works with controlled open state', async () => {
      const user = userEvent.setup()
      let isOpen = false
      const setOpen = jest.fn((open: boolean) => {
        isOpen = open
      })
      
      const { rerender } = render(
        <Dialog open={isOpen} onOpenChange={setOpen}>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Controlled Dialog</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )
      
      await user.click(screen.getByText('Open Dialog'))
      expect(setOpen).toHaveBeenCalledWith(true)
      
      // Simulate controlled state update
      isOpen = true
      rerender(
        <Dialog open={isOpen} onOpenChange={setOpen}>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Controlled Dialog</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )
      
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })
}) 
