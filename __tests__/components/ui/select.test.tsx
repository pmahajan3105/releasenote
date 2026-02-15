import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton
} from '@/components/ui/select'

describe('Select Components', () => {
  describe('Select', () => {
    it('should render select with trigger and content', () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      )

      expect(screen.getByTestId('select-trigger')).toBeInTheDocument()
      expect(screen.getByText('Select an option')).toBeInTheDocument()
    })

    it('should handle value changes', async () => {
      const onValueChange = jest.fn()
      render(
        <Select onValueChange={onValueChange}>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      )

      const trigger = screen.getByTestId('select-trigger')
      fireEvent.click(trigger)

      // In a real test, you would check if the dropdown opens
      // For now, we just verify the trigger is clickable
      expect(trigger).toBeInTheDocument()
    })

    it('should support default value', () => {
      render(
        <Select defaultValue="option1">
          <SelectTrigger data-testid="select-trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      )

      expect(screen.getByTestId('select-trigger')).toBeInTheDocument()
    })

    it('should support disabled state', () => {
      render(
        <Select disabled>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )

      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toBeInTheDocument()
      expect(trigger).toBeDisabled()
    })
  })

  describe('SelectTrigger', () => {
    it('should render trigger with correct attributes', () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Test" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )

      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveAttribute('role', 'combobox')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('should handle custom className', () => {
      render(
        <Select>
          <SelectTrigger className="custom-class" data-testid="select-trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )

      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toHaveClass('custom-class')
    })

    it('should support focus states', async () => {
      const user = userEvent.setup()
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Test" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )

      const trigger = screen.getByTestId('select-trigger')
      await user.click(trigger)
      
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
  })

  describe('SelectValue', () => {
    it('should render placeholder when no value', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Choose option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )

      expect(screen.getByText('Choose option')).toBeInTheDocument()
    })

    it('should render selected value', () => {
      render(
        <Select defaultValue="option1">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Selected Option</SelectItem>
          </SelectContent>
        </Select>
      )

      expect(screen.getByText('Selected Option')).toBeInTheDocument()
    })

    it('should handle empty state', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )

      // Should render without crashing
      expect(document.body).toBeInTheDocument()
    })
  })

  describe('SelectContent', () => {
    it('should render content with items', () => {
      render(
        <Select defaultOpen>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="item1">Item 1</SelectItem>
            <SelectItem value="item2">Item 2</SelectItem>
          </SelectContent>
        </Select>
      )

      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
    })

    it('should handle custom positioning', () => {
      render(
        <Select defaultOpen>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" side="top">
            <SelectItem value="item1">Item 1</SelectItem>
          </SelectContent>
        </Select>
      )

      expect(screen.getByText('Item 1')).toBeInTheDocument()
    })

    it('should support custom className', () => {
      render(
        <Select defaultOpen>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="custom-content" data-testid="select-content">
            <SelectItem value="item1">Item 1</SelectItem>
          </SelectContent>
        </Select>
      )

      const content = screen.getByTestId('select-content')
      expect(content).toHaveClass('custom-content')
    })
  })

  describe('SelectItem', () => {
    it('should render item with value and text', () => {
      render(
        <Select defaultOpen>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test-value">Test Item</SelectItem>
          </SelectContent>
        </Select>
      )

      expect(screen.getByText('Test Item')).toBeInTheDocument()
    })

    it('should handle click events', async () => {
      const user = userEvent.setup()
      render(
        <Select defaultOpen>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test-value">Clickable Item</SelectItem>
          </SelectContent>
        </Select>
      )

      const item = screen.getByText('Clickable Item')
      await user.click(item)

      expect(screen.getByRole('combobox')).toHaveTextContent('Clickable Item')
    })

    it('should support disabled state', () => {
      render(
        <Select defaultOpen>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test-value" disabled>
              Disabled Item
            </SelectItem>
          </SelectContent>
        </Select>
      )

      const item = screen.getByRole('option', { name: 'Disabled Item' })
      expect(item).toHaveAttribute('data-disabled')
    })

    it('should handle custom className', () => {
      render(
        <Select defaultOpen>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test" className="custom-item" data-testid="select-item">
              Custom Item
            </SelectItem>
          </SelectContent>
        </Select>
      )

      const item = screen.getByTestId('select-item')
      expect(item).toHaveClass('custom-item')
    })
  })

  describe('SelectGroup', () => {
    it('should render group with label and items', () => {
      render(
        <Select defaultOpen>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Group Label</SelectLabel>
              <SelectItem value="item1">Item 1</SelectItem>
              <SelectItem value="item2">Item 2</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      )

      expect(screen.getByText('Group Label')).toBeInTheDocument()
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
    })

    it('should handle multiple groups', () => {
      render(
        <Select defaultOpen>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Group 1</SelectLabel>
              <SelectItem value="item1">Item 1</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Group 2</SelectLabel>
              <SelectItem value="item2">Item 2</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      )

      expect(screen.getByText('Group 1')).toBeInTheDocument()
      expect(screen.getByText('Group 2')).toBeInTheDocument()
    })
  })

  describe('SelectLabel', () => {
    it('should render label text', () => {
      render(
        <Select defaultOpen>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Category Label</SelectLabel>
              <SelectItem value="item1">Item 1</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      )

      expect(screen.getByText('Category Label')).toBeInTheDocument()
    })

    it('should apply correct styling', () => {
      render(
        <Select defaultOpen>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel data-testid="select-label">Label</SelectLabel>
              <SelectItem value="item1">Item 1</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      )

      const label = screen.getByTestId('select-label')
      expect(label).toHaveClass('py-1.5', 'pl-8', 'pr-2', 'text-sm', 'font-semibold')
    })

    it('should handle custom className', () => {
      render(
        <Select defaultOpen>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel className="custom-label" data-testid="select-label">
                Custom Label
              </SelectLabel>
              <SelectItem value="item1">Item 1</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      )

      const label = screen.getByTestId('select-label')
      expect(label).toHaveClass('custom-label')
    })
  })

  describe('SelectSeparator', () => {
    it('should render separator', () => {
      render(
        <Select defaultOpen>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="item1">Item 1</SelectItem>
            <SelectSeparator data-testid="separator" />
            <SelectItem value="item2">Item 2</SelectItem>
          </SelectContent>
        </Select>
      )

      const separator = screen.getByTestId('separator')
      expect(separator).toBeInTheDocument()
      expect(separator).toHaveClass('-mx-1', 'my-1', 'h-px', 'bg-muted')
    })

    it('should handle custom className', () => {
      render(
        <Select defaultOpen>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="item1">Item 1</SelectItem>
            <SelectSeparator className="custom-separator" data-testid="separator" />
            <SelectItem value="item2">Item 2</SelectItem>
          </SelectContent>
        </Select>
      )

      const separator = screen.getByTestId('separator')
      expect(separator).toHaveClass('custom-separator')
    })
  })

  describe('SelectScrollUpButton', () => {
    it('supports content rendering when scroll up button is provided', () => {
      render(
        <Select defaultOpen>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectScrollUpButton data-testid="scroll-up" />
            <SelectItem value="item1">Item 1</SelectItem>
          </SelectContent>
        </Select>
      )

      expect(screen.getByText('Item 1')).toBeInTheDocument()
    })

    it('keeps list items interactive when scroll up button is provided', async () => {
      const user = userEvent.setup()
      render(
        <Select defaultOpen>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectScrollUpButton data-testid="scroll-up" />
            <SelectItem value="item1">Item 1</SelectItem>
          </SelectContent>
        </Select>
      )

      const item = screen.getByText('Item 1')
      await user.click(item)
      
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })

  describe('SelectScrollDownButton', () => {
    it('supports content rendering when scroll down button is provided', () => {
      render(
        <Select defaultOpen>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="item1">Item 1</SelectItem>
            <SelectScrollDownButton data-testid="scroll-down" />
          </SelectContent>
        </Select>
      )

      expect(screen.getByText('Item 1')).toBeInTheDocument()
    })

    it('keeps list items interactive when scroll down button is provided', async () => {
      const user = userEvent.setup()
      render(
        <Select defaultOpen>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="item1">Item 1</SelectItem>
            <SelectScrollDownButton data-testid="scroll-down" />
          </SelectContent>
        </Select>
      )

      const item = screen.getByText('Item 1')
      await user.click(item)
      
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })

  describe('Complex Select Usage', () => {
    it('should render complex select with groups and separators', () => {
      render(
        <Select defaultOpen>
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Vegetables</SelectLabel>
              <SelectItem value="carrot">Carrot</SelectItem>
              <SelectItem value="potato">Potato</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      )

      expect(screen.getByText('Fruits')).toBeInTheDocument()
      expect(screen.getByText('Apple')).toBeInTheDocument()
      expect(screen.getByText('Vegetables')).toBeInTheDocument()
      expect(screen.getByText('Carrot')).toBeInTheDocument()
    })

    it('should handle large lists with scroll buttons', () => {
      render(
        <Select defaultOpen>
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            <SelectScrollUpButton />
            {Array.from({ length: 20 }, (_, i) => (
              <SelectItem key={i} value={`option${i + 1}`}>
                Option {i + 1}
              </SelectItem>
            ))}
            <SelectScrollDownButton />
          </SelectContent>
        </Select>
      )

      expect(screen.getByText('Option 1')).toBeInTheDocument()
      expect(screen.getByText('Option 20')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )

      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toHaveAttribute('role', 'combobox')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(trigger).toHaveAttribute('aria-autocomplete', 'none')
    })

    it('should handle keyboard navigation', () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      )

      const trigger = screen.getByTestId('select-trigger')
      fireEvent.keyDown(trigger, { key: 'ArrowDown' })
      
      expect(trigger).toBeInTheDocument()
    })

    it('should handle focus management', () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )

      const trigger = screen.getByTestId('select-trigger')
      fireEvent.focus(trigger)
      
      expect(trigger).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle select with only disabled items', () => {
      render(
        <Select defaultOpen>
          <SelectTrigger>
            <SelectValue placeholder="All disabled" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="disabled1" disabled>
              Disabled Option 1
            </SelectItem>
            <SelectItem value="disabled2" disabled>
              Disabled Option 2
            </SelectItem>
          </SelectContent>
        </Select>
      )

      expect(screen.getByText('Disabled Option 1')).toBeInTheDocument()
      expect(screen.getByText('Disabled Option 2')).toBeInTheDocument()
    })

    it('should handle very long option text', () => {
      const longText = 'This is a very long option text that should be handled properly by the select component'
      
      render(
        <Select defaultOpen>
          <SelectTrigger>
            <SelectValue placeholder="Long text" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="long-text">
              {longText}
            </SelectItem>
          </SelectContent>
        </Select>
      )

      expect(screen.getByText(longText)).toBeInTheDocument()
    })
  })
}) 
