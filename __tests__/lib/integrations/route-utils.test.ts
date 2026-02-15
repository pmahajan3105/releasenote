import { describe, expect, it } from '@jest/globals'
import {
  parseBooleanParam,
  parseEnumParam,
  parseIntegerParam,
} from '@/lib/integrations/route-utils'

describe('route-utils', () => {
  it('parses integer params with bounds', () => {
    expect(parseIntegerParam('10', 5, { min: 1, max: 20 })).toBe(10)
    expect(parseIntegerParam('0', 5, { min: 1, max: 20 })).toBe(1)
    expect(parseIntegerParam('999', 5, { min: 1, max: 20 })).toBe(20)
    expect(parseIntegerParam('invalid', 5)).toBe(5)
  })

  it('parses enum params with fallback', () => {
    const allowed = ['a', 'b', 'c'] as const
    expect(parseEnumParam('b', allowed, 'a')).toBe('b')
    expect(parseEnumParam('z', allowed, 'a')).toBe('a')
    expect(parseEnumParam(null, allowed)).toBeUndefined()
  })

  it('parses boolean params', () => {
    expect(parseBooleanParam('true', false)).toBe(true)
    expect(parseBooleanParam('1', false)).toBe(true)
    expect(parseBooleanParam('no', true)).toBe(false)
    expect(parseBooleanParam('unknown', true)).toBe(true)
    expect(parseBooleanParam(null, false)).toBe(false)
  })
})
