import type { ViewDefinition, ProcessedView } from '../types/image'

// ─── canvas pixel transforms ──────────────────────────────────────────────────

function grayscale(data: ImageData): ImageData {
  const d = new Uint8ClampedArray(data.data)
  for (let i = 0; i < d.length; i += 4) {
    const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
    d[i] = d[i + 1] = d[i + 2] = lum
  }
  return new ImageData(d, data.width, data.height)
}

function negative(data: ImageData): ImageData {
  const d = new Uint8ClampedArray(data.data)
  for (let i = 0; i < d.length; i += 4) {
    d[i] = 255 - d[i]; d[i + 1] = 255 - d[i + 1]; d[i + 2] = 255 - d[i + 2]
  }
  return new ImageData(d, data.width, data.height)
}

function redChannel(data: ImageData): ImageData {
  const d = new Uint8ClampedArray(data.data)
  for (let i = 0; i < d.length; i += 4) { const v = d[i]; d[i] = d[i + 1] = d[i + 2] = v }
  return new ImageData(d, data.width, data.height)
}

function greenChannel(data: ImageData): ImageData {
  const d = new Uint8ClampedArray(data.data)
  for (let i = 0; i < d.length; i += 4) { const v = d[i + 1]; d[i] = d[i + 1] = d[i + 2] = v }
  return new ImageData(d, data.width, data.height)
}

function blueChannel(data: ImageData): ImageData {
  const d = new Uint8ClampedArray(data.data)
  for (let i = 0; i < d.length; i += 4) { const v = d[i + 2]; d[i] = d[i + 1] = d[i + 2] = v }
  return new ImageData(d, data.width, data.height)
}

function hueChannel(data: ImageData): ImageData {
  const d = data.data
  const result = new Uint8ClampedArray(d.length)
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min
    let h = 0
    if (delta > 0) {
      if (max === r) h = ((g - b) / delta) % 6
      else if (max === g) h = (b - r) / delta + 2
      else h = (r - g) / delta + 4
      h = h * 60; if (h < 0) h += 360
    }
    const v = Math.round(h / 360 * 255)
    result[i] = result[i + 1] = result[i + 2] = v; result[i + 3] = 255
  }
  return new ImageData(result, data.width, data.height)
}

function saturationChannel(data: ImageData): ImageData {
  const d = data.data
  const result = new Uint8ClampedArray(d.length)
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255
    const max = Math.max(r, g, b)
    const s = max === 0 ? 0 : (max - Math.min(r, g, b)) / max
    const v = Math.round(s * 255)
    result[i] = result[i + 1] = result[i + 2] = v; result[i + 3] = 255
  }
  return new ImageData(result, data.width, data.height)
}

function sobelEdges(data: ImageData): ImageData {
  const W = data.width, H = data.height, d = data.data
  const gray = new Float32Array(W * H)
  for (let i = 0; i < W * H; i++)
    gray[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]
  const result = new Uint8ClampedArray(d.length)
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const tl = gray[(y-1)*W+x-1], tc = gray[(y-1)*W+x], tr = gray[(y-1)*W+x+1]
      const ml = gray[y*W+x-1],                             mr = gray[y*W+x+1]
      const bl = gray[(y+1)*W+x-1], bc = gray[(y+1)*W+x], br = gray[(y+1)*W+x+1]
      const Gx = -tl - 2*ml - bl + tr + 2*mr + br
      const Gy =  tl + 2*tc + tr - bl - 2*bc - br
      const mag = Math.min(255, Math.sqrt(Gx*Gx + Gy*Gy))
      const idx = (y*W+x)*4
      result[idx] = result[idx+1] = result[idx+2] = mag; result[idx+3] = 255
    }
  }
  return new ImageData(result, W, H)
}

