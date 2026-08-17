import { describe, expect, it } from 'vitest'
import { decodeMessage, encodeMessage, type NetMessage } from './protocol'

const worth = { cash: 1000, property: 500, buildings: 200, total: 1700, ownsProperty: true }

const samples: NetMessage[] = [
  { t: 'hello', player: { id: 'p1', name: 'Ada', color: '#ff0000' }, worth },
  { t: 'worth', worth },
  { t: 'bye' },
  { t: 'welcome', youId: 'p1', boardId: 'standard-uk', variantId: 'well-regulated' },
  {
    t: 'roster',
    players: [{ id: 'p1', name: 'Ada', color: '#f00', worth, connected: true, isHost: true }],
  },
  { t: 'tax', delta: -200, label: 'Wealth tax' },
]

describe('protocol encode/decode', () => {
  it('round-trips every message shape', () => {
    for (const m of samples) {
      expect(decodeMessage(encodeMessage(m))).toEqual(m)
    }
  })

  it('throws on malformed input', () => {
    expect(() => decodeMessage('not json')).toThrow()
    expect(() => decodeMessage('{"nope":1}')).toThrow('Malformed message')
  })
})
