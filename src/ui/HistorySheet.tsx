import type { GameSession } from '../domain/types'
import { Sheet } from './Sheet'

interface HistorySheetProps {
  open: boolean
  session: GameSession
  canUndo: boolean
  onUndo: () => void
  onClose: () => void
}

export function HistorySheet({ open, session, canUndo, onUndo, onClose }: HistorySheetProps) {
  const entries = [...session.log].reverse()

  return (
    <Sheet open={open} onClose={onClose} title="Activity">
      {entries.length === 0 ? (
        <p className="py-6 text-center text-sm text-faint">No moves yet.</p>
      ) : (
        <>
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="mb-4 w-full rounded-xl bg-surface2 py-3 font-semibold text-ink active:bg-surface3 disabled:opacity-40"
          >
            Undo last move
          </button>
          <ul className="flex flex-col">
            {entries.map((e, i) => (
              <li
                key={e.id}
                className={
                  'flex items-center gap-3 py-2.5 text-sm ' +
                  (i > 0 ? 'border-t border-line ' : '') +
                  (i === 0 ? 'text-ink' : 'text-muted')
                }
              >
                <span className="w-6 shrink-0 text-right text-xs text-faint tabular-nums">{e.id}</span>
                <span className="flex-1">{e.label}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Sheet>
  )
}
