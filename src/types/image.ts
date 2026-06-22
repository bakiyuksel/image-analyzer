export interface ViewDefinition {
  id: string
  name: string
  description: string
  cssFilter?: string
  canvasTransform?: (data: ImageData) => ImageData
  asyncTransform?: (img: HTMLImageElement) => Promise<string>
}

export interface ProcessedView {
  definition: ViewDefinition
  dataUrl: string
}
