import { useEffect } from 'react'

interface WakeLockLike {
  release: () => Promise<void>
  addEventListener: (type: string, listener: () => void) => void
}

interface WakeLockNavigator {
  wakeLock?: { request: (type: 'screen') => Promise<WakeLockLike> }
}

/**
 * Hold a screen wake lock while `active`, keeping the phone from sleeping (which
 * would drop the WebRTC connection). Re-acquires when the tab becomes visible
 * again, since the lock is released on hide. No-op where unsupported.
 */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active) return
    const nav = navigator as Navigator & WakeLockNavigator
    if (!nav.wakeLock) return

    let lock: WakeLockLike | null = null
    let cancelled = false

    const acquire = async () => {
      if (cancelled || lock || document.visibilityState !== 'visible') return
      try {
        lock = await nav.wakeLock!.request('screen')
        lock.addEventListener('release', () => {
          lock = null
        })
      } catch {
        // request can reject (e.g. not visible, low battery) — ignore
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') void acquire()
    }

    void acquire()
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      lock?.release().catch(() => {})
      lock = null
    }
  }, [active])
}
