import { useCanvasStore } from '../../../stores/canvasStore'
import type { EditorEdgeData, EdgeWaypoint } from '../../../types/editor'
import styles from '../Inspector.module.css'

interface EdgeInspectorProps {
  edgeId: string
  onDelete: () => void
}

export function EdgeInspector({ edgeId, onDelete }: EdgeInspectorProps) {
  const { edges, requestEdgeUpdate, snapToGrid, setSnapToGrid, snapGrid, setSnapGrid } = useCanvasStore()

  const edge = edges.find(e => e.id === edgeId)
  const edgeData = edge?.data as EditorEdgeData | undefined
  const waypoints = edgeData?.waypoints || []
  const curveMode = edgeData?.curveMode ?? false

  // 현재 웨이포인트들을 그리드에 스냅
  const handleSnapCurrentWaypoints = () => {
    const snappedWaypoints = waypoints.map(wp => ({
      ...wp,
      x: Math.round(wp.x / snapGrid) * snapGrid,
      y: Math.round(wp.y / snapGrid) * snapGrid,
    }))
    requestEdgeUpdate(edgeId, { waypoints: snappedWaypoints })
  }

  // 모든 웨이포인트 삭제 (곡선으로 되돌리기)
  const handleClearWaypoints = () => {
    requestEdgeUpdate(edgeId, { waypoints: [] })
  }

  // 웨이포인트 위치 직접 수정
  const handleWaypointChange = (index: number, field: 'x' | 'y', value: number) => {
    const newWaypoints = waypoints.map((wp, i) => 
      i === index ? { ...wp, [field]: value } : wp
    )
    requestEdgeUpdate(edgeId, { waypoints: newWaypoints })
  }

  // 웨이포인트 삭제
  const handleDeleteWaypoint = (index: number) => {
    const newWaypoints = waypoints.filter((_, i) => i !== index)
    requestEdgeUpdate(edgeId, { waypoints: newWaypoints })
  }

  // 웨이포인트 추가 (중간 지점에)
  const handleAddWaypoint = () => {
    // 소스와 타겟 사이 중간점 계산 (대략적인 위치)
    let newX = 0, newY = 0
    if (waypoints.length === 0) {
      // 첫 웨이포인트: 대략 중간 위치 (정확한 값은 알 수 없으므로 0,0)
      newX = 0
      newY = 0
    } else {
      // 마지막 웨이포인트 근처에 추가
      const lastWp = waypoints[waypoints.length - 1]
      newX = lastWp.x + 50
      newY = lastWp.y
    }

    const newWaypoint: EdgeWaypoint = {
      id: `wp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      x: newX,
      y: newY,
    }

    requestEdgeUpdate(edgeId, { waypoints: [...waypoints, newWaypoint] })
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
          <>
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

            {/* 곡선 모드 체크박스 */}
            <label className={styles.checkboxLabel} style={{ marginTop: '8px' }}>
              <input
                type="checkbox"
                checked={curveMode}
                onChange={(e) => requestEdgeUpdate(edgeId, { curveMode: e.target.checked })}
              />
              Smooth Curve (Spline)
            </label>
          </>
        )}

        <div className={styles.divider} />

        {/* 그리드 스냅 설정 (글로벌) */}
        <div className={styles.field}>
          <label className={styles.label}>Grid Snap</label>
          <div className={styles.snapRow}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={snapToGrid}
                onChange={(e) => setSnapToGrid(e.target.checked)}
              />
              Enable
            </label>
            <input
              type="number"
              className={styles.snapInput}
              value={snapGrid}
              onChange={(e) => setSnapGrid(Math.max(1, Number(e.target.value)))}
              min={1}
              step={5}
              disabled={!snapToGrid}
            />
            <span style={{ color: '#888', fontSize: '11px' }}>px</span>
          </div>
        </div>

        {/* 현재 웨이포인트 정렬 버튼 */}
        {waypoints.length > 0 && (
          <>
            <button className={styles.snapButton} onClick={handleSnapCurrentWaypoints}>
              Align Waypoints to Grid
            </button>

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
