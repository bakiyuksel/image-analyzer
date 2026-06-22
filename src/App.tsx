import { useState, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import type { ProcessedView } from './types/image'
import { processImage } from './lib/transforms'
import DropZone from './components/DropZone'
import ViewGrid from './components/ViewGrid'
import Lightbox from './components/Lightbox'
import PredictionPanel from './components/PredictionPanel'

export default function App() {
  const [views, setViews] = useState<ProcessedView[]>([])
  const [lightboxId, setLightboxId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFile = useCallback((file: File) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = async () => {
      setLoading(true)
      const processed = await processImage(img)
      URL.revokeObjectURL(objectUrl)
      setViews(processed)
      setLoading(false)
    }
    img.src = objectUrl
  }, [])

  const lightboxView = lightboxId != null
    ? (views.find(v => v.definition.id === lightboxId) ?? null)
    : null

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="flex items-center justify-between px-6 py-4 border-b border-rim">
        <div>
          <h1 className="text-base font-semibold text-fg tracking-wide">Image Analyzer</h1>
          <p className="text-xs text-muted mt-0.5">Upload een foto om alle views te genereren</p>
        </div>
        {views.length > 0 && (
          <button
            onClick={() => { setViews([]); setLightboxId(null) }}
            className="flex items-center gap-2 text-sm text-muted hover:text-fg transition-colors px-3 py-1.5 rounded-sm border border-rim hover:border-accent"
          >
            <RefreshCw size={13} />
            Nieuwe afbeelding
          </button>
        )}
      </header>

      <main className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 text-muted">
            <div className="w-8 h-8 border-2 border-rim border-t-accent rounded-full animate-spin" />
            <p className="text-sm">Views genereren…</p>
          </div>
        ) : views.length === 0 ? (
          <DropZone onFile={handleFile} />
        ) : (
          <>
            <ViewGrid views={views} onPanelClick={setLightboxId} />
            <PredictionPanel views={views} />
          </>
        )}
      </main>

      {lightboxView !== null && (
        <Lightbox view={lightboxView} onClose={() => setLightboxId(null)} />
      )}
    </div>
  )
}
