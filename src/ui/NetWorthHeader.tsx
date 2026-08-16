import { useEffect, useRef, useState } from 'react'
import { computeWorth } from '../domain/networth'
import type { Board, GameState } from '../domain/types'
import { formatMoney } from '../util/money'
import { Timer } from './Timer'

interface NetWorthHeaderProps {
  board: Board
  state: GameState
  startedAt: number
  canUndo: boolean
  onUndo: () => void
  onMenu: () => void
}

const SEGMENTS = [
  { key: 'cash', label: 'Cash', color: '#34d399' },
  { key: 'property', label: 'Property', color: '#60a5fa' },
  { key: 'buildings', label: 'Houses', color: '#f59e0b' },
] as const

export function NetWorthHeader({ board, state, startedAt, canUndo, onUndo, onMenu }: NetWorthHeaderProps) {
  const worth = computeWorth(board, state)
  const positiveTotal = SEGMENTS.reduce((sum, s) => sum + Math.max(0, worth[s.key]), 0)

  // Pulse the figure when net worth changes (only cash in/out moves it).
  const prevTotal = useRef(worth.total)
  const seq = useRef(0)
  const [pulse, setPulse] = useState<{ key: number; dir: 'up' | 'down' } | null>(null)
  useEffect(() => {
    if (prevTotal.current !== worth.total) {
      const dir = worth.total > prevTotal.current ? 'up' : 'down'
      seq.current += 1
      setPulse({ key: seq.current, dir })
      prevTotal.current = worth.total
    }
  }, [worth.total])

  return (
    <header className="sticky top-0 z-20 bg-page/95 px-5 pt-4 pb-4 shadow-lg ring-1 ring-line backdrop-blur">
      <div className="mx-auto max-w-md">
        <div className="flex items-start justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted uppercase">
              Net worth
              <Timer startedAt={startedAt} />
            </p>
            <p
              key={pulse?.key ?? 'init'}
              className={
                'mt-0.5 inline-block origin-left text-4xl font-bold text-accent tabular-nums ' +
                (pulse?.dir === 'up'
                  ? 'animate-worth-up'
                  : pulse?.dir === 'down'
                    ? 'animate-worth-down'
                    : '')
              }
            >
              {formatMoney(worth.total, board)}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="rounded-full p-2.5 text-ink ring-1 ring-line active:bg-surface disabled:opacity-30"
              aria-label="Undo last action"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 14L4 9l5-5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 9h11a5 5 0 0 1 0 10h-1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={onMenu}
              className="rounded-full p-2.5 text-ink ring-1 ring-line active:bg-surface"
              aria-label="Menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.75" />
                <circle cx="12" cy="12" r="1.75" />
                <circle cx="12" cy="19" r="1.75" />
              </svg>
            </button>
          </div>
        </div>

        {/* Split bar */}
        <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-surface">
          {positiveTotal > 0 &&
            SEGMENTS.map((s) => {
              const value = Math.max(0, worth[s.key])
              if (value === 0) return null
              return (
                <div
                  key={s.key}
                  style={{ width: `${(value / positiveTotal) * 100}%`, backgroundColor: s.color }}
                />
              )
            })}
        </div>

        {/* Legend */}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {SEGMENTS.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1.5 text-muted">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
              {s.label} <span className="font-medium text-ink tabular-nums">{formatMoney(worth[s.key], board)}</span>
            </span>
          ))}
        </div>
      </div>
    </header>
  )
}
