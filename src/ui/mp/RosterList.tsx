import type { RosterEntry } from '../../net/protocol'

export function RosterList({ roster, meId }: { roster: RosterEntry[]; meId?: string }) {
  if (roster.length === 0) {
    return <p className="py-6 text-center text-sm text-faint">No players yet.</p>
  }
  return (
    <ul className="flex flex-col gap-2">
      {roster.map((p) => (
        <li key={p.id} className="flex items-center gap-3 rounded-xl bg-surface2 px-4 py-3">
          <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="min-w-0 flex-1 truncate font-medium text-ink">{p.name}</span>
          {p.isHost && <Tag>Host</Tag>}
          {p.id === meId && <Tag>You</Tag>}
          <span
            className={'text-[10px] ' + (p.connected ? 'text-pos' : 'text-faint')}
            title={p.connected ? 'Connected' : 'Disconnected'}
          >
            ●
          </span>
        </li>
      ))}
    </ul>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="shrink-0 rounded-full bg-surface3 px-2 py-0.5 text-[10px] font-semibold text-muted">
      {children}
    </span>
  )
}
