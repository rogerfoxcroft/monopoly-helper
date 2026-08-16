import { describe, expect, it } from 'vitest'
import { formatElapsed } from './Timer'

describe('formatElapsed', () => {
  it('shows M:SS under an hour', () => {
    expect(formatElapsed(0)).toBe('0:00')
    expect(formatElapsed(9 * 1000)).toBe('0:09')
    expect(formatElapsed(75 * 1000)).toBe('1:15')
    expect(formatElapsed(59 * 60 * 1000 + 59 * 1000)).toBe('59:59')
  })

  it('shows H:MM:SS once past an hour', () => {
    expect(formatElapsed(60 * 60 * 1000)).toBe('1:00:00')
    expect(formatElapsed(2 * 3600 * 1000 + 5 * 60 * 1000 + 3 * 1000)).toBe('2:05:03')
  })

  it('never goes negative', () => {
    expect(formatElapsed(-5000)).toBe('0:00')
  })
})
