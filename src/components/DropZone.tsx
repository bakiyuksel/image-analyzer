import { useCallback, useState } from 'react'
import { Upload } from 'lucide-react'

interface Props {
  onFile: (file: File) => void
}

export default function DropZone({ onFile }: Props) {
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
      className={`flex flex-col items-center justify-center min-h-[70vh] rounded-sm border-2 border-dashed cursor-pointer transition-colors select-none ${
        isDragging
          ? 'border-accent bg-accent/5 text-accent'
          : 'border-rim hover:border-accent/60 text-muted hover:text-fg'
      }`}
      onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-input')?.click()}
    >
      <Upload
        size={48}
        strokeWidth={1.5}
        className={`mb-5 transition-colors ${isDragging ? 'text-accent' : 'text-muted'}`}
      />
      <p className="text-xl font-medium mb-2 text-fg">Sleep een afbeelding hierheen</p>
      <p className="text-sm text-muted">of klik om te bladeren — JPG, PNG, WebP, AVIF</p>
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
