import type { Action } from '../domain/reducer'
import { MAX_BUILD_LEVEL, type Board, type Holding, type PropertyDef } from '../domain/types'
import { buildingValue, holdingValue, mortgageValue, propertyValue } from '../domain/networth'
import { formatMoney } from '../util/money'
import { GROUP_META } from './colors'
import { Sheet } from './Sheet'

interface PropertySheetProps {
  open: boolean
  board: Board
  def: PropertyDef | null
  holding: Holding | undefined
  dispatch: (action: Action) => void
  onClose: () => void
}

function buildLabel(level: number): string {
  if (level === 0) return 'No buildings'
  if (level === MAX_BUILD_LEVEL) return 'Hotel'
  return `${level} house${level > 1 ? 's' : ''}`
}

export function PropertySheet({ open, board, def, holding, dispatch, onClose }: PropertySheetProps) {
  if (!def) return <Sheet open={open} onClose={onClose} title="" children={null} />

  const meta = GROUP_META[def.group]
  const owned = !!holding
  const buildable = def.houseCost > 0
  const level = holding?.buildLevel ?? 0

  const title = (
    <span className="flex items-center gap-2.5">
      <span className="inline-block h-4 w-4 shrink-0 rounded" style={{ backgroundColor: meta.swatch }} />
      <span className="truncate">{def.name}</span>
    </span>
  )

  return (
    <Sheet open={open} onClose={onClose} title={title}>
      {!owned ? (
        <div>
          <Row label="Price" value={formatMoney(def.price, board)} />
          {buildable && <Row label="House cost" value={formatMoney(def.houseCost, board)} />}
          <Row label="Mortgage value" value={formatMoney(mortgageValue(def), board)} />
          <button
            onClick={() => {
              dispatch({ type: 'buyProperty', propertyId: def.id })
              onClose()
            }}
            className="mt-5 w-full rounded-xl bg-emerald-600 py-3.5 font-semibold text-white active:bg-emerald-500"
          >
            Buy for {formatMoney(def.price, board)}
          </button>
        </div>
      ) : (
        <div>
          <Row label="Current value" value={formatMoney(holdingValue(def, holding!), board)} />
          <Row
            label={holding!.mortgaged ? 'Land (mortgaged)' : 'Land'}
            value={formatMoney(propertyValue(def, holding!), board)}
          />
          {buildable && level > 0 && (
            <Row label={buildLabel(level)} value={formatMoney(buildingValue(def, holding!), board)} />
          )}

          {/* House / hotel stepper */}
          {buildable && (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Buildings</span>
                <span className="text-xs text-slate-500">{formatMoney(def.houseCost, board)} each</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-900 p-2">
                <StepBtn
                  disabled={level === 0}
                  onClick={() => dispatch({ type: 'setBuildLevel', propertyId: def.id, buildLevel: level - 1 })}
                  label="−"
                />
                <span className="text-base font-semibold text-slate-100">{buildLabel(level)}</span>
                <StepBtn
                  disabled={level === MAX_BUILD_LEVEL || holding!.mortgaged}
                  onClick={() => dispatch({ type: 'setBuildLevel', propertyId: def.id, buildLevel: level + 1 })}
                  label="+"
                />
              </div>
              {holding!.mortgaged && (
                <p className="mt-1.5 text-xs text-amber-400">Unmortgage before building.</p>
              )}
            </div>
          )}

          {/* Mortgage toggle */}
          <button
            onClick={() =>
              dispatch({ type: 'setMortgaged', propertyId: def.id, mortgaged: !holding!.mortgaged })
            }
            disabled={!holding!.mortgaged && level > 0}
            className="mt-5 w-full rounded-xl bg-slate-700 py-3 font-semibold text-slate-100 active:bg-slate-600 disabled:opacity-40"
          >
            {holding!.mortgaged
              ? `Unmortgage · −${formatMoney(mortgageValue(def), board)}`
              : `Mortgage · +${formatMoney(mortgageValue(def), board)}`}
          </button>
          {!holding!.mortgaged && level > 0 && (
            <p className="mt-1.5 text-xs text-slate-500">Sell buildings before mortgaging.</p>
          )}

          {/* Sell */}
          <button
            onClick={() => {
              dispatch({ type: 'sellProperty', propertyId: def.id })
              onClose()
            }}
            className="mt-3 w-full rounded-xl bg-red-600/15 py-3 font-semibold text-red-300 ring-1 ring-red-600/40 active:bg-red-600/25"
          >
            Sell · +{formatMoney(holdingValue(def, holding!), board)}
          </button>
        </div>
      )}
    </Sheet>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-700/60 py-2.5 text-sm last:border-0">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-slate-100 tabular-nums">{value}</span>
    </div>
  )
}

function StepBtn({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="h-11 w-11 rounded-lg bg-slate-700 text-2xl font-bold text-slate-100 active:bg-slate-600 disabled:opacity-30"
    >
      {label}
    </button>
  )
}
