import { useState, useCallback, useEffect } from 'react'
import posthog from 'posthog-js'
import { RefreshCw } from 'lucide-react'
import type { ProcessedView } from './types/image'
import { processImage } from './lib/transforms'
import { useLang } from './lib/lang-context'
import { translations } from './lib/i18n'
import DropZone from './components/DropZone'
import ViewGrid from './components/ViewGrid'
import Lightbox from './components/Lightbox'
import PredictionPanel from './components/PredictionPanel'
import ExifPanel from './components/ExifPanel'
import HistogramPanel from './components/HistogramPanel'
import ExportPanel from './components/ExportPanel'
import ConsentBanner from './components/ConsentBanner'
import NotFound from './components/NotFound'
import VerdictBanner from './components/VerdictBanner'
import UrlModal from './components/UrlModal'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'

export default function App() {
  if (window.location.pathname !== '/') return <NotFound />

  const { lang, setLang } = useLang()
  const T = translations[lang]
  const [views, setViews] = useState<ProcessedView[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [lightboxId, setLightboxId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false)
  const [urlError, setUrlError] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [downscaleNotice, setDownscaleNotice] = useState(false)

  const handleFile = useCallback((f: File) => {
    setImageError(null)
    setDownscaleNotice(false)

    if (f.size > 100 * 1024 * 1024) {
      setImageError(T.app.fileTooLarge)
      return
    }

    setFile(f)
    const objectUrl = URL.createObjectURL(f)
    const img = new Image()
    img.onload = async () => {
      setLoading(true)
      const start = performance.now()
      const { views, wasDownscaled } = await processImage(img)
      const durationMs = Math.round(performance.now() - start)
      URL.revokeObjectURL(objectUrl)
      setViews(views)
      setLoading(false)
      if (wasDownscaled) setDownscaleNotice(true)
      posthog.capture('image_analyzed', {
        fileName: f.name,
        fileSize: f.size,
        fileType: f.type,
        viewCount: views.length,
        durationMs,
        wasDownscaled,
      })
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      setLoading(false)
      setImageError(T.app.fileLoadError)
    }
    img.src = objectUrl
  }, [T.app])

  const handleUrl = useCallback(async (url: string) => {
    setIsUrlModalOpen(false)
    setUrlError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`)
      if (res.status === 422) {
        setLoading(false)
        setUrlError(T.urlModal.errorNotImage)
        setIsUrlModalOpen(true)
        return
      }
      if (!res.ok) throw new Error('http')
      const blob = await res.blob()
      const name = url.split('/').pop()?.split('?')[0] ?? 'image'
      handleFile(new File([blob], name, { type: blob.type }))
    } catch {
      setLoading(false)
      setUrlError(T.urlModal.errorFailed)
      setIsUrlModalOpen(true)
    }
  }, [handleFile, T.urlModal])

  useEffect(() => {
    if (views.length > 0) setIsUrlModalOpen(false)
  }, [views.length])

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (views.length > 0 || loading) return
      if ((e.target as HTMLElement).tagName === 'INPUT') return
      const items = e.clipboardData?.items
      if (!items) return
      const arr = Array.from(items)
      for (const item of arr) {
        if (item.type.startsWith('image/')) {
          const f = item.getAsFile()
          if (f) { handleFile(f); return }
        }
      }
      for (const item of arr) {
        if (item.type === 'text/plain') {
          item.getAsString((text) => {
            const trimmed = text.trim()
            if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
              void handleUrl(trimmed)
            }
          })
          return
        }
      }
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [handleFile, handleUrl, views.length, loading])

  const lightboxView = lightboxId != null
    ? (views.find(v => v.definition.id === lightboxId) ?? null)
    : null

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-3.5 border-b border-rim bg-surface/80 backdrop-blur-md">
        <div>
          <h1 className="text-sm font-semibold text-fg tracking-wide">Image Analyzer</h1>
          <p className="text-xs text-muted mt-0.5">{T.app.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-bg rounded-lg p-0.5 border border-rim">
            {(['nl', 'en'] as const).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`text-xs px-2.5 py-1 rounded-md transition-all ${
                  lang === l
                    ? 'bg-green-700 text-white font-medium'
                    : 'text-muted hover:text-fg'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          {views.length > 0 && (
            <button
              onClick={() => { setViews([]); setFile(null); setLightboxId(null); setUrlError(null); setImageError(null); setDownscaleNotice(false) }}
              className="flex items-center gap-2 text-sm text-muted hover:text-fg transition-colors px-3 py-1.5 rounded-lg border border-rim hover:border-accent/50"
            >
              <RefreshCw size={13} />
              {T.app.newImage}
            </button>
          )}
        </div>
      </header>

      <main className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 text-muted">
            <div className="w-8 h-8 border-2 border-rim border-t-accent rounded-full animate-spin" />
            <p className="text-sm">{T.app.loading}</p>
          </div>
        ) : views.length === 0 ? (
          <>
            {imageError && (
              <div className="max-w-xl mx-auto mb-4 px-4 py-3 rounded-xl border border-red-500/30 bg-red-950/20 text-sm text-red-300">
                {imageError}
              </div>
            )}
            <DropZone onFile={handleFile} onOpenUrlModal={() => setIsUrlModalOpen(true)} />
          </>
        ) : (
          <>
            <VerdictBanner views={views} />
            {downscaleNotice && (
              <p className="text-xs text-muted mb-4">{T.app.downscaleNotice}</p>
            )}
            <ViewGrid views={views} onPanelClick={setLightboxId} />
            <HistogramPanel dataUrl={views.find(v => v.definition.id === 'original')?.dataUrl ?? ''} />
            <PredictionPanel views={views} />
            {file && (
              <ExifPanel
                file={file}
                originalDataUrl={views.find(v => v.definition.id === 'original')?.dataUrl ?? ''}
              />
            )}
            {file && <ExportPanel file={file} views={views} />}
          </>
        )}
      </main>

      {lightboxView !== null && (
        <Lightbox view={lightboxView} onClose={() => setLightboxId(null)} />
      )}

      {isUrlModalOpen && (
        <UrlModal
          onClose={() => { setIsUrlModalOpen(false); setUrlError(null) }}
          onSubmit={handleUrl}
          error={urlError}
        />
      )}

      <ConsentBanner />
      <Analytics />
      <SpeedInsights />
    </div>
  )
}
