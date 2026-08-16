import { useCallback, useEffect, useRef, useState } from 'react'
import { getBoard } from '../boards'
import { apply, newGame, ReducerError, undo as undoSession, type Action } from '../domain/reducer'
import type { Board, GameSession, Variant } from '../domain/types'
import { getVariant } from '../variants'
import { haptic } from '../util/haptics'
import { clearSession, loadSession, saveSession } from './storage'

export interface UseGame {
  /** Current session, or null when no game is in progress (show the picker). */
  session: GameSession | null
  /** The board for the current session, if any. */
  board: Board | undefined
  /** The rules variant for the current session, if any. */
  variant: Variant | undefined
  /** Last error message from an invalid action, or null. */
  error: string | null
  start: (board: Board, variant: Variant) => void
  dispatch: (action: Action) => void
  undo: () => void
  /** Reset to the starting point, keeping the same edition and variant. */
  reset: () => void
  /** Abandon the game and return to the edition picker. */
  quit: () => void
  clearError: () => void
}

export function useGame(): UseGame {
  const [session, setSession] = useState<GameSession | null>(() => loadSession())
  const [error, setError] = useState<string | null>(null)
  const board = session ? getBoard(session.present.boardId) : undefined
  const variant = session ? getVariant(session.present.variantId) : undefined

  // Persist whenever the session changes.
  const firstRun = useRef(true)
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      if (session) return // don't rewrite what we just loaded
    }
    if (session) saveSession(session)
    else clearSession()
  }, [session])

  const start = useCallback((b: Board, v: Variant) => {
    setError(null)
    setSession(newGame(b, v))
  }, [])

  const dispatch = useCallback(
    (action: Action) => {
      setSession((s) => {
        if (!s) return s
        const b = getBoard(s.present.boardId)
        if (!b) return s
        try {
          const next = apply(b, s, action)
          setError(null)
          haptic(12)
          return next
        } catch (e) {
          setError(e instanceof ReducerError ? e.message : 'Something went wrong')
          haptic([20, 40, 20])
          return s
        }
      })
    },
    [],
  )

  const undo = useCallback(() => {
    setError(null)
    setSession((s) => {
      if (!s) return s
      const next = undoSession(s)
      if (next !== s) haptic(12)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    setError(null)
    setSession((s) => {
      const b = s && getBoard(s.present.boardId)
      return b ? newGame(b, getVariant(s.present.variantId)) : s
    })
  }, [])

  const quit = useCallback(() => {
    setError(null)
    setSession(null)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return { session, board, variant, error, start, dispatch, undo, reset, quit, clearError }
}
