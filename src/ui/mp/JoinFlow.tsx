import { useState } from 'react'
import { useMultiplayer } from '../../state/useMultiplayer'
import { BackBar } from '../BackBar'
import { QrCode } from './QrCode'
import { QrScanner } from './QrScanner'
import { RosterList } from './RosterList'

interface JoinFlowProps {
  onExit: () => void
}

export function JoinFlow({ onExit }: JoinFlowProps) {
  const mp = useMultiplayer()
  const [name, setName] = useState('')
  const [step, setStep] = useState<'setup' | 'scan' | 'answer'>('setup')
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState<string | null>(null)

  const exit = () => {
    mp.leave()
    onExit()
  }

  // Once the host welcomes us, show the connected roster regardless of step.
  if (mp.connected && mp.role === 'client') {
    return (
      <main className="mx-auto flex min-h-full max-w-md flex-col px-5 py-6">
        <BackBar title="Connected" onBack={exit} />
        <div className="mt-6 rounded-2xl bg-surface p-5 ring-1 ring-line">
          <p className="text-center text-sm font-semibold text-pos">You're in!</p>
          <div className="mt-4">
            <RosterList roster={mp.roster} meId={mp.me?.id} />
          </div>
        </div>
        <p className="mt-auto pt-8 text-center text-xs text-faint">
          Live gameplay sync (leaderboard &amp; wealth tax) arrives in the next update.
        </p>
      </main>
    )
  }

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
      <BackBar title="Join a game" onBack={exit} />

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
