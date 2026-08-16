import { useEffect, useState } from 'react'
import { holdingValue } from '../domain/networth'
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
  const book = def && holding ? holdingValue(def, holding) : 0
  const [digits, setDigits] = useState(String(book))

  // Re-seed with book value whenever the sheet (re)opens for a property.
  useEffect(() => {
    if (open) setDigits(String(book))
  }, [open, book])

  if (!def || !holding) return <Sheet open={open} onClose={onClose} title="" children={null} />

  const amount = digits === '' ? 0 : parseInt(digits, 10)
  const diff = amount - book

  function press(key: string) {
    haptic(5)
    if (key === '⌫') setDigits((d) => d.slice(0, -1))
    else setDigits((d) => (d + key).replace(/^0+(?=\d)/, '').slice(0, 7))
  }

  return (
    <Sheet open={open} onClose={onClose} title={`Sell ${def.name}`}>
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="text-muted">Book value</span>
        <button
          onClick={() => setDigits(String(book))}
          className="font-semibold text-accent tabular-nums"
        >
          {formatMoney(book, board)} · reset
        </button>
      </div>

      <div className="rounded-2xl bg-page px-4 py-5 text-center">
        <span className="text-xs text-muted">Sale price</span>
        <div className="mt-1 text-4xl font-bold text-ink tabular-nums">{formatMoney(amount, board)}</div>
        <div className="mt-1 text-sm font-medium tabular-nums">
          {diff === 0 ? (
            <span className="text-faint">At book value</span>
          ) : diff > 0 ? (
            <span className="text-pos">Profit {formatMoney(diff, board)}</span>
          ) : (
            <span className="text-neg">Loss {formatMoney(-diff, board)}</span>
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
