import { useState } from 'react'
import { boards } from '../boards'
import { variants, STANDARD_VARIANT } from '../variants'
import { formatMoney } from '../util/money'
import { BackBar } from './BackBar'
import { GROUP_META } from './colors'
import type { Board, Variant } from '../domain/types'

interface StartScreenProps {
  onStart: (board: Board, variant: Variant) => void
  onBack: () => void
}

/** A little colour strip previewing a board's property groups. */
function ColourStrip({ board }: { board: Board }) {
  const groups = Array.from(new Set(board.properties.map((p) => p.group)))
  return (
    <div className="mt-3 flex h-2 overflow-hidden rounded-full">
      {groups.map((g) => (
        <div key={g} className="flex-1" style={{ backgroundColor: GROUP_META[g].swatch }} />
      ))}
    </div>
  )
}

export function StartScreen({ onStart, onBack }: StartScreenProps) {
  const [variant, setVariant] = useState<Variant>(STANDARD_VARIANT)

  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col px-5 py-6">
      <BackBar title="Single player" onBack={onBack} />
      <p className="mt-2 mb-6 text-sm text-muted">Pick your rules and edition to begin.</p>

      {/* Variant / rules selector */}
      <div className="mb-6">
        <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">Rules</p>
        <div className="flex flex-col gap-2">
          {variants.map((v) => {
            const active = v.id === variant.id
            return (
              <button
                key={v.id}
                onClick={() => setVariant(v)}
                className={
                  'rounded-xl p-3.5 text-left ring-1 transition ' +
                  (active ? 'bg-surface2 ring-accent' : 'bg-surface ring-line')
                }
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-ink">{v.name}</span>
                  <span
                    className={
                      'h-4 w-4 shrink-0 rounded-full ring-2 ' +
                      (active ? 'bg-accent ring-accent' : 'ring-line')
                    }
                  />
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-muted">{v.description}</p>
              </button>
            )
          })}
        </div>
      </div>

      <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">Edition</p>
      <div className="flex flex-col gap-4">
        {boards.map((board) => {
          const startCash = variant.startingCash ?? board.startingCash
          return (
            <button
              key={board.id}
              onClick={() => onStart(board, variant)}
              className="rounded-2xl bg-surface p-5 text-left shadow-lg ring-1 ring-line transition active:scale-[0.99]"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-lg font-semibold text-ink">{board.name}</span>
                <span className="shrink-0 text-sm text-muted">Start {formatMoney(startCash, board)}</span>
              </div>
              <p className="mt-1 text-xs text-faint">
                {board.properties.length} spaces · {board.currency}
              </p>
              <ColourStrip board={board} />
            </button>
          )
        })}
      </div>

      <p className="mt-auto pt-10 text-center text-xs text-faint">
        Your game saves automatically on this device.
      </p>
    </main>
  )
}
