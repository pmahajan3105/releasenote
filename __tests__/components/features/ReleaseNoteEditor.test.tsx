import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReleaseNoteEditor from '@/components/features/ReleaseNoteEditor'

// Mock react-quill
jest.mock('react-quill', () => {
  const MockQuill = ({ value, onChange, placeholder }: any) => (
    <div data-testid="quill-editor">
      <textarea
        data-testid="quill-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
  return MockQuill
})

// Mock next/dynamic
jest.mock('next/dynamic', () => {
  return (importFunc: any) => {
    const Component = importFunc()
    return Component
  }
})

// Mock Supabase
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn(() => ({
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        getPublicUrl: jest.fn()
      }))
    }
  }))
}))

const mockProps = {
  value: '<h2>Features</h2><p>Initial content</p>',
  onChange: jest.fn(),
  placeholder: 'Write your release notes here...'
}

describe('ReleaseNoteEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render with initial value', () => {
    render(<ReleaseNoteEditor {...mockProps} />)
    
    expect(screen.getByTestId('quill-editor')).toBeInTheDocument()
    expect(screen.getByDisplayValue('<h2>Features</h2><p>Initial content</p>')).toBeInTheDocument()
  })

  it('should render with custom placeholder', () => {
    render(<ReleaseNoteEditor value="" onChange={jest.fn()} placeholder="Custom placeholder" />)
    
    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument()
  })

  it('should render with default placeholder', () => {
    render(<ReleaseNoteEditor value="" onChange={jest.fn()} />)
    
    expect(screen.getByPlaceholderText('Write your release notes here...')).toBeInTheDocument()
  })

  it('should call onChange when content is edited', async () => {
    const user = userEvent.setup()
    const mockOnChange = jest.fn()
    
    render(<ReleaseNoteEditor value="" onChange={mockOnChange} />)
    
    const textarea = screen.getByTestId('quill-textarea')
    await user.type(textarea, 'New content')
    
    expect(mockOnChange).toHaveBeenCalledWith('New content')
  })

  it('should handle empty value gracefully', () => {
    render(<ReleaseNoteEditor value="" onChange={jest.fn()} />)
    
    const textarea = screen.getByTestId('quill-textarea')
    expect(textarea).toHaveValue('')
  })

  it('should handle HTML content', () => {
    const htmlContent = '<h1>Title</h1><p>Paragraph</p>'
    render(<ReleaseNoteEditor value={htmlContent} onChange={jest.fn()} />)
    
    expect(screen.getByDisplayValue(htmlContent)).toBeInTheDocument()
  })

  it('should update when value prop changes', () => {
    const { rerender } = render(<ReleaseNoteEditor value="Initial" onChange={jest.fn()} />)
    
    expect(screen.getByDisplayValue('Initial')).toBeInTheDocument()
    
    rerender(<ReleaseNoteEditor value="Updated" onChange={jest.fn()} />)
    
    expect(screen.getByDisplayValue('Updated')).toBeInTheDocument()
  })

  it('should handle multiple onChange calls', async () => {
    const user = userEvent.setup()
    const mockOnChange = jest.fn()
    
    render(<ReleaseNoteEditor value="" onChange={mockOnChange} />)
    
    const textarea = screen.getByTestId('quill-textarea')
    await user.type(textarea, 'Hello')
    
    expect(mockOnChange).toHaveBeenCalledTimes(5) // One for each character
  })

  it('should preserve formatting in HTML content', () => {
    const formattedContent = '<strong>Bold</strong> and <em>italic</em> text'
    render(<ReleaseNoteEditor value={formattedContent} onChange={jest.fn()} />)
    
    expect(screen.getByDisplayValue(formattedContent)).toBeInTheDocument()
  })

  it('should handle special characters in content', () => {
    const specialContent = 'Special chars: &amp; &lt; &gt; &quot; &#39;'
    render(<ReleaseNoteEditor value={specialContent} onChange={jest.fn()} />)
    
    expect(screen.getByDisplayValue(specialContent)).toBeInTheDocument()
  })
}) 