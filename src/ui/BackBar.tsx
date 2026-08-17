interface BackBarProps {
  title: string
  onBack: () => void
}

/** A simple top bar with a back chevron and a title. */
export function BackBar({ title, onBack }: BackBarProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onBack}
        className="-ml-2 rounded-full p-2 text-ink active:bg-surface2"
        aria-label="Back"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <h1 className="text-lg font-semibold text-ink">{title}</h1>
    </div>
  )
}
