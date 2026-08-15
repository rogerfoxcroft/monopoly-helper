import type { Board } from '../domain/types'

/** Format an amount in the board's currency, no minor units (whole pounds). */
export function formatMoney(amount: number, board: Board): string {
  return new Intl.NumberFormat(board.locale, {
    style: 'currency',
    currency: board.currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Format a signed delta, e.g. "+£200" / "-£50". */
export function formatDelta(amount: number, board: Board): string {
  const sign = amount >= 0 ? '+' : '-'
  return sign + formatMoney(Math.abs(amount), board)
}
