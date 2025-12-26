import { useState } from 'react'
import { useCanvasStore } from '../../../stores/canvasStore'
import type { EditorEdgeData, EdgeWaypoint } from '../../../types/editor'
import styles from '../Inspector.module.css'

interface EdgeInspectorProps {
  edgeId: string
  onDelete: () => void
}

export function EdgeInspector({ edgeId, onDelete }: EdgeInspectorProps) {
  const { edges, setEdges } = useCanvasStore()
  const [snapGridSize, setSnapGridSize] = useState(20)

  const edge = edges.find(e => e.id === edgeId)
  const waypoints = (edge?.data as EditorEdgeData)?.waypoints || []

  // 웨이포인트를 그리드에 스냅
  const handleSnapToGrid = () => {
    setEdges(edges.map(e => {
      if (e.id !== edgeId) return e
      const currentWaypoints = (e.data as EditorEdgeData)?.waypoints || []
      const snappedWaypoints = currentWaypoints.map(wp => ({
        ...wp,
        x: Math.round(wp.x / snapGridSize) * snapGridSize,
        y: Math.round(wp.y / snapGridSize) * snapGridSize,
      }))
      return {
        ...e,
        data: { ...e.data, waypoints: snappedWaypoints },
      }
    }))
  }

  // 모든 웨이포인트 삭제 (곡선으로 되돌리기)
  const handleClearWaypoints = () => {
    setEdges(edges.map(e => {
      if (e.id !== edgeId) return e
      return {
        ...e,
        data: { ...e.data, waypoints: [] },
      }
    }))
  }

  // 웨이포인트 위치 직접 수정
  const handleWaypointChange = (index: number, field: 'x' | 'y', value: number) => {
    setEdges(edges.map(e => {
      if (e.id !== edgeId) return e
      const currentWaypoints = (e.data as EditorEdgeData)?.waypoints || []
      const newWaypoints = currentWaypoints.map((wp, i) => 
        i === index ? { ...wp, [field]: value } : wp
      )
      return {
        ...e,
        data: { ...e.data, waypoints: newWaypoints },
      }
    }))
  }

  // 웨이포인트 삭제
  const handleDeleteWaypoint = (index: number) => {
    setEdges(edges.map(e => {
      if (e.id !== edgeId) return e
      const currentWaypoints = (e.data as EditorEdgeData)?.waypoints || []
      return {
        ...e,
        data: { ...e.data, waypoints: currentWaypoints.filter((_, i) => i !== index) },
      }
    }))
  }

  // 웨이포인트 추가 (중간 지점에)
  const handleAddWaypoint = () => {
    setEdges(edges.map(e => {
      if (e.id !== edgeId) return e
      const currentWaypoints = (e.data as EditorEdgeData)?.waypoints || []
      
      // 소스와 타겟 사이 중간점 계산 (대략적인 위치)
      let newX = 0, newY = 0
      if (currentWaypoints.length === 0) {
        // 첫 웨이포인트: 대략 중간 위치 (정확한 값은 알 수 없으므로 0,0)
        newX = 0
        newY = 0
      } else {
        // 마지막 웨이포인트 근처에 추가
        const lastWp = currentWaypoints[currentWaypoints.length - 1]
        newX = lastWp.x + 50
        newY = lastWp.y
      }

      const newWaypoint: EdgeWaypoint = {
        id: `wp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        x: newX,
        y: newY,
      }

      return {
        ...e,
        data: { ...e.data, waypoints: [...currentWaypoints, newWaypoint] },
      }
    }))
  }

  return (
    <aside className={styles.inspector}>
      <div className={styles.header} style={{ borderColor: '#ff6b00' }}>
        <span className={styles.icon}>🔗</span>
        <span className={styles.type}>Edge</span>
      </div>
      <div className={styles.content}>
        {/* Edge ID */}
        <div className={styles.field}>
          <label className={styles.label}>Edge ID</label>
          <input
            type="text"
            className={styles.input}
            value={edgeId}
            readOnly
          />
        </div>

        {/* 도움말 */}
        <div className={styles.field}>
          <p style={{ color: '#888', fontSize: '12px', marginBottom: '0' }}>
            엣지를 더블클릭하면 웨이포인트가 추가됩니다.
          </p>
        </div>

        <div className={styles.divider} />

        {/* 웨이포인트 섹션 */}
        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label className={styles.label}>Waypoints ({waypoints.length})</label>
            <button className={styles.addBtn} onClick={handleAddWaypoint}>
              + Add
            </button>
          </div>
        </div>

        {/* 웨이포인트 목록 */}
        {waypoints.length > 0 && (
          <div className={styles.waypointList}>
            {waypoints.map((wp, index) => (
              <div key={wp.id} className={styles.waypointItem}>
                <span className={styles.waypointIndex}>#{index + 1}</span>
                <input
                  type="number"
                  className={styles.waypointInput}
                  value={Math.round(wp.x)}
                  onChange={(e) => handleWaypointChange(index, 'x', Number(e.target.value))}
                  title="X"
                />
                <input
                  type="number"
                  className={styles.waypointInput}
                  value={Math.round(wp.y)}
                  onChange={(e) => handleWaypointChange(index, 'y', Number(e.target.value))}
                  title="Y"
                />
                <button
                  className={styles.removeBtn}
                  onClick={() => handleDeleteWaypoint(index)}
                  title="삭제"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 그리드 스냅 */}
        {waypoints.length > 0 && (
          <>
            <div className={styles.divider} />
            <div className={styles.field}>
              <label className={styles.label}>Grid Snap</label>
              <div className={styles.snapRow}>
                <input
                  type="number"
                  className={styles.snapInput}
                  value={snapGridSize}
                  onChange={(e) => setSnapGridSize(Math.max(1, Number(e.target.value)))}
                  min={1}
                  step={5}
                />
                <span style={{ color: '#888', fontSize: '11px' }}>px</span>
                <button className={styles.snapButton} onClick={handleSnapToGrid}>
                  Snap to Grid
                </button>
              </div>
            </div>

            {/* 곡선으로 되돌리기 */}
            <button
              className={styles.clearButton}
              onClick={handleClearWaypoints}
            >
              Clear All (Back to Curve)
            </button>
          </>
        )}

        <div className={styles.divider} />

        {/* 삭제 버튼 */}
        <button
          className={styles.deleteButton}
          onClick={onDelete}
        >
          Delete Edge
        </button>
      </div>
    </aside>
  )
}
