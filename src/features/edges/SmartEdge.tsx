import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/react'

/**
 * 스마트 엣지: 같은 높이면 직선, 다르면 곡선
 * - snap grid (20px) 고려하여 threshold 설정
 * - 직선일 때 Y 좌표를 평균으로 맞춰서 완전한 수평선
 */
export function SmartEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  selected,
}: EdgeProps) {
  // Y 좌표 차이가 작으면 직선 사용
  const yDiff = Math.abs(sourceY - targetY)
  const isHorizontal = yDiff < 10

  let edgePath: string

  if (isHorizontal) {
    // 직선: Y 좌표를 중간값으로 맞춰서 완전한 수평선
    const midY = (sourceY + targetY) / 2
    edgePath = `M ${sourceX} ${midY} L ${targetX} ${midY}`
  } else {
    // 곡선: smoothstep 사용
    const [path] = getSmoothStepPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
      borderRadius: 8,
    })
    edgePath = path
  }

  // 선택 시 하이라이트 스타일
  const edgeStyle = selected
    ? {
        ...style,
        stroke: '#ff6b00',
        strokeWidth: 4,
        filter: 'drop-shadow(0 0 6px #ff6b00)',
      }
    : style

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={edgeStyle}
      markerEnd={markerEnd}
    />
  )
}
