import { boards } from '../boards'
import { formatMoney } from '../util/money'
import { GROUP_META } from './colors'
import type { Board } from '../domain/types'

interface StartScreenProps {
  onStart: (board: Board) => void
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

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col px-5 py-10">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">Monopoly Helper</h1>
        <p className="mt-2 text-sm text-slate-400">Track your worth, turn by turn. Choose an edition to begin.</p>
      </header>

      <div className="flex flex-col gap-4">
        {boards.map((board) => (
          <button
            key={board.id}
            onClick={() => onStart(board)}
            className="rounded-2xl bg-slate-800/70 p-5 text-left shadow-lg ring-1 ring-slate-700/60 transition active:scale-[0.99] active:bg-slate-800"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-lg font-semibold text-slate-100">{board.name}</span>
              <span className="shrink-0 text-sm text-slate-400">Start {formatMoney(board.startingCash, board)}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {board.properties.length} spaces · {board.currency}
            </p>
            <ColourStrip board={board} />
          </button>
        ))}
      </div>

      <p className="mt-auto pt-10 text-center text-xs text-slate-500">
        Your game saves automatically on this device.
      </p>
    </main>
  )
}
