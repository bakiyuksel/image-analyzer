import { useState, useCallback, useEffect } from 'react'
import * as Sentry from '@sentry/react'
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
import { Analytics } from '@vercel/analytics/react'

export default function App() {
  if (window.location.pathname !== '/') return <NotFound />

  const { lang, setLang } = useLang()
  const T = translations[lang]
  const [views, setViews] = useState<ProcessedView[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [lightboxId, setLightboxId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [urlError, setUrlError] = useState<string | null>(null)

  const handleFile = useCallback((f: File) => {
    setFile(f)
    const objectUrl = URL.createObjectURL(f)
    const img = new Image()
    img.onload = async () => {
      setLoading(true)
      const start = performance.now()
      const processed = await processImage(img)
      const durationMs = Math.round(performance.now() - start)
      URL.revokeObjectURL(objectUrl)
      setViews(processed)
      setLoading(false)
      Sentry.logger.info('Image analyzed', {
        fileName: f.name,
        fileSize: f.size,
        fileType: f.type,
        viewCount: processed.length,
        durationMs,
      })
    }
    img.src = objectUrl
  }, [])

  const handleUrl = useCallback(async (url: string) => {
    setUrlError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`)
      if (res.status === 422) {
        setLoading(false)
        setUrlError(T.dropzone.urlError.cors)
        return
      }
      if (!res.ok) throw new Error('http')
      const blob = await res.blob()
      const name = url.split('/').pop()?.split('?')[0] ?? 'image'
      handleFile(new File([blob], name, { type: blob.type }))
    } catch {
      setLoading(false)
      setUrlError(T.dropzone.urlError.failed)
    }
  }, [handleFile, T.dropzone.urlError])

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
      <header className="flex items-center justify-between px-6 py-4 border-b border-rim">
        <div>
          <h1 className="text-base font-semibold text-fg tracking-wide">Image Analyzer</h1>
          <p className="text-xs text-muted mt-0.5">{T.app.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {(['nl', 'en'] as const).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`text-xs px-2 py-1 rounded-sm border transition-colors ${
                  lang === l
                    ? 'text-fg border-accent'
                    : 'text-muted border-rim hover:border-accent/60 hover:text-fg'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          {views.length > 0 && (
            <button
              onClick={() => { setViews([]); setFile(null); setLightboxId(null); setUrlError(null) }}
              className="flex items-center gap-2 text-sm text-muted hover:text-fg transition-colors px-3 py-1.5 rounded-sm border border-rim hover:border-accent"
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
          <DropZone onFile={handleFile} onUrl={handleUrl} urlError={urlError} />
        ) : (
          <>
            <VerdictBanner views={views} />
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

      <ConsentBanner />
      <Analytics />
    </div>
  )
}
