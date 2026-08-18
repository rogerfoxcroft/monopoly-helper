import { useState } from 'react'
import type { UseMultiplayer } from '../../state/useMultiplayer'
import { BackBar } from '../BackBar'
import { QrCode } from './QrCode'
import { QrScanner } from './QrScanner'

interface ReconnectFlowProps {
  mp: UseMultiplayer
  onExit: () => void
}

/**
 * Shown to a client whose connection to the host dropped. Their local game is
 * untouched; they rescan the host's code to rejoin with the same identity.
 */
export function ReconnectFlow({ mp, onExit }: ReconnectFlowProps) {
  const [step, setStep] = useState<'prompt' | 'scan' | 'answer'>('prompt')
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function onScan(code: string) {
    setError(null)
    try {
      setAnswer(await mp.acceptInvite(code))
      setStep('answer')
    } catch {
      setError('That code was not a valid host invite. Try again.')
    }
  }

  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col px-5 py-6">
      <BackBar title="Reconnect" onBack={onExit} />

      {step === 'prompt' && (
        <div className="mt-10 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface2 text-warn">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3a9 9 0 1 0 9 9" strokeLinecap="round" />
              <path d="M21 3v6h-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <h2 className="mt-5 text-lg font-semibold text-ink">Connection lost</h2>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
            Your game is safe. Ask the host to tap <span className="font-medium text-ink">Add player</span>,
            then rescan their code to rejoin.
          </p>
          <button
            onClick={() => {
              mp.reconnect()
              setStep('scan')
            }}
            className="mt-6 w-full rounded-xl bg-emerald-600 py-3.5 font-semibold text-white active:bg-emerald-500"
          >
            Rescan to rejoin
          </button>
        </div>
      )}

      {step === 'scan' && (
        <div className="mt-6">
          <p className="mb-3 text-sm text-muted">Scan the host's code:</p>
          {error && <p className="mb-3 text-sm text-warn">{error}</p>}
          <QrScanner onResult={onScan} />
        </div>
      )}

      {step === 'answer' && (
        <div className="mt-6">
          <p className="mb-3 text-sm text-muted">Show this back to the host:</p>
          <QrCode value={answer} />
          <p className="mt-4 text-center text-sm text-faint">Reconnecting…</p>
        </div>
      )}
    </main>
  )
}
