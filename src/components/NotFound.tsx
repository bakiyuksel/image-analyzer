import { useEffect } from 'react'
import posthog from 'posthog-js'
import { useLang } from '../lib/lang-context'
import { translations } from '../lib/i18n'

export default function NotFound() {
  const { lang } = useLang()
  const T = translations[lang].notFound
  const path = window.location.pathname

  useEffect(() => {
    posthog.capture('404', { path })
  }, [path])

  return (
    <div className="min-h-screen bg-bg text-fg flex flex-col items-center justify-center gap-6">
      <p className="text-8xl font-bold text-muted" style={{ opacity: 0.15 }}>{T.code}</p>
      <h1 className="text-xl font-semibold -mt-4">{T.title}</h1>
      <p className="text-sm text-muted font-mono">{path}</p>
      <a
        href="/"
        className="text-sm text-muted hover:text-fg border border-rim hover:border-accent px-4 py-2 rounded-sm transition-colors"
      >
        {T.back}
      </a>
    </div>
  )
}
