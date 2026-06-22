import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useLang } from '../lib/lang-context'
import { translations } from '../lib/i18n'

interface Props {
  onClose: () => void
  onSubmit: (url: string) => void
  error: string | null
}

export default function UrlModal({ onClose, onSubmit, error }: Props) {
  const { lang } = useLang()
  const T = translations[lang].urlModal
  const [url, setUrl] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSubmit = () => {
    const trimmed = url.trim()
    if (trimmed) onSubmit(trimmed)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-surface border border-rim rounded-2xl w-full max-w-md mx-4 p-6 shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-fg uppercase tracking-widest">{T.title}</h2>
          <button onClick={onClose} className="text-muted hover:text-fg transition-colors p-1 rounded-lg hover:bg-surface-hover">
            <X size={16} />
          </button>
        </div>

        <input
          ref={inputRef}
          type="url"
          placeholder={T.placeholder}
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
          className="w-full bg-bg border border-rim rounded-xl px-4 py-2.5 text-sm text-fg placeholder:text-muted focus:outline-none focus:border-accent transition-colors mb-4"
        />

        {error && (
          <div className="bg-red-950/30 border border-red-500/25 rounded-xl px-4 py-3 mb-4">
            <p className="text-sm text-red-300 leading-relaxed">{error}</p>
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-rim text-muted hover:text-fg hover:border-accent/50 transition-colors"
          >
            {T.cancel}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!url.trim()}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-accent hover:bg-accent-dim text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {T.load}
          </button>
        </div>
      </div>
    </div>
  )
}
