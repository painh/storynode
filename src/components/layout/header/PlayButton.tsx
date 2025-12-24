import styles from '../Header.module.css'

interface PlayButtonProps {
  disabled: boolean
  onClick: () => void
}

export function PlayButton({ disabled, onClick }: PlayButtonProps) {
  return (
    <button
      className={styles.playButton}
      onClick={onClick}
      disabled={disabled}
      title="Play Story (F5)"
    >
      <span className={styles.playIcon}>▶</span>
      <span>Play</span>
    </button>
  )
}
