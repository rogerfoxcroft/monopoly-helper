import { describe, expect, it } from 'vitest'
import { standardUk } from '../boards/standard-uk'
import { STANDARD_VARIANT, WELL_REGULATED_VARIANT } from '../variants'
import { netWorth } from './networth'
import { apply, canUndo, newGame, ReducerError, reset, undo, type Action } from './reducer'
import type { GameSession } from './types'

const board = standardUk

function fresh(): GameSession {
  return newGame(board, STANDARD_VARIANT)
}

describe('newGame / reset', () => {
  it('starts with the board starting cash and no holdings', () => {
    const s = fresh()
    expect(s.present.cash).toBe(1500)
    expect(s.present.holdings).toEqual([])
    expect(netWorth(board, s.present)).toBe(1500)
  })

  it('reset returns to the starting point', () => {
    let s = fresh()
    s = apply(board, s, { type: 'adjustCash', amount: -400 })
    s = reset(board, STANDARD_VARIANT)
    expect(s.present.cash).toBe(1500)
    expect(s.log).toEqual([])
    expect(canUndo(s)).toBe(false)
  })

  it('applies the variant starting cash override', () => {
    const s = newGame(board, WELL_REGULATED_VARIANT)
    expect(s.present.cash).toBe(1000)
    expect(s.present.variantId).toBe('well-regulated')
  })
})

describe('adjustCash', () => {
  it('adds and removes cash and logs it', () => {
    let s = fresh()
    s = apply(board, s, { type: 'adjustCash', amount: 200, note: 'Pass GO' })
    expect(s.present.cash).toBe(1700)
    expect(s.log.at(-1)?.label).toContain('Pass GO')
    s = apply(board, s, { type: 'adjustCash', amount: -50 })
    expect(s.present.cash).toBe(1650)
  })

  it('rejects a zero adjustment', () => {
    expect(() => apply(board, fresh(), { type: 'adjustCash', amount: 0 })).toThrow(ReducerError)
  })
})

describe('property transactions', () => {
  it('buying deducts price and records the holding', () => {
    let s = fresh()
    s = apply(board, s, { type: 'buyProperty', propertyId: 'mayfair' })
    expect(s.present.cash).toBe(1100)
    expect(s.present.holdings).toHaveLength(1)
  })

  it('cannot buy the same property twice', () => {
    let s = apply(board, fresh(), { type: 'buyProperty', propertyId: 'mayfair' })
    expect(() => apply(board, s, { type: 'buyProperty', propertyId: 'mayfair' })).toThrow(ReducerError)
  })

  it('selling defaults to half the full value (bank rate)', () => {
    let s = fresh()
    s = apply(board, s, { type: 'buyProperty', propertyId: 'old-kent-road' }) // -60
    s = apply(board, s, { type: 'setBuildLevel', propertyId: 'old-kent-road', buildLevel: 2 }) // -100
    const before = s.present.cash
    const worthBefore = netWorth(board, s.present)
    s = apply(board, s, { type: 'sellProperty', propertyId: 'old-kent-road' }) // full 160 -> half 80
    expect(s.present.cash).toBe(before + 80)
    expect(netWorth(board, s.present)).toBe(worthBefore - 80) // lost the other half
    expect(s.present.holdings).toHaveLength(0)
  })

  it('selling with an override amount books a profit to cash and net worth', () => {
    let s = apply(board, fresh(), { type: 'buyProperty', propertyId: 'mayfair' }) // -400 → 1100
    const worthBefore = netWorth(board, s.present)
    s = apply(board, s, { type: 'sellProperty', propertyId: 'mayfair', amount: 600 }) // book 400, +200 profit
    expect(s.present.cash).toBe(1700) // 1100 + 600
    expect(netWorth(board, s.present)).toBe(worthBefore + 200)
    expect(s.log.at(-1)?.label).toContain('profit')
  })

  it('selling with an override below book books a loss', () => {
    let s = apply(board, fresh(), { type: 'buyProperty', propertyId: 'mayfair' }) // -400 → 1100
    const worthBefore = netWorth(board, s.present)
    s = apply(board, s, { type: 'sellProperty', propertyId: 'mayfair', amount: 250 }) // book 400, -150 loss
    expect(s.present.cash).toBe(1350) // 1100 + 250
    expect(netWorth(board, s.present)).toBe(worthBefore - 150)
    expect(s.log.at(-1)?.label).toContain('loss')
  })

  it('rejects a negative sale amount', () => {
    const s = apply(board, fresh(), { type: 'buyProperty', propertyId: 'mayfair' })
    expect(() => apply(board, s, { type: 'sellProperty', propertyId: 'mayfair', amount: -10 })).toThrow(
      ReducerError,
    )
  })

  it('mortgaging pays half and unmortgaging costs half', () => {
    let s = apply(board, fresh(), { type: 'buyProperty', propertyId: 'mayfair' }) // -400 → 1100
    s = apply(board, s, { type: 'setMortgaged', propertyId: 'mayfair', mortgaged: true })
    expect(s.present.cash).toBe(1300) // +200
    s = apply(board, s, { type: 'setMortgaged', propertyId: 'mayfair', mortgaged: false })
    expect(s.present.cash).toBe(1100) // -200
  })

  it('cannot mortgage a property with buildings', () => {
    let s = apply(board, fresh(), { type: 'buyProperty', propertyId: 'old-kent-road' })
    s = apply(board, s, { type: 'setBuildLevel', propertyId: 'old-kent-road', buildLevel: 1 })
    expect(() => apply(board, s, { type: 'setMortgaged', propertyId: 'old-kent-road', mortgaged: true })).toThrow(
      ReducerError,
    )
  })

  it('cannot build on a station', () => {
    let s = apply(board, fresh(), { type: 'buyProperty', propertyId: 'kings-cross' })
    expect(() => apply(board, s, { type: 'setBuildLevel', propertyId: 'kings-cross', buildLevel: 1 })).toThrow(
      ReducerError,
    )
  })

  it('rejects build levels above a hotel', () => {
    let s = apply(board, fresh(), { type: 'buyProperty', propertyId: 'old-kent-road' })
    expect(() => apply(board, s, { type: 'setBuildLevel', propertyId: 'old-kent-road', buildLevel: 6 })).toThrow(
      ReducerError,
    )
  })
})

