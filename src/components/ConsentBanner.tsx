import { useState } from 'react'
import { useLang } from '../lib/lang-context'
import { translations } from '../lib/i18n'
import { initSentry } from '../instrument'

const CONSENT_KEY = 'sentry_consent'

export default function ConsentBanner() {
  const [visible, setVisible] = useState(() => localStorage.getItem(CONSENT_KEY) === null)
  const { lang } = useLang()
  const T = translations[lang].consent

  if (!visible) return null

  function accept() {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    initSentry()
    setVisible(false)
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, 'declined')
    setVisible(false)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-rim bg-surface px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <p className="text-sm text-muted flex-1 leading-relaxed">{T.message}</p>
      <div className="flex gap-3 shrink-0">
        <button
          onClick={decline}
          className="text-sm text-muted px-4 py-1.5 rounded-sm border border-rim hover:border-fg hover:text-fg transition-colors"
        >
          {T.decline}
        </button>
        <button
          onClick={accept}
          className="text-sm text-fg bg-accent/20 px-4 py-1.5 rounded-sm border border-accent hover:bg-accent/30 transition-colors"
        >
          {T.accept}
        </button>
      </div>
    </div>
  )
}
