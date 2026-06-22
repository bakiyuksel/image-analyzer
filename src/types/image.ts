export interface ViewDefinition {
  id: string
  name: string
  description: string
  cssFilter?: string
  canvasTransform?: (data: ImageData) => ImageData
  asyncTransform?: (img: HTMLImageElement) => Promise<{ dataUrl: string; score?: number }>
  scoreFromOutput?: (data: ImageData) => number
}

export interface ProcessedView {
  definition: ViewDefinition
  dataUrl: string
  score?: number
}

export interface Prediction {
  level: 'ok' | 'warn' | 'alert'
  title: string
  detail: string
}
