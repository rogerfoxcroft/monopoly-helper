/**
 * Core domain types for the Monopoly worth tracker.
 *
 * The app is "board-definition driven": everything edition-specific lives in a
 * `Board`, and the engine/UI stay generic so a new edition (e.g. Alton Towers)
 * is just a new data file.
 */

export type Group =
  | 'brown'
  | 'lightblue'
  | 'pink'
  | 'orange'
  | 'red'
  | 'yellow'
  | 'green'
  | 'darkblue'
  | 'station'
  | 'utility'

export interface PropertyDef {
  /** Stable kebab-case id, unique within a board. */
  id: string
  name: string
  group: Group
  /** Purchase price from the bank. */
  price: number
  /** Cost of each build step (house or hotel). 0 for stations/utilities. */
  houseCost: number
}

export interface Board {
  id: string
  name: string
  /** ISO 4217 currency code, e.g. 'GBP'. */
  currency: string
  /** BCP 47 locale for formatting, e.g. 'en-GB'. */
  locale: string
  /** Cash each player starts with. */
  startingCash: number
  properties: PropertyDef[]
}

/**
 * A property the player currently owns.
 * `buildLevel`: 0 = bare, 1-4 = that many houses, 5 = hotel.
 */
export interface Holding {
  propertyId: string
  mortgaged: boolean
  buildLevel: number
}

/** The mutable, savable state of a single game. */
export interface GameState {
  boardId: string
  cash: number
  holdings: Holding[]
}

export interface LogEntry {
  id: number
  label: string
}

/**
 * Wraps a `GameState` with the history needed for undo and an activity log.
 * This is what gets persisted to localStorage.
 */
export interface GameSession {
  present: GameState
  /** Snapshots preceding `present`, oldest first. Bounded length. */
  past: GameState[]
  log: LogEntry[]
  nextLogId: number
}

/** Max build level: 4 houses then a hotel. */
export const MAX_BUILD_LEVEL = 5
