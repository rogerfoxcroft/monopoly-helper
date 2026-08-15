import { useEffect, useState } from 'react'
import type { GameSession } from '../domain/types'
import type { UseGame } from '../state/useGame'
import { useTheme, type ThemePref } from '../state/theme'
import { canUndo as canUndoSession } from '../domain/reducer'
import { CashPanel } from './CashPanel'
import { ConfirmDialog } from './ConfirmDialog'
import { HistorySheet } from './HistorySheet'
import { NetWorthHeader } from './NetWorthHeader'
import { PropertyList } from './PropertyList'
import { Sheet } from './Sheet'

type Dialog = null | 'menu' | 'history' | 'reset' | 'quit'

export function GameScreen({ game }: { game: UseGame }) {
  const { board, error, dispatch, undo, reset, quit, clearError } = game
  const session = game.session as GameSession
  const [dialog, setDialog] = useState<Dialog>(null)
  const [theme, setTheme] = useTheme()
  const canUndo = canUndoSession(session)

  // Auto-dismiss error toasts.
  useEffect(() => {
    if (!error) return
    const t = setTimeout(clearError, 2600)
    return () => clearTimeout(t)
  }, [error, clearError])

  if (!board) return null

  return (
    <div className="min-h-full pb-10">
      <NetWorthHeader
        board={board}
        state={session.present}
        canUndo={canUndo}
        onUndo={undo}
        onMenu={() => setDialog('menu')}
      />

      <CashPanel board={board} state={session.present} dispatch={dispatch} />
      <PropertyList board={board} holdings={session.present.holdings} dispatch={dispatch} />

      {/* Error toast */}
      {error && (
        <div className="fixed inset-x-0 bottom-6 z-30 flex justify-center px-5">
          <div className="pb-safe rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
            {error}
          </div>
        </div>
      )}

      {/* Menu */}
      <Sheet open={dialog === 'menu'} onClose={() => setDialog(null)} title={board.name}>
        <div className="mb-4">
          <p className="mb-1.5 text-xs font-medium tracking-wide text-muted uppercase">Theme</p>
          <ThemeToggle value={theme} onChange={setTheme} />
        </div>
        <div className="flex flex-col gap-2">
          <MenuItem label="Activity log" onClick={() => setDialog('history')} />
          <MenuItem label="Reset game" onClick={() => setDialog('reset')} />
          <MenuItem label="Change edition" onClick={() => setDialog('quit')} />
        </div>
      </Sheet>

      <HistorySheet
        open={dialog === 'history'}
        session={session}
        canUndo={canUndo}
        onUndo={undo}
        onClose={() => setDialog(null)}
      />

      <ConfirmDialog
        open={dialog === 'reset'}
        title="Reset game?"
        message="This clears all cash, properties and history, returning to the starting balance for this edition. This can't be undone."
        confirmLabel="Reset"
        danger
        onConfirm={() => {
          reset()
          setDialog(null)
        }}
        onCancel={() => setDialog(null)}
      />

      <ConfirmDialog
        open={dialog === 'quit'}
        title="Change edition?"
        message="This ends the current game and returns to the edition picker. Your current game will be lost."
        confirmLabel="Change edition"
        danger
        onConfirm={() => {
          quit()
          setDialog(null)
        }}
        onCancel={() => setDialog(null)}
      />
    </div>
  )
}

const THEME_OPTIONS: { value: ThemePref; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

function ThemeToggle({ value, onChange }: { value: ThemePref; onChange: (v: ThemePref) => void }) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-xl bg-page p-1">
      {THEME_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={
            'rounded-lg py-2 text-sm font-semibold transition ' +
            (value === opt.value ? 'bg-surface2 text-ink shadow-sm' : 'text-muted')
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function MenuItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl bg-surface2 px-4 py-3.5 text-left font-medium text-ink active:bg-surface3"
    >
      {label}
    </button>
  )
}
