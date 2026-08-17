import type { WealthTaxRule } from './types'

export interface WealthTaxResult {
  players: number
  /** Fraction applied, e.g. 0.1. Null-safe callers check `applicable`. */
  rate: number
  /** Total tax the leader pays (rounded to nearest £1). */
  total: number
  /** Amount each other player receives (rounded to nearest £1). */
  perOther: number
}

/** The tax rate for a given player count, or null if outside every band. */
export function wealthTaxRate(rule: WealthTaxRule, players: number): number | null {
  const band = rule.bands.find((b) => players >= b.minPlayers && players <= b.maxPlayers)
  return band ? band.rate : null
}

/** The player-count range the rule covers, e.g. { min: 2, max: 6 }. */
export function wealthTaxRange(rule: WealthTaxRule): { min: number; max: number } {
  return {
    min: Math.min(...rule.bands.map((b) => b.minPlayers)),
    max: Math.max(...rule.bands.map((b) => b.maxPlayers)),
  }
}

/**
 * Wealth tax the leader owes on `netWorth` for `players` players, and the share
 * each of the others receives. Amounts are rounded DOWN to the nearest £1.
 * Returns null when the player count is outside the rule's bands.
 */
export function computeWealthTax(
  rule: WealthTaxRule,
  players: number,
  netWorth: number,
): WealthTaxResult | null {
  const rate = wealthTaxRate(rule, players)
  if (rate == null) return null
  const total = Math.floor(netWorth * rate)
  const perOther = players > 1 ? Math.floor(total / (players - 1)) : 0
  return { players, rate, total, perOther }
}

/** Minimal shape of a player needed to compute a round's wealth tax. */
export interface TaxPlayer {
  id: string
  name: string
  worth: { total: number; ownsProperty: boolean }
}

export interface RoundTax {
  leaderId: string
  leaderName: string
  rate: number
  players: number
  /** Amount each non-leader receives. */
  perOther: number
  /** Amount the leader pays (= perOther × (players − 1), so it balances exactly). */
  totalPaid: number
  /** Signed cash change per player id (leader negative, others positive). */
  deltas: { id: string; delta: number }[]
}

/**
 * Compute a round's wealth tax across the whole table. The leader is the player
 * with the highest net worth who owns at least one property; they pay a share
 * to every other player. Amounts round down; the leader pays exactly the sum of
 * the shares so no money leaves the game. Returns null when no tax is due.
 */
export function computeRoundTax(rule: WealthTaxRule, players: TaxPlayer[]): RoundTax | null {
  const n = players.length
  if (n < 2) return null
  const rate = wealthTaxRate(rule, n)
  if (rate == null) return null

  const eligible = players.filter((p) => p.worth.ownsProperty)
  if (eligible.length === 0) return null
  const leader = eligible.reduce((best, p) => (p.worth.total > best.worth.total ? p : best))
  if (leader.worth.total <= 0) return null

  const nominal = Math.floor(leader.worth.total * rate)
  const perOther = Math.floor(nominal / (n - 1))
  if (perOther <= 0) return null
  const totalPaid = perOther * (n - 1)

  const deltas = players.map((p) => ({
    id: p.id,
    delta: p.id === leader.id ? -totalPaid : perOther,
  }))

  return { leaderId: leader.id, leaderName: leader.name, rate, players: n, perOther, totalPaid, deltas }
}