function noiseMap(data: ImageData): ImageData {
  const W = data.width, H = data.height, d = data.data
  let src = new Float32Array(W * H * 3)
  for (let i = 0; i < W * H; i++) {
    src[i*3] = d[i*4]; src[i*3+1] = d[i*4+1]; src[i*3+2] = d[i*4+2]
  }
  for (let pass = 0; pass < 3; pass++) {
    const blurred = new Float32Array(W * H * 3)
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        let r = 0, g = 0, b = 0, count = 0
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ny = Math.max(0, Math.min(H-1, y+dy)), nx = Math.max(0, Math.min(W-1, x+dx))
            const idx = (ny*W+nx)*3
            r += src[idx]; g += src[idx+1]; b += src[idx+2]; count++
          }
        }
        const idx = (y*W+x)*3
        blurred[idx] = r/count; blurred[idx+1] = g/count; blurred[idx+2] = b/count
      }
    }
    src = blurred
  }
  const result = new Uint8ClampedArray(d.length)
  const SCALE = 8, OFFSET = 128
  for (let i = 0; i < W*H; i++) {
    result[i*4]   = Math.max(0, Math.min(255, (d[i*4]   - src[i*3])   * SCALE + OFFSET))
    result[i*4+1] = Math.max(0, Math.min(255, (d[i*4+1] - src[i*3+1]) * SCALE + OFFSET))
    result[i*4+2] = Math.max(0, Math.min(255, (d[i*4+2] - src[i*3+2]) * SCALE + OFFSET))
    result[i*4+3] = 255
  }
  return new ImageData(result, W, H)
}

// ─── clone detection (copy-move heuristic, async) ────────────────────────────

async function cloneDetect(img: HTMLImageElement): Promise<{ dataUrl: string }> {
  const MAX = 512
  const scale = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight))
  const SW = Math.round(img.naturalWidth * scale), SH = Math.round(img.naturalHeight * scale)

  const small = document.createElement('canvas')
  small.width = SW; small.height = SH
  const sCtx = small.getContext('2d')!
  sCtx.drawImage(img, 0, 0, SW, SH)
  const pixels = sCtx.getImageData(0, 0, SW, SH).data

  const BLOCK = 16, STRIDE = 8
  const blocks: { x: number; y: number; sig: string }[] = []

  for (let y = 0; y <= SH - BLOCK; y += STRIDE) {
    for (let x = 0; x <= SW - BLOCK; x += STRIDE) {
      // Quadrant means (2×2 grid of sub-blocks) for a more discriminating signature
      const qr = [0, 0, 0, 0], qg = [0, 0, 0, 0], qb = [0, 0, 0, 0], qc = [0, 0, 0, 0]
      for (let dy = 0; dy < BLOCK; dy++) {
        for (let dx = 0; dx < BLOCK; dx++) {
          const qi = (dy < BLOCK / 2 ? 0 : 2) + (dx < BLOCK / 2 ? 0 : 1)
          const idx = ((y + dy) * SW + (x + dx)) * 4
          qr[qi] += pixels[idx]; qg[qi] += pixels[idx + 1]; qb[qi] += pixels[idx + 2]; qc[qi]++
        }
      }
      // Quantize to 5-bit per channel per quadrant → reduce false positives
      const sig = qr.map((_, i) =>
        `${Math.round(qr[i] / qc[i] / 8)},${Math.round(qg[i] / qc[i] / 8)},${Math.round(qb[i] / qc[i] / 8)}`
      ).join('|')
      blocks.push({ x, y, sig })
    }
  }

  // Group blocks by signature
  const groups = new Map<string, { x: number; y: number }[]>()
  for (const b of blocks) {
    if (!groups.has(b.sig)) groups.set(b.sig, [])
    groups.get(b.sig)!.push({ x: b.x, y: b.y })
  }

  // Collect suspicious blocks: same sig, distance > 32px in scaled space
  const MIN_DIST = 32
  const suspicious = new Set<string>()
  for (const positions of groups.values()) {
    if (positions.length < 2) continue
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dx = positions[i].x - positions[j].x, dy = positions[i].y - positions[j].y
        if (Math.sqrt(dx * dx + dy * dy) >= MIN_DIST) {
          suspicious.add(`${positions[i].x},${positions[i].y}`)
          suspicious.add(`${positions[j].x},${positions[j].y}`)
        }
      }
    }
  }

  // Draw on full-resolution canvas
  const out = document.createElement('canvas')
  out.width = img.naturalWidth; out.height = img.naturalHeight
  const oCtx = out.getContext('2d')!
  oCtx.drawImage(img, 0, 0)

  if (suspicious.size > 0) {
    oCtx.fillStyle = 'rgba(255, 60, 60, 0.45)'
    for (const key of suspicious) {
      const [sx, sy] = key.split(',').map(Number)
      const fx = Math.round(sx / scale), fy = Math.round(sy / scale)
      const fw = Math.round(BLOCK / scale), fh = Math.round(BLOCK / scale)
      oCtx.fillRect(fx, fy, fw, fh)
    }
  }

  return { dataUrl: out.toDataURL('image/jpeg', 0.92) }
}

