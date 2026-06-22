import type { ViewDefinition, ProcessedView } from '../types/image'

// ─── canvas pixel transforms ─────────────────────────────────────────────────

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
    d[i] = 255 - d[i]
    d[i + 1] = 255 - d[i + 1]
    d[i + 2] = 255 - d[i + 2]
  }
  return new ImageData(d, data.width, data.height)
}

function redChannel(data: ImageData): ImageData {
  const d = new Uint8ClampedArray(data.data)
  for (let i = 0; i < d.length; i += 4) {
    const v = d[i]
    d[i] = d[i + 1] = d[i + 2] = v
  }
  return new ImageData(d, data.width, data.height)
}

function greenChannel(data: ImageData): ImageData {
  const d = new Uint8ClampedArray(data.data)
  for (let i = 0; i < d.length; i += 4) {
    const v = d[i + 1]
    d[i] = d[i + 1] = d[i + 2] = v
  }
  return new ImageData(d, data.width, data.height)
}

function blueChannel(data: ImageData): ImageData {
  const d = new Uint8ClampedArray(data.data)
  for (let i = 0; i < d.length; i += 4) {
    const v = d[i + 2]
    d[i] = d[i + 1] = d[i + 2] = v
  }
  return new ImageData(d, data.width, data.height)
}

function hueChannel(data: ImageData): ImageData {
  const d = data.data
  const result = new Uint8ClampedArray(d.length)
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    const delta = max - min
    let h = 0
    if (delta > 0) {
      if (max === r) h = ((g - b) / delta) % 6
      else if (max === g) h = (b - r) / delta + 2
      else h = (r - g) / delta + 4
      h = h * 60
      if (h < 0) h += 360
    }
    const v = Math.round(h / 360 * 255)
    result[i] = result[i + 1] = result[i + 2] = v
    result[i + 3] = 255
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
    result[i] = result[i + 1] = result[i + 2] = v
    result[i + 3] = 255
  }
  return new ImageData(result, data.width, data.height)
}

function sobelEdges(data: ImageData): ImageData {
  const W = data.width, H = data.height, d = data.data
  const gray = new Float32Array(W * H)
  for (let i = 0; i < W * H; i++) {
    gray[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]
  }
  const result = new Uint8ClampedArray(d.length)
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const tl = gray[(y - 1) * W + x - 1], tc = gray[(y - 1) * W + x], tr = gray[(y - 1) * W + x + 1]
      const ml = gray[y * W + x - 1],                                     mr = gray[y * W + x + 1]
      const bl = gray[(y + 1) * W + x - 1], bc = gray[(y + 1) * W + x], br = gray[(y + 1) * W + x + 1]
      const Gx = -tl - 2 * ml - bl + tr + 2 * mr + br
      const Gy =  tl + 2 * tc + tr - bl - 2 * bc - br
      const mag = Math.min(255, Math.sqrt(Gx * Gx + Gy * Gy))
      const idx = (y * W + x) * 4
      result[idx] = result[idx + 1] = result[idx + 2] = mag
      result[idx + 3] = 255
    }
  }
  return new ImageData(result, W, H)
}

function noiseMap(data: ImageData): ImageData {
  const W = data.width, H = data.height, d = data.data
  // 3-pass box blur to approximate Gaussian
  let src = new Float32Array(W * H * 3)
  for (let i = 0; i < W * H; i++) {
    src[i * 3] = d[i * 4]
    src[i * 3 + 1] = d[i * 4 + 1]
    src[i * 3 + 2] = d[i * 4 + 2]
  }
  for (let pass = 0; pass < 3; pass++) {
    const blurred = new Float32Array(W * H * 3)
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        let r = 0, g = 0, b = 0, count = 0
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ny = Math.max(0, Math.min(H - 1, y + dy))
            const nx = Math.max(0, Math.min(W - 1, x + dx))
            const idx = (ny * W + nx) * 3
            r += src[idx]; g += src[idx + 1]; b += src[idx + 2]; count++
          }
        }
        const idx = (y * W + x) * 3
        blurred[idx] = r / count; blurred[idx + 1] = g / count; blurred[idx + 2] = b / count
      }
    }
    src = blurred
  }
  const result = new Uint8ClampedArray(d.length)
  const SCALE = 8, OFFSET = 128
  for (let i = 0; i < W * H; i++) {
    result[i * 4] = Math.max(0, Math.min(255, (d[i * 4] - src[i * 3]) * SCALE + OFFSET))
    result[i * 4 + 1] = Math.max(0, Math.min(255, (d[i * 4 + 1] - src[i * 3 + 1]) * SCALE + OFFSET))
    result[i * 4 + 2] = Math.max(0, Math.min(255, (d[i * 4 + 2] - src[i * 3 + 2]) * SCALE + OFFSET))
    result[i * 4 + 3] = 255
  }
  return new ImageData(result, W, H)
}

// ─── ELA (async — needs JPEG round-trip) ─────────────────────────────────────

