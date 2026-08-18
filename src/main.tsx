import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

/**
 * Force-reset escape hatch: loading `?reset` wipes saved state, unregisters the
 * service worker and clears caches, then reloads clean. Handles a stuck game
 * and any stale-cache weirdness on the hosted site.
 */
async function forceReset(): Promise<void> {
  try {
    localStorage.clear()
  } catch {
    // ignore
  }
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations()
      await Promise.all(regs.map((r) => r.unregister()))
    }
  } catch {
    // ignore
  }
  try {
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
    }
  } catch {
    // ignore
  }
  location.replace(import.meta.env.BASE_URL)
}

if (new URLSearchParams(location.search).has('reset')) {
  void forceReset()
} else {
  // Auto-update: apply new builds on activation and poll while the app is open
  // so devices (host and joiners) converge on the same version without a manual
  // reopen. registerType 'autoUpdate' reloads the page once the new SW takes over.
  registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        setInterval(() => {
          registration.update().catch(() => {})
        }, 60_000)
      }
    },
  })

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
