import { useEffect, useState } from 'react'
import exifr from 'exifr'
import { AlertTriangle, CheckCircle, ImageOff } from 'lucide-react'

interface ExifData {
  Make?: string
  Model?: string
  Software?: string
  DateTimeOriginal?: Date | string
  DateTimeDigitized?: Date | string
  DateTime?: Date | string
  GPSLatitude?: number
  GPSLongitude?: number
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

function analyzeExif(data: ExifData | null, hasThumb: boolean, thumbMismatch: boolean, fileLastModified: number): Flag[] {
  if (!data) return [{ level: 'warn', text: 'Geen EXIF-data gevonden — foto is mogelijk gestript of nooit met een camera gemaakt.' }]

  const flags: Flag[] = []
  const software = data.Software?.toLowerCase() ?? ''
  const matchedSoftware = EDIT_SOFTWARE.find(s => software.includes(s))

  if (matchedSoftware) {
    flags.push({ level: 'alert', text: `Software-veld bevat "${data.Software}" — direct bewijs dat de foto door bewerkingssoftware is gegaan.` })
  }

  if (!data.Make && !data.Model) {
    flags.push({ level: 'warn', text: 'Camera make/model ontbreekt — originele opnamen bevatten dit normaal altijd.' })
  }

  if (!data.DateTimeOriginal && data.DateTimeDigitized) {
    flags.push({ level: 'warn', text: 'DateTimeOriginal ontbreekt maar DateTimeDigitized aanwezig — wijst op herverwerking of export.' })
  }

  if (!data.DateTimeOriginal && !data.DateTimeDigitized && !data.DateTime) {
    flags.push({ level: 'warn', text: 'Alle datumvelden ontbreken — gestripte EXIF of synthetisch gegenereerd beeld.' })
  }

  // Timeline: opnamedatum mag niet later zijn dan bestandsdatum
  const captureTime = parseExifDate(data.DateTimeOriginal)
  if (captureTime != null && captureTime > fileLastModified + 60_000) {
    flags.push({
      level: 'alert',
      text: `Opnamedatum (${formatDate(data.DateTimeOriginal)}) ligt NA bestandsdatum (${new Date(fileLastModified).toLocaleString('nl-NL')}) — onmogelijk bij een authentiek bestand.`,
    })
  }

  // GPS datum vs opnamedatum
  if (data.GPSDateStamp && data.DateTimeOriginal) {
    const gpsDate = String(data.GPSDateStamp).replace(/:/g, '-').slice(0, 10)
    const captureDate = captureTime != null
      ? new Date(captureTime).toISOString().slice(0, 10)
      : String(data.DateTimeOriginal).replace(/^(\d{4}):(\d{2}):(\d{2}).*/, '$1-$2-$3').slice(0, 10)
    if (gpsDate && captureDate && gpsDate !== captureDate) {
      flags.push({ level: 'warn', text: `GPS-datum (${data.GPSDateStamp}) wijkt af van opnamedatum — locatie mogelijk achteraf toegevoegd.` })
    }
  } else if ((data.GPSLatitude != null || data.GPSLongitude != null) && !data.GPSDateStamp) {
    flags.push({ level: 'warn', text: 'GPS-coördinaten aanwezig maar GPS-datumstempel ontbreekt — inconsistente metadata.' })
  }

  if (hasThumb && thumbMismatch) {
    flags.push({ level: 'alert', text: 'Embedded thumbnail matcht niet met de hoofdafbeelding — klassiek teken van bewerking na export.' })
  }

  if (flags.length === 0) {
    flags.push({ level: 'ok', text: 'Geen verdachte metadata-indicatoren gevonden.' })
  }

  return flags
}

function formatDate(d?: Date | string): string {
  if (!d) return '—'
  if (d instanceof Date) return d.toLocaleString('nl-NL')
  return String(d)
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

  // Simple thumbnail mismatch: compare thumbnail dimensions vs reported EXIF dimensions
  const thumbMismatch = false // visual comparison only — user judges

  const flags = loading ? [] : analyzeExif(exif, thumbUrl != null, thumbMismatch, file.lastModified)

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
    ['Make', exif.Make ?? '—'],
    ['Model', exif.Model ?? '—'],
    ['Software', exif.Software ?? '—'],
    ['Opnamedatum', formatDate(exif.DateTimeOriginal)],
    ['Digitalisatiedatum', formatDate(exif.DateTimeDigitized)],
    ['Bestandsdatum', formatDate(exif.DateTime)],
    ['GPS', exif.GPSLatitude != null ? `${exif.GPSLatitude.toFixed(5)}, ${exif.GPSLongitude?.toFixed(5)}` : '—'],
    ['Kleurruimte', colorSpaceLabel(exif.ColorSpace)],
    ['Afmetingen (EXIF)', exif.ExifImageWidth ? `${exif.ExifImageWidth} × ${exif.ExifImageHeight}` : '—'],
  ] : []

  return (
    <div className="mt-8">
      <div className="border-t border-rim mb-6" />
      <h2 className="text-sm font-semibold text-muted uppercase tracking-widest mb-4">EXIF Metadata</h2>

      {loading ? (
        <p className="text-sm text-muted">Metadata laden…</p>
      ) : (
        <div className="flex gap-8 items-start">
          {/* Flags */}
          <div className="flex flex-col gap-2 flex-1">
            {flags.map((f, i) => (
              <div key={i} className="flex gap-2 text-sm">
                {LEVEL_ICON[f.level]}
                <span className={LEVEL_TEXT[f.level]}>{f.text}</span>
              </div>
            ))}

            {/* Metadata tabel */}
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

          {/* Thumbnail vergelijking */}
          {thumbUrl && (
            <div className="shrink-0">
              <p className="text-xs text-muted mb-2 uppercase tracking-wide">Thumbnail vs origineel</p>
              <div className="flex gap-3 items-start">
                <div className="text-center">
                  <img src={thumbUrl} alt="Embedded thumbnail" className="w-32 h-24 object-contain bg-bg border border-rim rounded-sm" />
                  <p className="text-xs text-muted mt-1">Thumbnail</p>
                </div>
                <div className="text-center">
                  <img src={originalDataUrl} alt="Origineel" className="w-32 h-24 object-contain bg-bg border border-rim rounded-sm" />
                  <p className="text-xs text-muted mt-1">Origineel</p>
                </div>
              </div>
              <p className="text-xs text-muted mt-2 max-w-[17rem] leading-relaxed">
                Als thumbnail en origineel duidelijk verschillen is de foto na de thumbnailgeneratie bewerkt.
              </p>
            </div>
          )}

          {!thumbUrl && !loading && (
            <div className="shrink-0 flex flex-col items-center gap-2 text-muted">
              <ImageOff size={24} strokeWidth={1.5} />
              <p className="text-xs">Geen embedded thumbnail</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
