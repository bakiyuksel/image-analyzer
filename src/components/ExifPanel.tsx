import { useEffect, useState, lazy, Suspense } from 'react'
import exifr from 'exifr'
import { AlertTriangle, CheckCircle, ImageOff } from 'lucide-react'
import { useLang } from '../lib/lang-context'
import { translations } from '../lib/i18n'
import type { Lang } from '../lib/i18n'

const GpsMap = lazy(() => import('./GpsMap'))

interface ExifData {
  Make?: string
  Model?: string
  Software?: string
  DateTimeOriginal?: Date | string
  DateTimeDigitized?: Date | string
  DateTime?: Date | string
  GPSLatitude?: number | number[]
  GPSLongitude?: number | number[]
  GPSDateStamp?: string
  ColorSpace?: number
  ExifImageWidth?: number
  ExifImageHeight?: number
  Orientation?: number
}

interface Flag {
  level: 'alert' | 'warn' | 'ok'
  text: string
}

const EDIT_SOFTWARE = ['photoshop', 'gimp', 'lightroom', 'canva', 'picsart', 'snapseed', 'facetune', 'meitu', 'pixlr']

function parseExifDate(d: Date | string | undefined): number | null {
  if (!d) return null
  if (d instanceof Date) return isNaN(d.getTime()) ? null : d.getTime()
  const normalized = String(d).replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3')
  const t = new Date(normalized).getTime()
  return isNaN(t) ? null : t
}

function toDecimalDeg(val: number | number[] | undefined): number | null {
  if (val == null) return null
  if (typeof val === 'number') return val
  return val[0] + (val[1] ?? 0) / 60 + (val[2] ?? 0) / 3600
}

function formatDate(d: Date | string | undefined, locale: string): string {
  if (!d) return '—'
  if (d instanceof Date) return d.toLocaleString(locale)
  return String(d)
}

function analyzeExif(data: ExifData | null, hasThumb: boolean, thumbMismatch: boolean, fileLastModified: number, lang: Lang): Flag[] {
  const TE = translations[lang].exif
  const locale = TE.locale

  if (!data) return [{ level: 'warn', text: TE.noData }]

  const flags: Flag[] = []
  const software = data.Software?.toLowerCase() ?? ''
  const matchedSoftware = EDIT_SOFTWARE.find(s => software.includes(s))

  if (matchedSoftware) {
    flags.push({ level: 'alert', text: TE.softwareFlag(data.Software!) })
  }

  if (!data.Make && !data.Model) {
    flags.push({ level: 'warn', text: TE.noCamera })
  }

  if (!data.DateTimeOriginal && data.DateTimeDigitized) {
    flags.push({ level: 'warn', text: TE.noOriginalDate })
  }

  if (!data.DateTimeOriginal && !data.DateTimeDigitized && !data.DateTime) {
    flags.push({ level: 'warn', text: TE.noDates })
  }

  const captureTime = parseExifDate(data.DateTimeOriginal)
  if (captureTime != null && captureTime > fileLastModified + 60_000) {
    flags.push({
      level: 'alert',
      text: TE.timelineAlert(
        formatDate(data.DateTimeOriginal, locale),
        new Date(fileLastModified).toLocaleString(locale),
      ),
    })
  }

  if (data.GPSDateStamp && data.DateTimeOriginal) {
    const gpsDate = String(data.GPSDateStamp).replace(/:/g, '-').slice(0, 10)
    const captureDate = captureTime != null
      ? new Date(captureTime).toISOString().slice(0, 10)
      : String(data.DateTimeOriginal).replace(/^(\d{4}):(\d{2}):(\d{2}).*/, '$1-$2-$3').slice(0, 10)
    if (gpsDate && captureDate && gpsDate !== captureDate) {
      flags.push({ level: 'warn', text: TE.gpsMismatch(data.GPSDateStamp) })
    }
  } else if ((data.GPSLatitude != null || data.GPSLongitude != null) && !data.GPSDateStamp) {
    flags.push({ level: 'warn', text: TE.gpsNoDate })
  }

  if (hasThumb && thumbMismatch) {
    flags.push({ level: 'alert', text: TE.thumbMismatch })
  }

  if (flags.length === 0) {
    flags.push({ level: 'ok', text: TE.allOk })
  }

  return flags
}

function colorSpaceLabel(cs?: number): string {
  if (cs === 1) return 'sRGB'
  if (cs === 65535) return 'Uncalibrated'
  return cs != null ? String(cs) : '—'
}

interface Props {
  file: File
  originalDataUrl: string
}

