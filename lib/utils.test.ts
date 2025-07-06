import { cn, slugify } from './utils'

describe('cn function', () => {
  it('should merge class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  it('should handle conditional classes', () => {
    expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional')
  })

  it('should handle Tailwind CSS conflicts', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })

  it('should handle empty inputs', () => {
    expect(cn()).toBe('')
    expect(cn('', null, undefined)).toBe('')
  })

  it('should handle arrays of classes', () => {
    expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3')
  })

  it('should handle objects with boolean values', () => {
    expect(cn({ 'class1': true, 'class2': false, 'class3': true })).toBe('class1 class3')
  })
})

describe('slugify function', () => {
  it('should convert text to lowercase slug', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('should handle empty or null input', () => {
    expect(slugify('')).toBe('')
    expect(slugify(null as unknown as string)).toBe('')
    expect(slugify(undefined as unknown as string)).toBe('')
  })

  it('should replace spaces with hyphens', () => {
    expect(slugify('Multiple   Spaces   Here')).toBe('multiple-spaces-here')
  })

  it('should remove special characters', () => {
    expect(slugify('Hello@#$%World!')).toBe('helloworld')
  })

  it('should handle mixed case and special characters', () => {
    expect(slugify('My Awesome Blog Post!')).toBe('my-awesome-blog-post')
  })

  it('should remove leading and trailing hyphens', () => {
    expect(slugify('  -start and end-  ')).toBe('start-and-end')
  })

  it('should handle consecutive hyphens', () => {
    expect(slugify('word---with---many---hyphens')).toBe('word-with-many-hyphens')
  })

  it('should handle numbers and underscores', () => {
    expect(slugify('Version 2.0_beta')).toBe('version-20_beta')
  })

  it('should handle unicode characters', () => {
    expect(slugify('Café & Restaurant')).toBe('caf-restaurant')
  })

  it('should handle only special characters', () => {
    expect(slugify('!@#$%^&*()')).toBe('')
  })

  it('should handle very long strings', () => {
    const longString = 'a'.repeat(100) + ' ' + 'b'.repeat(100)
    const result = slugify(longString)
    expect(result).toBe('a'.repeat(100) + '-' + 'b'.repeat(100))
  })
}) 