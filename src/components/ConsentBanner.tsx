import { useState } from 'react'
import { useLang } from '../lib/lang-context'
import { translations } from '../lib/i18n'
import { initPosthog } from '../instrument'

const CONSENT_KEY = 'sentry_consent'

export default function ConsentBanner() {
  const [visible, setVisible] = useState(() => localStorage.getItem(CONSENT_KEY) === null)
  const { lang } = useLang()
  const T = translations[lang].consent

  if (!visible) return null

  function accept() {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    initPosthog()
    setVisible(false)
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, 'declined')
    setVisible(false)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-rim bg-surface/90 backdrop-blur-md px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <p className="text-sm text-muted flex-1 leading-relaxed">{T.message}</p>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={decline}
          className="text-sm text-muted px-4 py-1.5 rounded-lg border border-rim hover:border-accent/50 hover:text-fg transition-colors"
        >
          {T.decline}
        </button>
        <button
          onClick={accept}
          className="text-sm font-medium text-white bg-accent hover:bg-accent-dim px-4 py-1.5 rounded-lg transition-colors"
        >
          {T.accept}
        </button>
      </div>
    </div>
  )
}
