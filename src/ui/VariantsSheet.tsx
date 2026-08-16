import type { Variant } from '../domain/types'
import { variants } from '../variants'
import { Sheet } from './Sheet'

interface VariantsSheetProps {
  open: boolean
  current: Variant
  onSelect: (variant: Variant) => void
  onClose: () => void
}

export function VariantsSheet({ open, current, onSelect, onClose }: VariantsSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title="Variants">
      <div className="flex flex-col gap-2.5">
        {variants.map((v) => {
          const active = v.id === current.id
          return (
            <div
              key={v.id}
              className={
                'rounded-xl p-4 ring-1 ' +
                (active ? 'bg-surface2 ring-accent' : 'bg-surface2 ring-line')
              }
            >
              <button onClick={() => onSelect(v)} className="w-full text-left">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-ink">{v.name}</span>
                  {active && (
                    <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white">
                      IN USE
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted">{v.description}</p>
              </button>
              {v.rulesPdf && (
                <a
                  href={`${import.meta.env.BASE_URL}${v.rulesPdf}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs font-medium text-accent"
                >
                  Read the rules (PDF) ↗
                </a>
              )}
            </div>
          )
        })}
      </div>
      <p className="mt-4 text-xs text-faint">
        Switching keeps your current cash and properties. Starting cash only changes when you reset or
        start a new game.
      </p>
    </Sheet>
  )
}