// ─── scoring helpers ──────────────────────────────────────────────────────────

function scoreMeanBrightness(data: ImageData): number {
  const d = data.data
  let total = 0
  for (let i = 0; i < d.length; i += 4) total += (d[i] + d[i+1] + d[i+2]) / 3
  return total / (data.width * data.height * 255)
}

function scoreNoiseVariance(data: ImageData): number {
  const d = data.data, n = data.width * data.height
  let sum = 0
  for (let i = 0; i < d.length; i += 4) sum += d[i]
  const mean = sum / n
  let variance = 0
  for (let i = 0; i < d.length; i += 4) variance += (d[i] - mean) ** 2
  return Math.sqrt(variance / n) / 128
}

// ─── ELA (async — JPEG round-trip) ───────────────────────────────────────────

async function ela(img: HTMLImageElement): Promise<{ dataUrl: string; score: number }> {
  const W = img.naturalWidth, H = img.naturalHeight

  const origCanvas = document.createElement('canvas')
  origCanvas.width = W; origCanvas.height = H
  const origCtx = origCanvas.getContext('2d')!
  origCtx.drawImage(img, 0, 0)
  const origData = origCtx.getImageData(0, 0, W, H).data

  const jpegUrl = origCanvas.toDataURL('image/jpeg', 0.75)
  const reImg = new Image()
  await new Promise<void>(resolve => { reImg.onload = () => resolve(); reImg.src = jpegUrl })

  const reCanvas = document.createElement('canvas')
  reCanvas.width = W; reCanvas.height = H
  const reCtx = reCanvas.getContext('2d')!
  reCtx.drawImage(reImg, 0, 0)
  const reData = reCtx.getImageData(0, 0, W, H).data

  const diff = new Uint8ClampedArray(origData.length)
  const SCALE = 20
  let total = 0
  for (let i = 0; i < origData.length; i += 4) {
    diff[i]   = Math.min(255, Math.abs(origData[i]   - reData[i])   * SCALE)
    diff[i+1] = Math.min(255, Math.abs(origData[i+1] - reData[i+1]) * SCALE)
    diff[i+2] = Math.min(255, Math.abs(origData[i+2] - reData[i+2]) * SCALE)
    diff[i+3] = 255
    total += (diff[i] + diff[i+1] + diff[i+2]) / 3
  }
  const score = total / (W * H * 255)

  const out = document.createElement('canvas')
  out.width = W; out.height = H
  out.getContext('2d')!.putImageData(new ImageData(diff, W, H), 0, 0)
  return { dataUrl: out.toDataURL('image/jpeg', 0.92), score }
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.src = src
  })
}

// ─── 1D Cooley-Tukey FFT (in-place, power-of-2 length) ───────────────────────

function fft1d(re: Float64Array, im: Float64Array): void {
  const n = re.length
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1
    for (; j & bit; bit >>= 1) j ^= bit
    j ^= bit
    if (i < j) {
      let t = re[i]; re[i] = re[j]; re[j] = t
      t = im[i]; im[i] = im[j]; im[j] = t
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len
    const wRe = Math.cos(ang), wIm = Math.sin(ang)
    for (let i = 0; i < n; i += len) {
      let xRe = 1, xIm = 0
      for (let j = 0; j < (len >> 1); j++) {
        const uRe = re[i + j], uIm = im[i + j]
        const vRe = re[i + j + (len >> 1)] * xRe - im[i + j + (len >> 1)] * xIm
        const vIm = re[i + j + (len >> 1)] * xIm + im[i + j + (len >> 1)] * xRe
        re[i + j] = uRe + vRe; im[i + j] = uIm + vIm
        re[i + j + (len >> 1)] = uRe - vRe; im[i + j + (len >> 1)] = uIm - vIm
        const nxRe = xRe * wRe - xIm * wIm
        xIm = xRe * wIm + xIm * wRe
        xRe = nxRe
      }
    }
  }
}

// ─── JPEG Ghost (multi-quality compression fingerprint) ───────────────────────

