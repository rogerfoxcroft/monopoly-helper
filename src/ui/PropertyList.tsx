import { useMemo, useState } from 'react'
import { holdingValue } from '../domain/networth'
import type { Action } from '../domain/reducer'
import { MAX_BUILD_LEVEL, type Board, type Holding, type PropertyDef } from '../domain/types'
import { formatMoney } from '../util/money'
import { GROUP_META, GROUP_ORDER } from './colors'
import { PropertySheet } from './PropertySheet'

interface PropertyListProps {
  board: Board
  holdings: Holding[]
  dispatch: (action: Action) => void
}

function BuildingBadge({ level }: { level: number }) {
  if (level === 0) return null
  if (level === MAX_BUILD_LEVEL) {
    return (
      <span className="rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">HOTEL</span>
    )
  }
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: level }).map((_, i) => (
        <span key={i} className="h-2.5 w-2.5 rounded-[2px] bg-emerald-400" />
      ))}
    </span>
  )
}

export function PropertyList({ board, holdings, dispatch }: PropertyListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const holdingById = useMemo(
    () => new Map(holdings.map((h) => [h.propertyId, h])),
    [holdings],
  )

  const groups = useMemo(() => {
    return GROUP_ORDER.map((group) => ({
      group,
      items: board.properties.filter((p) => p.group === group),
    })).filter((g) => g.items.length > 0)
  }, [board])

  const selectedDef: PropertyDef | null =
    board.properties.find((p) => p.id === selectedId) ?? null

  return (
    <section className="mx-auto max-w-md px-5 pb-4">
      {groups.map(({ group, items }) => {
        const meta = GROUP_META[group]
        const ownedCount = items.filter((p) => holdingById.has(p.id)).length
        return (
          <div key={group} className="mb-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: meta.swatch }} />
              <h2 className="text-sm font-semibold text-slate-300">{meta.label}</h2>
              <span className="text-xs text-slate-500">
                {ownedCount}/{items.length}
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl ring-1 ring-slate-700/60">
              {items.map((p, i) => {
                const holding = holdingById.get(p.id)
                const owned = !!holding
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    className={
                      'flex w-full items-center gap-3 px-3.5 py-3 text-left transition ' +
                      (i > 0 ? 'border-t border-slate-700/50 ' : '') +
                      (owned ? 'bg-slate-800' : 'bg-slate-800/40 active:bg-slate-800')
                    }
                  >
                    <span
                      className="h-9 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: owned ? meta.swatch : 'transparent', outline: owned ? 'none' : `1.5px solid ${meta.swatch}66`, outlineOffset: '-1.5px' }}
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={
                          'block truncate text-sm font-medium ' +
                          (owned ? 'text-slate-100' : 'text-slate-400')
                        }
                      >
                        {p.name}
                      </span>
                      <span className="mt-0.5 flex items-center gap-2">
                        {owned ? (
                          <>
                            <BuildingBadge level={holding!.buildLevel} />
                            {holding!.mortgaged && (
                              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">
                                MORTGAGED
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-slate-500">Tap to buy</span>
                        )}
                      </span>
                    </span>
                    <span className="shrink-0 text-right text-sm font-semibold tabular-nums text-slate-200">
                      {owned ? formatMoney(holdingValue(p, holding!), board) : formatMoney(p.price, board)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      <PropertySheet
        open={selectedId !== null}
        board={board}
        def={selectedDef}
        holding={selectedId ? holdingById.get(selectedId) : undefined}
        dispatch={dispatch}
        onClose={() => setSelectedId(null)}
      />
    </section>
  )
}
