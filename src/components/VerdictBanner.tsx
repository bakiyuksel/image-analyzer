import { ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react'
import type { ProcessedView } from '../types/image'
import { useLang } from '../lib/lang-context'
import { translations } from '../lib/i18n'

interface Props {
  views: ProcessedView[]
}

function computeVerdict(views: ProcessedView[]) {
  const ela   = views.find(v => v.definition.id === 'ela')?.score ?? 0
  const noise = views.find(v => v.definition.id === 'noise-map')?.score ?? 0
  const sobel = views.find(v => v.definition.id === 'sobel')?.score ?? 0

  let alerts = 0, warns = 0
  if (ela > 0.16) alerts++; else if (ela > 0.08) warns++
  if (noise > 0.55) alerts++; else if (noise > 0.35) warns++
  if (sobel > 0.25) warns++

  // normalize each metric against its alert threshold, weighted
  const score = Math.min(100, Math.round(
    (ela / 0.16) * 50 + (noise / 0.55) * 30 + (sobel / 0.25) * 20
  ))

  if (alerts > 0 || warns >= 3) return { level: 'alert' as const, score }
  if (warns > 0)                 return { level: 'warn'  as const, score }
  return                                { level: 'ok'    as const, score }
}

const STYLES = {
  alert: {
    border: 'border-red-800',
    bg: 'bg-red-950/40',
    icon: <ShieldAlert size={20} className="text-red-400 shrink-0" />,
    title: 'text-red-300',
    bar: 'bg-red-500',
  },
  warn: {
    border: 'border-yellow-800',
    bg: 'bg-yellow-950/40',
    icon: <ShieldQuestion size={20} className="text-yellow-400 shrink-0" />,
    title: 'text-yellow-300',
    bar: 'bg-yellow-500',
  },
  ok: {
    border: 'border-green-900',
    bg: 'bg-green-950/30',
    icon: <ShieldCheck size={20} className="text-green-500 shrink-0" />,
    title: 'text-green-400',
    bar: 'bg-green-500',
  },
}

export default function VerdictBanner({ views }: Props) {
  const { lang } = useLang()
  const T = translations[lang].verdict
  const { level, score } = computeVerdict(views)
  const S = STYLES[level]

  return (
    <div className={`rounded-sm border ${S.border} ${S.bg} px-5 py-4 mb-8`}>
      <div className="flex items-center gap-3 mb-3">
        {S.icon}
        <span className={`text-base font-semibold ${S.title}`}>{T[level]}</span>
        <span className="ml-auto text-xs text-muted">{T.score(String(score))}</span>
      </div>
      <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden mb-3">
        <div className={`h-full ${S.bar} rounded-full transition-all`} style={{ width: `${score}%` }} />
      </div>
      <p className="text-sm text-muted leading-relaxed">{T.subtext[level]}</p>
    </div>
  )
}
