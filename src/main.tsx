import './instrument'
import { hasSentryConsent, initSentry, initPosthog } from './instrument'
import { reactErrorHandler } from '@sentry/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LangProvider } from './lib/lang-context.tsx'

if (hasSentryConsent()) {
  initSentry()
  initPosthog()
}

createRoot(document.getElementById('root')!, {
  onUncaughtError: reactErrorHandler(),
  onCaughtError: reactErrorHandler(),
  onRecoverableError: reactErrorHandler(),
}).render(
  <StrictMode>
    <LangProvider>
      <App />
    </LangProvider>
  </StrictMode>,
)
