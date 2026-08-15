import type { Board } from '../domain/types'
import { standardUk } from './standard-uk'

/**
 * Registry of playable editions. Add a board here once its `properties` are
 * complete (see `alton-towers.ts` for a placeholder awaiting data).
 */
export const boards: Board[] = [standardUk]

export const DEFAULT_BOARD_ID = standardUk.id

export function getBoard(id: string): Board | undefined {
  return boards.find((b) => b.id === id)
}

/** Look up a property definition within a board. */
export function getProperty(board: Board, propertyId: string) {
  return board.properties.find((p) => p.id === propertyId)
}
