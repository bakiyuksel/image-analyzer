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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-surface border border-rim rounded-sm w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-fg uppercase tracking-widest">{T.title}</h2>
          <button onClick={onClose} className="text-muted hover:text-fg transition-colors">
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
          className="w-full bg-bg border border-rim rounded-sm px-3 py-2 text-sm text-fg placeholder:text-muted focus:outline-none focus:border-accent transition-colors mb-3"
        />

        {error && (
          <p className="text-sm text-red-400 mb-3 leading-relaxed">{error}</p>
        )}

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-rim rounded-sm text-muted hover:text-fg hover:border-accent transition-colors"
          >
            {T.cancel}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!url.trim()}
            className="px-4 py-2 text-sm border border-accent rounded-sm text-accent hover:bg-accent hover:text-bg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {T.load}
          </button>
        </div>
      </div>
    </div>
  )
}
