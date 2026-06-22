import { AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react'
import type { ProcessedView, Prediction } from '../types/image'
import { useLang } from '../lib/lang-context'
import { translations } from '../lib/i18n'
import type { Lang } from '../lib/i18n'

function buildPredictions(views: ProcessedView[], lang: Lang): Prediction[] {
  const T = translations[lang].prediction
  const predictions: Prediction[] = []

  for (const view of views) {
    if (view.score == null) continue
    const score = (view.score * 100).toFixed(1)

    if (view.definition.id === 'ela') {
      if (view.score > 0.16) {
        predictions.push({ level: 'alert', title: T.elaHighTitle, detail: T.elaHighDetail(score) })
      } else if (view.score > 0.08) {
        predictions.push({ level: 'warn', title: T.elaWarnTitle, detail: T.elaWarnDetail(score) })
      }
    }

    if (view.definition.id === 'noise-map') {
      if (view.score > 0.55) {
        predictions.push({ level: 'alert', title: T.noiseHighTitle, detail: T.noiseHighDetail(score) })
      } else if (view.score > 0.35) {
        predictions.push({ level: 'warn', title: T.noiseWarnTitle, detail: T.noiseWarnDetail(score) })
      }
    }

    if (view.definition.id === 'sobel') {
      if (view.score > 0.25) {
        predictions.push({ level: 'warn', title: T.sobelWarnTitle, detail: T.sobelWarnDetail(score) })
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
    border: 'border-red-800',
    bg: 'bg-red-950/40',
    icon: <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5" />,
    title: 'text-red-300',
  },
  warn: {
    border: 'border-yellow-800',
    bg: 'bg-yellow-950/40',
    icon: <AlertTriangle size={16} className="text-yellow-400 shrink-0 mt-0.5" />,
    title: 'text-yellow-300',
  },
  ok: {
    border: 'border-green-900',
    bg: 'bg-green-950/30',
    icon: <ShieldCheck size={16} className="text-green-500 shrink-0 mt-0.5" />,
    title: 'text-green-400',
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
      <h2 className="text-sm font-semibold text-muted uppercase tracking-widest mb-4">
        {translations[lang].prediction.heading}
      </h2>
      <div className="flex flex-col gap-3">
        {predictions.map((p, i) => {
          const s = LEVEL_STYLES[p.level]
          return (
            <div key={i} className={`flex gap-3 px-4 py-3 rounded-sm border ${s.border} ${s.bg}`}>
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
