import type { GameSession } from '../domain/types'
import { DEFAULT_VARIANT_ID } from '../variants'

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
    // Backfill fields added after a game may have been saved.
    if (!parsed.session.present.variantId) {
      parsed.session.present.variantId = DEFAULT_VARIANT_ID
    }
    if (typeof parsed.session.startedAt !== 'number') {
      parsed.session.startedAt = Date.now()
    }
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
