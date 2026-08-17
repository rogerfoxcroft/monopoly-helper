export type HomeMode = 'single' | 'host' | 'join'

interface HomeScreenProps {
  onSelect: (mode: HomeMode) => void
}

interface Mode {
  id: HomeMode
  title: string
  description: string
  icon: React.ReactNode
}

const MODES: Mode[] = [
  {
    id: 'single',
    title: 'Single player',
    description: 'Track your own net worth, turn by turn.',
    icon: (
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 20a7 7 0 0 1 14 0" strokeLinecap="round" />
    ),
  },
  {
    id: 'host',
    title: 'Host a game',
    description: 'Start a multiplayer game others join on your Wi-Fi or hotspot.',
    icon: (
      <>
        <circle cx="12" cy="18" r="1.6" fill="currentColor" stroke="none" />
        <path d="M8.5 14.5a5 5 0 0 1 7 0M5.5 11.5a9 9 0 0 1 13 0" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: 'join',
    title: 'Join a game',
    description: "Scan the host's code to join their game.",
    icon: (
      <>
        <path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" strokeLinecap="round" />
        <path d="M4 12h16" strokeLinecap="round" />
      </>
    ),
  },
]

export function HomeScreen({ onSelect }: HomeScreenProps) {
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col px-5 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-ink">Monopoly Helper</h1>
        <p className="mt-2 text-sm text-muted">Keep tabs on your worth, turn by turn.</p>
      </header>

      <div className="flex flex-col gap-4">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onSelect(mode.id)}
            className="flex items-center gap-4 rounded-2xl bg-surface p-5 text-left shadow-lg ring-1 ring-line transition active:scale-[0.99]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface2 text-accent">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mode.icon}
              </svg>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-ink">{mode.title}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted">{mode.description}</span>
            </span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-faint">
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>

      <p className="mt-auto pt-10 text-center text-xs text-faint">
        Your game saves automatically on this device.
      </p>
    </main>
  )
}
