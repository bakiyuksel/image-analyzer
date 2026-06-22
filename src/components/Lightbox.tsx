import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { ProcessedView } from '../types/image'

interface Props {
  view: ProcessedView
  onClose: () => void
}

export default function Lightbox({ view, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black/88 z-50 flex items-center justify-center p-8"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 p-2 text-muted hover:text-fg transition-colors rounded-sm hover:bg-surface"
        onClick={onClose}
        title="Sluiten (Escape)"
      >
        <X size={22} />
      </button>

      <div
        className="flex flex-col items-center gap-5 max-w-[90vw] max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <img
          src={view.dataUrl}
          alt={view.definition.name}
          className="max-w-[85vw] max-h-[72vh] object-contain rounded-sm"
          draggable={false}
        />
        <div className="text-center border-t border-rim pt-4 w-full">
          <p className="text-accent font-semibold text-base mb-1">{view.definition.name}</p>
          <p className="text-muted text-sm max-w-lg mx-auto leading-relaxed">
            {view.definition.description}
          </p>
        </div>
      </div>
    </div>
  )
}
