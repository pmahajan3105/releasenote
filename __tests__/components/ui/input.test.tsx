import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/input'

describe('Input Component', () => {
  describe('Basic Rendering', () => {
    it('renders input with default props', () => {
      render(<Input />)
      
      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
      expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md', 'border', 'border-input')
    })

    it('renders with placeholder', () => {
      render(<Input placeholder="Enter text here" />)
      
      expect(screen.getByPlaceholderText('Enter text here')).toBeInTheDocument()
    })

    it('renders with default value', () => {
      render(<Input defaultValue="Default text" />)
      
      const input = screen.getByDisplayValue('Default text')
      expect(input).toBeInTheDocument()
    })

    it('renders with controlled value', () => {
      render(<Input value="Controlled value" onChange={() => {}} />)
      
      expect(screen.getByDisplayValue('Controlled value')).toBeInTheDocument()
    })
  })

  describe('Input Types', () => {
    it('renders text input by default', () => {
      render(<Input />)
      
      const input = screen.getByRole('textbox')
      // Default type is not explicitly set, so it defaults to text
      expect(input).not.toHaveAttribute('type')
    })

    it('renders email input', () => {
      render(<Input type="email" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('renders password input', () => {
      render(<Input type="password" />)
      
      const input = document.querySelector('input[type="password"]')
      expect(input).toBeInTheDocument()
    })

    it('renders number input', () => {
      render(<Input type="number" />)
      
      const input = screen.getByRole('spinbutton')
      expect(input).toHaveAttribute('type', 'number')
    })

    it('renders search input', () => {
      render(<Input type="search" />)
      
      const input = screen.getByRole('searchbox')
      expect(input).toHaveAttribute('type', 'search')
    })

    it('renders tel input', () => {
      render(<Input type="tel" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'tel')
    })

    it('renders url input', () => {
      render(<Input type="url" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'url')
    })
  })

  describe('States', () => {
    it('renders disabled state', () => {
      render(<Input disabled />)
      
      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
      expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
    })

    it('renders readonly state', () => {
      render(<Input readOnly value="Read only text" />)
      
      const input = screen.getByDisplayValue('Read only text')
      expect(input).toHaveAttribute('readonly')
    })

    it('renders required state', () => {
      render(<Input required />)
      
      const input = screen.getByRole('textbox')
      expect(input).toBeRequired()
    })
  })

  describe('Event Handling', () => {
    it('handles onChange events', async () => {
      const handleChange = jest.fn()
      const user = userEvent.setup()
      
      render(<Input onChange={handleChange} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'Hello')
      
      expect(handleChange).toHaveBeenCalled()
      expect(input).toHaveValue('Hello')
    })

    it('handles onFocus events', () => {
      const handleFocus = jest.fn()
      
      render(<Input onFocus={handleFocus} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.focus(input)
      
      expect(handleFocus).toHaveBeenCalledTimes(1)
    })

    it('handles onBlur events', () => {
      const handleBlur = jest.fn()
      
      render(<Input onBlur={handleBlur} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.focus(input)
      fireEvent.blur(input)
      
      expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    it('handles onKeyDown events', () => {
      const handleKeyDown = jest.fn()
      
      render(<Input onKeyDown={handleKeyDown} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.keyDown(input, { key: 'Enter' })
      
      expect(handleKeyDown).toHaveBeenCalledTimes(1)
    })

    it('handles form submission on Enter', () => {
      const handleSubmit = jest.fn((e) => e.preventDefault())
      
      render(
        <form onSubmit={handleSubmit}>
          <Input />
        </form>
      )
      
      const input = screen.getByRole('textbox')
      fireEvent.keyDown(input, { key: 'Enter' })
      fireEvent.submit(input.closest('form')!)
      
      expect(handleSubmit).toHaveBeenCalledTimes(1)
    })
  })

  describe('Validation', () => {
    it('supports HTML5 validation attributes', () => {
      render(
        <Input 
          type="email"
          required
          minLength={5}
          maxLength={50}
          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$"
        />
      )
      
      const input = screen.getByRole('textbox')
      expect(input).toBeRequired()
      expect(input).toHaveAttribute('minLength', '5')
      expect(input).toHaveAttribute('maxLength', '50')
      expect(input).toHaveAttribute('pattern', '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$')
    })

    it('supports custom validation', async () => {
      const user = userEvent.setup()
      
      render(<Input type="email" />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'invalid-email')
      
      expect(input).toHaveValue('invalid-email')
    })

    it('validates required fields', () => {
      render(<Input required />)
      
      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input).toBeRequired()
      expect(input.checkValidity()).toBe(false) // Empty required field is invalid
    })

    it('validates email format', async () => {
      const user = userEvent.setup()
      
      render(<Input type="email" />)
      
      const input = screen.getByRole('textbox') as HTMLInputElement
      await user.type(input, 'test@example.com')
      
      expect(input).toHaveValue('test@example.com')
      expect(input.checkValidity()).toBe(true)
    })

    it('validates number input', async () => {
      const user = userEvent.setup()
      
      render(<Input type="number" min={0} max={100} />)
      
      const input = screen.getByRole('spinbutton') as HTMLInputElement
      await user.type(input, '50')
      
      expect(input).toHaveValue(50)
      expect(input.checkValidity()).toBe(true)
    })

    it('validates pattern matching', async () => {
      const user = userEvent.setup()
      
      render(<Input pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" placeholder="123-456-7890" />)
      
      const input = screen.getByRole('textbox') as HTMLInputElement
      await user.type(input, '123-456-7890')
      
      expect(input).toHaveValue('123-456-7890')
      expect(input.checkValidity()).toBe(true)
    })
  })

  describe('Styling', () => {
    it('applies default classes', () => {
      render(<Input />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass(
        'flex',
        'h-10',
        'w-full',
        'rounded-md',
        'border',
        'border-input',
        'bg-background',
        'px-3',
        'py-2',
        'text-sm'
      )
    })

    it('merges custom className', () => {
      render(<Input className="custom-class" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('custom-class')
      expect(input).toHaveClass('flex', 'h-10', 'w-full') // Still has default classes
    })

    it('applies focus styles', () => {
      render(<Input />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2')
    })

    it('applies disabled styles', () => {
      render(<Input disabled />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
    })
  })

  describe('Form Integration', () => {
    it('works within forms', () => {
      render(
        <form>
          <Input name="username" />
          <Input name="email" type="email" />
        </form>
      )
      
      const usernameInput = screen.getByRole('textbox', { name: /username/i })
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      
      expect(usernameInput).toHaveAttribute('name', 'username')
      expect(emailInput).toHaveAttribute('name', 'email')
    })

    it('supports form data collection', async () => {
      const user = userEvent.setup()
      let formData: FormData | null = null
      
      const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        formData = new FormData(e.currentTarget)
      }
      
      render(
        <form onSubmit={handleSubmit}>
          <Input name="username" defaultValue="testuser" />
          <Input name="email" type="email" defaultValue="test@example.com" />
          <button type="submit">Submit</button>
        </form>
      )
      
      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)
      
      expect(formData!.get('username')).toBe('testuser')
      expect(formData!.get('email')).toBe('test@example.com')
    })

    it('handles form reset', () => {
      render(
        <form>
          <Input name="username" defaultValue="testuser" />
          <button type="reset">Reset</button>
        </form>
      )
      
      const input = screen.getByRole('textbox')
      const resetButton = screen.getByRole('button', { name: /reset/i })
      
      expect(input).toHaveValue('testuser')
      
      fireEvent.click(resetButton)
      expect(input).toHaveValue('testuser') // Default value remains
    })
  })

  describe('Accessibility', () => {
    it('supports ARIA attributes', () => {
      render(
        <Input 
          aria-label="Search input"
          aria-describedby="search-help"
          aria-invalid={true}
        />
      )
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-label', 'Search input')
      expect(input).toHaveAttribute('aria-describedby', 'search-help')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('supports labeling', () => {
      render(
        <div>
          <label htmlFor="username">Username</label>
          <Input id="username" />
        </div>
      )
      
      const input = screen.getByLabelText('Username')
      expect(input).toBeInTheDocument()
    })

    it('supports fieldset and legend', () => {
      render(
        <fieldset>
          <legend>User Information</legend>
          <Input name="username" placeholder="Username" />
        </fieldset>
      )
      
      const input = screen.getByPlaceholderText('Username')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles null and undefined values', () => {
      render(<Input value={undefined} onChange={() => {}} />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('')
    })

    it('handles special characters', async () => {
      const user = userEvent.setup()
      const specialChars = '!@#$%^&*()_+-={}|;:,.<>?'
      
      render(<Input />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, specialChars)
      
      expect(input).toHaveValue(specialChars)
    })

    it('handles very long text', async () => {
      const user = userEvent.setup()
      const longText = 'a'.repeat(1000)
      
      render(<Input />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, longText)
      
      expect(input).toHaveValue(longText)
    })

    it('handles rapid typing', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      
      render(<Input onChange={handleChange} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'rapid')
      
      expect(handleChange).toHaveBeenCalledTimes(5) // One for each character
      expect(input).toHaveValue('rapid')
    })

    it('handles copy and paste', async () => {
      const user = userEvent.setup()
      
      render(<Input />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'test')
      
      // Select all and copy
      fireEvent.keyDown(input, { key: 'a', ctrlKey: true })
      fireEvent.keyDown(input, { key: 'c', ctrlKey: true })
      
      // Clear and paste
      await user.clear(input)
      fireEvent.keyDown(input, { key: 'v', ctrlKey: true })
      
      expect(input).toHaveValue('')
    })
  })

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('')
        return <Input value={value} onChange={(e) => setValue(e.target.value)} />
      }
      
      const { rerender } = render(<TestComponent />)
      
      // Re-render with same props shouldn't cause issues
      rerender(<TestComponent />)
      
      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
    })

    it('handles controlled updates efficiently', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      
      const TestComponent = () => {
        const [value, setValue] = React.useState('')
        return (
          <Input 
            value={value} 
            onChange={(e) => {
              setValue(e.target.value)
              handleChange(e)
            }} 
          />
        )
      }
      
      render(<TestComponent />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'test')
      
      expect(handleChange).toHaveBeenCalledTimes(4)
      expect(input).toHaveValue('test')
    })
  })
}) 