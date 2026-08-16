import type { Board, GameState, Holding, PropertyDef } from './types'

export interface WorthBreakdown {
  cash: number
  /** Value tied up in owned land (mortgaged land counts at half). */
  property: number
  /** Value tied up in houses and hotels. */
  buildings: number
  /** cash + property + buildings. */
  total: number
}

/** Mortgage value of a property: half its purchase price. */
export function mortgageValue(def: PropertyDef): number {
  return def.price / 2
}

/**
 * A single holding's contribution to the "property" column.
 * Face-value model: unmortgaged land is worth its price; mortgaging moves
 * half that value into cash, so a mortgaged holding is worth half.
 */
export function propertyValue(def: PropertyDef, holding: Holding): number {
  return holding.mortgaged ? mortgageValue(def) : def.price
}

/** A holding's building value: buildLevel steps of the group's house cost. */
export function buildingValue(def: PropertyDef, holding: Holding): number {
  return holding.buildLevel * def.houseCost
}

/**
 * Full liquidation-neutral value a holding contributes to net worth,
 * i.e. what selling it back would return under the face-value model.
 */
export function holdingValue(def: PropertyDef, holding: Holding): number {
  return propertyValue(def, holding) + buildingValue(def, holding)
}

/**
 * Cash a sale yields by default: half the holding's full value (the bank
 * buy-back rate). Selling to another player can beat this — hence the
 * overridable amount on the sell action.
 */
export function defaultSaleValue(def: PropertyDef, holding: Holding): number {
  return Math.floor(holdingValue(def, holding) / 2)
}

function defs(board: Board): Map<string, PropertyDef> {
  return new Map(board.properties.map((p) => [p.id, p]))
}

/** Compute the net-worth breakdown for a game state on a given board. */
export function computeWorth(board: Board, state: GameState): WorthBreakdown {
  const byId = defs(board)
  let property = 0
  let buildings = 0

  for (const holding of state.holdings) {
    const def = byId.get(holding.propertyId)
    if (!def) continue // unknown property (e.g. board changed) — ignore defensively
    property += propertyValue(def, holding)
    buildings += buildingValue(def, holding)
  }

  const cash = state.cash
  return { cash, property, buildings, total: cash + property + buildings }
}

/** Convenience: just the headline net-worth figure. */
export function netWorth(board: Board, state: GameState): number {
  return computeWorth(board, state).total
}
