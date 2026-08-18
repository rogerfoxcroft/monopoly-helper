import type { Action } from '../../domain/reducer'
import { holdingValue } from '../../domain/networth'
import { MAX_BUILD_LEVEL, type Board, type GameState, type Holding, type Variant } from '../../domain/types'
import type { RosterEntry } from '../../net/protocol'
import { formatMoney } from '../../util/money'
import { GROUP_META } from '../colors'
import { CashPanel } from '../CashPanel'
import type { HostTaxView } from '../GameScreen'
import { PropertyList } from '../PropertyList'
import { WealthTaxHostPanel } from './WealthTaxHostPanel'

interface MultiplayerColumnsProps {
  board: Board
  variant: Variant
  session: GameState
  dispatch: (action: Action) => void
  roster: RosterEntry[]
  meId: string
  hostTax?: HostTaxView
}

/**
 * Wide-screen dashboard: one column per player. Your own column carries the
 * cash controls and the full interactive board; other columns show a summary
 * and their owned properties, read-only.
 */
export function MultiplayerColumns({
  board,
  variant,
  session,
  dispatch,
  roster,
  meId,
  hostTax,
}: MultiplayerColumnsProps) {
  const me = roster.filter((p) => p.id === meId)
  const others = roster.filter((p) => p.id !== meId)
  const ordered = [...me, ...others]

  return (
    <div className="w-full">
      {hostTax && (
        <div className="py-3">
          <WealthTaxHostPanel board={board} preview={hostTax.preview} onApply={hostTax.apply} />
        </div>
      )}

      <div className="w-full overflow-x-auto px-4 pb-10">
        <div className="mx-auto flex w-max min-w-full justify-center gap-4">
          {ordered.map((entry) => (
            <PlayerColumn
              key={entry.id}
              board={board}
              variant={variant}
              entry={entry}
              isMe={entry.id === meId}
              session={session}
              dispatch={dispatch}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function PlayerColumn({
  board,
  variant,
  entry,
  isMe,
  session,
  dispatch,
}: {
  board: Board
  variant: Variant
  entry: RosterEntry
  isMe: boolean
  session: GameState
  dispatch: (action: Action) => void
}) {
  return (
    <div className="flex w-[19rem] shrink-0 flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
        <span className="min-w-0 flex-1 truncate font-semibold text-ink">{entry.name}</span>
        {isMe && <Tag>You</Tag>}
        {entry.isHost && <Tag>Host</Tag>}
        {!entry.connected && <span className="text-[10px] text-warn">offline</span>}
      </div>

      {isMe && (
        <CashPanel board={board} state={session} variant={variant} dispatch={dispatch} />
      )}

      <PlayerSummary board={board} entry={entry} />

      {isMe ? (
        <PropertyList board={board} holdings={session.holdings} dispatch={dispatch} />
      ) : (
        <OwnedPropertyList board={board} holdings={entry.holdings} />
      )}
    </div>
  )
}

function PlayerSummary({ board, entry }: { board: Board; entry: RosterEntry }) {
  const w = entry.worth
  return (
    <div className="mx-auto w-full max-w-md px-5">
      <div className="rounded-2xl bg-surface p-4 ring-1 ring-line">
        <p className="text-xs font-medium tracking-wide text-muted uppercase">Net worth</p>
        <p className="mt-0.5 text-2xl font-bold text-accent tabular-nums">{formatMoney(w.total, board)}</p>
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-faint">
          <span>Cash {formatMoney(w.cash, board)}</span>
          <span>Property {formatMoney(w.property, board)}</span>
          <span>Houses {formatMoney(w.buildings, board)}</span>
        </div>
      </div>
    </div>
  )
}

/** Compact, read-only list of another player's owned properties. */
function OwnedPropertyList({ board, holdings }: { board: Board; holdings: Holding[] }) {
  const byId = new Map(holdings.map((h) => [h.propertyId, h]))
  const owned = board.properties.filter((p) => byId.has(p.id))

  return (
    <div className="mx-auto w-full max-w-md px-5 pb-4">
      {owned.length === 0 ? (
        <p className="py-3 text-center text-xs text-faint">No properties yet.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl ring-1 ring-line">
          {owned.map((p, i) => {
            const h = byId.get(p.id)!
            return (
              <div
                key={p.id}
                className={
                  'flex items-center gap-2.5 bg-surface px-3 py-2 ' +
                  (i > 0 ? 'border-t border-line' : '')
                }
              >
                <span
                  className="h-6 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: GROUP_META[p.group].swatch }}
                />
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-ink">{p.name}</span>
                <BuildBadge level={h.buildLevel} />
                {h.mortgaged && (
                  <span className="rounded bg-amber-500/20 px-1 py-0.5 text-[9px] font-semibold text-warn">
                    MTG
                  </span>
                )}
                <span className="text-xs tabular-nums text-muted">
                  {formatMoney(holdingValue(p, h), board)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function BuildBadge({ level }: { level: number }) {
  if (level === 0) return null
  if (level === MAX_BUILD_LEVEL) {
    return <span className="rounded bg-red-500 px-1 py-0.5 text-[9px] font-bold text-white">H</span>
  }
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: level }).map((_, i) => (
        <span key={i} className="h-2 w-2 rounded-[2px] bg-emerald-400" />
      ))}
    </span>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="shrink-0 rounded-full bg-surface3 px-2 py-0.5 text-[10px] font-semibold text-muted">
      {children}
    </span>
  )
}
