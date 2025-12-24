import styles from '../Header.module.css'

interface HelpMenuProps {
  isOpen: boolean
  menu: {
    keyboardShortcuts: string
  }
  onShowShortcuts: () => void
}

export function HelpMenu({ isOpen, menu, onShowShortcuts }: HelpMenuProps) {
  if (!isOpen) return null

  return (
    <div className={styles.dropdown}>
      <button onClick={onShowShortcuts}>
        <span>{menu.keyboardShortcuts}</span>
        <span className={styles.shortcut}>?</span>
      </button>
    </div>
  )
}
