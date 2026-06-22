import { useEffect, useRef } from 'react'
import { useLang } from '../lib/lang-context'
import { translations } from '../lib/i18n'

interface Props {
  dataUrl: string
}

export default function HistogramPanel({ dataUrl }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const warningRef = useRef<string | null>(null)
  const { lang } = useLang()
  const T = translations[lang].histogram

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width, H = canvas.height

    const img = new Image()
    img.onload = () => {
      const tmp = document.createElement('canvas')
      tmp.width = img.naturalWidth; tmp.height = img.naturalHeight
      const tmpCtx = tmp.getContext('2d')!
      tmpCtx.drawImage(img, 0, 0)
      const pixels = tmpCtx.getImageData(0, 0, tmp.width, tmp.height).data

      const r = new Float32Array(256)
      const g = new Float32Array(256)
      const b = new Float32Array(256)
      for (let i = 0; i < pixels.length; i += 4) {
        r[pixels[i]]++
        g[pixels[i + 1]]++
        b[pixels[i + 2]]++
      }

      const slice = (arr: Float32Array) => Array.from(arr).slice(1, 255)
      const peak = Math.max(...slice(r), ...slice(g), ...slice(b))
      const norm = (arr: Float32Array) => arr.map(v => Math.round((v / peak) * (H - 4)))

      const rN = norm(r), gN = norm(g), bN = norm(b)

      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#1d2021'
      ctx.fillRect(0, 0, W, H)

      ctx.strokeStyle = '#3d3226'
      ctx.lineWidth = 1
      for (let x = 64; x < 256; x += 64) {
        const px = Math.round(x * W / 256)
        ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke()
      }

      const channels: [Float32Array, string][] = [
        [bN, 'rgba(100,140,255,0.5)'],
        [gN, 'rgba(100,210,100,0.5)'],
        [rN, 'rgba(255,100,100,0.5)'],
      ]
      for (const [arr, color] of channels) {
        ctx.beginPath()
        ctx.moveTo(0, H)
        for (let i = 0; i < 256; i++) {
          ctx.lineTo(Math.round(i * W / 256), H - arr[i])
        }
        ctx.lineTo(W, H)
        ctx.closePath()
        ctx.fillStyle = color
        ctx.fill()
      }

      const GAP = 5
      let gapFound = false
      for (const arr of [r, g, b]) {
        let run = 0
        for (let i = 10; i < 245; i++) {
          run = arr[i] === 0 ? run + 1 : 0
          if (run >= GAP) { gapFound = true; break }
        }
        if (gapFound) break
      }
      warningRef.current = gapFound ? T.gapWarning : null

      const warn = document.getElementById('histogram-warning')
      if (warn) {
        warn.textContent = warningRef.current ?? ''
        warn.style.display = warningRef.current ? 'flex' : 'none'
      }
    }
    img.src = dataUrl
  }, [dataUrl, T.gapWarning])

  return (
    <div className="mt-8">
      <div className="border-t border-rim mb-6" />
      <h2 className="text-sm font-semibold text-muted uppercase tracking-widest mb-4">{T.heading}</h2>
      <canvas
        ref={canvasRef}
        width={512}
        height={120}
        className="rounded-sm border border-rim w-full max-w-2xl"
        style={{ imageRendering: 'pixelated' }}
      />
      <div className="flex gap-4 mt-2 text-xs text-muted">
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded-sm bg-red-400/70" />{T.red}</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded-sm bg-green-400/70" />{T.green}</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded-sm bg-blue-400/70" />{T.blue}</span>
      </div>
      <div
        id="histogram-warning"
        className="mt-3 hidden items-center gap-2 text-sm text-yellow-300 border border-yellow-800 bg-yellow-950/40 px-4 py-2 rounded-sm max-w-2xl"
      />
    </div>
  )
}
