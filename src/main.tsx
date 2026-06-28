import { hasAnalyticsConsent, initPosthog, captureException } from './instrument'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LangProvider } from './lib/lang-context.tsx'

if (hasAnalyticsConsent()) {
  initPosthog()
}

createRoot(document.getElementById('root')!, {
  onUncaughtError: (error, info) => captureException(error, { componentStack: info.componentStack }),
  onCaughtError: (error, info) => captureException(error, { componentStack: info.componentStack }),
  onRecoverableError: (error, info) => captureException(error, { componentStack: info.componentStack }),
}).render(
  <StrictMode>
    <LangProvider>
      <App />
    </LangProvider>
  </StrictMode>,
)
