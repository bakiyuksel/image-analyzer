import type { ProcessedView } from '../types/image'
import ViewPanel from './ViewPanel'

interface Props {
  views: ProcessedView[]
  onPanelClick: (id: string) => void
}

export default function ViewGrid({ views, onPanelClick }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {views.map(view => (
        <ViewPanel
          key={view.definition.id}
          view={view}
          onClick={() => onPanelClick(view.definition.id)}
        />
      ))}
    </div>
  )
}
