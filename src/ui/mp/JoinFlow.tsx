import { useState } from 'react'
import type { UseMultiplayer } from '../../state/useMultiplayer'
import { BackBar } from '../BackBar'
import { QrCode } from './QrCode'
import { QrScanner } from './QrScanner'

interface JoinFlowProps {
  mp: UseMultiplayer
  onExit: () => void
}

export function JoinFlow({ mp, onExit }: JoinFlowProps) {
  const [name, setName] = useState('')
  const [step, setStep] = useState<'setup' | 'scan' | 'answer'>('setup')
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function onScanOffer(code: string) {
    setError(null)
    try {
      const ans = await mp.acceptInvite(code)
      setAnswer(ans)
      setStep('answer')
    } catch {
      setError('That code was not a valid host invite. Try again.')
    }
  }

  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col px-5 py-6">
      <BackBar title="Join a game" onBack={onExit} />

      {step === 'setup' && (
        <>
          <label className="mt-6 block">
            <span className="mb-1.5 block text-xs font-medium tracking-wide text-muted uppercase">Your name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Player"
              maxLength={16}
              className="w-full rounded-xl bg-surface2 px-4 py-3 text-ink placeholder:text-faint"
            />
          </label>
          <button
            onClick={() => {
              mp.startJoin(name)
              setStep('scan')
            }}
            className="mt-8 w-full rounded-xl bg-emerald-600 py-3.5 font-semibold text-white active:bg-emerald-500"
          >
            Continue
          </button>
        </>
      )}

      {step === 'scan' && (
        <div className="mt-6">
          <p className="mb-3 text-sm text-muted">Scan the host's code:</p>
          {error && <p className="mb-3 text-sm text-warn">{error}</p>}
          <QrScanner onResult={onScanOffer} />
        </div>
      )}

      {step === 'answer' && (
        <div className="mt-6">
          <p className="mb-3 text-sm text-muted">Show this back to the host:</p>
          <QrCode value={answer} />
          <p className="mt-4 text-center text-sm text-faint">Waiting for the host to connect…</p>
        </div>
      )}
    </main>
  )
}
