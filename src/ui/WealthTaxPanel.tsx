import { useState } from 'react'
import { computeWorth } from '../domain/networth'
import { computeWealthTax, wealthTaxRange } from '../domain/wealthtax'
import type { Board, GameState, Variant } from '../domain/types'
import { formatMoney } from '../util/money'
import { haptic } from '../util/haptics'
import { RulesSheet } from './RulesSheet'

interface WealthTaxPanelProps {
  board: Board
  state: GameState
  variant: Variant
}

const PLAYERS_KEY = 'monopoly-helper:wt-players'

function loadPlayers(fallback: number): number {
  try {
    const v = parseInt(localStorage.getItem(PLAYERS_KEY) ?? '', 10)
    if (Number.isFinite(v)) return v
  } catch {
    // ignore
  }
  return fallback
}

export function WealthTaxPanel({ board, state, variant }: WealthTaxPanelProps) {
  const rule = variant.wealthTax!
  const { min, max } = wealthTaxRange(rule)
  const [players, setPlayers] = useState(() => Math.min(max, Math.max(min, loadPlayers(4))))
  const [rulesOpen, setRulesOpen] = useState(false)
  const hasRules = !!variant.rulesSummary || !!variant.rulesPdf

  const change = (delta: number) => {
    const next = Math.min(max, Math.max(min, players + delta))
    if (next === players) return
    haptic(8)
    setPlayers(next)
    try {
      localStorage.setItem(PLAYERS_KEY, String(next))
    } catch {
      // ignore
    }
  }

  const netWorth = computeWorth(board, state).total
  const tax = computeWealthTax(rule, players, netWorth)

  return (
    <section className="mx-auto max-w-md px-5 pb-1">
      <div className="rounded-2xl bg-surface p-5 ring-1 ring-line">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Wealth tax</h2>
          {hasRules && (
            <button
              onClick={() => setRulesOpen(true)}
              className="-mr-1 rounded-full p-1 text-muted active:bg-surface2"
              aria-label="Well Regulated Monopoly rules"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5" strokeLinecap="round" />
                <circle cx="12" cy="7.75" r="0.6" fill="currentColor" stroke="none" />
              </svg>
            </button>
          )}
        </div>

        {/* Player-count tumbler */}
        <div className="mt-3 flex items-center gap-3">
          <span className="text-sm text-muted">Players</span>
          <div className="flex flex-1 items-center justify-between rounded-xl bg-page p-1.5">
            <TumblerBtn label="−" disabled={players <= min} onClick={() => change(-1)} />
            <span className="text-center">
              <span className="block text-2xl font-bold text-ink tabular-nums leading-none">{players}</span>
            </span>
            <TumblerBtn label="+" disabled={players >= max} onClick={() => change(1)} />
          </div>
        </div>

        {/* Result */}
        {tax && (
          <div className="mt-4 rounded-xl bg-page px-4 py-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted">You'd pay ({Math.round(tax.rate * 100)}%)</span>
              <span className="text-2xl font-bold text-warn tabular-nums">{formatMoney(tax.total, board)}</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xs text-faint">Each other player receives</span>
              <span className="text-sm font-semibold text-ink tabular-nums">
                {formatMoney(tax.perOther, board)}
              </span>
            </div>
          </div>
        )}
        <p className="mt-2 text-xs text-faint">
          Payable at the end of the round if you hold the highest net worth.
        </p>
      </div>

      <RulesSheet open={rulesOpen} variant={variant} onClose={() => setRulesOpen(false)} />
    </section>
  )
}

function TumblerBtn({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="h-10 w-14 rounded-lg bg-surface2 text-2xl font-bold text-ink active:bg-surface3 disabled:opacity-30"
      aria-label={label === '+' ? 'More players' : 'Fewer players'}
    >
      {label}
    </button>
  )
}
