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

  const pathParts = points.map((point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`
    return `L ${point.x} ${point.y}`
  })

  return pathParts.join(' ')
}

// 베지어 핸들을 이용한 곡선 경로 생성
const createBezierHandlePath = (
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  waypoints: EdgeWaypoint[]
): string => {
  if (waypoints.length === 0) {
    return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`
  }

  let path = `M ${sourceX} ${sourceY}`
  
  // 각 세그먼트를 베지어 곡선으로 연결
  const allPoints = [
    { x: sourceX, y: sourceY, handleIn: undefined, handleOut: undefined },
    ...waypoints,
    { x: targetX, y: targetY, handleIn: undefined, handleOut: undefined },
  ]

  for (let i = 0; i < allPoints.length - 1; i++) {
    const p1 = allPoints[i]
    const p2 = allPoints[i + 1]
    
    // 기본 핸들 위치 계산 (없으면 직선 방향으로)
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    const defaultHandleLength = Math.sqrt(dx * dx + dy * dy) / 3

    // p1의 나가는 핸들 (절대 좌표)
    const h1 = p1.handleOut 
      ? { x: p1.x + p1.handleOut.x, y: p1.y + p1.handleOut.y }
      : { x: p1.x + defaultHandleLength * (dx / Math.sqrt(dx * dx + dy * dy) || 0), 
          y: p1.y + defaultHandleLength * (dy / Math.sqrt(dx * dx + dy * dy) || 0) }

    // p2의 들어오는 핸들 (절대 좌표)
    const h2 = p2.handleIn
      ? { x: p2.x + p2.handleIn.x, y: p2.y + p2.handleIn.y }
      : { x: p2.x - defaultHandleLength * (dx / Math.sqrt(dx * dx + dy * dy) || 0),
          y: p2.y - defaultHandleLength * (dy / Math.sqrt(dx * dx + dy * dy) || 0) }

    path += ` C ${h1.x} ${h1.y}, ${h2.x} ${h2.y}, ${p2.x} ${p2.y}`
  }

  return path
}

// Catmull-Rom 스플라인 (자동 곡선)
const createCatmullRomPath = (
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

  const tension = 0.5
  let path = `M ${points[0].x} ${points[0].y}`

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]

    const cp1x = p1.x + (p2.x - p0.x) * tension / 3
    const cp1y = p1.y + (p2.y - p0.y) * tension / 3
    const cp2x = p2.x - (p3.x - p1.x) * tension / 3
    const cp2y = p2.y - (p3.y - p1.y) * tension / 3

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }

  return path
}

// 웨이포인트 핸들 컴포넌트
interface WaypointHandleProps {
  waypoint: EdgeWaypoint
  onDrag: (id: string, x: number, y: number) => void
  onDelete: (id: string) => void
  onHandleDrag: (id: string, handleType: 'in' | 'out', x: number, y: number) => void
  showBezierHandles: boolean
}

