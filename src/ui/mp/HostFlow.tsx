import { useState } from 'react'
import { boards } from '../../boards'
import { variants } from '../../variants'
import type { UseMultiplayer } from '../../state/useMultiplayer'
import { BackBar } from '../BackBar'
import { AddPlayerSheet } from './AddPlayerSheet'
import { RosterList } from './RosterList'

interface HostFlowProps {
  mp: UseMultiplayer
  onExit: () => void
  onStart: (boardId: string, variantId: string) => void
}

export function HostFlow({ mp, onExit, onStart }: HostFlowProps) {
  const [name, setName] = useState('')
  const [boardId, setBoardId] = useState(boards[0].id)
  const [variantId, setVariantId] = useState(variants[0].id)

  if (mp.role !== 'host') {
    return (
      <main className="mx-auto flex min-h-full max-w-md flex-col px-5 py-6">
        <BackBar title="Host a game" onBack={onExit} />
        <div className="mt-6 flex flex-col gap-6">
          <Field label="Your name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Host"
              maxLength={16}
              className="w-full rounded-xl bg-surface2 px-4 py-3 text-ink placeholder:text-faint"
            />
          </Field>

          <Field label="Edition">
            <Segmented options={boards.map((b) => ({ value: b.id, label: b.name }))} value={boardId} onChange={setBoardId} />
          </Field>

          <Field label="Rules">
            <Segmented options={variants.map((v) => ({ value: v.id, label: v.name }))} value={variantId} onChange={setVariantId} />
          </Field>
        </div>

        <button
          onClick={() => mp.startHost(name, boardId, variantId)}
          className="mt-8 w-full rounded-xl bg-emerald-600 py-3.5 font-semibold text-white active:bg-emerald-500"
        >
          Create game
        </button>
      </main>
    )
  }

  return <HostLobby mp={mp} onExit={onExit} onStart={() => onStart(boardId, variantId)} />
}

function HostLobby({
  mp,
  onExit,
  onStart,
}: {
  mp: UseMultiplayer
  onExit: () => void
  onStart: () => void
}) {
  const [adding, setAdding] = useState(false)
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col px-5 py-6">
      <BackBar title="Lobby" onBack={onExit} />
      <p className="mt-2 mb-5 text-sm text-muted">
        Players on your Wi-Fi or hotspot join by scanning your code. Add everyone, then start.
      </p>

      <div className="mb-4">
        <h2 className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">
          Players ({mp.roster.length})
        </h2>
        <RosterList roster={mp.roster} meId={mp.me?.id} />
      </div>

      <button
        onClick={() => setAdding(true)}
        className="w-full rounded-xl bg-surface2 py-3.5 font-semibold text-ink active:bg-surface3"
      >
        + Add player
      </button>

      <button
        onClick={onStart}
        className="mt-3 w-full rounded-xl bg-emerald-600 py-3.5 font-semibold text-white active:bg-emerald-500"
      >
        Start game
      </button>

      <AddPlayerSheet open={adding} mp={mp} onClose={() => setAdding(false)} />
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium tracking-wide text-muted uppercase">{label}</span>
      {children}
    </label>
  )
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={
            'rounded-xl px-4 py-2.5 text-left text-sm font-semibold ring-1 transition ' +
            (value === o.value ? 'bg-surface2 text-ink ring-accent' : 'bg-surface text-muted ring-line')
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
