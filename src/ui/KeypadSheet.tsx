import { useState } from 'react'
import type { Board } from '../domain/types'
import { formatMoney } from '../util/money'
import { haptic } from '../util/haptics'
import { Sheet } from './Sheet'

interface KeypadSheetProps {
  open: boolean
  board: Board
  onClose: () => void
  /** Called with a signed amount: positive to add, negative to take. */
  onSubmit: (signedAmount: number) => void
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', '⌫']

export function KeypadSheet({ open, board, onClose, onSubmit }: KeypadSheetProps) {
  const [digits, setDigits] = useState('')
  const amount = digits === '' ? 0 : parseInt(digits, 10)

  function press(key: string) {
    haptic(5)
    if (key === '⌫') {
      setDigits((d) => d.slice(0, -1))
    } else {
      setDigits((d) => (d === '' && key === '00' ? '' : (d + key).slice(0, 7)))
    }
  }

  function submit(sign: 1 | -1) {
    if (amount <= 0) return
    onSubmit(sign * amount)
    setDigits('')
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="Enter amount">
      <div className="mb-4 rounded-2xl bg-page px-4 py-5 text-center">
        <span className="text-4xl font-bold text-ink tabular-nums">{formatMoney(amount, board)}</span>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
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

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => submit(-1)}
          disabled={amount <= 0}
          className="flex-1 rounded-xl bg-red-600 py-3.5 font-semibold text-white active:bg-red-500 disabled:opacity-40"
        >
          Take
        </button>
        <button
          onClick={() => submit(1)}
          disabled={amount <= 0}
          className="flex-1 rounded-xl bg-emerald-600 py-3.5 font-semibold text-white active:bg-emerald-500 disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </Sheet>
  )
}
