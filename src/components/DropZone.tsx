import { useCallback, useState } from 'react'
import { ImageUp, Link2 } from 'lucide-react'
import { useLang } from '../lib/lang-context'
import { translations } from '../lib/i18n'

interface Props {
  onFile: (file: File) => void
  onOpenUrlModal: () => void
}

export default function DropZone({ onFile, onOpenUrlModal }: Props) {
  const { lang } = useLang()
  const T = translations[lang].dropzone
  const [isDragging, setIsDragging] = useState(false)

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

  return (
    <div
      className={`dropzone-glow flex flex-col items-center justify-center min-h-[72vh] rounded-2xl border-2 border-dashed transition-all duration-300 select-none ${
        isDragging
          ? 'is-dragging border-accent bg-accent/5 scale-[1.008]'
          : 'border-rim hover:border-accent/50'
      }`}
      onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="relative mb-7">
        <div className={`relative p-4 rounded-2xl transition-colors duration-300 ${
          isDragging ? 'bg-accent/15 text-accent' : 'bg-surface text-muted animate-float'
        }`}>
          <ImageUp size={36} strokeWidth={1.5} />
        </div>
        {isDragging && (
          <div className="absolute inset-0 rounded-2xl bg-accent/20 blur-xl animate-pulse" />
        )}
      </div>

      <h2 className={`text-2xl font-semibold mb-2 tracking-tight transition-colors duration-300 ${
        isDragging ? 'text-accent' : 'text-fg'
      }`}>
        {T.headline}
      </h2>
      <p className="text-sm text-muted mb-8">{T.hint}</p>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => document.getElementById('file-input')?.click()}
          className="btn-shimmer flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg bg-accent hover:bg-accent-dim text-white transition-colors active:scale-95"
        >
          {T.uploadButton}
        </button>
        <button
          type="button"
          onClick={onOpenUrlModal}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg border border-rim text-muted hover:text-fg hover:border-accent/60 hover:bg-surface-hover transition-all active:scale-95"
        >
          <Link2 size={14} />
          {T.urlButton}
        </button>
      </div>

      <input
        id="file-input"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
