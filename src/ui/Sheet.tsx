import { useEffect, type ReactNode } from 'react'

interface SheetProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
}

/** A mobile bottom sheet: backdrop + rounded panel that rises from the bottom. */
export function Sheet({ open, onClose, title, children }: SheetProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <div
        className="animate-fade absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="animate-rise pb-safe relative z-10 max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-surface shadow-2xl ring-1 ring-line"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 rounded-t-3xl bg-surface/95 px-5 pt-4 pb-3 backdrop-blur">
          <div className="min-w-0 text-lg font-semibold text-ink">{title}</div>
          <button
            onClick={onClose}
            className="-mr-2 shrink-0 rounded-full p-2 text-muted hover:bg-surface2 hover:text-ink"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="px-5 pb-5">{children}</div>
      </div>
    </div>
  )
}
