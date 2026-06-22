import type { ViewDefinition, ProcessedView } from '../types/image'

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

export const VIEW_DEFINITIONS: ViewDefinition[] = [
  {
    id: 'original',
    name: 'Original',
    description: 'De onbewerkte referentieafbeelding als ijkpunt voor alle andere views.',
  },
  {
    id: 'grayscale',
    name: 'Grayscale',
    description: 'Helderheidswaarden (luminantie) zonder kleur — beoordeel belichting en toonverdeling puur op lichtsterkte, onafhankelijk van kleur.',
    canvasTransform: grayscale,
  },
  {
    id: 'negative',
    name: 'Negative',
    description: 'Alle tonen omgekeerd — donkere gebieden worden licht en andersom. Maakt verborgen detail in schaduwen en overbelichte highlights zichtbaar.',
    canvasTransform: negative,
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    description: 'Extreem versterkt contrast — je ziet direct waar shadow clipping en highlight blowout optreedt. Nuttig voor het beoordelen van de dynamiek van de foto.',
    cssFilter: 'contrast(5) brightness(0.9)',
  },
  {
    id: 'shadows-lifted',
    name: 'Shadows Detail',
    description: 'Schaduwen sterk opgetrokken — controleer of er nog bruikbaar detail zit in de donkerste gebieden. Helpt bij de beslissing hoeveel je schaduwen kunt herstellen.',
    cssFilter: 'brightness(3) contrast(0.5)',
  },
  {
    id: 'saturation-boost',
    name: 'Saturation Boost',
    description: 'Kleurverzadiging maximaal opgedraaid — ontdek subtiele kleurtonen en kleurcasts die normaal nauwelijks zichtbaar zijn.',
    cssFilter: 'saturate(5)',
  },
  {
    id: 'sepia',
    name: 'Sepia',
    description: 'Warme bruintoon overlay — referentie voor vintage of analoge bewerkingsstijlen. Laat zien hoe de toonverdeling reageert op warme toning.',
    cssFilter: 'sepia(1)',
  },
  {
    id: 'red-channel',
    name: 'Red Channel',
    description: 'Alleen de rode kleurdata als grijswaarden — nuttig voor huidtonen, zonsondergangen en het maken van selectiemaskers op basis van rode tinten.',
    canvasTransform: redChannel,
  },
  {
    id: 'green-channel',
    name: 'Green Channel',
    description: 'Groen kanaal als grijswaarden — doorgaans het schoonste kanaal met minste ruis. Ideale basis voor zwart-wit conversie en luminosity masks.',
    canvasTransform: greenChannel,
  },
  {
    id: 'blue-channel',
    name: 'Blue Channel',
    description: 'Blauw kanaal als grijswaarden — bevat het meeste sensorruis. Nuttig om noisegevoeligheid te beoordelen en te beslissen hoeveel noise reduction nodig is.',
    canvasTransform: blueChannel,
  },
]

function applyView(img: HTMLImageElement, def: ViewDefinition): string {
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')!

  if (def.canvasTransform) {
    ctx.drawImage(img, 0, 0)
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
    ctx.putImageData(def.canvasTransform(data), 0, 0)
  } else if (def.cssFilter) {
    ctx.filter = def.cssFilter
    ctx.drawImage(img, 0, 0)
  } else {
    ctx.drawImage(img, 0, 0)
  }

  return canvas.toDataURL('image/jpeg', 0.92)
}

export function processImage(img: HTMLImageElement): ProcessedView[] {
  return VIEW_DEFINITIONS.map(def => ({
    definition: def,
    dataUrl: applyView(img, def),
  }))
}