async function ela(img: HTMLImageElement): Promise<string> {
  const W = img.naturalWidth, H = img.naturalHeight

  const origCanvas = document.createElement('canvas')
  origCanvas.width = W; origCanvas.height = H
  const origCtx = origCanvas.getContext('2d')!
  origCtx.drawImage(img, 0, 0)
  const origData = origCtx.getImageData(0, 0, W, H).data

  // Re-compress at low quality to simulate JPEG re-save
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
  for (let i = 0; i < origData.length; i += 4) {
    diff[i] = Math.min(255, Math.abs(origData[i] - reData[i]) * SCALE)
    diff[i + 1] = Math.min(255, Math.abs(origData[i + 1] - reData[i + 1]) * SCALE)
    diff[i + 2] = Math.min(255, Math.abs(origData[i + 2] - reData[i + 2]) * SCALE)
    diff[i + 3] = 255
  }

  const out = document.createElement('canvas')
  out.width = W; out.height = H
  out.getContext('2d')!.putImageData(new ImageData(diff, W, H), 0, 0)
  return out.toDataURL('image/jpeg', 0.92)
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
    description: 'Error Level Analysis — herslaat de foto als JPEG en vergroot het verschil 20×. Bewerkte zones compressen anders dan de omgeving en lichten op als heldere vlekken. De sterkste tool voor het detecteren van copy-paste, retouche en compositing.',
    asyncTransform: ela,
  },
  {
    id: 'noise-map',
    name: 'Noise Map',
    description: 'Isoleert de ruislaag via high-pass filtering. Kloonstempels, inpainting en AI-gegenereerde gebieden missen de organische ruistextuur van de camera — die zones verschijnen hier als te glad of met een ander patroon.',
    canvasTransform: noiseMap,
  },
  {
    id: 'sobel',
    name: 'Edge Detection',
    description: 'Sobel-operator: berekent de gradiëntsterkte per pixel. Onnatuurlijk scherpe of abrupte randen op logisch zachte plekken, of halo\'s rond ingeplakte objecten, zijn directe tekenen van compositing.',
    canvasTransform: sobelEdges,
  },
  {
    id: 'negative',
    name: 'Negative',
    description: 'Alle tonen omgekeerd. Retoucheringen, kloonvlekken en zachte blending die in het origineel onzichtbaar zijn, kunnen als toonverschillen oplichten in de negatief-versie.',
    canvasTransform: negative,
  },
  {
    id: 'grayscale',
    name: 'Grayscale',
    description: 'Puur luminantiepatroon zonder kleurinformatie. Inconsistente belichting tussen object en achtergrond — een verrader van compositing — is hier makkelijker te zien omdat kleurableding wegvalt.',
    canvasTransform: grayscale,
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    description: 'Contrast extreem opgevoerd. Onlogische lichtrichting, zachte schaduwen die niet bij de rest passen, of kunstmatig vloeiende overgangen — tekenen van lokale aanpassingen — zijn hier duidelijker zichtbaar.',
    cssFilter: 'contrast(5) brightness(0.9)',
  },
  {
    id: 'hue',
    name: 'Hue Channel',
    description: 'Kleurschakering (H uit HSV) als grijswaarden. Selectieve kleurveranderingen — bijv. een hemel die van blauw naar paars is getrokken, of huidtonen die lokaal zijn aangepast — vallen op als blokken met een te uniforme hue.',
    canvasTransform: hueChannel,
  },
  {
    id: 'saturation',
    name: 'Saturation Channel',
    description: 'Verzadiging (S uit HSV) als grijswaarden. Lokaal opgedraaide of verlaagde verzadiging, selective color, of vignettering die niet klopt met de opnameomstandigheden zijn hier direct zichtbaar.',
    canvasTransform: saturationChannel,
  },
  {
    id: 'red-channel',
    name: 'Red Channel',
    description: 'Alleen de rode kleurdata. Ingeplakte elementen afkomstig van een andere camera of opnamesituatie hebben een afwijkend ruispatroon in dit kanaal — vergelijk de textuur van het verdachte object met de achtergrond.',
    canvasTransform: redChannel,
  },
  {
    id: 'green-channel',
    name: 'Green Channel',
    description: 'Groen kanaal — het schoonste en meest gevoelige kanaal van de meeste sensoren. Inconsistenties in ruis of scherpte die in het groen kanaal zichtbaar zijn maar niet in de andere, wijzen op een verschillende opnamebron.',
    canvasTransform: greenChannel,
  },
  {
    id: 'blue-channel',
    name: 'Blue Channel',
    description: 'Blauw kanaal — bevat het meeste sensorruis. Compositing van beelden van verschillende camera\'s of ISO-waarden is hier het makkelijkst te herkennen: het ruisniveau of -patroon verandert abrupt bij de naad.',
    canvasTransform: blueChannel,
  },
]

// ─── processing ───────────────────────────────────────────────────────────────

async function applyView(img: HTMLImageElement, def: ViewDefinition): Promise<string> {
  if (def.asyncTransform) return def.asyncTransform(img)

  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')!

  if (def.canvasTransform) {
    ctx.drawImage(img, 0, 0)
    ctx.putImageData(def.canvasTransform(ctx.getImageData(0, 0, canvas.width, canvas.height)), 0, 0)
  } else if (def.cssFilter) {
    ctx.filter = def.cssFilter
    ctx.drawImage(img, 0, 0)
  } else {
    ctx.drawImage(img, 0, 0)
  }

  return canvas.toDataURL('image/jpeg', 0.92)
}

export async function processImage(img: HTMLImageElement): Promise<ProcessedView[]> {
  return Promise.all(VIEW_DEFINITIONS.map(async def => ({
    definition: def,
    dataUrl: await applyView(img, def),
  })))
}
