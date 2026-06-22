import { Download } from 'lucide-react'
import type { ProcessedView } from '../types/image'

interface Props {
  file: File
  views: ProcessedView[]
}

export default function ExportPanel({ file, views }: Props) {
  function handleExport() {
    const report = {
      generatedAt: new Date().toISOString(),
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified).toISOString(),
      },
      views: views.map(v => ({
        id: v.definition.id,
        name: v.definition.name,
        score: v.score ?? null,
      })),
      scores: Object.fromEntries(
        views.filter(v => v.score != null).map(v => [v.definition.id, v.score])
      ),
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${file.name.replace(/\.[^.]+$/, '')}_rapport.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mt-8 mb-12">
      <div className="border-t border-rim mb-6" />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-widest">Export</h2>
          <p className="text-xs text-muted mt-1 opacity-60">Scores en bestandsinfo als JSON</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 text-sm text-muted hover:text-fg transition-colors px-3 py-1.5 rounded-sm border border-rim hover:border-accent"
        >
          <Download size={13} />
          Download rapport
        </button>
      </div>
    </div>
  )
}
