import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

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
