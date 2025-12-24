import styles from '../Header.module.css'

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.helpModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.helpHeader}>
          <h2>Keyboard Shortcuts</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.helpContent}>
          <section>
            <h3>General</h3>
            <div className={styles.shortcutList}>
              <div><kbd>⌘</kbd> + <kbd>N</kbd><span>New Project</span></div>
              <div><kbd>⌘</kbd> + <kbd>O</kbd><span>Open Folder</span></div>
              <div><kbd>⌘</kbd> + <kbd>S</kbd><span>Save</span></div>
              <div><kbd>⌘</kbd> + <kbd>Z</kbd><span>Undo</span></div>
              <div><kbd>⇧</kbd> + <kbd>⌘</kbd> + <kbd>Z</kbd><span>Redo</span></div>
            </div>
          </section>
          <section>
            <h3>Canvas</h3>
            <div className={styles.shortcutList}>
              <div><kbd>⌘</kbd> + <kbd>L</kbd><span>Auto Layout</span></div>
              <div><kbd>⌘</kbd> + <kbd>F</kbd><span>Search in Canvas</span></div>
              <div><kbd>⇧</kbd> + <kbd>⌘</kbd> + <kbd>F</kbd><span>Search All</span></div>
              <div><kbd>⌘</kbd> + <kbd>A</kbd><span>Select All</span></div>
              <div><kbd>Delete</kbd> / <kbd>⌫</kbd><span>Delete Selected</span></div>
              <div><kbd>⌘</kbd> + <kbd>C</kbd><span>Copy</span></div>
              <div><kbd>⌘</kbd> + <kbd>V</kbd><span>Paste</span></div>
            </div>
          </section>
          <section>
            <h3>Node Dragging</h3>
            <div className={styles.shortcutList}>
              <div><kbd>Drag</kbd><span>Free movement (1px)</span></div>
              <div><kbd>⇧</kbd> + <kbd>Drag</kbd><span>Snap to grid</span></div>
            </div>
          </section>
          <section>
            <h3>Search</h3>
            <div className={styles.shortcutList}>
              <div><kbd>F3</kbd><span>Next Result</span></div>
              <div><kbd>⇧</kbd> + <kbd>F3</kbd><span>Previous Result</span></div>
              <div><kbd>Enter</kbd><span>Go to Result & Close</span></div>
              <div><kbd>⇧</kbd> + <kbd>Enter</kbd><span>Go to Result (Keep Open)</span></div>
              <div><kbd>↑</kbd> / <kbd>↓</kbd><span>Navigate Results</span></div>
              <div><kbd>Esc</kbd><span>Close Search</span></div>
            </div>
          </section>
          <section>
            <h3>Playback</h3>
            <div className={styles.shortcutList}>
              <div><kbd>F5</kbd><span>Play Story</span></div>
              <div><kbd>Esc</kbd><span>Stop Playback</span></div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
