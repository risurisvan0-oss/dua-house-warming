import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
import { storageService } from './services/storageService'

registerSW({ immediate: true })

const url = new URL(window.location.href)
let urlChanged = false

// A ?fresh=1 (or &fresh=1) link wipes this browser's saved RSVP/journey
// progress so the invitation replays exactly like a brand new guest —
// handy for re-testing/demoing the flow from the very start.
if (url.searchParams.get('fresh') === '1') {
  storageService.resetForFreshStart()
  url.searchParams.delete('fresh')
  urlChanged = true
}

// A ?to=<name> link personalises the whole invitation — see
// /admin's "Personalised Links" tool. Trimmed to a sane length and
// stored once, then scrubbed from the URL so it stays clean/shareable.
const guestNameParam = url.searchParams.get('to')
if (guestNameParam && guestNameParam.trim()) {
  storageService.setGuestName(guestNameParam.trim().slice(0, 60))
  url.searchParams.delete('to')
  urlChanged = true
}

if (urlChanged) {
  window.history.replaceState(null, '', url.pathname + url.search + url.hash)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
