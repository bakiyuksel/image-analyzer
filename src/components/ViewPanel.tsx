import { useState, useRef, useEffect } from 'react'
import { Info, Download } from 'lucide-react'
import type { ProcessedView } from '../types/image'

interface Props {
  view: ProcessedView
  onClick: () => void
}

export default function ViewPanel({ view, onClick }: Props) {
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!tooltipOpen) return
    function handleClick(e: MouseEvent) {
      if (!tooltipRef.current?.contains(e.target as Node)) {
        setTooltipOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [tooltipOpen])

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

        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <a
            href={view.dataUrl}
            download={`${view.definition.id}.jpg`}
            className="p-1.5 rounded-sm bg-bg/75 text-muted hover:text-accent backdrop-blur-sm"
            onClick={e => e.stopPropagation()}
            title="Download"
          >
            <Download size={15} />
          </a>
          <button
            className="p-1.5 rounded-sm bg-bg/75 text-muted hover:text-accent backdrop-blur-sm"
            onClick={e => {
              e.stopPropagation()
              setTooltipOpen(v => !v)
            }}
            title="Uitleg"
          >
            <Info size={15} />
          </button>
        </div>

        {tooltipOpen && (
          <div
            ref={tooltipRef}
            className="absolute top-10 right-2 w-72 bg-surface border border-rim text-sm p-3 rounded-sm shadow-xl z-20"
            onClick={e => e.stopPropagation()}
          >
            <p className="font-semibold text-accent mb-1.5">{view.definition.name}</p>
            <p className="text-muted leading-relaxed">{view.definition.description}</p>
          </div>
        )}
      </div>

      <div className="px-3 py-2 border-t border-rim flex items-center justify-between">
        <span className="text-sm font-medium text-fg">{view.definition.name}</span>
        <Info size={12} className="text-rim opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  )
}
