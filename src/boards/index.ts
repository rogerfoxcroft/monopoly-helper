import type { Board } from '../domain/types'
import { altonTowers } from './alton-towers'
import { standardUk } from './standard-uk'

/** Registry of playable editions, in the order shown to the player. */
export const boards: Board[] = [standardUk, altonTowers]

export const DEFAULT_BOARD_ID = standardUk.id

export function getBoard(id: string): Board | undefined {
  return boards.find((b) => b.id === id)
}

/** Look up a property definition within a board. */
export function getProperty(board: Board, propertyId: string) {
  return board.properties.find((p) => p.id === propertyId)
}
