import { BackBar } from './BackBar'

interface ComingSoonProps {
  title: string
  blurb: string
  onBack: () => void
}

/** Temporary placeholder for multiplayer modes still under construction. */
export function ComingSoon({ title, blurb, onBack }: ComingSoonProps) {
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col px-5 py-6">
      <BackBar title={title} onBack={onBack} />
      <div className="mt-16 flex flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface2 text-accent">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4l2.5 2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h2 className="mt-5 text-lg font-semibold text-ink">Coming soon</h2>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">{blurb}</p>
      </div>
    </main>
  )
}
