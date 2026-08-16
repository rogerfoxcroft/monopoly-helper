import { useEffect, useState } from 'react'
import { defaultSaleValue, holdingValue } from '../domain/networth'
import type { Board, Holding, PropertyDef } from '../domain/types'
import { formatMoney } from '../util/money'
import { haptic } from '../util/haptics'
import { Sheet } from './Sheet'

interface SellSheetProps {
  open: boolean
  board: Board
  def: PropertyDef | null
  holding: Holding | null
  onConfirm: (amount: number) => void
  onClose: () => void
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', '⌫']

export function SellSheet({ open, board, def, holding, onConfirm, onClose }: SellSheetProps) {
  const full = def && holding ? holdingValue(def, holding) : 0
  const half = def && holding ? defaultSaleValue(def, holding) : 0
  const [digits, setDigits] = useState(String(half))

  // Re-seed with the default (bank) sale value whenever the sheet reopens.
  useEffect(() => {
    if (open) setDigits(String(half))
  }, [open, half])

  if (!def || !holding) return <Sheet open={open} onClose={onClose} title="" children={null} />

  const amount = digits === '' ? 0 : parseInt(digits, 10)
  const diff = amount - full

  function press(key: string) {
    haptic(5)
    if (key === '⌫') setDigits((d) => d.slice(0, -1))
    else setDigits((d) => (d + key).replace(/^0+(?=\d)/, '').slice(0, 7))
  }

  return (
    <Sheet open={open} onClose={onClose} title={`Sell ${def.name}`}>
      {/* Quick amounts: bank rate (half) vs a full-value trade */}
      <div className="mb-3 grid grid-cols-2 gap-2">
        <QuickChip
          label="Sell to bank"
          value={formatMoney(half, board)}
          active={amount === half}
          onClick={() => setDigits(String(half))}
        />
        <QuickChip
          label="Full value"
          value={formatMoney(full, board)}
          active={amount === full}
          onClick={() => setDigits(String(full))}
        />
      </div>

      <div className="rounded-2xl bg-page px-4 py-5 text-center">
        <span className="text-xs text-muted">Sale price</span>
        <div className="mt-1 text-4xl font-bold text-ink tabular-nums">{formatMoney(amount, board)}</div>
        <div className="mt-1 text-sm font-medium tabular-nums">
          {diff === 0 ? (
            <span className="text-faint">No change to net worth</span>
          ) : diff > 0 ? (
            <span className="text-pos">Net worth +{formatMoney(diff, board)}</span>
          ) : (
            <span className="text-neg">Net worth −{formatMoney(-diff, board)}</span>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {KEYS.map((k) => (
          <button
            key={k}
            onClick={() => press(k)}
            className="rounded-xl bg-surface2 py-4 text-xl font-semibold text-ink active:bg-surface3"
          >
            {k}
          </button>
        ))}
      </div>

      <button
        onClick={() => onConfirm(amount)}
        className="mt-4 w-full rounded-xl bg-red-600 py-3.5 font-semibold text-white active:bg-red-500"
      >
        Sell for {formatMoney(amount, board)}
      </button>
    </Sheet>
  )
}

function QuickChip({
  label,
  value,
  active,
  onClick,
}: {
  label: string
  value: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={
        'rounded-xl px-3 py-2.5 text-left ring-1 transition ' +
        (active ? 'bg-surface2 ring-accent' : 'bg-surface2 ring-line')
      }
    >
      <span className="block text-xs text-muted">{label}</span>
      <span className="block text-base font-bold text-ink tabular-nums">{value}</span>
    </button>
  )
}
