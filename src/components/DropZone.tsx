import { useCallback, useState } from 'react'
import { Upload } from 'lucide-react'
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
      className={`flex flex-col items-center justify-center min-h-[70vh] rounded-sm border-2 border-dashed transition-colors select-none ${
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

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => document.getElementById('file-input')?.click()}
          className="px-5 py-2.5 text-sm border border-rim rounded-sm text-muted hover:text-fg hover:border-accent transition-colors"
        >
          {T.uploadButton}
        </button>
        <button
          type="button"
          onClick={onOpenUrlModal}
          className="px-5 py-2.5 text-sm border border-rim rounded-sm text-muted hover:text-fg hover:border-accent transition-colors"
        >
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