function WaypointHandle({ waypoint, onDrag, onDelete, onHandleDrag, showBezierHandles }: WaypointHandleProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [draggingHandle, setDraggingHandle] = useState<'in' | 'out' | null>(null)
  const { screenToFlowPosition } = useReactFlow()
  const { snapToGrid, snapGrid } = useCanvasStore()
  const startPosRef = useRef({ x: 0, y: 0 })

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsDragging(true)
    startPosRef.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleHandleMouseDown = useCallback((e: React.MouseEvent, handleType: 'in' | 'out') => {
    e.stopPropagation()
    e.preventDefault()
    setDraggingHandle(handleType)
  }, [])

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onDelete(waypoint.id)
  }, [waypoint.id, onDelete])

  useEffect(() => {
    if (!isDragging && !draggingHandle) return

    const handleMouseMove = (e: MouseEvent) => {
      let flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY })
      
      if (snapToGrid && isDragging) {
        flowPos = {
          x: Math.round(flowPos.x / snapGrid) * snapGrid,
          y: Math.round(flowPos.y / snapGrid) * snapGrid,
        }
      }
      
      if (isDragging) {
        onDrag(waypoint.id, flowPos.x, flowPos.y)
      } else if (draggingHandle) {
        // 핸들은 웨이포인트 기준 상대 좌표로 저장
        const relX = flowPos.x - waypoint.x
        const relY = flowPos.y - waypoint.y
        onHandleDrag(waypoint.id, draggingHandle, relX, relY)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setDraggingHandle(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, draggingHandle, waypoint, onDrag, onHandleDrag, screenToFlowPosition, snapToGrid, snapGrid])

  // 베지어 핸들 절대 좌표
  const handleIn = waypoint.handleIn 
    ? { x: waypoint.x + waypoint.handleIn.x, y: waypoint.y + waypoint.handleIn.y }
    : null
  const handleOut = waypoint.handleOut
    ? { x: waypoint.x + waypoint.handleOut.x, y: waypoint.y + waypoint.handleOut.y }
    : null

  return (
    <>
      {/* 베지어 핸들 라인과 포인트 */}
      {showBezierHandles && (handleIn || handleOut) && (
        <svg
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            overflow: 'visible',
          }}
        >
          {/* 핸들 라인 */}
          {handleIn && (
            <line
              x1={waypoint.x}
              y1={waypoint.y}
              x2={handleIn.x}
              y2={handleIn.y}
              stroke="#4fc3f7"
              strokeWidth={1}
              strokeDasharray="3,3"
            />
          )}
          {handleOut && (
            <line
              x1={waypoint.x}
              y1={waypoint.y}
              x2={handleOut.x}
              y2={handleOut.y}
              stroke="#4fc3f7"
              strokeWidth={1}
              strokeDasharray="3,3"
            />
          )}
        </svg>
      )}

      {/* 들어오는 핸들 (In) */}
      {showBezierHandles && handleIn && (
        <div
          className={`${styles.bezierHandle} ${draggingHandle === 'in' ? styles.dragging : ''}`}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${handleIn.x}px, ${handleIn.y}px)`,
            pointerEvents: 'all',
          }}
          onMouseDown={(e) => handleHandleMouseDown(e, 'in')}
          title="In Handle"
        />
      )}

      {/* 나가는 핸들 (Out) */}
      {showBezierHandles && handleOut && (
        <div
          className={`${styles.bezierHandle} ${draggingHandle === 'out' ? styles.dragging : ''}`}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${handleOut.x}px, ${handleOut.y}px)`,
            pointerEvents: 'all',
          }}
          onMouseDown={(e) => handleHandleMouseDown(e, 'out')}
          title="Out Handle"
        />
      )}

      {/* 메인 웨이포인트 */}
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
    </>
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
  const curveMode = edgeData?.curveMode ?? false

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

  // 베지어 핸들 드래그 핸들러
  const handleBezierHandleDrag = useCallback((waypointId: string, handleType: 'in' | 'out', x: number, y: number) => {
    setEdges((edges) =>
      edges.map((edge) => {
        if (edge.id !== id) return edge
        const currentWaypoints = (edge.data as EditorEdgeData)?.waypoints || []
        const newWaypoints = currentWaypoints.map((wp) => {
          if (wp.id !== waypointId) return wp
          if (handleType === 'in') {
            return { ...wp, handleIn: { x, y } }
          } else {
            return { ...wp, handleOut: { x, y } }
          }
        })
        return {
          ...edge,
          data: { ...edge.data, waypoints: newWaypoints },
        }
      })
    )
  }, [id, setEdges])

  // 베지어 핸들이 하나라도 있는지 확인
  const hasBezierHandles = waypoints.some(wp => wp.handleIn || wp.handleOut)

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
    // curveMode가 켜져있고 베지어 핸들이 있으면 베지어 핸들 사용
    if (hasBezierHandles) {
      edgePath = createBezierHandlePath(sourceX, sourceY, targetX, targetY, waypoints)
    } else {
      // 핸들 없으면 자동 스플라인
      edgePath = createCatmullRomPath(sourceX, sourceY, targetX, targetY, waypoints)
    }
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
              onHandleDrag={handleBezierHandleDrag}
              showBezierHandles={curveMode}
            />
          ))}
        </EdgeLabelRenderer>
      )}
    </>
  )
}
