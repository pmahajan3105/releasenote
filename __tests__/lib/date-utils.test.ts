import { describe, it, expect } from '@jest/globals'

describe('Date Utilities', () => {
  describe('Date Creation', () => {
    it('should create new dates', () => {
      const now = new Date()
      expect(now).toBeInstanceOf(Date)
      
      const specificDate = new Date(2024, 0, 1) // Year, Month (0-based), Day
      expect(specificDate.getFullYear()).toBe(2024)
      expect(specificDate.getMonth()).toBe(0) // January is 0
      expect(specificDate.getDate()).toBe(1)
    })

    it('should create dates from timestamp', () => {
      const timestamp = 1640995200000 // 2022-01-01 00:00:00 UTC
      const date = new Date(timestamp)
      
      expect(date.getTime()).toBe(timestamp)
      expect(date.getUTCFullYear()).toBe(2022) // Use UTC to avoid timezone issues
    })

    it('should create dates from components', () => {
      const date = new Date(2024, 0, 15, 10, 30, 45) // Year, Month (0-based), Day, Hour, Minute, Second
      
      expect(date.getFullYear()).toBe(2024)
      expect(date.getMonth()).toBe(0)
      expect(date.getDate()).toBe(15)
      expect(date.getHours()).toBe(10)
      expect(date.getMinutes()).toBe(30)
      expect(date.getSeconds()).toBe(45)
    })
  })

  describe('Date Formatting', () => {
    it('should format dates to strings', () => {
      const date = new Date('2024-01-15T10:30:45Z')
      
      expect(date.toISOString()).toContain('2024-01-15')
      expect(date.toDateString()).toContain('Jan')
      expect(date.toUTCString()).toContain('10:30:45') // Use UTC string to avoid timezone issues
    })

    it('should format dates with locale', () => {
      const date = new Date(2024, 0, 15) // Use explicit date construction
      
      const usFormat = date.toLocaleDateString('en-US')
      expect(usFormat).toMatch(/1\/15\/2024|1\/15\/24/)
      
      // For ISO format, use UTC date to avoid timezone issues
      const utcDate = new Date('2024-01-15T00:00:00Z')
      const isoFormat = utcDate.toISOString().split('T')[0]
      expect(isoFormat).toBe('2024-01-15')
    })

    it('should format custom date strings', () => {
      const formatDate = (date: Date, format: string): string => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        
        return format
          .replace('YYYY', String(year))
          .replace('MM', month)
          .replace('DD', day)
      }
      
      const date = new Date(2024, 0, 15) // Use explicit date construction
      expect(formatDate(date, 'YYYY-MM-DD')).toBe('2024-01-15')
      expect(formatDate(date, 'DD/MM/YYYY')).toBe('15/01/2024')
    })
  })

  describe('Date Comparison', () => {
    it('should compare dates', () => {
      const date1 = new Date('2024-01-01')
      const date2 = new Date('2024-01-02')
      const date3 = new Date('2024-01-01')
      
      expect(date1 < date2).toBe(true)
      expect(date2 > date1).toBe(true)
      expect(date1.getTime() === date3.getTime()).toBe(true)
    })

    it('should check if dates are same day', () => {
      const isSameDay = (date1: Date, date2: Date): boolean => {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate()
      }
      
      const date1 = new Date('2024-01-15T10:00:00')
      const date2 = new Date('2024-01-15T15:00:00')
      const date3 = new Date('2024-01-16T10:00:00')
      
      expect(isSameDay(date1, date2)).toBe(true)
      expect(isSameDay(date1, date3)).toBe(false)
    })

    it('should check if date is today', () => {
      const isToday = (date: Date): boolean => {
        const today = new Date()
        return date.getFullYear() === today.getFullYear() &&
               date.getMonth() === today.getMonth() &&
               date.getDate() === today.getDate()
      }
      
      const today = new Date()
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
      
      expect(isToday(today)).toBe(true)
      expect(isToday(yesterday)).toBe(false)
    })
  })

  describe('Date Arithmetic', () => {
    it('should add days to date', () => {
      const addDays = (date: Date, days: number): Date => {
        const result = new Date(date)
        result.setDate(result.getDate() + days)
        return result
      }
      
      const date = new Date(2024, 0, 15) // Use explicit date construction
      const futureDate = addDays(date, 10)
      
      expect(futureDate.getDate()).toBe(25)
      expect(futureDate.getMonth()).toBe(0) // January
    })

    it('should subtract days from date', () => {
      const subtractDays = (date: Date, days: number): Date => {
        const result = new Date(date)
        result.setDate(result.getDate() - days)
        return result
      }
      
      const date = new Date(2024, 0, 15) // Use explicit date construction
      const pastDate = subtractDays(date, 10)
      
      expect(pastDate.getDate()).toBe(5)
      expect(pastDate.getMonth()).toBe(0) // January
    })

    it('should calculate difference between dates', () => {
      const daysBetween = (date1: Date, date2: Date): number => {
        const diffTime = Math.abs(date2.getTime() - date1.getTime())
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      }
      
      const date1 = new Date('2024-01-01')
      const date2 = new Date('2024-01-11')
      
      expect(daysBetween(date1, date2)).toBe(10)
    })
  })

  describe('Date Validation', () => {
    it('should validate date objects', () => {
      const validDate = new Date('2024-01-15')
      const invalidDate = new Date('invalid')
      
      expect(validDate instanceof Date).toBe(true)
      expect(!isNaN(validDate.getTime())).toBe(true)
      
      expect(invalidDate instanceof Date).toBe(true)
      expect(isNaN(invalidDate.getTime())).toBe(true)
    })

    it('should check if year is leap year', () => {
      const isLeapYear = (year: number): boolean => {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
      }
      
      expect(isLeapYear(2024)).toBe(true)
      expect(isLeapYear(2023)).toBe(false)
      expect(isLeapYear(2000)).toBe(true)
      expect(isLeapYear(1900)).toBe(false)
    })

    it('should validate date strings', () => {
      const isValidDateString = (dateString: string): boolean => {
        const date = new Date(dateString)
        return !isNaN(date.getTime())
      }
      
      expect(isValidDateString('2024-01-15')).toBe(true)
      expect(isValidDateString('2024-13-01')).toBe(false)
      expect(isValidDateString('invalid')).toBe(false)
    })
  })

  describe('Date Ranges', () => {
    it('should check if date is in range', () => {
      const isInRange = (date: Date, start: Date, end: Date): boolean => {
        return date >= start && date <= end
      }
      
      const date = new Date('2024-01-15')
      const start = new Date('2024-01-01')
      const end = new Date('2024-01-31')
      const outside = new Date('2024-02-01')
      
      expect(isInRange(date, start, end)).toBe(true)
      expect(isInRange(outside, start, end)).toBe(false)
    })

    it('should get start and end of day', () => {
      const startOfDay = (date: Date): Date => {
        const result = new Date(date)
        result.setHours(0, 0, 0, 0)
        return result
      }
      
      const endOfDay = (date: Date): Date => {
        const result = new Date(date)
        result.setHours(23, 59, 59, 999)
        return result
      }
      
      const date = new Date('2024-01-15T15:30:45')
      const start = startOfDay(date)
      const end = endOfDay(date)
      
      expect(start.getHours()).toBe(0)
      expect(start.getMinutes()).toBe(0)
      expect(end.getHours()).toBe(23)
      expect(end.getMinutes()).toBe(59)
    })
  })

  describe('Time Utilities', () => {
    it('should get current timestamp', () => {
      const now = Date.now()
      const dateNow = new Date().getTime()
      
      expect(typeof now).toBe('number')
      expect(Math.abs(now - dateNow)).toBeLessThan(10) // Should be very close
    })

    it('should format time duration', () => {
      const formatDuration = (milliseconds: number): string => {
        const seconds = Math.floor(milliseconds / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)
        
        if (hours > 0) {
          return `${hours}h ${minutes % 60}m ${seconds % 60}s`
        } else if (minutes > 0) {
          return `${minutes}m ${seconds % 60}s`
        } else {
          return `${seconds}s`
        }
      }
      
      expect(formatDuration(5000)).toBe('5s')
      expect(formatDuration(65000)).toBe('1m 5s')
      expect(formatDuration(3665000)).toBe('1h 1m 5s')
    })

    it('should get relative time', () => {
      const getRelativeTime = (date: Date): string => {
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        
        if (diffDays === 0) return 'today'
        if (diffDays === 1) return 'yesterday'
        if (diffDays < 7) return `${diffDays} days ago`
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
        return `${Math.floor(diffDays / 30)} months ago`
      }
      
      const today = new Date()
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      expect(getRelativeTime(today)).toBe('today')
      expect(getRelativeTime(yesterday)).toBe('yesterday')
      expect(getRelativeTime(weekAgo)).toBe('1 weeks ago')
    })
  })
}) 