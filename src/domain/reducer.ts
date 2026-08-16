import { getProperty } from '../boards'
import { formatDelta, formatMoney } from '../util/money'
import { defaultSaleValue, holdingValue, mortgageValue } from './networth'
import {
  MAX_BUILD_LEVEL,
  type Board,
  type GameSession,
  type GameState,
  type Holding,
  type Variant,
} from './types'

/** How many undo snapshots to retain. */
const HISTORY_LIMIT = 50

export type Action =
  | { type: 'adjustCash'; amount: number; note?: string }
  | { type: 'buyProperty'; propertyId: string }
  | { type: 'sellProperty'; propertyId: string; amount?: number }
  | { type: 'setMortgaged'; propertyId: string; mortgaged: boolean }
  | { type: 'setBuildLevel'; propertyId: string; buildLevel: number }

/** Thrown when an action is invalid for the current state. */
export class ReducerError extends Error {}

function fail(message: string): never {
  throw new ReducerError(message)
}

// ---- session lifecycle -----------------------------------------------------

export function newGame(board: Board, variant: Variant, now: number = Date.now()): GameSession {
  const startingCash = variant.startingCash ?? board.startingCash
  return {
    present: { boardId: board.id, variantId: variant.id, cash: startingCash, holdings: [] },
    past: [],
    log: [],
    nextLogId: 1,
    startedAt: now,
  }
}

/** Reset to the starting point of the session's board and variant. */
export function reset(board: Board, variant: Variant, now: number = Date.now()): GameSession {
  return newGame(board, variant, now)
}

// ---- helpers ---------------------------------------------------------------

function findHolding(state: GameState, propertyId: string): Holding | undefined {
  return state.holdings.find((h) => h.propertyId === propertyId)
}

function requireProperty(board: Board, propertyId: string) {
  const def = getProperty(board, propertyId)
  if (!def) fail(`Unknown property: ${propertyId}`)
  return def
}

// ---- the reducer -----------------------------------------------------------

/**
 * Apply an action, returning `{ state, label }`: the next `GameState` plus a
 * human-readable log label. Throws `ReducerError` on invalid actions.
 * Pure — does not mutate its input.
 */
function reduce(board: Board, state: GameState, action: Action): { state: GameState; label: string } {
  switch (action.type) {
    case 'adjustCash': {
      if (action.amount === 0) fail('Cash adjustment cannot be zero')
      const label = action.note
        ? `${action.note} (${formatDelta(action.amount, board)})`
        : `Cash ${formatDelta(action.amount, board)}`
      return { state: { ...state, cash: state.cash + action.amount }, label }
    }

    case 'buyProperty': {
      const def = requireProperty(board, action.propertyId)
      if (findHolding(state, action.propertyId)) fail(`${def.name} is already owned`)
      const holding: Holding = { propertyId: def.id, mortgaged: false, buildLevel: 0 }
      return {
        state: { ...state, cash: state.cash - def.price, holdings: [...state.holdings, holding] },
        label: `Bought ${def.name} (${formatDelta(-def.price, board)})`,
      }
    }

    case 'sellProperty': {
      const def = requireProperty(board, action.propertyId)
      const holding = findHolding(state, action.propertyId)
      if (!holding) fail(`${def.name} is not owned`)
      if (action.amount != null && (!Number.isFinite(action.amount) || action.amount < 0)) {
        fail('Sale amount must be zero or more')
      }
      const book = holdingValue(def, holding)
      // Default to the bank rate (half value); an override models a negotiated
      // sale to a rival. Either way, the difference from the holding's full
      // value is a profit or loss to net worth.
      const proceeds = action.amount ?? defaultSaleValue(def, holding)
      const diff = proceeds - book
      const pnl =
        diff === 0
          ? ''
          : diff > 0
            ? ` · profit ${formatMoney(diff, board)}`
            : ` · loss ${formatMoney(-diff, board)}`
      return {
        state: {
          ...state,
          cash: state.cash + proceeds,
          holdings: state.holdings.filter((h) => h.propertyId !== action.propertyId),
        },
        label: `Sold ${def.name} (${formatDelta(proceeds, board)})${pnl}`,
      }
    }

    case 'setMortgaged': {
      const def = requireProperty(board, action.propertyId)
      const holding = findHolding(state, action.propertyId)
      if (!holding) fail(`${def.name} is not owned`)
      if (holding.mortgaged === action.mortgaged) {
        fail(`${def.name} is already ${action.mortgaged ? 'mortgaged' : 'unmortgaged'}`)
      }
      if (action.mortgaged && holding.buildLevel > 0) {
        fail(`Sell buildings on ${def.name} before mortgaging`)
      }
      const value = mortgageValue(def)
      const delta = action.mortgaged ? value : -value
      return {
        state: {
          ...state,
          cash: state.cash + delta,
          holdings: state.holdings.map((h) =>
            h.propertyId === action.propertyId ? { ...h, mortgaged: action.mortgaged } : h,
          ),
        },
        label: `${action.mortgaged ? 'Mortgaged' : 'Unmortgaged'} ${def.name} (${formatDelta(delta, board)})`,
      }
    }

    case 'setBuildLevel': {
      const def = requireProperty(board, action.propertyId)
      const holding = findHolding(state, action.propertyId)
      if (!holding) fail(`${def.name} is not owned`)
      if (def.houseCost <= 0) fail(`Cannot build on ${def.name}`)
      if (holding.mortgaged) fail(`Unmortgage ${def.name} before building`)
      const level = action.buildLevel
      if (!Number.isInteger(level) || level < 0 || level > MAX_BUILD_LEVEL) {
        fail(`Build level must be 0–${MAX_BUILD_LEVEL}`)
      }
      if (level === holding.buildLevel) fail(`${def.name} is already at that build level`)
      const delta = (level - holding.buildLevel) * def.houseCost // +build cost / -sale return
      const verb = level > holding.buildLevel ? 'Built on' : 'Sold buildings on'
      const suffix = level === MAX_BUILD_LEVEL ? ' → hotel' : ''
      return {
        state: {
          ...state,
          cash: state.cash - delta,
          holdings: state.holdings.map((h) =>
            h.propertyId === action.propertyId ? { ...h, buildLevel: level } : h,
          ),
        },
        label: `${verb} ${def.name}${suffix} (${formatDelta(-delta, board)})`,
      }
    }
  }
}

/**
 * Apply an action to a session, pushing history for undo and appending a log
 * entry. Returns a new session; throws `ReducerError` on invalid actions.
 */
export function apply(board: Board, session: GameSession, action: Action): GameSession {
  const { state, label } = reduce(board, session.present, action)
  const past = [...session.past, session.present].slice(-HISTORY_LIMIT)
  return {
    present: state,
    past,
    log: [...session.log, { id: session.nextLogId, label }],
    nextLogId: session.nextLogId + 1,
    startedAt: session.startedAt,
  }
}

/** Undo the most recent action. No-op if there's nothing to undo. */
export function undo(session: GameSession): GameSession {
  if (session.past.length === 0) return session
  const past = session.past.slice(0, -1)
  const present = session.past[session.past.length - 1]
  return { ...session, present, past, log: session.log.slice(0, -1) }
}

export function canUndo(session: GameSession): boolean {
  return session.past.length > 0
}

/** Describe a starting-balance line for display, e.g. "Start: £1,500". */
export function startingLabel(board: Board): string {
  return `Start ${formatMoney(board.startingCash, board)}`
}
