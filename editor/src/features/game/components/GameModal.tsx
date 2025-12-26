// 게임 모달 컴포넌트

import { useEffect, useMemo, useCallback, useState, useRef, CSSProperties } from 'react'
import { useGameStore } from '../../../stores/gameStore'
import { useEditorStore } from '../../../stores/editorStore'
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

  // 최대화 및 크기 조절 상태
  const [isMaximized, setIsMaximized] = useState(false)
  const [isResized, setIsResized] = useState(false)
  const [modalSize, setModalSize] = useState({ width: 0, height: 0 })
  const modalRef = useRef<HTMLDivElement>(null)
  const isResizing = useRef(false)
  const resizeDirection = useRef<string>('')
  const startPos = useRef({ x: 0, y: 0 })
  const startSize = useRef({ width: 0, height: 0 })

  const updateGameSettings = useEditorStore((state) => state.updateGameSettings)
  const customThemesFromStore = useEditorStore((state) => state.project.gameSettings?.customThemes)
  const fontOverride = useEditorStore((state) => state.project.gameSettings?.fontOverride)
  const typewriterSpeedOverride = useEditorStore((state) => state.project.gameSettings?.typewriterSpeedOverride)
  const customThemes = customThemesFromStore ?? []

  // 테마에 오버라이드 적용
  const theme = useMemo(() => {
    const baseTheme = getThemeById(currentThemeId)
    return {
      ...baseTheme,
      fonts: fontOverride ? {
        dialogue: fontOverride,
        speaker: fontOverride,
        ui: fontOverride,
      } : baseTheme.fonts,
      effects: {
        ...baseTheme.effects,
        typewriterSpeed: typewriterSpeedOverride ?? baseTheme.effects.typewriterSpeed,
      },
    }
  }, [currentThemeId, fontOverride, typewriterSpeedOverride])

  // 테마 변경 시 프로젝트 설정에도 저장
  const handleThemeChange = useCallback((themeId: string) => {
    setTheme(themeId)
    updateGameSettings({ defaultThemeId: themeId })
  }, [setTheme, updateGameSettings])

  // 게임 모드 변경 시 프로젝트 설정에도 저장
  const handleGameModeChange = useCallback((mode: 'visualNovel' | 'textAdventure') => {
    setGameMode(mode)
    updateGameSettings({ defaultGameMode: mode })
  }, [setGameMode, updateGameSettings])

  // 모든 테마 (프리셋 + 커스텀)
  const allThemes = useMemo(() => {
    return [...themePresets, ...customThemes.map(ct => ({
      ...ct,
      colors: { ...ct.colors, debugPanelBg: '#1a1a1a', debugPanelText: '#00ff00' },
    }))]
  }, [customThemes])

  // 최대화 토글
  const toggleMaximize = useCallback(() => {
    setIsMaximized(prev => !prev)
  }, [])

  // 리사이즈 시작
  const handleResizeStart = useCallback((e: React.MouseEvent, direction: string) => {
    if (isMaximized) return
    e.preventDefault()
    e.stopPropagation()
    isResizing.current = true
    resizeDirection.current = direction
    startPos.current = { x: e.clientX, y: e.clientY }
    setIsResized(true)
    
    const modal = modalRef.current
    if (modal) {
      const rect = modal.getBoundingClientRect()
      startSize.current = { width: rect.width, height: rect.height }
      if (modalSize.width === 0) {
        setModalSize({ width: rect.width, height: rect.height })
      }
    }

    document.addEventListener('mousemove', handleResizeMove)
    document.addEventListener('mouseup', handleResizeEnd)
  }, [isMaximized, modalSize.width])

  // 리사이즈 중
  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return

    const deltaX = e.clientX - startPos.current.x
    const deltaY = e.clientY - startPos.current.y
    const dir = resizeDirection.current

    let newWidth = startSize.current.width
    let newHeight = startSize.current.height

    if (dir.includes('e')) newWidth = Math.max(600, startSize.current.width + deltaX)
    if (dir.includes('w')) newWidth = Math.max(600, startSize.current.width - deltaX)
    if (dir.includes('s')) newHeight = Math.max(400, startSize.current.height + deltaY)
    if (dir.includes('n')) newHeight = Math.max(400, startSize.current.height - deltaY)

    setModalSize({ width: newWidth, height: newHeight })
  }, [])

  // 리사이즈 종료
  const handleResizeEnd = useCallback(() => {
    isResizing.current = false
    document.removeEventListener('mousemove', handleResizeMove)
    document.removeEventListener('mouseup', handleResizeEnd)
  }, [handleResizeMove])

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
      <div 
        ref={modalRef}
        className={`${styles.modal} ${isMaximized ? styles.maximized : ''} ${isResized ? styles.resized : ''}`} 
        style={{
          ...themeStyles,
          ...(modalSize.width > 0 && !isMaximized ? { width: modalSize.width, height: modalSize.height } : {})
        }}
      >
        {/* 리사이즈 핸들 */}
        {!isMaximized && (
          <>
            <div className={`${styles.resizeHandle} ${styles.resizeN}`} onMouseDown={(e) => handleResizeStart(e, 'n')} />
            <div className={`${styles.resizeHandle} ${styles.resizeS}`} onMouseDown={(e) => handleResizeStart(e, 's')} />
            <div className={`${styles.resizeHandle} ${styles.resizeE}`} onMouseDown={(e) => handleResizeStart(e, 'e')} />
            <div className={`${styles.resizeHandle} ${styles.resizeW}`} onMouseDown={(e) => handleResizeStart(e, 'w')} />
            <div className={`${styles.resizeHandle} ${styles.resizeNE}`} onMouseDown={(e) => handleResizeStart(e, 'ne')} />
            <div className={`${styles.resizeHandle} ${styles.resizeNW}`} onMouseDown={(e) => handleResizeStart(e, 'nw')} />
            <div className={`${styles.resizeHandle} ${styles.resizeSE}`} onMouseDown={(e) => handleResizeStart(e, 'se')} />
            <div className={`${styles.resizeHandle} ${styles.resizeSW}`} onMouseDown={(e) => handleResizeStart(e, 'sw')} />
          </>
        )}
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
              onChange={(e) => handleGameModeChange(e.target.value as 'visualNovel' | 'textAdventure')}
            >
              <option value="visualNovel">Visual Novel</option>
              <option value="textAdventure">Text Adventure</option>
            </select>

            {/* 테마 선택 */}
            <select
              className={styles.themeSelect}
              value={currentThemeId}
              onChange={(e) => handleThemeChange(e.target.value)}
            >
              {allThemes.map((t) => (
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

            {/* 최대화 */}
            <button
              className={styles.iconButton}
              onClick={toggleMaximize}
              title={isMaximized ? 'Restore' : 'Maximize'}
            >
              {isMaximized ? '🗗' : '🗖'}
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
