import { isTauri } from '../../../utils/fileUtils'
import styles from '../Header.module.css'

interface ViewMenuProps {
  isOpen: boolean
  menu: {
    autoLayout: string
    reload: string
    toggleDevTools: string
  }
  onAutoLayout: () => void
  onClose: () => void
}

export function ViewMenu({
  isOpen,
  menu,
  onAutoLayout,
  onClose,
}: ViewMenuProps) {
  if (!isOpen) return null

  const handleReload = () => {
    window.location.reload()
    onClose()
  }

  const handleToggleDevTools = async () => {
    if (isTauri()) {
      const { invoke } = await import('@tauri-apps/api/core')
      await invoke('toggle_devtools')
    }
    onClose()
  }

  return (
    <div className={styles.dropdown}>
      <button onClick={onAutoLayout}>
        <span>{menu.autoLayout}</span>
        <span className={styles.shortcut}>⌘L</span>
      </button>
      {import.meta.env.DEV && (
        <>
          <div className={styles.divider} />
          <button onClick={handleReload}>
            <span>{menu.reload}</span>
            <span className={styles.shortcut}>⌘R</span>
          </button>
          <button onClick={handleToggleDevTools}>
            <span>{menu.toggleDevTools}</span>
            <span className={styles.shortcut}>⌥⌘I</span>
          </button>
        </>
      )}
    </div>
  )
}
