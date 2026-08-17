import { useState } from 'react'
import type { RoundTax } from '../../domain/wealthtax'
import type { Board } from '../../domain/types'
import { formatMoney } from '../../util/money'
import { ConfirmDialog } from '../ConfirmDialog'

interface WealthTaxHostPanelProps {
  board: Board
  preview: RoundTax | null
  onApply: () => void
}

/** Host-only control to apply the end-of-round wealth tax to the whole table. */
export function WealthTaxHostPanel({ board, preview, onApply }: WealthTaxHostPanelProps) {
  const [confirm, setConfirm] = useState(false)

  return (
    <section className="mx-auto max-w-md px-5 pb-1">
      <div className="rounded-2xl bg-surface p-4 ring-1 ring-line">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Wealth tax</h2>
          <span className="text-xs text-faint">Host control</span>
        </div>

        {preview ? (
          <p className="mt-1.5 text-xs leading-relaxed text-muted">
            <span className="font-semibold text-ink">{preview.leaderName}</span> leads — pays{' '}
            <span className="font-semibold text-warn">{formatMoney(preview.totalPaid, board)}</span> (
            {Math.round(preview.rate * 100)}%); each other player gets{' '}
            <span className="font-semibold text-pos">{formatMoney(preview.perOther, board)}</span>.
          </p>
        ) : (
          <p className="mt-1.5 text-xs text-faint">No tax due this round yet.</p>
        )}

        <button
          onClick={() => setConfirm(true)}
          disabled={!preview}
          className="mt-3 w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white active:bg-emerald-500 disabled:opacity-40"
        >
          End of round · apply wealth tax
        </button>
      </div>

      <ConfirmDialog
        open={confirm}
        title="Apply wealth tax?"
        message={
          preview
            ? `${preview.leaderName} pays ${formatMoney(preview.totalPaid, board)}, and each other player receives ${formatMoney(preview.perOther, board)}. Everyone's cash updates automatically.`
            : ''
        }
        confirmLabel="Apply"
        onConfirm={() => {
          onApply()
          setConfirm(false)
        }}
        onCancel={() => setConfirm(false)}
      />
    </section>
  )
}
