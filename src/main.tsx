import './instrument'
import { hasSentryConsent, initSentry } from './instrument'
import { reactErrorHandler } from '@sentry/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import posthog from 'posthog-js'
import './index.css'
import App from './App.tsx'
import { LangProvider } from './lib/lang-context.tsx'

if (hasSentryConsent()) {
  initSentry()
}

posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  api_host: 'https://eu.i.posthog.com',
  person_profiles: 'identified_only',
  capture_pageview: true,
  capture_pageleave: true,
})

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