async function jpegGhost(img: HTMLImageElement): Promise<{ dataUrl: string }> {
  const MAX = 800
  const scale = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight))
  const W = Math.round(img.naturalWidth * scale), H = Math.round(img.naturalHeight * scale)
  const N = W * H

  const origCanvas = document.createElement('canvas')
  origCanvas.width = W; origCanvas.height = H
  const origCtx = origCanvas.getContext('2d')!
  origCtx.drawImage(img, 0, 0, W, H)
  const origData = origCtx.getImageData(0, 0, W, H).data

  const QUALITIES = [0.50, 0.62, 0.72, 0.80, 0.88, 0.95]
  const errors: Float32Array[] = []

  for (const q of QUALITIES) {
    const reImg = await loadImage(origCanvas.toDataURL('image/jpeg', q))
    const tmp = document.createElement('canvas')
    tmp.width = W; tmp.height = H
    tmp.getContext('2d')!.drawImage(reImg, 0, 0)
    const reData = tmp.getContext('2d')!.getImageData(0, 0, W, H).data
    const err = new Float32Array(N)
    for (let i = 0; i < N; i++) {
      const dr = origData[i * 4] - reData[i * 4]
      const dg = origData[i * 4 + 1] - reData[i * 4 + 1]
      const db = origData[i * 4 + 2] - reData[i * 4 + 2]
      err[i] = dr * dr + dg * dg + db * db
    }
    errors.push(err)
  }

  const bestQ = new Uint8Array(N)
  for (let i = 0; i < N; i++) {
    let minErr = Infinity, best = 0
    for (let q = 0; q < QUALITIES.length; q++) {
      if (errors[q][i] < minErr) { minErr = errors[q][i]; best = q }
    }
    bestQ[i] = best
  }

  const votes = new Int32Array(QUALITIES.length)
  for (let i = 0; i < N; i++) votes[bestQ[i]]++
  let domQ = 0
  for (let q = 1; q < QUALITIES.length; q++) if (votes[q] > votes[domQ]) domQ = q

  const result = new Uint8ClampedArray(N * 4)
  for (let i = 0; i < N; i++) {
    const errAtDom = Math.sqrt(errors[domQ][i])
    if (bestQ[i] === domQ) {
      const v = Math.min(50, errAtDom * 0.5)
      result[i * 4] = result[i * 4 + 1] = result[i * 4 + 2] = v
    } else {
      result[i * 4] = Math.min(255, errAtDom * 2.5)
      result[i * 4 + 1] = Math.min(80, errAtDom * 0.5)
      result[i * 4 + 2] = 0
    }
    result[i * 4 + 3] = 255
  }

  const small = document.createElement('canvas')
  small.width = W; small.height = H
  small.getContext('2d')!.putImageData(new ImageData(result, W, H), 0, 0)

  const out = document.createElement('canvas')
  out.width = img.naturalWidth; out.height = img.naturalHeight
  const oCtx = out.getContext('2d')!
  oCtx.imageSmoothingEnabled = false
  oCtx.drawImage(small, 0, 0, out.width, out.height)
  return { dataUrl: out.toDataURL('image/jpeg', 0.92) }
}

// ─── FFT Spectrum (2D Fourier transform visualization) ────────────────────────

