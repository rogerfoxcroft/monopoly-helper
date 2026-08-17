import type { RosterEntry } from '../../net/protocol'
import type { Board } from '../../domain/types'
import { formatMoney } from '../../util/money'

interface LeaderboardProps {
  roster: RosterEntry[]
  board: Board
  meId: string
}

/**
 * Live standings, one column per player. Scrolls horizontally on a phone and
 * spreads to fill the width on a larger (host) screen.
 */
export function Leaderboard({ roster, board, meId }: LeaderboardProps) {
  const sorted = [...roster].sort((a, b) => b.worth.total - a.worth.total)
  const leaderTotal = sorted.length ? sorted[0].worth.total : 0

  return (
    <div className="w-full overflow-x-auto px-5 pb-1">
      <div className="mx-auto flex w-max min-w-full max-w-3xl justify-center gap-2.5">
        {sorted.map((p, i) => {
          const isLeader = p.worth.total === leaderTotal && leaderTotal > 0
          const isMe = p.id === meId
          return (
            <div
              key={p.id}
              className={
                'flex min-w-[7.5rem] flex-1 flex-col rounded-2xl p-3 ring-1 ' +
                (isMe ? 'bg-surface ring-accent' : 'bg-surface ring-line')
              }
            >
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{p.name}</span>
                {isLeader && <span title="Leader">👑</span>}
              </div>
              <div className="mt-2 text-lg font-bold text-ink tabular-nums">
                {formatMoney(p.worth.total, board)}
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-faint">
                <span>#{i + 1}</span>
                {!p.connected && <span className="text-warn">offline</span>}
                {p.isHost && <span>· host</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
