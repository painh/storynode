import styles from '../Header.module.css'

interface EditMenuProps {
  isOpen: boolean
  canUndo: boolean
  canRedo: boolean
  menu: {
    undo: string
    redo: string
    selectAll: string
    delete: string
  }
  search: {
    currentCanvas: string
    allFiles: string
  }
  onUndo: () => void
  onRedo: () => void
  onSelectAll: () => void
  onDelete: () => void
  onSearchCanvas: () => void
  onSearchAll: () => void
}

export function EditMenu({
  isOpen,
  canUndo,
  canRedo,
  menu,
  search,
  onUndo,
  onRedo,
  onSelectAll,
  onDelete,
  onSearchCanvas,
  onSearchAll,
}: EditMenuProps) {
  if (!isOpen) return null

  return (
    <div className={styles.dropdown}>
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={!canUndo ? styles.disabled : ''}
      >
        <span>{menu.undo}</span>
        <span className={styles.shortcut}>⌘Z</span>
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={!canRedo ? styles.disabled : ''}
      >
        <span>{menu.redo}</span>
        <span className={styles.shortcut}>⇧⌘Z</span>
      </button>
      <div className={styles.divider} />
      <button onClick={onSelectAll}>
        <span>{menu.selectAll}</span>
        <span className={styles.shortcut}>⌘A</span>
      </button>
      <button onClick={onDelete}>
        <span>{menu.delete}</span>
        <span className={styles.shortcut}>⌫</span>
      </button>
      <div className={styles.divider} />
      <button onClick={onSearchCanvas}>
        <span>{search.currentCanvas}</span>
        <span className={styles.shortcut}>⌘F</span>
      </button>
      <button onClick={onSearchAll}>
        <span>{search.allFiles}</span>
        <span className={styles.shortcut}>⇧⌘F</span>
      </button>
    </div>
  )
}
