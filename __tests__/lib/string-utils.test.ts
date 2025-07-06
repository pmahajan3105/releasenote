import { describe, it, expect } from '@jest/globals'

describe('String Utilities', () => {
  describe('Basic String Operations', () => {
    it('should convert to uppercase', () => {
      expect('hello'.toUpperCase()).toBe('HELLO')
      expect('HELLO'.toUpperCase()).toBe('HELLO')
      expect(''.toUpperCase()).toBe('')
    })

    it('should convert to lowercase', () => {
      expect('HELLO'.toLowerCase()).toBe('hello')
      expect('hello'.toLowerCase()).toBe('hello')
      expect(''.toLowerCase()).toBe('')
    })

    it('should trim whitespace', () => {
      expect('  hello  '.trim()).toBe('hello')
      expect('hello'.trim()).toBe('hello')
      expect('   '.trim()).toBe('')
    })

    it('should get string length', () => {
      expect('hello'.length).toBe(5)
      expect(''.length).toBe(0)
      expect('hello world'.length).toBe(11)
    })
  })

  describe('String Validation', () => {
    it('should check if string is empty', () => {
      const isEmpty = (str: string): boolean => str.length === 0
      
      expect(isEmpty('')).toBe(true)
      expect(isEmpty('hello')).toBe(false)
      expect(isEmpty(' ')).toBe(false)
    })

    it('should check if string is blank', () => {
      const isBlank = (str: string): boolean => str.trim().length === 0
      
      expect(isBlank('')).toBe(true)
      expect(isBlank('   ')).toBe(true)
      expect(isBlank('hello')).toBe(false)
      expect(isBlank(' hello ')).toBe(false)
    })

    it('should validate email format', () => {
      const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
      }

      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
    })

    it('should validate URL format', () => {
      const isValidUrl = (url: string): boolean => {
        try {
          new URL(url)
          return true
        } catch {
          return false
        }
      }

      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://test.org')).toBe(true)
      expect(isValidUrl('ftp://files.example.com')).toBe(true)
      expect(isValidUrl('not-a-url')).toBe(false)
      expect(isValidUrl('')).toBe(false)
    })
  })

  describe('String Transformation', () => {
    it('should capitalize first letter', () => {
      const capitalize = (str: string): string => {
        if (!str) return str
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
      }

      expect(capitalize('hello')).toBe('Hello')
      expect(capitalize('HELLO')).toBe('Hello')
      expect(capitalize('h')).toBe('H')
      expect(capitalize('')).toBe('')
    })

    it('should convert to title case', () => {
      const toTitleCase = (str: string): string => {
        return str.toLowerCase().split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
      }

      expect(toTitleCase('hello world')).toBe('Hello World')
      expect(toTitleCase('the quick brown fox')).toBe('The Quick Brown Fox')
      expect(toTitleCase('HELLO')).toBe('Hello')
      expect(toTitleCase('')).toBe('')
    })

    it('should convert to slug', () => {
      const toSlug = (str: string): string => {
        return str
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '')
      }

      expect(toSlug('Hello World')).toBe('hello-world')
      expect(toSlug('The Quick Brown Fox!')).toBe('the-quick-brown-fox')
      expect(toSlug('  spaced  out  ')).toBe('spaced-out')
      expect(toSlug('special@#$characters')).toBe('specialcharacters')
    })

    it('should reverse string', () => {
      const reverse = (str: string): string => {
        return str.split('').reverse().join('')
      }

      expect(reverse('hello')).toBe('olleh')
      expect(reverse('abc')).toBe('cba')
      expect(reverse('a')).toBe('a')
      expect(reverse('')).toBe('')
    })
  })

  describe('String Manipulation', () => {
    it('should repeat string', () => {
      expect('hello'.repeat(3)).toBe('hellohellohello')
      expect('a'.repeat(5)).toBe('aaaaa')
      expect('test'.repeat(0)).toBe('')
      expect(''.repeat(3)).toBe('')
    })

    it('should pad string', () => {
      expect('hello'.padStart(10, '0')).toBe('00000hello')
      expect('hello'.padEnd(10, '0')).toBe('hello00000')
      expect('hello'.padStart(3, '0')).toBe('hello')
      expect('hello'.padEnd(3, '0')).toBe('hello')
    })

    it('should replace text', () => {
      expect('hello world'.replace('world', 'universe')).toBe('hello universe')
      expect('hello hello'.replace(/hello/g, 'hi')).toBe('hi hi')
      expect('test'.replace('xyz', 'abc')).toBe('test')
    })

    it('should split string', () => {
      expect('hello,world'.split(',')).toEqual(['hello', 'world'])
      expect('a-b-c'.split('-')).toEqual(['a', 'b', 'c'])
      expect('hello'.split('')).toEqual(['h', 'e', 'l', 'l', 'o'])
      expect(''.split(',')).toEqual([''])
    })
  })

  describe('String Search', () => {
    it('should check if string includes substring', () => {
      expect('hello world'.includes('world')).toBe(true)
      expect('hello world'.includes('universe')).toBe(false)
      expect('hello world'.includes('')).toBe(true)
    })

    it('should check if string starts with substring', () => {
      expect('hello world'.startsWith('hello')).toBe(true)
      expect('hello world'.startsWith('world')).toBe(false)
      expect('hello world'.startsWith('')).toBe(true)
    })

    it('should check if string ends with substring', () => {
      expect('hello world'.endsWith('world')).toBe(true)
      expect('hello world'.endsWith('hello')).toBe(false)
      expect('hello world'.endsWith('')).toBe(true)
    })

    it('should find index of substring', () => {
      expect('hello world'.indexOf('world')).toBe(6)
      expect('hello world'.indexOf('universe')).toBe(-1)
      expect('hello hello'.indexOf('hello')).toBe(0)
      expect('hello hello'.lastIndexOf('hello')).toBe(6)
    })
  })

  describe('String Extraction', () => {
    it('should extract substring', () => {
      expect('hello world'.substring(0, 5)).toBe('hello')
      expect('hello world'.substring(6)).toBe('world')
      expect('hello world'.slice(0, 5)).toBe('hello')
      expect('hello world'.slice(-5)).toBe('world')
    })

    it('should extract character at index', () => {
      expect('hello'.charAt(0)).toBe('h')
      expect('hello'.charAt(4)).toBe('o')
      expect('hello'.charAt(10)).toBe('')
      expect('hello'[0]).toBe('h')
    })

    it('should get character code', () => {
      expect('A'.charCodeAt(0)).toBe(65)
      expect('a'.charCodeAt(0)).toBe(97)
      expect('0'.charCodeAt(0)).toBe(48)
    })
  })

  describe('String Formatting', () => {
    it('should format template strings', () => {
      const name = 'World'
      const greeting = `Hello, ${name}!`
      
      expect(greeting).toBe('Hello, World!')
    })

    it('should format with placeholders', () => {
      const format = (template: string, ...args: any[]): string => {
        return template.replace(/{(\d+)}/g, (match, index) => {
          return args[index] !== undefined ? String(args[index]) : match
        })
      }

      expect(format('Hello, {0}!', 'World')).toBe('Hello, World!')
      expect(format('{0} + {1} = {2}', 2, 3, 5)).toBe('2 + 3 = 5')
      expect(format('No replacement')).toBe('No replacement')
    })

    it('should truncate string', () => {
      const truncate = (str: string, length: number, suffix = '...'): string => {
        if (str.length <= length) return str
        return str.substring(0, length - suffix.length) + suffix
      }

      expect(truncate('Hello World', 8)).toBe('Hello...')
      expect(truncate('Hello', 10)).toBe('Hello')
      expect(truncate('Hello World', 8, '…')).toBe('Hello W…')
    })
  })

  describe('String Comparison', () => {
    it('should compare strings alphabetically', () => {
      expect('a' < 'b').toBe(true)
      expect('apple' < 'banana').toBe(true)
      expect('hello' === 'hello').toBe(true)
    })

    it('should compare strings case-insensitively', () => {
      const compareIgnoreCase = (a: string, b: string): boolean => {
        return a.toLowerCase() === b.toLowerCase()
      }

      expect(compareIgnoreCase('Hello', 'hello')).toBe(true)
      expect(compareIgnoreCase('WORLD', 'world')).toBe(true)
      expect(compareIgnoreCase('test', 'different')).toBe(false)
    })

    it('should check string similarity', () => {
      const levenshteinDistance = (a: string, b: string): number => {
        const matrix = []
        for (let i = 0; i <= b.length; i++) {
          matrix[i] = [i]
        }
        for (let j = 0; j <= a.length; j++) {
          matrix[0][j] = j
        }
        for (let i = 1; i <= b.length; i++) {
          for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
              matrix[i][j] = matrix[i - 1][j - 1]
            } else {
              matrix[i][j] = Math.min(
                matrix[i - 1][j - 1] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j] + 1
              )
            }
          }
        }
        return matrix[b.length][a.length]
      }

      expect(levenshteinDistance('kitten', 'sitting')).toBe(3)
      expect(levenshteinDistance('hello', 'hello')).toBe(0)
      expect(levenshteinDistance('', 'test')).toBe(4)
    })
  })
}) 