describe('house selling returns half', () => {
  it('building costs full price but removing returns only half', () => {
    let s = apply(board, fresh(), { type: 'buyProperty', propertyId: 'mayfair' }) // -400 → 1100
    s = apply(board, s, { type: 'setBuildLevel', propertyId: 'mayfair', buildLevel: 2 }) // -2×200 → 700
    expect(s.present.cash).toBe(700)
    const worthAfterBuild = netWorth(board, s.present)
    s = apply(board, s, { type: 'setBuildLevel', propertyId: 'mayfair', buildLevel: 0 }) // sell 2 @ half(100)
    expect(s.present.cash).toBe(900) // +2×100
    expect(netWorth(board, s.present)).toBe(worthAfterBuild - 200) // lost the other half
    expect(s.log.at(-1)?.label).toContain('Sold buildings')
  })
})

describe('net-worth invariance', () => {
  // Buy, build-up, and mortgage are pure column-shifts that must not change
  // total net worth (the defining property of the face-value model). Selling
  // (property or houses) at the bank's half rate is intentionally not neutral.
  const invariantActions: Action[] = [
    { type: 'buyProperty', propertyId: 'mayfair' },
    { type: 'setBuildLevel', propertyId: 'mayfair', buildLevel: 3 },
    { type: 'setBuildLevel', propertyId: 'mayfair', buildLevel: 5 },
    { type: 'buyProperty', propertyId: 'oxford-street' },
    { type: 'setMortgaged', propertyId: 'oxford-street', mortgaged: true },
    { type: 'setMortgaged', propertyId: 'oxford-street', mortgaged: false },
    { type: 'sellProperty', propertyId: 'oxford-street', amount: 300 }, // full-value sale is neutral
  ]

  it('holds net worth constant through buy/build/mortgage/sell', () => {
    let s = fresh()
    const start = netWorth(board, s.present)
    for (const action of invariantActions) {
      s = apply(board, s, action)
      expect(netWorth(board, s.present)).toBe(start)
    }
  })
})

describe('undo', () => {
  it('reverts the last action and its log entry', () => {
    let s = fresh()
    s = apply(board, s, { type: 'adjustCash', amount: 200 })
    s = apply(board, s, { type: 'buyProperty', propertyId: 'mayfair' })
    expect(s.present.cash).toBe(1300)
    s = undo(s)
    expect(s.present.cash).toBe(1700)
    expect(s.present.holdings).toHaveLength(0)
    expect(s.log).toHaveLength(1)
  })

  it('is a no-op with nothing to undo', () => {
    const s = fresh()
    expect(undo(s)).toEqual(s)
    expect(canUndo(s)).toBe(false)
  })
})
