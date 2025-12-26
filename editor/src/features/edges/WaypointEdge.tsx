import { useCallback, useState, useRef, useEffect } from 'react'
import { BaseEdge, EdgeLabelRenderer, getBezierPath, Position, type EdgeProps, useReactFlow } from '@xyflow/react'
import type { EditorEdgeData, EdgeWaypoint } from '../../types/editor'
import styles from './WaypointEdge.module.css'

// 웨이포인트를 포함한 경로 생성 (직선 연결)
const createPathWithWaypoints = (
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

interface WaypointHandleProps {
  waypoint: EdgeWaypoint
  onDrag: (id: string, x: number, y: number) => void
  onDelete: (id: string) => void
}

function WaypointHandle({ waypoint, onDrag, onDelete }: WaypointHandleProps) {
  const [isDragging, setIsDragging] = useState(false)
  const { screenToFlowPosition } = useReactFlow()
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
      const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY })
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
  }, [isDragging, waypoint.id, onDrag, screenToFlowPosition])

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

  // 경로 생성: 웨이포인트가 없으면 베지어 곡선, 있으면 직선 연결
  const edgePath = waypoints.length === 0
    ? getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      })[0]
    : createPathWithWaypoints(sourceX, sourceY, targetX, targetY, waypoints)

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
