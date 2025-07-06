import { describe, it, expect } from '@jest/globals'

describe('Array Utilities', () => {
  describe('Basic Array Operations', () => {
    it('should check if array is empty', () => {
      const isEmpty = (arr: any[]): boolean => arr.length === 0
      
      expect(isEmpty([])).toBe(true)
      expect(isEmpty([1, 2, 3])).toBe(false)
      expect(isEmpty([''])).toBe(false)
    })

    it('should get array length', () => {
      expect([].length).toBe(0)
      expect([1, 2, 3].length).toBe(3)
      expect(['a', 'b'].length).toBe(2)
    })

    it('should add elements to array', () => {
      const arr = [1, 2]
      arr.push(3)
      expect(arr).toEqual([1, 2, 3])
      
      const arr2 = ['a']
      arr2.unshift('b')
      expect(arr2).toEqual(['b', 'a'])
    })

    it('should remove elements from array', () => {
      const arr = [1, 2, 3]
      const popped = arr.pop()
      expect(popped).toBe(3)
      expect(arr).toEqual([1, 2])
      
      const arr2 = [1, 2, 3]
      const shifted = arr2.shift()
      expect(shifted).toBe(1)
      expect(arr2).toEqual([2, 3])
    })
  })

  describe('Array Search and Access', () => {
    it('should find elements in array', () => {
      const arr = [1, 2, 3, 4, 5]
      
      expect(arr.indexOf(3)).toBe(2)
      expect(arr.indexOf(6)).toBe(-1)
      expect(arr.includes(4)).toBe(true)
      expect(arr.includes(6)).toBe(false)
    })

    it('should access elements by index', () => {
      const arr = ['a', 'b', 'c']
      
      expect(arr[0]).toBe('a')
      expect(arr[1]).toBe('b')
      expect(arr[2]).toBe('c')
      expect(arr[3]).toBeUndefined()
    })

    it('should find elements with find method', () => {
      const arr = [1, 2, 3, 4, 5]
      
      const found = arr.find(x => x > 3)
      expect(found).toBe(4)
      
      const notFound = arr.find(x => x > 10)
      expect(notFound).toBeUndefined()
    })

    it('should find index with findIndex method', () => {
      const arr = [1, 2, 3, 4, 5]
      
      const index = arr.findIndex(x => x > 3)
      expect(index).toBe(3)
      
      const notFoundIndex = arr.findIndex(x => x > 10)
      expect(notFoundIndex).toBe(-1)
    })
  })

  describe('Array Transformation', () => {
    it('should map array elements', () => {
      const arr = [1, 2, 3]
      const doubled = arr.map(x => x * 2)
      
      expect(doubled).toEqual([2, 4, 6])
      expect(arr).toEqual([1, 2, 3]) // Original unchanged
    })

    it('should filter array elements', () => {
      const arr = [1, 2, 3, 4, 5]
      const evens = arr.filter(x => x % 2 === 0)
      
      expect(evens).toEqual([2, 4])
      expect(arr).toEqual([1, 2, 3, 4, 5]) // Original unchanged
    })

    it('should reduce array to single value', () => {
      const arr = [1, 2, 3, 4, 5]
      const sum = arr.reduce((acc, curr) => acc + curr, 0)
      
      expect(sum).toBe(15)
      
      const product = arr.reduce((acc, curr) => acc * curr, 1)
      expect(product).toBe(120)
    })

    it('should reverse array', () => {
      const arr = [1, 2, 3]
      const reversed = [...arr].reverse()
      
      expect(reversed).toEqual([3, 2, 1])
      expect(arr).toEqual([1, 2, 3]) // Original unchanged
    })
  })

  describe('Array Sorting', () => {
    it('should sort numbers', () => {
      const arr = [3, 1, 4, 1, 5]
      const sorted = [...arr].sort((a, b) => a - b)
      
      expect(sorted).toEqual([1, 1, 3, 4, 5])
      expect(arr).toEqual([3, 1, 4, 1, 5]) // Original unchanged
    })

    it('should sort strings', () => {
      const arr = ['banana', 'apple', 'cherry']
      const sorted = [...arr].sort()
      
      expect(sorted).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should sort objects', () => {
      const arr = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
        { name: 'Bob', age: 35 }
      ]
      const sortedByAge = [...arr].sort((a, b) => a.age - b.age)
      
      expect(sortedByAge[0].name).toBe('Jane')
      expect(sortedByAge[2].name).toBe('Bob')
    })
  })

  describe('Array Slicing and Splicing', () => {
    it('should slice array', () => {
      const arr = [1, 2, 3, 4, 5]
      
      expect(arr.slice(1, 3)).toEqual([2, 3])
      expect(arr.slice(2)).toEqual([3, 4, 5])
      expect(arr.slice(-2)).toEqual([4, 5])
      expect(arr).toEqual([1, 2, 3, 4, 5]) // Original unchanged
    })

    it('should splice array', () => {
      const arr = [1, 2, 3, 4, 5]
      const removed = arr.splice(1, 2, 'a', 'b')
      
      expect(removed).toEqual([2, 3])
      expect(arr).toEqual([1, 'a', 'b', 4, 5])
    })
  })

  describe('Array Joining and Concatenation', () => {
    it('should join array elements', () => {
      const arr = ['a', 'b', 'c']
      
      expect(arr.join()).toBe('a,b,c')
      expect(arr.join(' ')).toBe('a b c')
      expect(arr.join('-')).toBe('a-b-c')
    })

    it('should concatenate arrays', () => {
      const arr1 = [1, 2]
      const arr2 = [3, 4]
      const arr3 = [5, 6]
      
      const combined = arr1.concat(arr2, arr3)
      expect(combined).toEqual([1, 2, 3, 4, 5, 6])
      
      const spreadCombined = [...arr1, ...arr2, ...arr3]
      expect(spreadCombined).toEqual([1, 2, 3, 4, 5, 6])
    })
  })

  describe('Array Validation', () => {
    it('should check if value is array', () => {
      expect(Array.isArray([])).toBe(true)
      expect(Array.isArray([1, 2, 3])).toBe(true)
      expect(Array.isArray('string')).toBe(false)
      expect(Array.isArray({})).toBe(false)
      expect(Array.isArray(null)).toBe(false)
    })

    it('should check array conditions', () => {
      const arr = [2, 4, 6, 8]
      
      const allEven = arr.every(x => x % 2 === 0)
      expect(allEven).toBe(true)
      
      const someOdd = arr.some(x => x % 2 === 1)
      expect(someOdd).toBe(false)
    })
  })

  describe('Array Utilities', () => {
    it('should remove duplicates', () => {
      const removeDuplicates = (arr: any[]): any[] => {
        return [...new Set(arr)]
      }
      
      expect(removeDuplicates([1, 2, 2, 3, 3, 4])).toEqual([1, 2, 3, 4])
      expect(removeDuplicates(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c'])
    })

    it('should flatten array', () => {
      const flatten = (arr: any[]): any[] => {
        return arr.flat()
      }
      
      expect(flatten([1, [2, 3], [4, 5]])).toEqual([1, 2, 3, 4, 5])
      expect(flatten([1, 2, 3])).toEqual([1, 2, 3])
    })

    it('should chunk array', () => {
      const chunk = (arr: any[], size: number): any[][] => {
        const chunks = []
        for (let i = 0; i < arr.length; i += size) {
          chunks.push(arr.slice(i, i + size))
        }
        return chunks
      }
      
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
      expect(chunk([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]])
    })

    it('should shuffle array', () => {
      const shuffle = (arr: any[]): any[] => {
        const shuffled = [...arr]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return shuffled
      }
      
      const arr = [1, 2, 3, 4, 5]
      const shuffled = shuffle(arr)
      
      expect(shuffled).toHaveLength(5)
      expect(shuffled).toEqual(expect.arrayContaining([1, 2, 3, 4, 5]))
      expect(arr).toEqual([1, 2, 3, 4, 5]) // Original unchanged
    })

    it('should get unique values', () => {
      const unique = (arr: any[]): any[] => {
        return arr.filter((value, index, self) => self.indexOf(value) === index)
      }
      
      expect(unique([1, 2, 2, 3, 3, 4])).toEqual([1, 2, 3, 4])
      expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c'])
    })

    it('should partition array', () => {
      const partition = (arr: any[], predicate: (item: any) => boolean): [any[], any[]] => {
        const pass = []
        const fail = []
        for (const item of arr) {
          if (predicate(item)) {
            pass.push(item)
          } else {
            fail.push(item)
          }
        }
        return [pass, fail]
      }
      
      const [evens, odds] = partition([1, 2, 3, 4, 5], x => x % 2 === 0)
      expect(evens).toEqual([2, 4])
      expect(odds).toEqual([1, 3, 5])
    })
  })

  describe('Array Statistics', () => {
    it('should calculate min and max', () => {
      const arr = [3, 1, 4, 1, 5, 9, 2, 6]
      
      expect(Math.min(...arr)).toBe(1)
      expect(Math.max(...arr)).toBe(9)
    })

    it('should calculate sum and average', () => {
      const sum = (arr: number[]): number => {
        return arr.reduce((acc, curr) => acc + curr, 0)
      }
      
      const average = (arr: number[]): number => {
        return arr.length === 0 ? 0 : sum(arr) / arr.length
      }
      
      const arr = [1, 2, 3, 4, 5]
      expect(sum(arr)).toBe(15)
      expect(average(arr)).toBe(3)
      expect(average([])).toBe(0)
    })

    it('should count occurrences', () => {
      const countOccurrences = (arr: any[], value: any): number => {
        return arr.filter(item => item === value).length
      }
      
      const arr = [1, 2, 2, 3, 2, 4]
      expect(countOccurrences(arr, 2)).toBe(3)
      expect(countOccurrences(arr, 5)).toBe(0)
    })
  })
}) 