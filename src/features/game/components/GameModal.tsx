// 게임 모달 컴포넌트

import { useEffect, useMemo, CSSProperties } from 'react'
import { useGameStore } from '../../../stores/gameStore'
import { getThemeById, themePresets } from '../themes'
import { GameScreen } from './GameScreen'
import { TextAdventureScreen } from './TextAdventureScreen'
import { DebugPanel } from './DebugPanel'
import styles from '../styles/GameModal.module.css'

interface GameModalProps {
  isOpen: boolean
  onClose: () => void
}

export function GameModal({ isOpen, onClose }: GameModalProps) {
  const {
    status,
    debug,
    currentThemeId,
    gameMode,
    toggleDebug,
    setTheme,
    setGameMode,
    pause,
    resume,
    restart,
    closeGame,
  } = useGameStore()

  const theme = useMemo(() => getThemeById(currentThemeId), [currentThemeId])

  // ESC 키로 닫기/일시정지
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (status === 'playing') {
          pause()
        } else if (status === 'paused') {
          resume()
        } else {
          handleClose()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, status, pause, resume])

  const handleClose = () => {
    closeGame()
    onClose()
  }

  const handleRestart = () => {
    restart()
  }

  const handleTogglePause = () => {
    if (status === 'playing') {
      pause()
    } else if (status === 'paused') {
      resume()
    }
  }

  // 테마 CSS 변수
  const themeStyles: CSSProperties = {
    '--game-background': theme.colors.background,
    '--game-border': theme.colors.dialogueBoxBorder,
    '--game-text': theme.colors.dialogueText,
    '--game-accent': theme.colors.accent,
    '--game-dialogue-box': theme.colors.dialogueBox,
    '--game-dialogue-box-hover': theme.colors.choiceButtonHover,
    '--game-dialogue-border': theme.colors.dialogueBoxBorder,
    '--game-dialogue-text': theme.colors.dialogueText,
    '--game-speaker-name': theme.colors.speakerName,
    '--game-speaker-bg': theme.colors.speakerNameBg,
    '--game-choice-button': theme.colors.choiceButton,
    '--game-choice-hover': theme.colors.choiceButtonHover,
    '--game-choice-text': theme.colors.choiceButtonText,
    '--game-choice-border': theme.colors.choiceButtonBorder,
    '--game-debug-bg': theme.colors.debugPanelBg,
    '--game-debug-text': theme.colors.debugPanelText,
    '--game-font-dialogue': theme.fonts.dialogue,
    '--game-font-speaker': theme.fonts.speaker,
    '--game-font-ui': theme.fonts.ui,
  } as CSSProperties

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && handleTogglePause()}>
      <div className={styles.modal} style={themeStyles}>
        {/* 헤더 */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h3 className={styles.title}>▶ Story Player</h3>
            <span className={`${styles.statusBadge} ${styles[status]}`}>
              {status.toUpperCase()}
            </span>
          </div>

          <div className={styles.headerRight}>
            {/* 게임 모드 선택 */}
            <select
              className={styles.modeSelect}
              value={gameMode}
              onChange={(e) => setGameMode(e.target.value as 'visualNovel' | 'textAdventure')}
            >
              <option value="visualNovel">Visual Novel</option>
              <option value="textAdventure">Text Adventure</option>
            </select>

            {/* 테마 선택 */}
            <select
              className={styles.themeSelect}
              value={currentThemeId}
              onChange={(e) => setTheme(e.target.value)}
            >
              {themePresets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            {/* 디버그 토글 */}
            <button
              className={`${styles.iconButton} ${debug.enabled ? styles.active : ''}`}
              onClick={toggleDebug}
              title="Toggle Debug Panel (D)"
            >
              🔧
            </button>

            {/* 재시작 */}
            <button
              className={styles.iconButton}
              onClick={handleRestart}
              title="Restart"
            >
              🔄
            </button>

            {/* 일시정지/재개 */}
            <button
              className={styles.iconButton}
              onClick={handleTogglePause}
              title={status === 'playing' ? 'Pause (ESC)' : 'Resume (ESC)'}
            >
              {status === 'playing' ? '⏸️' : '▶️'}
            </button>

            {/* 닫기 */}
            <button
              className={styles.iconButton}
              onClick={handleClose}
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 컨텐츠 */}
        <div className={styles.content}>
          <div className={styles.gameArea}>
            {gameMode === 'visualNovel' ? (
              <GameScreen theme={theme} />
            ) : (
              <TextAdventureScreen theme={theme} />
            )}
          </div>

          {/* 디버그 패널 */}
          {debug.enabled && (
            <div className={styles.debugPanel}>
              <DebugPanel />
            </div>
          )}

          {/* 종료 오버레이 */}
          {status === 'ended' && (
            <div className={styles.endedOverlay}>
              <span className={styles.endedTitle}>🏁 Chapter Complete</span>
              <div className={styles.endedButtons}>
                <button
                  className={`${styles.footerButton} ${styles.secondary}`}
                  onClick={handleRestart}
                >
                  🔄 Restart
                </button>
                <button
                  className={`${styles.footerButton} ${styles.primary}`}
                  onClick={handleClose}
                >
                  ✓ Close
                </button>
              </div>
            </div>
          )}

          {/* 일시정지 오버레이 */}
          {status === 'paused' && (
            <div className={styles.endedOverlay}>
              <span className={styles.endedTitle}>⏸️ Paused</span>
              <div className={styles.endedButtons}>
                <button
                  className={`${styles.footerButton} ${styles.secondary}`}
                  onClick={handleRestart}
                >
                  🔄 Restart
                </button>
                <button
                  className={`${styles.footerButton} ${styles.primary}`}
                  onClick={resume}
                >
                  ▶️ Resume
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className={styles.footer}>
          <span style={{ fontSize: 12, opacity: 0.5 }}>
            Space/Enter: Continue • ESC: Pause • D: Debug
          </span>
        </div>
      </div>
    </div>
  )
}
