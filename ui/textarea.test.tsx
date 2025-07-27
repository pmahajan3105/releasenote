import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Textarea } from './textarea'

describe('Textarea Component', () => {
  it('renders with default props', () => {
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveClass('flex', 'min-h-[80px]', 'w-full', 'rounded-md')
  })

  it('applies custom className', () => {
    render(<Textarea className="custom-class" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('custom-class')
  })

  it('handles placeholder text', () => {
    render(<Textarea placeholder="Enter your message" />)
    const textarea = screen.getByPlaceholderText('Enter your message')
    expect(textarea).toBeInTheDocument()
  })

  it('handles value and onChange', async () => {
    const user = userEvent.setup()
    const handleChange = jest.fn()
    render(<Textarea value="" onChange={handleChange} />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'test message')
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('handles disabled state', () => {
    render(<Textarea disabled />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeDisabled()
    expect(textarea).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
  })

  it('handles required attribute', () => {
    render(<Textarea required />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeRequired()
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLTextAreaElement>()
    render(<Textarea ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })

  it('handles focus and blur events', () => {
    const handleFocus = jest.fn()
    const handleBlur = jest.fn()
    render(<Textarea onFocus={handleFocus} onBlur={handleBlur} />)
    
    const textarea = screen.getByRole('textbox')
    fireEvent.focus(textarea)
    expect(handleFocus).toHaveBeenCalled()
    
    fireEvent.blur(textarea)
    expect(handleBlur).toHaveBeenCalled()
  })

  it('handles rows attribute', () => {
    render(<Textarea rows={5} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('rows', '5')
  })

  it('handles cols attribute', () => {
    render(<Textarea cols={50} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('cols', '50')
  })

  it('handles maxLength attribute', () => {
    render(<Textarea maxLength={100} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('maxLength', '100')
  })

  it('handles defaultValue', () => {
    render(<Textarea defaultValue="default message" />)
    const textarea = screen.getByDisplayValue('default message')
    expect(textarea).toBeInTheDocument()
  })

  it('handles readonly attribute', () => {
    render(<Textarea readOnly />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('readOnly')
  })
}) 