import { AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react'
import type { ProcessedView, Prediction } from '../types/image'

function buildPredictions(views: ProcessedView[]): Prediction[] {
  const predictions: Prediction[] = []

  for (const view of views) {
    if (view.score == null) continue

    if (view.definition.id === 'ela') {
      if (view.score > 0.16) {
        predictions.push({
          level: 'alert',
          title: 'Hoge ELA-afwijking',
          detail:
            `Score: ${(view.score * 100).toFixed(1)}% — Meerdere zones reageren significant anders op JPEG re-compressie dan de omgeving. Dit is een sterke indicator van copy-paste, lokale retouche of compositing. Bekijk de ELA-view op heldere vlekken.`,
        })
      } else if (view.score > 0.08) {
        predictions.push({
          level: 'warn',
          title: 'Matige ELA-afwijking',
          detail:
            `Score: ${(view.score * 100).toFixed(1)}% — Lichte JPEG-compressie-inconsistenties aanwezig. Kan duiden op lichte bewerkingen, meerdere opslagrondes of zwaar bijgesneden gebieden.`,
        })
      }
    }

    if (view.definition.id === 'noise-map') {
      if (view.score > 0.55) {
        predictions.push({
          level: 'alert',
          title: 'Sterk wisselend ruispatroon',
          detail:
            `Score: ${(view.score * 100).toFixed(1)}% — Het ruisniveau varieert significant tussen gebieden. Kloonstempels, inpainting of ingeplakte elementen van een andere camera missen de organische ruis van de rest van de foto.`,
        })
      } else if (view.score > 0.35) {
        predictions.push({
          level: 'warn',
          title: 'Wisselend ruispatroon',
          detail:
            `Score: ${(view.score * 100).toFixed(1)}% — Lichte inconsistentie in het ruispatroon. Kan wijzen op zachte retouche, content-aware fill of sterk verschil in scherpte tussen gebieden.`,
        })
      }
    }

    if (view.definition.id === 'sobel') {
      if (view.score > 0.25) {
        predictions.push({
          level: 'warn',
          title: 'Opvallend veel scherpe randen',
          detail:
            `Score: ${(view.score * 100).toFixed(1)}% — Hoge gemiddelde randsterkte. Controleer de Edge Detection-view op halo's of te strak uitgesneden objecten die wijzen op compositing.`,
        })
      }
    }
  }

  if (predictions.length === 0) {
    predictions.push({
      level: 'ok',
      title: 'Geen duidelijke manipulatie-indicatoren',
      detail:
        'De geanalyseerde metrics tonen geen sterke tekenen van bewerking. Dit sluit manipulatie niet uit — beoordeel de views ook visueel, met name ELA en Noise Map.',
    })
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
  const predictions = buildPredictions(views)

  return (
    <div className="mt-8">
      <div className="border-t border-rim mb-6" />
      <h2 className="text-sm font-semibold text-muted uppercase tracking-widest mb-4">
        Analyse
      </h2>
      <div className="flex flex-col gap-3">
        {predictions.map((p, i) => {
          const s = LEVEL_STYLES[p.level]
          return (
            <div
              key={i}
              className={`flex gap-3 px-4 py-3 rounded-sm border ${s.border} ${s.bg}`}
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
