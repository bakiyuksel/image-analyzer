import { useEffect, useState } from 'react'
import { ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react'
import type { ProcessedView } from '../types/image'
import { useLang } from '../lib/lang-context'
import { translations } from '../lib/i18n'
import { THRESHOLDS } from '../lib/thresholds'

interface Props {
  views: ProcessedView[]
}

function computeVerdict(views: ProcessedView[]) {
  const ela        = views.find(v => v.definition.id === 'ela')?.score ?? 0
  const noise      = views.find(v => v.definition.id === 'noise-map')?.score ?? 0
  const sobel      = views.find(v => v.definition.id === 'sobel')?.score ?? 0
  const jpegGhost  = views.find(v => v.definition.id === 'jpeg-ghost')?.score ?? 0
  const clone      = views.find(v => v.definition.id === 'clone-detect')?.score ?? 0
  const fft        = views.find(v => v.definition.id === 'fft-spectrum')?.score ?? 0

  let alerts = 0, warns = 0
  if (ela > THRESHOLDS.ela.alert) alerts++; else if (ela > THRESHOLDS.ela.warn) warns++
  if (noise > THRESHOLDS.noise.alert) alerts++; else if (noise > THRESHOLDS.noise.warn) warns++
  if (sobel > THRESHOLDS.sobel.warn) warns++
  if (jpegGhost > THRESHOLDS['jpeg-ghost'].alert) alerts++; else if (jpegGhost > THRESHOLDS['jpeg-ghost'].warn) warns++
  if (clone > THRESHOLDS['clone-detect'].alert) alerts++; else if (clone > THRESHOLDS['clone-detect'].warn) warns++
  if (fft > THRESHOLDS['fft-spectrum'].alert) alerts++; else if (fft > THRESHOLDS['fft-spectrum'].warn) warns++

  const score = Math.round(
    Math.min(1, ela / THRESHOLDS.ela.alert) * 45 +
    Math.min(1, noise / THRESHOLDS.noise.alert) * 25 +
    Math.min(1, sobel / THRESHOLDS.sobel.warn) * 15 +
    Math.min(1, jpegGhost / THRESHOLDS['jpeg-ghost'].alert) * 5 +
    Math.min(1, clone / THRESHOLDS['clone-detect'].alert) * 8 +
    Math.min(1, fft / THRESHOLDS['fft-spectrum'].alert) * 2
  )

  if (alerts > 0 || warns >= 3) return { level: 'alert' as const, score }
  if (warns > 0)                 return { level: 'warn'  as const, score }
  return                                { level: 'ok'    as const, score }
}

const STYLES = {
  alert: {
    border: 'border-red-500/30',
    bg: 'bg-red-950/20',
    bar: 'bg-gradient-to-r from-red-600 to-red-400',
    icon: <ShieldAlert size={22} className="text-red-400" />,
    iconBg: 'bg-red-950/60',
    title: 'text-red-300',
  },
  warn: {
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-950/20',
    bar: 'bg-gradient-to-r from-yellow-600 to-yellow-400',
    icon: <ShieldQuestion size={22} className="text-yellow-400" />,
    iconBg: 'bg-yellow-950/60',
    title: 'text-yellow-300',
  },
  ok: {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-950/20',
    bar: 'bg-gradient-to-r from-emerald-600 to-emerald-400',
    icon: <ShieldCheck size={22} className="text-emerald-400" />,
    iconBg: 'bg-emerald-950/60',
    title: 'text-emerald-300',
  },
}

function useCountUp(target: number, duration = 900) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(eased * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])
  return display
}

export default function VerdictBanner({ views }: Props) {
  const { lang } = useLang()
  const T = translations[lang].verdict
  const { level, score } = computeVerdict(views)
  const S = STYLES[level]
  const displayScore = useCountUp(score)

  return (
    <div className={`animate-fade-in-up rounded-2xl border ${S.border} ${S.bg} overflow-hidden mb-8`}>
      <div className="px-6 py-5">
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-2.5 rounded-xl ${S.iconBg} shrink-0`}>
            {S.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-base font-semibold ${S.title}`}>{T[level]}</p>
            <p className="text-xs text-muted mt-0.5 leading-relaxed">{T.subtext[level]}</p>
          </div>
          <div className="text-right shrink-0">
            <p className={`text-4xl font-bold tabular-nums ${S.title}`}>{displayScore}</p>
            <p className="text-xs text-muted">/ 100</p>
          </div>
        </div>
        <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden">
          <div
            className={`h-full ${S.bar} rounded-full transition-all duration-700`}
            style={{ width: `${displayScore}%` }}
          />
        </div>
      </div>
    </div>
  )
}