async function fftSpectrum(img: HTMLImageElement): Promise<{ dataUrl: string }> {
  const SIZE = 256

  const small = document.createElement('canvas')
  small.width = SIZE; small.height = SIZE
  small.getContext('2d')!.drawImage(img, 0, 0, SIZE, SIZE)
  const pixels = small.getContext('2d')!.getImageData(0, 0, SIZE, SIZE).data

  const re = new Float64Array(SIZE * SIZE)
  const im = new Float64Array(SIZE * SIZE)
  for (let y = 0; y < SIZE; y++) {
    const wy = 0.54 - 0.46 * Math.cos((2 * Math.PI * y) / (SIZE - 1))
    for (let x = 0; x < SIZE; x++) {
      const wx = 0.54 - 0.46 * Math.cos((2 * Math.PI * x) / (SIZE - 1))
      const i = y * SIZE + x
      re[i] = (0.299 * pixels[i * 4] + 0.587 * pixels[i * 4 + 1] + 0.114 * pixels[i * 4 + 2]) / 255 * wx * wy
    }
  }

  const rowRe = new Float64Array(SIZE), rowIm = new Float64Array(SIZE)
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) { rowRe[x] = re[y * SIZE + x]; rowIm[x] = im[y * SIZE + x] }
    fft1d(rowRe, rowIm)
    for (let x = 0; x < SIZE; x++) { re[y * SIZE + x] = rowRe[x]; im[y * SIZE + x] = rowIm[x] }
  }
  const colRe = new Float64Array(SIZE), colIm = new Float64Array(SIZE)
  for (let x = 0; x < SIZE; x++) {
    for (let y = 0; y < SIZE; y++) { colRe[y] = re[y * SIZE + x]; colIm[y] = im[y * SIZE + x] }
    fft1d(colRe, colIm)
    for (let y = 0; y < SIZE; y++) { re[y * SIZE + x] = colRe[y]; im[y * SIZE + x] = colIm[y] }
  }

  const half = SIZE >> 1
  const shifted = new Float64Array(SIZE * SIZE)
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const mag = Math.log1p(Math.sqrt(re[y * SIZE + x] ** 2 + im[y * SIZE + x] ** 2))
      shifted[((y + half) % SIZE) * SIZE + ((x + half) % SIZE)] = mag
    }
  }

  let maxMag = 0
  for (let i = 0; i < shifted.length; i++) if (shifted[i] > maxMag) maxMag = shifted[i]

  const result = new Uint8ClampedArray(SIZE * SIZE * 4)
  for (let i = 0; i < SIZE * SIZE; i++) {
    const v = Math.round((shifted[i] / maxMag) * 255)
    result[i * 4] = result[i * 4 + 1] = result[i * 4 + 2] = v
    result[i * 4 + 3] = 255
  }

  const specCanvas = document.createElement('canvas')
  specCanvas.width = SIZE; specCanvas.height = SIZE
  specCanvas.getContext('2d')!.putImageData(new ImageData(result, SIZE, SIZE), 0, 0)

  const out = document.createElement('canvas')
  out.width = 512; out.height = 512
  const oCtx = out.getContext('2d')!
  oCtx.fillStyle = '#000'
  oCtx.fillRect(0, 0, 512, 512)
  oCtx.imageSmoothingEnabled = false
  oCtx.drawImage(specCanvas, 0, 0, 512, 512)
  return { dataUrl: out.toDataURL('image/jpeg', 0.92) }
}

// ─── view definitions ─────────────────────────────────────────────────────────

