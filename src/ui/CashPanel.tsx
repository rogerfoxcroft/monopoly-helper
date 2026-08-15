import { useState } from 'react'
import type { Action } from '../domain/reducer'
import type { Board, GameState } from '../domain/types'
import { formatMoney } from '../util/money'
import { KeypadSheet } from './KeypadSheet'

interface CashPanelProps {
  board: Board
  state: GameState
  dispatch: (action: Action) => void
}

const DENOMS = [1, 5, 10, 20, 50, 100, 500]

export function CashPanel({ board, state, dispatch }: CashPanelProps) {
  const [mode, setMode] = useState<'add' | 'take'>('add')
  const [keypadOpen, setKeypadOpen] = useState(false)

  const sign = mode === 'add' ? 1 : -1
  function adjust(amount: number, note?: string) {
    dispatch({ type: 'adjustCash', amount, note })
  }

  return (
    <section className="mx-auto max-w-md px-5 py-5">
      <div className="rounded-2xl bg-surface p-5 ring-1 ring-line">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted">Cash</span>
          <span
            className={
              'text-2xl font-bold tabular-nums ' + (state.cash < 0 ? 'text-red-400' : 'text-ink')
            }
          >
            {formatMoney(state.cash, board)}
          </span>
        </div>

        {/* Add / Take toggle */}
        <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-page p-1">
          {(['add', 'take'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={
                'rounded-lg py-2 text-sm font-semibold capitalize transition ' +
                (mode === m
                  ? m === 'add'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-red-600 text-white'
                  : 'text-muted')
              }
            >
              {m}
            </button>
          ))}
        </div>

        {/* Denomination chips */}
        <div className="mt-3 grid grid-cols-4 gap-2">
          {DENOMS.map((d) => (
            <button
              key={d}
              onClick={() => adjust(sign * d)}
              className="rounded-xl bg-surface2 py-3 text-sm font-semibold text-ink tabular-nums active:bg-surface3"
            >
              {sign < 0 ? '−' : '+'}
              {formatMoney(d, board)}
            </button>
          ))}
          <button
            onClick={() => setKeypadOpen(true)}
            className="rounded-xl bg-surface2 py-3 text-sm font-semibold text-ink active:bg-surface3"
          >
            123…
          </button>
        </div>

        {/* Pass GO shortcut */}
        <button
          onClick={() => adjust(200, 'Pass GO')}
          className="mt-3 w-full rounded-xl bg-emerald-500/15 py-3 text-sm font-semibold text-pos ring-1 ring-emerald-600/30 active:bg-emerald-500/25"
        >
          Pass GO · +{formatMoney(200, board)}
        </button>
      </div>

      <KeypadSheet
        open={keypadOpen}
        board={board}
        onClose={() => setKeypadOpen(false)}
        onSubmit={(amount) => adjust(amount)}
      />
    </section>
  )
}
