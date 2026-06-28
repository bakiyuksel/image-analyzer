import { AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react'
import type { ProcessedView, Prediction } from '../types/image'
import { useLang } from '../lib/lang-context'
import { translations } from '../lib/i18n'
import type { Lang } from '../lib/i18n'
import { THRESHOLDS } from '../lib/thresholds'

function buildPredictions(views: ProcessedView[], lang: Lang): Prediction[] {
  const T = translations[lang].prediction
  const predictions: Prediction[] = []

  for (const view of views) {
    if (view.score == null) continue
    const score = (view.score * 100).toFixed(1)

    if (view.definition.id === 'ela') {
      if (view.score > THRESHOLDS.ela.alert) {
        predictions.push({ level: 'alert', title: T.elaHighTitle, detail: T.elaHighDetail(score) })
      } else if (view.score > THRESHOLDS.ela.warn) {
        predictions.push({ level: 'warn', title: T.elaWarnTitle, detail: T.elaWarnDetail(score) })
      }
    }

    if (view.definition.id === 'noise-map') {
      if (view.score > THRESHOLDS.noise.alert) {
        predictions.push({ level: 'alert', title: T.noiseHighTitle, detail: T.noiseHighDetail(score) })
      } else if (view.score > THRESHOLDS.noise.warn) {
        predictions.push({ level: 'warn', title: T.noiseWarnTitle, detail: T.noiseWarnDetail(score) })
      }
    }

    if (view.definition.id === 'sobel') {
      if (view.score > THRESHOLDS.sobel.warn) {
        predictions.push({ level: 'warn', title: T.sobelWarnTitle, detail: T.sobelWarnDetail(score) })
      }
    }

    if (view.definition.id === 'jpeg-ghost') {
      if (view.score > THRESHOLDS['jpeg-ghost'].alert) {
        predictions.push({ level: 'alert', title: T.jpegGhostHighTitle, detail: T.jpegGhostHighDetail(score) })
      } else if (view.score > THRESHOLDS['jpeg-ghost'].warn) {
        predictions.push({ level: 'warn', title: T.jpegGhostWarnTitle, detail: T.jpegGhostWarnDetail(score) })
      }
    }

    if (view.definition.id === 'clone-detect') {
      if (view.score > THRESHOLDS['clone-detect'].alert) {
        predictions.push({ level: 'alert', title: T.cloneHighTitle, detail: T.cloneHighDetail(score) })
      } else if (view.score > THRESHOLDS['clone-detect'].warn) {
        predictions.push({ level: 'warn', title: T.cloneWarnTitle, detail: T.cloneWarnDetail(score) })
      }
    }

    if (view.definition.id === 'fft-spectrum') {
      if (view.score > THRESHOLDS['fft-spectrum'].alert) {
        predictions.push({ level: 'alert', title: T.fftHighTitle, detail: T.fftHighDetail(score) })
      } else if (view.score > THRESHOLDS['fft-spectrum'].warn) {
        predictions.push({ level: 'warn', title: T.fftWarnTitle, detail: T.fftWarnDetail(score) })
      }
    }
  }

  if (predictions.length === 0) {
    predictions.push({ level: 'ok', title: T.okTitle, detail: T.okDetail })
  }

  return predictions
}

const LEVEL_STYLES = {
  alert: {
    border: 'border-red-500/25',
    bg: 'bg-red-950/20',
    icon: <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5" />,
    title: 'text-red-300',
  },
  warn: {
    border: 'border-yellow-500/25',
    bg: 'bg-yellow-950/20',
    icon: <AlertTriangle size={16} className="text-yellow-400 shrink-0 mt-0.5" />,
    title: 'text-yellow-300',
  },
  ok: {
    border: 'border-emerald-500/25',
    bg: 'bg-emerald-950/20',
    icon: <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />,
    title: 'text-emerald-300',
  },
}

interface Props {
  views: ProcessedView[]
}

export default function PredictionPanel({ views }: Props) {
  const { lang } = useLang()
  const predictions = buildPredictions(views, lang)

  return (
    <div className="mt-8">
      <div className="border-t border-rim mb-6" />
      <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
        {translations[lang].prediction.heading}
      </h2>
      <div className="flex flex-col gap-3">
        {predictions.map((p, i) => {
          const s = LEVEL_STYLES[p.level]
          return (
            <div
              key={i}
              className={`animate-fade-in-up flex gap-3 px-4 py-3.5 rounded-xl border ${s.border} ${s.bg}`}
              style={{ animationDelay: `${i * 75}ms` }}
            >
              {s.icon}
              <div>
                <p className={`text-sm font-semibold mb-0.5 ${s.title}`}>{p.title}</p>
                <p className="text-sm text-muted leading-relaxed">{p.detail}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
