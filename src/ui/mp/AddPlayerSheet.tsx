import { useEffect, useState } from 'react'
import type { UseMultiplayer } from '../../state/useMultiplayer'
import { Sheet } from '../Sheet'
import { QrCode } from './QrCode'
import { QrScanner } from './QrScanner'

interface AddPlayerSheetProps {
  open: boolean
  mp: UseMultiplayer
  onClose: () => void
}

/**
 * Host's add/reconnect-a-player wizard: show an offer QR, then scan the
 * player's answer. A reconnecting player reuses their id, so this also serves
 * as "reconnect" — the roster merges rather than duplicating.
 */
export function AddPlayerSheet({ open, mp, onClose }: AddPlayerSheetProps) {
  const [step, setStep] = useState<'offer' | 'scan'>('offer')
  const [offer, setOffer] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Generate a fresh invite each time the sheet opens. mp's methods are stable
  // (useCallback), so keying on `open` alone avoids re-running every render.
  useEffect(() => {
    if (!open) return
    setStep('offer')
    setError(null)
    setOffer('')
    mp.createInvite().then(setOffer).catch(() => setError('Could not create an invite.'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function onScan(code: string) {
    try {
      await mp.completeInvite(code)
      onClose() // handshake done; connection establishes in the background
    } catch {
      setError('That code was not a valid join response. Try again.')
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Add player">
      {error && <p className="mb-3 text-sm text-warn">{error}</p>}
      {step === 'offer' ? (
        <div>
          <p className="mb-3 text-sm text-muted">1. Ask the player to scan this code:</p>
          {offer ? (
            <QrCode value={offer} />
          ) : (
            <p className="py-10 text-center text-sm text-faint">Preparing…</p>
          )}
          <button
            onClick={() => setStep('scan')}
            disabled={!offer}
            className="mt-4 w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white active:bg-emerald-500 disabled:opacity-40"
          >
            Next: scan their response
          </button>
        </div>
      ) : (
        <div>
          <p className="mb-3 text-sm text-muted">2. Scan the code the player shows back:</p>
          <QrScanner onResult={onScan} />
          <button
            onClick={() => setStep('offer')}
            className="mt-3 w-full rounded-xl bg-surface2 py-3 font-semibold text-ink active:bg-surface3"
          >
            Back to my code
          </button>
        </div>
      )}
    </Sheet>
  )
}
