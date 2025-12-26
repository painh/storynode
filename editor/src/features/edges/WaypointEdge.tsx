import { useCallback, useState, useRef, useEffect } from 'react'
import { BaseEdge, EdgeLabelRenderer, getBezierPath, Position, type EdgeProps, useReactFlow } from '@xyflow/react'
import { useCanvasStore } from '../../stores/canvasStore'
import type { EditorEdgeData, EdgeWaypoint } from '../../types/editor'
import styles from './WaypointEdge.module.css'

// 웨이포인트를 포함한 경로 생성 (직선 연결)
const createLinearPath = (
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  waypoints: EdgeWaypoint[]
): string => {
  const points = [
    { x: sourceX, y: sourceY },
    ...waypoints,
    { x: targetX, y: targetY },
  ]

  // 직선 연결
  const pathParts = points.map((point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`
    return `L ${point.x} ${point.y}`
  })

  return pathParts.join(' ')
}

// Catmull-Rom 스플라인을 이용한 부드러운 곡선 생성
const createCurvePath = (
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  waypoints: EdgeWaypoint[]
): string => {
  const points = [
    { x: sourceX, y: sourceY },
    ...waypoints,
    { x: targetX, y: targetY },
  ]

  if (points.length < 2) return ''
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`
  }

  // Catmull-Rom to Bezier 변환
  const tension = 0.5
  let path = `M ${points[0].x} ${points[0].y}`

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]

    // 컨트롤 포인트 계산
    const cp1x = p1.x + (p2.x - p0.x) * tension / 3
    const cp1y = p1.y + (p2.y - p0.y) * tension / 3
    const cp2x = p2.x - (p3.x - p1.x) * tension / 3
    const cp2y = p2.y - (p3.y - p1.y) * tension / 3

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }

  return path
}

interface WaypointHandleProps {
  waypoint: EdgeWaypoint
  onDrag: (id: string, x: number, y: number) => void
  onDelete: (id: string) => void
}

function WaypointHandle({ waypoint, onDrag, onDelete }: WaypointHandleProps) {
  const [isDragging, setIsDragging] = useState(false)
  const { screenToFlowPosition } = useReactFlow()
  const { snapToGrid, snapGrid } = useCanvasStore()
  const startPosRef = useRef({ x: 0, y: 0 })

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsDragging(true)
    startPosRef.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onDelete(waypoint.id)
  }, [waypoint.id, onDelete])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      let flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY })
      
      // 스냅 적용
      if (snapToGrid) {
        flowPos = {
          x: Math.round(flowPos.x / snapGrid) * snapGrid,
          y: Math.round(flowPos.y / snapGrid) * snapGrid,
        }
      }
      
      onDrag(waypoint.id, flowPos.x, flowPos.y)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, waypoint.id, onDrag, screenToFlowPosition, snapToGrid, snapGrid])

  return (
    <div
      className={`${styles.waypoint} ${isDragging ? styles.dragging : ''}`}
      style={{
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${waypoint.x}px, ${waypoint.y}px)`,
        pointerEvents: 'all',
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      title="드래그: 이동 / 더블클릭: 삭제"
    />
  )
}

export function WaypointEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  markerEnd,
  selected,
  data,
}: EdgeProps) {
  const { setEdges } = useReactFlow()
  const edgeData = data as EditorEdgeData | undefined
  const waypoints = edgeData?.waypoints || []

  // 웨이포인트 드래그 핸들러
  const handleWaypointDrag = useCallback((waypointId: string, x: number, y: number) => {
    setEdges((edges) =>
      edges.map((edge) => {
        if (edge.id !== id) return edge
        const currentWaypoints = (edge.data as EditorEdgeData)?.waypoints || []
        const newWaypoints = currentWaypoints.map((wp) =>
          wp.id === waypointId ? { ...wp, x, y } : wp
        )
        return {
          ...edge,
          data: { ...edge.data, waypoints: newWaypoints },
        }
      })
    )
  }, [id, setEdges])

  // 웨이포인트 삭제 핸들러
  const handleWaypointDelete = useCallback((waypointId: string) => {
    setEdges((edges) =>
      edges.map((edge) => {
        if (edge.id !== id) return edge
        const currentWaypoints = (edge.data as EditorEdgeData)?.waypoints || []
        const newWaypoints = currentWaypoints.filter((wp) => wp.id !== waypointId)
        return {
          ...edge,
          data: { ...edge.data, waypoints: newWaypoints },
        }
      })
    )
  }, [id, setEdges])

  const curveMode = edgeData?.curveMode ?? false

  // 경로 생성
  let edgePath: string
  if (waypoints.length === 0) {
    // 웨이포인트 없으면 기본 베지어 곡선
    edgePath = getBezierPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    })[0]
  } else if (curveMode) {
    // 곡선 모드: 스플라인 곡선
    edgePath = createCurvePath(sourceX, sourceY, targetX, targetY, waypoints)
  } else {
    // 직선 모드
    edgePath = createLinearPath(sourceX, sourceY, targetX, targetY, waypoints)
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
    <>
      {/* 실제 보이는 엣지 */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={edgeStyle}
        markerEnd={markerEnd}
      />
      {/* 선택 시 웨이포인트 핸들 표시 */}
      {selected && waypoints.length > 0 && (
        <EdgeLabelRenderer>
          {waypoints.map((waypoint) => (
            <WaypointHandle
              key={waypoint.id}
              waypoint={waypoint}
              onDrag={handleWaypointDrag}
              onDelete={handleWaypointDelete}
            />
          ))}
        </EdgeLabelRenderer>
      )}
    </>
  )
}
