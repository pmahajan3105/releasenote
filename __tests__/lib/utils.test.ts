import { describe, it, expect, jest } from '@jest/globals'
import { 
  cn, 
  slugify, 
  formatDate, 
  generateSlug, 
  truncateText, 
  isValidEmail, 
  debounce, 
  throttle, 
  sleep, 
  capitalize, 
  getInitials 
} from '@/lib/utils'

describe('Utils', () => {
  describe('cn (className merger)', () => {
    it('should merge class names', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
      expect(cn('class1', false && 'class2', 'class3')).toBe('class1 class3')
    })

    it('should handle empty inputs', () => {
      expect(cn()).toBe('')
      expect(cn('')).toBe('')
      expect(cn(null, undefined)).toBe('')
    })

    it('should handle Tailwind class conflicts', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2')
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })
  })

  describe('slugify', () => {
    it('should convert text to URL-friendly slug', () => {
      expect(slugify('Hello World')).toBe('hello-world')
      expect(slugify('React & Next.js')).toBe('react-nextjs')
      expect(slugify('Multiple   Spaces')).toBe('multiple-spaces')
    })

    it('should handle empty input', () => {
      expect(slugify('')).toBe('')
      expect(slugify('   ')).toBe('')
    })

    it('should handle special characters', () => {
      expect(slugify('Hello@World#123')).toBe('helloworld123')
      expect(slugify('Test!@#$%^&*()_+')).toBe('test_')
    })

    it('should handle multiple dashes', () => {
      expect(slugify('Hello---World')).toBe('hello-world')
      expect(slugify('---Hello World---')).toBe('hello-world')
    })
  })

  describe('formatDate', () => {
    it('should format date string', () => {
      const result = formatDate('2024-01-15')
      expect(result).toMatch(/January 15, 2024|January 14, 2024/) // Account for timezone
    })

    it('should format Date object', () => {
      const date = new Date('2024-01-15T12:00:00Z')
      const result = formatDate(date)
      expect(result).toMatch(/January/)
      expect(result).toMatch(/2024/)
    })

    it('should handle invalid dates', () => {
      expect(formatDate('invalid-date')).toBe('Invalid Date')
      expect(formatDate('')).toBe('Invalid Date')
    })
  })

  describe('generateSlug', () => {
    it('should generate URL-friendly slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world')
      expect(generateSlug('React & Next.js')).toBe('react-nextjs')
      expect(generateSlug('Multiple   Spaces')).toBe('multiple-spaces')
    })

    it('should handle special characters', () => {
      expect(generateSlug('Hello@World#123')).toBe('helloworld123')
      expect(generateSlug('Test!@#$%^&*()_+')).toBe('test')
    })

    it('should handle empty input', () => {
      expect(generateSlug('')).toBe('')
      expect(generateSlug('   ')).toBe('-')
    })
  })

  describe('truncateText', () => {
    it('should truncate long text', () => {
      expect(truncateText('This is a long text', 10)).toBe('This is...')
      expect(truncateText('Short', 10)).toBe('Short')
    })

    it('should use custom suffix', () => {
      expect(truncateText('This is a long text', 10, '---')).toBe('This is---')
    })

    it('should handle edge cases', () => {
      expect(truncateText('', 10)).toBe('')
      expect(truncateText('Test', 0)).toBe('...')
    })
  })

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
      expect(isValidEmail('test+tag@example.org')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('test@domain')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should debounce function calls', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('test1')
      debouncedFn('test2')
      debouncedFn('test3')

      expect(mockFn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('test3')
    })

    it('should reset timer on subsequent calls', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('test1')
      jest.advanceTimersByTime(50)
      debouncedFn('test2')
      jest.advanceTimersByTime(50)

      expect(mockFn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(50)
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('test2')
    })
  })

  describe('throttle', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should throttle function calls', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 100)

      throttledFn('test1')
      throttledFn('test2')
      throttledFn('test3')

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('test1')

      jest.advanceTimersByTime(100)
      throttledFn('test4')

      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(mockFn).toHaveBeenCalledWith('test4')
    })
  })

  describe('sleep', () => {
    it('should return a promise that resolves after delay', async () => {
      const start = Date.now()
      await sleep(10)
      const end = Date.now()
      
      expect(end - start).toBeGreaterThanOrEqual(10)
    })
  })

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello')
      expect(capitalize('world')).toBe('World')
      expect(capitalize('test string')).toBe('Test string')
    })

    it('should handle edge cases', () => {
      expect(capitalize('')).toBe('')
      expect(capitalize('a')).toBe('A')
      expect(capitalize('A')).toBe('A')
    })
  })

  describe('getInitials', () => {
    it('should get initials from name', () => {
      expect(getInitials('John Doe')).toBe('JD')
      expect(getInitials('Jane Smith')).toBe('JS')
      expect(getInitials('John Michael Doe')).toBe('JM')
    })

    it('should handle single name', () => {
      expect(getInitials('John')).toBe('J')
      expect(getInitials('Jane')).toBe('J')
    })

    it('should handle edge cases', () => {
      expect(getInitials('')).toBe('')
      expect(getInitials('   ')).toBe('')
      expect(getInitials('a b c d e')).toBe('AB')
    })
  })
}) 