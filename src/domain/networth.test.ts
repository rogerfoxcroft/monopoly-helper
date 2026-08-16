import { describe, expect, it } from 'vitest'
import { standardUk } from '../boards/standard-uk'
import { computeWorth, mortgageValue, netWorth } from './networth'
import type { GameState } from './types'

const board = standardUk

function state(partial: Partial<GameState>): GameState {
  return { boardId: board.id, variantId: 'standard', cash: 0, holdings: [], ...partial }
}

describe('computeWorth', () => {
  it('is just cash when nothing is owned', () => {
    expect(computeWorth(board, state({ cash: 1500 }))).toEqual({
      cash: 1500,
      property: 0,
      buildings: 0,
      total: 1500,
    })
  })

  it('counts unmortgaged property at full price', () => {
    const s = state({ cash: 1000, holdings: [{ propertyId: 'mayfair', mortgaged: false, buildLevel: 0 }] })
    const w = computeWorth(board, s)
    expect(w.property).toBe(400)
    expect(w.total).toBe(1400)
  })

  it('counts mortgaged property at half price', () => {
    const s = state({ cash: 1000, holdings: [{ propertyId: 'mayfair', mortgaged: true, buildLevel: 0 }] })
    expect(computeWorth(board, s).property).toBe(200)
  })

  it('values buildings at buildLevel × house cost (hotel = 5 steps)', () => {
    // Old Kent Road: houseCost £50, hotel (level 5) → £250 of buildings
    const s = state({ holdings: [{ propertyId: 'old-kent-road', mortgaged: false, buildLevel: 5 }] })
    const w = computeWorth(board, s)
    expect(w.buildings).toBe(250)
    expect(w.property).toBe(60)
    expect(w.total).toBe(310)
  })

  it('ignores holdings for unknown properties defensively', () => {
    const s = state({ cash: 500, holdings: [{ propertyId: 'nonexistent', mortgaged: false, buildLevel: 0 }] })
    expect(netWorth(board, s)).toBe(500)
  })
})

describe('mortgageValue', () => {
  it('is half the purchase price for every property', () => {
    for (const def of board.properties) {
      expect(mortgageValue(def)).toBe(def.price / 2)
    }
  })
})
