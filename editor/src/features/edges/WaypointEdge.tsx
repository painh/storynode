import { useCallback, useState, useRef, useEffect } from 'react'
import { BaseEdge, EdgeLabelRenderer, type EdgeProps, useReactFlow } from '@xyflow/react'
import type { EditorEdgeData, EdgeWaypoint } from '../../types/editor'
import styles from './WaypointEdge.module.css'

// 웨이포인트 ID 생성
const generateWaypointId = () => `wp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

// 두 점 사이의 거리 계산
const distance = (x1: number, y1: number, x2: number, y2: number) => 
  Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)

// 점에서 선분까지의 거리 계산
const pointToSegmentDistance = (
  px: number, py: number,
  x1: number, y1: number,
  x2: number, y2: number
): number => {
  const A = px - x1
  const B = py - y1
  const C = x2 - x1
  const D = y2 - y1

  const dot = A * C + B * D
  const lenSq = C * C + D * D
  let param = -1

  if (lenSq !== 0) param = dot / lenSq

  let xx, yy

  if (param < 0) {
    xx = x1
    yy = y1
  } else if (param > 1) {
    xx = x2
    yy = y2
  } else {
    xx = x1 + param * C
    yy = y1 + param * D
  }

  return distance(px, py, xx, yy)
}

// 웨이포인트를 포함한 경로 생성
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

  // 엣지 클릭으로 웨이포인트 추가
  const handleEdgeClick = useCallback((e: React.MouseEvent<SVGPathElement>) => {
    if (!selected) return

    const svg = e.currentTarget.closest('svg')
    if (!svg) return

    const point = svg.createSVGPoint()
    point.x = e.clientX
    point.y = e.clientY

    const ctm = svg.getScreenCTM()
    if (!ctm) return

    const svgPoint = point.matrixTransform(ctm.inverse())

    // 모든 세그먼트 중 클릭 위치에 가장 가까운 세그먼트 찾기
    const allPoints = [
      { x: sourceX, y: sourceY },
      ...waypoints,
      { x: targetX, y: targetY },
    ]

    let minDistance = Infinity
    let insertIndex = waypoints.length

    for (let i = 0; i < allPoints.length - 1; i++) {
      const dist = pointToSegmentDistance(
        svgPoint.x, svgPoint.y,
        allPoints[i].x, allPoints[i].y,
        allPoints[i + 1].x, allPoints[i + 1].y
      )
      if (dist < minDistance) {
        minDistance = dist
        insertIndex = i
      }
    }

    // 클릭이 선에서 너무 멀면 무시
    if (minDistance > 20) return

    const newWaypoint: EdgeWaypoint = {
      id: generateWaypointId(),
      x: svgPoint.x,
      y: svgPoint.y,
    }

    setEdges((edges) =>
      edges.map((edge) => {
        if (edge.id !== id) return edge
        const currentWaypoints = (edge.data as EditorEdgeData)?.waypoints || []
        const newWaypoints = [
          ...currentWaypoints.slice(0, insertIndex),
          newWaypoint,
          ...currentWaypoints.slice(insertIndex),
        ]
        return {
          ...edge,
          data: { ...edge.data, waypoints: newWaypoints },
        }
      })
    )
  }, [id, selected, sourceX, sourceY, targetX, targetY, waypoints, setEdges])

  // 엣지 삭제 핸들러
  const handleDelete = useCallback(() => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id))
  }, [id, setEdges])

  // 경로 생성
  const edgePath = createPathWithWaypoints(sourceX, sourceY, targetX, targetY, waypoints)

  // 선택 시 하이라이트 스타일
  const edgeStyle = selected
    ? {
        ...style,
        stroke: '#ff6b00',
        strokeWidth: 4,
        filter: 'drop-shadow(0 0 6px #ff6b00)',
      }
    : style

  // 삭제 버튼 위치 (첫 번째 세그먼트 중앙)
  const firstWaypoint = waypoints[0]
  const deleteBtnX = firstWaypoint ? (sourceX + firstWaypoint.x) / 2 : (sourceX + targetX) / 2
  const deleteBtnY = firstWaypoint ? (sourceY + firstWaypoint.y) / 2 : (sourceY + targetY) / 2

  return (
    <>
      {/* 클릭 감지용 투명한 두꺼운 선 */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ cursor: selected ? 'crosshair' : 'pointer', pointerEvents: 'stroke' }}
        onClick={handleEdgeClick}
      />
      {/* 실제 보이는 엣지 */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={edgeStyle}
        markerEnd={markerEnd}
      />
      {/* 선택 시 웨이포인트 핸들과 삭제 버튼 표시 */}
      {selected && (
        <EdgeLabelRenderer>
          {/* 웨이포인트 핸들 */}
          {waypoints.map((waypoint) => (
            <WaypointHandle
              key={waypoint.id}
              waypoint={waypoint}
              onDrag={handleWaypointDrag}
              onDelete={handleWaypointDelete}
            />
          ))}
          {/* 삭제 버튼 */}
          <button
            className={styles.deleteBtn}
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${deleteBtnX}px, ${deleteBtnY}px)`,
              pointerEvents: 'all',
            }}
            onClick={handleDelete}
            title="연결 삭제"
          >
            ✕
          </button>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
