import type { PlayerWorth } from './protocol'

/** Distinct avatar colours for up to six players. */
export const PLAYER_COLORS = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#a855f7', // purple
  '#ec4899', // pink
]

export function playerColor(index: number): string {
  return PLAYER_COLORS[((index % PLAYER_COLORS.length) + PLAYER_COLORS.length) % PLAYER_COLORS.length]
}

/** A unique-enough player id. */
export function genId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'p-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

/** A short human-readable room code (uppercase letters). */
export function shortCode(len = 4): string {
  let s = ''
  for (let i = 0; i < len; i++) s += String.fromCharCode(65 + Math.floor(Math.random() * 26))
  return s
}

export const ZERO_WORTH: PlayerWorth = {
  cash: 0,
  property: 0,
  buildings: 0,
  total: 0,
  ownsProperty: false,
}
