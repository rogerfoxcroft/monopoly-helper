import { Sheet } from './Sheet'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Sheet open={open} onClose={onCancel} title={title}>
      <p className="text-sm leading-relaxed text-slate-300">{message}</p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 rounded-xl bg-slate-700 py-3 font-semibold text-slate-100 active:bg-slate-600"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={
            'flex-1 rounded-xl py-3 font-semibold text-white ' +
            (danger ? 'bg-red-600 active:bg-red-500' : 'bg-emerald-600 active:bg-emerald-500')
          }
        >
          {confirmLabel}
        </button>
      </div>
    </Sheet>
  )
}
