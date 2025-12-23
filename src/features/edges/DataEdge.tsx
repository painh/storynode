import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/react'

/**
 * 데이터 엣지: 점선으로 표시하여 실행 엣지와 구분
 */
export function DataEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  data,
  selected,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 8,
  })

  // 데이터 타입에 따른 색상 (기본: 핑크)
  const color = (data as { color?: string })?.color || '#E91E63'

  // 선택 시 하이라이트 스타일
  const edgeStyle = selected
    ? {
        ...style,
        stroke: '#ff6b00',
        strokeWidth: 4,
        strokeDasharray: '5,5',
        filter: 'drop-shadow(0 0 6px #ff6b00)',
      }
    : {
        ...style,
        stroke: color,
        strokeWidth: 2,
        strokeDasharray: '5,5',
      }

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={edgeStyle}
      markerEnd={markerEnd}
    />
  )
}
