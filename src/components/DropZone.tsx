import { useCallback, useState } from 'react'
import { Upload } from 'lucide-react'
import { useLang } from '../lib/lang-context'
import { translations } from '../lib/i18n'

interface Props {
  onFile: (file: File) => void
  onUrl: (url: string) => void
  urlError?: string | null
}

export default function DropZone({ onFile, onUrl, urlError }: Props) {
  const { lang } = useLang()
  const T = translations[lang].dropzone
  const [isDragging, setIsDragging] = useState(false)
  const [urlInput, setUrlInput] = useState('')

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) onFile(file)
  }, [onFile])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFile(file)
  }, [onFile])

  const handleUrlSubmit = useCallback(() => {
    const trimmed = urlInput.trim()
    if (trimmed) {
      onUrl(trimmed)
      setUrlInput('')
    }
  }, [urlInput, onUrl])

  return (
    <div className="flex flex-col min-h-[70vh] gap-3">
      <div
        className={`flex flex-col flex-1 items-center justify-center rounded-sm border-2 border-dashed transition-colors select-none ${
          isDragging ? 'border-accent bg-accent/5' : 'border-rim'
        }`}
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <Upload
          size={48}
          strokeWidth={1.5}
          className={`mb-5 transition-colors ${isDragging ? 'text-accent' : 'text-muted'}`}
        />
        <p className={`text-xl font-medium mb-2 transition-colors ${isDragging ? 'text-accent' : 'text-fg'}`}>
          {T.headline}
        </p>
        <p className="text-sm text-muted mb-5">{T.hint}</p>
        <button
          type="button"
          onClick={() => document.getElementById('file-input')?.click()}
          className="px-5 py-2.5 text-sm border border-rim rounded-sm text-muted hover:text-fg hover:border-accent transition-colors cursor-pointer"
        >
          {T.uploadButton}
        </button>
        <input
          id="file-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
      </div>

      <div className="flex gap-2">
        <input
          type="url"
          placeholder={T.urlPlaceholder}
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleUrlSubmit() }}
          className="flex-1 bg-surface border border-rim rounded-sm px-3 py-2 text-sm text-fg placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
        />
        <button
          type="button"
          onClick={handleUrlSubmit}
          disabled={!urlInput.trim()}
          className="px-4 py-2 text-sm bg-surface border border-rim rounded-sm text-muted hover:text-fg hover:border-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {T.urlLoad}
        </button>
      </div>

      {urlError && (
        <p className="text-sm text-red-400 px-1">{urlError}</p>
      )}
    </div>
  )
}