export default function ExifPanel({ file, originalDataUrl }: Props) {
  const { lang } = useLang()
  const TE = translations[lang].exif

  const [exif, setExif] = useState<ExifData | null>(null)
  const [thumbUrl, setThumbUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [data, thumb] = await Promise.all([
          exifr.parse(file, { tiff: true, exif: true, gps: true }).catch(() => null),
          exifr.thumbnail(file).catch(() => null),
        ])
        if (cancelled) return
        setExif(data ?? null)
        if (thumb) {
          const blob = new Blob([thumb.slice()], { type: 'image/jpeg' })
          setThumbUrl(URL.createObjectURL(blob))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [file])

  const thumbMismatch = false
  const flags = loading ? [] : analyzeExif(exif, thumbUrl != null, thumbMismatch, file.lastModified, lang)
  const gpsLat = exif ? toDecimalDeg(exif.GPSLatitude) : null
  const gpsLng = exif ? toDecimalDeg(exif.GPSLongitude) : null

  const LEVEL_ICON = {
    alert: <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />,
    warn: <AlertTriangle size={14} className="text-yellow-400 shrink-0 mt-0.5" />,
    ok: <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" />,
  }
  const LEVEL_TEXT = {
    alert: 'text-red-300',
    warn: 'text-yellow-300',
    ok: 'text-green-400',
  }

  const rows: [string, string][] = exif ? [
    [TE.rowLabels.make, exif.Make ?? '—'],
    [TE.rowLabels.model, exif.Model ?? '—'],
    [TE.rowLabels.software, exif.Software ?? '—'],
    [TE.rowLabels.captureDate, formatDate(exif.DateTimeOriginal, TE.locale)],
    [TE.rowLabels.digitizationDate, formatDate(exif.DateTimeDigitized, TE.locale)],
    [TE.rowLabels.fileDate, formatDate(exif.DateTime, TE.locale)],
    [TE.rowLabels.gps, (() => { const lat = toDecimalDeg(exif.GPSLatitude); const lon = toDecimalDeg(exif.GPSLongitude); return lat != null ? `${lat.toFixed(5)}, ${lon?.toFixed(5) ?? '—'}` : '—' })()],
    [TE.rowLabels.colorSpace, colorSpaceLabel(exif.ColorSpace)],
    [TE.rowLabels.dimensions, exif.ExifImageWidth ? `${exif.ExifImageWidth} × ${exif.ExifImageHeight}` : '—'],
  ] : []

  return (
    <div className="mt-8">
      <div className="border-t border-rim mb-6" />
      <h2 className="text-sm font-semibold text-muted uppercase tracking-widest mb-4">{TE.heading}</h2>

      {loading ? (
        <p className="text-sm text-muted">{TE.loading}</p>
      ) : (
        <>
        <div className="flex gap-8 items-start">
          <div className="flex flex-col gap-2 flex-1">
            {flags.map((f, i) => (
              <div key={i} className="flex gap-2 text-sm">
                {LEVEL_ICON[f.level]}
                <span className={LEVEL_TEXT[f.level]}>{f.text}</span>
              </div>
            ))}

            {rows.length > 0 && (
              <table className="mt-4 text-sm border-collapse w-full max-w-lg">
                <tbody>
                  {rows.map(([label, value]) => (
                    <tr key={label} className="border-t border-rim">
                      <td className="py-1.5 pr-4 text-muted w-40 shrink-0">{label}</td>
                      <td className="py-1.5 text-fg font-mono text-xs break-all">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {thumbUrl && (
            <div className="shrink-0">
              <p className="text-xs text-muted mb-2 uppercase tracking-wide">{TE.thumbSection}</p>
              <div className="flex gap-3 items-start">
                <div className="text-center">
                  <img src={thumbUrl} alt={TE.thumbLabel} className="w-32 h-24 object-contain bg-bg border border-rim rounded-sm" />
                  <p className="text-xs text-muted mt-1">{TE.thumbLabel}</p>
                </div>
                <div className="text-center">
                  <img src={originalDataUrl} alt={TE.originalLabel} className="w-32 h-24 object-contain bg-bg border border-rim rounded-sm" />
                  <p className="text-xs text-muted mt-1">{TE.originalLabel}</p>
                </div>
              </div>
              <p className="text-xs text-muted mt-2 max-w-[17rem] leading-relaxed">{TE.thumbNote}</p>
            </div>
          )}

          {!thumbUrl && !loading && (
            <div className="shrink-0 flex flex-col items-center gap-2 text-muted">
              <ImageOff size={24} strokeWidth={1.5} />
              <p className="text-xs">{TE.noThumb}</p>
            </div>
          )}
        </div>

        {gpsLat != null && gpsLng != null && (
          <div className="mt-6 max-w-2xl">
            <p className="text-xs text-muted uppercase tracking-wide mb-2">GPS</p>
            <Suspense fallback={<div className="w-full rounded-sm border border-rim bg-bg" style={{ height: '180px' }} />}>
              <GpsMap lat={gpsLat} lng={gpsLng} />
            </Suspense>
          </div>
        )}
        </>
      )}
    </div>
  )
}
