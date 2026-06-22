import { Download } from 'lucide-react'
import type { ProcessedView } from '../types/image'

interface Props {
  view: ProcessedView
  onClick: () => void
}

export default function ViewPanel({ view, onClick }: Props) {
  return (
    <div
      className="group relative bg-surface border border-rim hover:border-accent transition-colors cursor-pointer rounded-sm overflow-hidden"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={view.dataUrl}
          alt={view.definition.name}
          className="w-full h-full object-contain bg-bg"
          draggable={false}
        />

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all">
          <a
            href={view.dataUrl}
            download={`${view.definition.id}.jpg`}
            className="p-1.5 rounded-sm bg-bg/75 text-muted hover:text-accent backdrop-blur-sm block"
            onClick={e => e.stopPropagation()}
            title="Download"
          >
            <Download size={15} />
          </a>
        </div>
      </div>

      <div className="px-3 py-2 border-t border-rim">
        <span className="text-sm font-medium text-fg">{view.definition.name}</span>
      </div>
    </div>
  )
}
