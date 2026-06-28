import posthog from 'posthog-js'

export function hasAnalyticsConsent(): boolean {
  return localStorage.getItem('sentry_consent') === 'accepted'
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  try {
    posthog.capture('$exception', {
      $exception_message: error instanceof Error ? error.message : String(error),
      $exception_stack: error instanceof Error ? error.stack : undefined,
      ...context,
    })
  } catch {
    // never throw from error handler
  }
}

export function initPosthog() {
  const key = import.meta.env.VITE_POSTHOG_KEY
  if (!key) return

  posthog.init(key, {
    api_host: '/ingest',
    ui_host: 'https://eu.posthog.com',
    defaults: '2026-05-30',
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
    capture_exceptions: true,
    session_recording: { maskAllInputs: true },
  })

  // Forward console errors/warnings to PostHog
  const origError = console.error.bind(console)
  console.error = (...args: unknown[]) => {
    origError(...args)
    posthog.capture('console_error', { message: String(args[0]) })
  }
  const origWarn = console.warn.bind(console)
  console.warn = (...args: unknown[]) => {
    origWarn(...args)
    posthog.capture('console_warn', { message: String(args[0]) })
  }
}
