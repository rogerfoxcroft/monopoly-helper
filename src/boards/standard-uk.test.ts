import { describe, expect, it } from 'vitest'
import { standardUk } from './standard-uk'

describe('standard UK board', () => {
  it('has 28 ownable spaces (22 streets, 4 stations, 2 utilities)', () => {
    const p = standardUk.properties
    expect(p).toHaveLength(28)
    expect(p.filter((x) => x.group === 'station')).toHaveLength(4)
    expect(p.filter((x) => x.group === 'utility')).toHaveLength(2)
  })

  it('has unique property ids', () => {
    const ids = standardUk.properties.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('prices every property above zero', () => {
    for (const p of standardUk.properties) expect(p.price).toBeGreaterThan(0)
  })

  it('gives streets a house cost and stations/utilities none', () => {
    for (const p of standardUk.properties) {
      if (p.group === 'station' || p.group === 'utility') {
        expect(p.houseCost).toBe(0)
      } else {
        expect(p.houseCost).toBeGreaterThan(0)
      }
    }
  })

  it('has the expected headline values', () => {
    const byId = new Map(standardUk.properties.map((p) => [p.id, p]))
    expect(byId.get('old-kent-road')?.price).toBe(60)
    expect(byId.get('mayfair')?.price).toBe(400)
    expect(byId.get('mayfair')?.houseCost).toBe(200)
    expect(byId.get('kings-cross')?.price).toBe(200)
  })
})
