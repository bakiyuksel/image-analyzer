import { useEffect, useRef, useState, useCallback } from 'react'
import { X, ZoomIn } from 'lucide-react'
import type { ProcessedView } from '../types/image'
import { useLang } from '../lib/lang-context'
import { translations, viewDescriptions } from '../lib/i18n'

interface Props {
  view: ProcessedView
  onClose: () => void
}

const MIN_ZOOM = 1
const MAX_ZOOM = 8

export default function Lightbox({ view, onClose }: Props) {
  const { lang } = useLang()
  const T = translations[lang].lightbox
  const description = viewDescriptions[view.definition.id]?.[lang] ?? view.definition.description
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragging = useRef(false)
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 })

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Reset zoom/pan when view changes
  useEffect(() => { setZoom(1); setOffset({ x: 0, y: 0 }) }, [view.definition.id])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setZoom(prev => {
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev * (e.deltaY < 0 ? 1.15 : 0.87)))
      if (next === MIN_ZOOM) setOffset({ x: 0, y: 0 })
      return next
    })
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom <= 1) return
    dragging.current = true
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y }
    e.preventDefault()
  }, [zoom, offset])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return
    setOffset({
      x: dragStart.current.ox + (e.clientX - dragStart.current.mx) / zoom,
      y: dragStart.current.oy + (e.clientY - dragStart.current.my) / zoom,
    })
  }, [zoom])

  const handleMouseUp = useCallback(() => { dragging.current = false }, [])

  const resetZoom = useCallback(() => { setZoom(1); setOffset({ x: 0, y: 0 }) }, [])

  const cursor = zoom <= 1 ? 'cursor-zoom-in' : dragging.current ? 'cursor-grabbing' : 'cursor-grab'

  return (
    <div
      className="animate-fade-in fixed inset-0 bg-black/88 z-50 flex items-center justify-center p-8 select-none"
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Close */}
      <button
        className="absolute top-4 right-4 p-2 text-muted hover:text-fg transition-colors rounded-sm hover:bg-surface z-10"
        onClick={onClose}
        title={T.close}
      >
        <X size={22} />
      </button>

      {/* Reset zoom */}
      {zoom > 1 && (
        <button
          className="absolute bottom-4 left-4 flex items-center gap-1.5 text-xs text-muted hover:text-fg px-2 py-1.5 border border-rim rounded-sm bg-surface/80 z-10"
          onClick={e => { e.stopPropagation(); resetZoom() }}
          title={T.close}
        >
          <ZoomIn size={13} />
          {zoom.toFixed(1)}× — {T.reset}
        </button>
      )}

      {/* Hint */}
      {zoom === 1 && (
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted/50 pointer-events-none">
          {T.zoomHint}
        </p>
      )}

      <div
        className="animate-scale-in flex flex-col items-center gap-5 max-w-[90vw] max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div
          className={`overflow-hidden rounded-sm ${cursor}`}
          style={{ maxWidth: '85vw', maxHeight: '72vh' }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onDoubleClick={resetZoom}
        >
          <img
            src={view.dataUrl}
            alt={view.definition.name}
            draggable={false}
            style={{
              display: 'block',
              maxWidth: '85vw',
              maxHeight: '72vh',
              objectFit: 'contain',
              transform: `scale(${zoom}) translate(${offset.x}px, ${offset.y}px)`,
              transformOrigin: 'center center',
              transition: dragging.current ? 'none' : 'transform 0.1s ease-out',
            }}
          />
        </div>

        <div className="text-center border-t border-rim/50 pt-4 w-full">
          <p className="text-accent font-semibold text-base mb-1">{view.definition.name}</p>
          <p className="text-fg/70 text-sm max-w-lg mx-auto leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}
