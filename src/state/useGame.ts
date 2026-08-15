import { useCallback, useEffect, useRef, useState } from 'react'
import { getBoard } from '../boards'
import { apply, newGame, ReducerError, undo as undoSession, type Action } from '../domain/reducer'
import type { Board, GameSession } from '../domain/types'
import { clearSession, loadSession, saveSession } from './storage'

export interface UseGame {
  /** Current session, or null when no game is in progress (show the picker). */
  session: GameSession | null
  /** The board for the current session, if any. */
  board: Board | undefined
  /** Last error message from an invalid action, or null. */
  error: string | null
  start: (board: Board) => void
  dispatch: (action: Action) => void
  undo: () => void
  /** Reset to the starting point, keeping the same edition. */
  reset: () => void
  /** Abandon the game and return to the edition picker. */
  quit: () => void
  clearError: () => void
}

export function useGame(): UseGame {
  const [session, setSession] = useState<GameSession | null>(() => loadSession())
  const [error, setError] = useState<string | null>(null)
  const board = session ? getBoard(session.present.boardId) : undefined

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

  const start = useCallback((b: Board) => {
    setError(null)
    setSession(newGame(b))
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
          return next
        } catch (e) {
          setError(e instanceof ReducerError ? e.message : 'Something went wrong')
          return s
        }
      })
    },
    [],
  )

  const undo = useCallback(() => {
    setError(null)
    setSession((s) => (s ? undoSession(s) : s))
  }, [])

  const reset = useCallback(() => {
    setError(null)
    setSession((s) => {
      const b = s && getBoard(s.present.boardId)
      return b ? newGame(b) : s
    })
  }, [])

  const quit = useCallback(() => {
    setError(null)
    setSession(null)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return { session, board, error, start, dispatch, undo, reset, quit, clearError }
}