export const VIEW_DEFINITIONS: ViewDefinition[] = [
  {
    id: 'original',
    name: 'Original',
    description: 'Referentieafbeelding. Vergelijk elke andere view hiermee om afwijkingen te spotten.',
  },
  {
    id: 'ela',
    name: 'ELA',
    description: 'Error Level Analysis — herslaat de foto als JPEG en vergroot het verschil 20×. Bewerkte zones compressen anders en lichten op als heldere vlekken. De sterkste tool voor het detecteren van copy-paste, retouche en compositing.',
    asyncTransform: ela,
  },
  {
    id: 'noise-map',
    name: 'Noise Map',
    description: 'Isoleert de ruislaag via high-pass filtering. Kloonstempels, inpainting en AI-gebieden missen de organische ruis van de camera — die zones verschijnen hier als te glad of met een afwijkend patroon.',
    canvasTransform: noiseMap,
    scoreFromOutput: scoreNoiseVariance,
  },
  {
    id: 'sobel',
    name: 'Edge Detection',
    description: 'Sobel-operator berekent de gradiëntsterkte per pixel. Onnatuurlijk scherpe randen op logisch zachte plekken, of halo\'s rond ingeplakte objecten, zijn directe tekenen van compositing.',
    canvasTransform: sobelEdges,
    scoreFromOutput: scoreMeanBrightness,
  },
  {
    id: 'negative',
    name: 'Negative',
    description: 'Alle tonen omgekeerd. Retoucheringen en zachte blending die in het origineel onzichtbaar zijn kunnen als toonverschillen oplichten.',
    canvasTransform: negative,
  },
  {
    id: 'grayscale',
    name: 'Grayscale',
    description: 'Puur luminantiepatroon zonder kleur. Inconsistente belichting tussen object en achtergrond — verrader van compositing — is hier makkelijker te zien.',
    canvasTransform: grayscale,
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    description: 'Contrast extreem opgevoerd. Onlogische lichtrichting, zachte schaduwen die niet passen of kunstmatig vloeiende overgangen zijn hier duidelijker zichtbaar.',
    cssFilter: 'contrast(5) brightness(0.9)',
  },
  {
    id: 'hue',
    name: 'Hue Channel',
    description: 'Kleurschakering (H uit HSV) als grijswaarden. Selectieve kleurveranderingen vallen op als blokken met een te uniforme of abrupt veranderende hue.',
    canvasTransform: hueChannel,
  },
  {
    id: 'saturation',
    name: 'Saturation Channel',
    description: 'Verzadiging (S uit HSV) als grijswaarden. Lokaal opgedraaide of verlaagde verzadiging en selective color zijn hier direct zichtbaar.',
    canvasTransform: saturationChannel,
  },
  {
    id: 'clone-detect',
    name: 'Clone Detect',
    description: 'Heuristiek voor copy-move detectie — vergelijkt overlappende 16×16 blokken op gelijkenis en markeert verdachte kopieën in rood. Uniforme gebieden (hemel, muur) kunnen false positives geven. Combineer altijd met ELA voor bevestiging.',
    asyncTransform: cloneDetect,
  },
  {
    id: 'red-channel',
    name: 'Red Channel',
    description: 'Alleen rode kleurdata. Ingeplakte elementen van een andere camera hebben een afwijkend ruispatroon — vergelijk de textuur van het verdachte object met de achtergrond.',
    canvasTransform: redChannel,
  },
  {
    id: 'green-channel',
    name: 'Green Channel',
    description: 'Groen kanaal — het schoonste kanaal. Inconsistenties in ruis of scherpte die hier zichtbaar zijn maar niet in andere kanalen wijzen op een verschillende opnamebron.',
    canvasTransform: greenChannel,
  },
  {
    id: 'blue-channel',
    name: 'Blue Channel',
    description: 'Blauw kanaal — bevat het meeste sensorruis. Compositing van beelden van verschillende bronnen is hier het makkelijkst te herkennen aan een abrupt veranderend ruispatroon.',
    canvasTransform: blueChannel,
  },
  {
    id: 'jpeg-ghost',
    name: 'JPEG Ghost',
    description: 'Comprimeert de afbeelding op 6 kwaliteitsniveaus en vergelijkt per pixel welk niveau het best aansluit. Authentieke gebieden clusteren rond één kwaliteitsniveau (donker). Ingeplakte elementen van een andere bron — anders gecomprimeerd — lichten op in oranje-rood.',
    asyncTransform: jpegGhost,
  },
  {
    id: 'fft-spectrum',
    name: 'FFT Spectrum',
    description: 'Frequentiedomein via 2D Fourier-transformatie. Het spectrum toont de verdeling van ruimtelijke frequenties. AI-gegenereerde beelden en upscaling tonen afwijkende patronen. Periodieke stippen of lijnen wijzen op tiling, interpolatie-artefacten of herhalende textuurpatronen.',
    asyncTransform: fftSpectrum,
  },
]

// ─── processing ───────────────────────────────────────────────────────────────

async function applyView(img: HTMLImageElement, def: ViewDefinition): Promise<{ dataUrl: string; score?: number }> {
  if (def.asyncTransform) return def.asyncTransform(img)

  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth; canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')!

  if (def.canvasTransform) {
    ctx.drawImage(img, 0, 0)
    const output = def.canvasTransform(ctx.getImageData(0, 0, canvas.width, canvas.height))
    ctx.putImageData(output, 0, 0)
    const score = def.scoreFromOutput ? def.scoreFromOutput(output) : undefined
    return { dataUrl: canvas.toDataURL('image/jpeg', 0.92), score }
  }

  if (def.cssFilter) { ctx.filter = def.cssFilter }
  ctx.drawImage(img, 0, 0)
  return { dataUrl: canvas.toDataURL('image/jpeg', 0.92) }
}

export async function processImage(img: HTMLImageElement): Promise<ProcessedView[]> {
  return Promise.all(VIEW_DEFINITIONS.map(async def => {
    const { dataUrl, score } = await applyView(img, def)
    return { definition: def, dataUrl, score }
  }))
}
