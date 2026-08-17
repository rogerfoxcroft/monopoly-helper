import { describe, expect, it } from 'vitest'
import { WELL_REGULATED_VARIANT } from '../variants'
import {
  computeRoundTax,
  computeWealthTax,
  wealthTaxRange,
  wealthTaxRate,
  type TaxPlayer,
} from './wealthtax'

const rule = WELL_REGULATED_VARIANT.wealthTax!

function player(id: string, total: number, ownsProperty = true): TaxPlayer {
  return { id, name: id.toUpperCase(), worth: { total, ownsProperty } }
}

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

describe('computeRoundTax', () => {
  it('taxes the leader and splits evenly, balancing to zero', () => {
    const t = computeRoundTax(rule, [player('a', 2000), player('b', 1000), player('c', 500)])!
    expect(t.leaderId).toBe('a')
    expect(t.rate).toBe(0.1) // 3 players
    expect(t.perOther).toBe(100) // floor(200/2)
    expect(t.totalPaid).toBe(200)
    const byId = new Map(t.deltas.map((d) => [d.id, d.delta]))
    expect(byId.get('a')).toBe(-200)
    expect(byId.get('b')).toBe(100)
    expect(byId.get('c')).toBe(100)
    expect(t.deltas.reduce((s, d) => s + d.delta, 0)).toBe(0)
  })

  it('picks the richest player who owns property, skipping non-owners', () => {
    const t = computeRoundTax(rule, [
      player('a', 3000, false), // richest but owns nothing
      player('b', 2000, true),
      player('c', 1000, true),
    ])!
    expect(t.leaderId).toBe('b')
  })

  it('uses 15% for five players and still balances', () => {
    const t = computeRoundTax(rule, [
      player('a', 1000),
      player('b', 1),
      player('c', 1),
      player('d', 1),
      player('e', 1),
    ])!
    expect(t.rate).toBe(0.15)
    expect(t.perOther).toBe(37) // floor(floor(150)/4)
    expect(t.totalPaid).toBe(148)
    expect(t.deltas.reduce((s, d) => s + d.delta, 0)).toBe(0)
  })

  it('returns null when nobody owns property', () => {
    expect(computeRoundTax(rule, [player('a', 2000, false), player('b', 1000, false)])).toBeNull()
  })

  it('returns null with fewer than two players', () => {
    expect(computeRoundTax(rule, [player('a', 2000)])).toBeNull()
  })

  it('returns null when the share rounds down to zero', () => {
    // 10% of 5 = 0.5 -> floor 0
    expect(computeRoundTax(rule, [player('a', 5), player('b', 5)])).toBeNull()
  })
})
