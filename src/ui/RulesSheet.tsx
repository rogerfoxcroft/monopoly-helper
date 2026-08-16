import type { Variant } from '../domain/types'
import { Sheet } from './Sheet'

interface RulesSheetProps {
  open: boolean
  variant: Variant
  onClose: () => void
}

export function RulesSheet({ open, variant, onClose }: RulesSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title={variant.name}>
      <div className="flex flex-col gap-4">
        {variant.rulesSummary?.map((section) => (
          <div key={section.heading}>
            <h3 className="text-sm font-semibold text-ink">{section.heading}</h3>
            <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-muted">{section.body}</p>
          </div>
        ))}
      </div>

      {variant.rulesPdf && (
        <a
          href={`${import.meta.env.BASE_URL}${variant.rulesPdf}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-block rounded-xl bg-surface2 px-4 py-3 text-sm font-semibold text-accent active:bg-surface3"
        >
          View the full rules (PDF) ↗
        </a>
      )}
    </Sheet>
  )
}
