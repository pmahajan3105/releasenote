import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './input'

describe('Input Component', () => {
  it('renders with default props', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md')
  })

  it('applies custom className', () => {
    render(<Input className="custom-class" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-class')
  })

  it('handles different input types', () => {
    const { rerender } = render(<Input type="email" />)
    let input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'email')

    rerender(<Input type="password" />)
    input = screen.getByDisplayValue('')
    expect(input).toHaveAttribute('type', 'password')

    rerender(<Input type="number" />)
    input = screen.getByRole('spinbutton')
    expect(input).toHaveAttribute('type', 'number')
  })

  it('handles placeholder text', () => {
    render(<Input placeholder="Enter your name" />)
    const input = screen.getByPlaceholderText('Enter your name')
    expect(input).toBeInTheDocument()
  })

  it('handles value and onChange', async () => {
    const user = userEvent.setup()
    const handleChange = jest.fn()
    render(<Input value="" onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'test value')
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('handles disabled state', () => {
    render(<Input disabled />)
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
  })

  it('handles required attribute', () => {
    render(<Input required />)
    const input = screen.getByRole('textbox')
    expect(input).toBeRequired()
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<Input ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('handles focus and blur events', () => {
    const handleFocus = jest.fn()
    const handleBlur = jest.fn()
    render(<Input onFocus={handleFocus} onBlur={handleBlur} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.focus(input)
    expect(handleFocus).toHaveBeenCalled()
    
    fireEvent.blur(input)
    expect(handleBlur).toHaveBeenCalled()
  })

  it('handles maxLength attribute', () => {
    render(<Input maxLength={10} />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('maxLength', '10')
  })

  it('handles defaultValue', () => {
    render(<Input defaultValue="default text" />)
    const input = screen.getByDisplayValue('default text')
    expect(input).toBeInTheDocument()
  })
}) 