import { MiniMap } from '@xyflow/react'
import type { Node } from '@xyflow/react'

const NODE_COLORS: Record<string, string> = {
  start: '#4CAF50',
  dialogue: '#4A6FA5',
  choice: '#8B4A6B',
  battle: '#C62828',
  shop: '#2E7D32',
  event: '#F9A825',
  chapter_end: '#4CAF50',
  variable: '#7B1FA2',
  condition: '#00796B',
  image: '#00BCD4',
  javascript: '#F0DB4F',
  custom: '#9C27B0',
  comment: '#5C6BC0',
}

export function CanvasMiniMap() {
  return (
    <MiniMap
      nodeColor={(node: Node) => NODE_COLORS[node.type || 'dialogue'] || '#666'}
      maskColor="rgba(0, 0, 0, 0.8)"
      pannable
      zoomable
    />
  )
}
