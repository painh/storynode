import styles from '../Canvas.module.css'

interface GridToolbarProps {
  showGrid: boolean
  snapGrid: number
  onShowGridChange: (show: boolean) => void
  onSnapGridChange: (grid: number) => void
}

export function GridToolbar({ showGrid, snapGrid, onShowGridChange, onSnapGridChange }: GridToolbarProps) {
  return (
    <div className={styles.gridToolbar}>
      <label>
        <input
          type="checkbox"
          checked={showGrid}
          onChange={(e) => onShowGridChange(e.target.checked)}
        />
        Grid
      </label>
      <input
        type="number"
        value={snapGrid}
        onChange={(e) => onSnapGridChange(Math.max(1, parseInt(e.target.value) || 1))}
        min={1}
        max={100}
        style={{ width: 50 }}
      />
      <span style={{ fontSize: 11, color: '#888' }}>Shift+Drag to snap</span>
    </div>
  )
}
