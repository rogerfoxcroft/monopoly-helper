import type { GameSession } from '../domain/types'

const KEY = 'monopoly-helper'
const VERSION = 1

interface Persisted {
  version: number
  session: GameSession
}

/** Load the saved session, or null if none/unreadable. */
export function loadSession(): GameSession | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Persisted
    if (parsed.version !== VERSION || !parsed.session?.present) return null
    return parsed.session
  } catch {
    return null
  }
}

export function saveSession(session: GameSession): void {
  try {
    const payload: Persisted = { version: VERSION, session }
    localStorage.setItem(KEY, JSON.stringify(payload))
  } catch {
    // Storage full or unavailable — nothing useful to do in a game tracker.
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
