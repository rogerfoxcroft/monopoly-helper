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
