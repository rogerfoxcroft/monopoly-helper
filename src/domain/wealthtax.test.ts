import { describe, expect, it } from 'vitest'
import { WELL_REGULATED_VARIANT } from '../variants'
import { computeWealthTax, wealthTaxRange, wealthTaxRate } from './wealthtax'

const rule = WELL_REGULATED_VARIANT.wealthTax!

describe('wealthTaxRate', () => {
  it('is 10% for 2–4 players and 15% for 5–6', () => {
    expect(wealthTaxRate(rule, 2)).toBe(0.1)
    expect(wealthTaxRate(rule, 4)).toBe(0.1)
    expect(wealthTaxRate(rule, 5)).toBe(0.15)
    expect(wealthTaxRate(rule, 6)).toBe(0.15)
  })

  it('is null outside the bands', () => {
    expect(wealthTaxRate(rule, 1)).toBeNull()
    expect(wealthTaxRate(rule, 7)).toBeNull()
  })
})

describe('wealthTaxRange', () => {
  it('spans the full player range', () => {
    expect(wealthTaxRange(rule)).toEqual({ min: 2, max: 6 })
  })
})

describe('computeWealthTax', () => {
  it('matches the rules worked example, rounded down (4 players, £2,000)', () => {
    const r = computeWealthTax(rule, 4, 2000)!
    expect(r.total).toBe(200) // 10%
    expect(r.perOther).toBe(66) // 200 / 3 = 66.67 -> floor 66
  })

  it('rounds the total down to the nearest £1', () => {
    // 10% of 1,995 = 199.5 -> 199
    expect(computeWealthTax(rule, 3, 1995)!.total).toBe(199)
  })

  it('uses 15% for five players', () => {
    const r = computeWealthTax(rule, 5, 1000)!
    expect(r.total).toBe(150)
    expect(r.perOther).toBe(37) // 150 / 4 = 37.5 -> 37
  })

  it('returns null for an unsupported player count', () => {
    expect(computeWealthTax(rule, 1, 1000)).toBeNull()
  })
})
