import { describe, it, expect } from '@jest/globals'

describe('Math Utilities', () => {
  describe('Basic Math Operations', () => {
    it('should add two numbers', () => {
      const add = (a: number, b: number): number => a + b
      expect(add(2, 3)).toBe(5)
      expect(add(-1, 1)).toBe(0)
      expect(add(0, 0)).toBe(0)
    })

    it('should subtract two numbers', () => {
      const subtract = (a: number, b: number): number => a - b
      expect(subtract(5, 3)).toBe(2)
      expect(subtract(1, 1)).toBe(0)
      expect(subtract(0, 5)).toBe(-5)
    })

    it('should multiply two numbers', () => {
      const multiply = (a: number, b: number): number => a * b
      expect(multiply(2, 3)).toBe(6)
      expect(multiply(-2, 3)).toBe(-6)
      expect(multiply(0, 5)).toBe(0)
    })

    it('should divide two numbers', () => {
      const divide = (a: number, b: number): number => a / b
      expect(divide(6, 2)).toBe(3)
      expect(divide(5, 2)).toBe(2.5)
      expect(divide(0, 5)).toBe(0)
    })
  })

  describe('Percentage Calculations', () => {
    it('should calculate percentage', () => {
      const calculatePercentage = (value: number, total: number): number => {
        if (total === 0) return 0
        return (value / total) * 100
      }

      expect(calculatePercentage(25, 100)).toBe(25)
      expect(calculatePercentage(1, 2)).toBe(50)
      expect(calculatePercentage(0, 100)).toBe(0)
      expect(calculatePercentage(10, 0)).toBe(0)
    })

    it('should calculate percentage change', () => {
      const calculatePercentageChange = (oldValue: number, newValue: number): number => {
        if (oldValue === 0) return 0
        return ((newValue - oldValue) / oldValue) * 100
      }

      expect(calculatePercentageChange(100, 120)).toBe(20)
      expect(calculatePercentageChange(100, 80)).toBe(-20)
      expect(calculatePercentageChange(100, 100)).toBe(0)
      expect(calculatePercentageChange(0, 100)).toBe(0)
    })
  })

  describe('Rounding Functions', () => {
    it('should round to nearest integer', () => {
      expect(Math.round(4.7)).toBe(5)
      expect(Math.round(4.4)).toBe(4)
      expect(Math.round(4.5)).toBe(5)
      expect(Math.round(-4.5)).toBe(-4)
    })

    it('should round to decimal places', () => {
      const roundToDecimals = (value: number, decimals: number): number => {
        const factor = Math.pow(10, decimals)
        return Math.round(value * factor) / factor
      }

      expect(roundToDecimals(4.567, 2)).toBe(4.57)
      expect(roundToDecimals(4.564, 2)).toBe(4.56)
      expect(roundToDecimals(4.5, 2)).toBe(4.5)
    })

    it('should ceil and floor numbers', () => {
      expect(Math.ceil(4.1)).toBe(5)
      expect(Math.ceil(4.9)).toBe(5)
      expect(Math.floor(4.1)).toBe(4)
      expect(Math.floor(4.9)).toBe(4)
    })
  })

  describe('Min/Max Functions', () => {
    it('should find minimum value', () => {
      expect(Math.min(1, 2, 3)).toBe(1)
      expect(Math.min(-1, -2, -3)).toBe(-3)
      expect(Math.min(0, 5, -2)).toBe(-2)
    })

    it('should find maximum value', () => {
      expect(Math.max(1, 2, 3)).toBe(3)
      expect(Math.max(-1, -2, -3)).toBe(-1)
      expect(Math.max(0, 5, -2)).toBe(5)
    })

    it('should clamp values', () => {
      const clamp = (value: number, min: number, max: number): number => {
        return Math.min(Math.max(value, min), max)
      }

      expect(clamp(5, 0, 10)).toBe(5)
      expect(clamp(-5, 0, 10)).toBe(0)
      expect(clamp(15, 0, 10)).toBe(10)
    })
  })

  describe('Random Functions', () => {
    it('should generate random numbers', () => {
      const random = Math.random()
      expect(random).toBeGreaterThanOrEqual(0)
      expect(random).toBeLessThan(1)
    })

    it('should generate random integers', () => {
      const randomInt = (min: number, max: number): number => {
        return Math.floor(Math.random() * (max - min + 1)) + min
      }

      const result = randomInt(1, 10)
      expect(result).toBeGreaterThanOrEqual(1)
      expect(result).toBeLessThanOrEqual(10)
      expect(Number.isInteger(result)).toBe(true)
    })
  })

  describe('Statistical Functions', () => {
    it('should calculate average', () => {
      const average = (numbers: number[]): number => {
        if (numbers.length === 0) return 0
        return numbers.reduce((sum, num) => sum + num, 0) / numbers.length
      }

      expect(average([1, 2, 3, 4, 5])).toBe(3)
      expect(average([10, 20])).toBe(15)
      expect(average([5])).toBe(5)
      expect(average([])).toBe(0)
    })

    it('should calculate median', () => {
      const median = (numbers: number[]): number => {
        if (numbers.length === 0) return 0
        const sorted = [...numbers].sort((a, b) => a - b)
        const mid = Math.floor(sorted.length / 2)
        return sorted.length % 2 === 0
          ? (sorted[mid - 1] + sorted[mid]) / 2
          : sorted[mid]
      }

      expect(median([1, 2, 3, 4, 5])).toBe(3)
      expect(median([1, 2, 3, 4])).toBe(2.5)
      expect(median([5])).toBe(5)
      expect(median([])).toBe(0)
    })

    it('should calculate sum', () => {
      const sum = (numbers: number[]): number => {
        return numbers.reduce((total, num) => total + num, 0)
      }

      expect(sum([1, 2, 3, 4, 5])).toBe(15)
      expect(sum([10, -5])).toBe(5)
      expect(sum([])).toBe(0)
    })
  })

  describe('Power and Root Functions', () => {
    it('should calculate power', () => {
      expect(Math.pow(2, 3)).toBe(8)
      expect(Math.pow(5, 2)).toBe(25)
      expect(Math.pow(2, 0)).toBe(1)
      expect(Math.pow(0, 5)).toBe(0)
    })

    it('should calculate square root', () => {
      expect(Math.sqrt(9)).toBe(3)
      expect(Math.sqrt(16)).toBe(4)
      expect(Math.sqrt(0)).toBe(0)
      expect(Math.sqrt(2)).toBeCloseTo(1.414, 3)
    })

    it('should calculate absolute value', () => {
      expect(Math.abs(5)).toBe(5)
      expect(Math.abs(-5)).toBe(5)
      expect(Math.abs(0)).toBe(0)
      expect(Math.abs(-0)).toBe(0)
    })
  })

  describe('Validation Functions', () => {
    it('should check if number is finite', () => {
      expect(Number.isFinite(42)).toBe(true)
      expect(Number.isFinite(Infinity)).toBe(false)
      expect(Number.isFinite(-Infinity)).toBe(false)
      expect(Number.isFinite(NaN)).toBe(false)
    })

    it('should check if number is integer', () => {
      expect(Number.isInteger(42)).toBe(true)
      expect(Number.isInteger(42.0)).toBe(true)
      expect(Number.isInteger(42.5)).toBe(false)
      expect(Number.isInteger(NaN)).toBe(false)
    })

    it('should check if number is NaN', () => {
      expect(Number.isNaN(NaN)).toBe(true)
      expect(Number.isNaN(42)).toBe(false)
      expect(Number.isNaN('hello')).toBe(false)
      expect(Number.isNaN(undefined)).toBe(false)
    })
  })

  describe('Format Functions', () => {
    it('should format numbers with commas', () => {
      const formatWithCommas = (num: number): string => {
        return num.toLocaleString()
      }

      expect(formatWithCommas(1234)).toBe('1,234')
      expect(formatWithCommas(1234567)).toBe('1,234,567')
      expect(formatWithCommas(123)).toBe('123')
    })

    it('should format currency', () => {
      const formatCurrency = (amount: number, currency = 'USD'): string => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency
        }).format(amount)
      }

      expect(formatCurrency(1234.56)).toBe('$1,234.56')
      expect(formatCurrency(0)).toBe('$0.00')
    })

    it('should format percentages', () => {
      const formatPercentage = (value: number, decimals = 1): string => {
        return `${value.toFixed(decimals)}%`
      }

      expect(formatPercentage(25.5)).toBe('25.5%')
      expect(formatPercentage(25.567, 2)).toBe('25.57%')
      expect(formatPercentage(0)).toBe('0.0%')
    })
  })
}) 