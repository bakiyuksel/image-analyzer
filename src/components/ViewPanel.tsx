import { Download } from 'lucide-react'
import type { ProcessedView } from '../types/image'

interface Props {
  view: ProcessedView
  onClick: () => void
}

export default function ViewPanel({ view, onClick }: Props) {
  return (
    <div
      className="group relative bg-surface border border-rim hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 transition-all duration-200 cursor-pointer rounded-xl overflow-hidden"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={view.dataUrl}
          alt={view.definition.name}
          className="w-full h-full object-contain bg-bg"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all">
          <a
            href={view.dataUrl}
            download={`${view.definition.id}.jpg`}
            className="p-1.5 rounded-lg bg-black/60 text-muted hover:text-accent backdrop-blur-sm block transition-colors"
            onClick={e => e.stopPropagation()}
            title="Download"
          >
            <Download size={14} />
          </a>
        </div>
      </div>
      <div className="px-3 py-2.5 border-t border-rim">
        <span className="text-sm font-medium text-fg">{view.definition.name}</span>
      </div>
    </div>
  )
}
