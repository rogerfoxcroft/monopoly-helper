import { describe, expect, it } from 'vitest'
import { boards, getBoard } from './index'
import { altonTowers } from './alton-towers'

// Structural invariants every registered edition must satisfy.
describe.each(boards.map((b) => [b.name, b] as const))('board: %s', (_name, board) => {
  it('is resolvable by id from the registry', () => {
    expect(getBoard(board.id)).toBe(board)
  })

  it('has 28 ownable spaces (22 streets, 4 stations, 2 utilities)', () => {
    expect(board.properties).toHaveLength(28)
    expect(board.properties.filter((p) => p.group === 'station')).toHaveLength(4)
    expect(board.properties.filter((p) => p.group === 'utility')).toHaveLength(2)
  })

  it('has unique property ids', () => {
    const ids = board.properties.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives streets a house cost and stations/utilities none', () => {
    for (const p of board.properties) {
      const buildable = p.group !== 'station' && p.group !== 'utility'
      expect(p.houseCost > 0).toBe(buildable)
    }
  })
})

// Spot-checks against the supplied Wicker Man (2018) source data.
describe('Alton Towers (Wicker Man) values', () => {
  const byId = new Map(altonTowers.properties.map((p) => [p.id, p]))

  it('matches source prices at the extremes', () => {
    expect(byId.get('runaway-mine-train')?.price).toBe(60)
    expect(byId.get('wicker-man')?.price).toBe(400)
    expect(byId.get('wicker-man')?.houseCost).toBe(200)
  })

  it('prices destinations at £200', () => {
    for (const p of altonTowers.properties.filter((x) => x.group === 'station')) {
      expect(p.price).toBe(200)
    }
  })
})
