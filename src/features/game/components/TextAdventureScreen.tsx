// 텍스트 어드벤처 스타일 게임 화면 컴포넌트
// "모험가 이야기" 스타일의 스크롤링 로그 UI

import { useRef, useEffect, useCallback } from 'react'
import { useGameStore } from '../../../stores/gameStore'
import type { GameTheme } from '../../../types/game'
import styles from '../styles/TextAdventureScreen.module.css'

interface TextAdventureScreenProps {
  theme: GameTheme
}

export function TextAdventureScreen({ theme }: TextAdventureScreenProps) {
  const { currentNode, gameState, status, advance, selectChoice } = useGameStore()
  const logEndRef = useRef<HTMLDivElement>(null)

  // 로그 맨 아래로 자동 스크롤
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [gameState?.history])

  // 클릭/스페이스로 진행
  const handleAdvance = useCallback(() => {
    if (status !== 'playing') return
    if (!currentNode) return

    // choice 노드면 진행 불가
    if (currentNode.type === 'choice') return

    advance()
  }, [status, currentNode, advance])

  // 키보드 이벤트
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        handleAdvance()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleAdvance])

  // 선택지 선택
  const handleSelectChoice = (index: number) => {
    if (status !== 'playing') return
    selectChoice(index)
  }

  // 스탯 바 렌더링
  const renderStatsBar = () => {
    if (!gameState) return null

    return (
      <div className={styles.statsBar}>
        <div className={styles.statItem}>
          <span className={styles.statIcon}>❤️</span>
          <span className={styles.statLabel}>HP</span>
          <span className={styles.statValue}>{gameState.variables.hp}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statIcon}>💰</span>
          <span className={styles.statLabel}>Gold</span>
          <span className={styles.statValue}>{gameState.variables.gold}</span>
        </div>
        {/* 활성화된 플래그 개수 */}
        <div className={styles.statItem}>
          <span className={styles.statIcon}>🚩</span>
          <span className={styles.statLabel}>Flags</span>
          <span className={styles.statValue}>
            {Object.values(gameState.variables.flags).filter(Boolean).length}
          </span>
        </div>
      </div>
    )
  }

  // 히스토리 로그 렌더링
  const renderLog = () => {
    if (!gameState?.history) return null

    return (
      <div className={styles.logContainer}>
        {gameState.history.map((entry, index) => (
          <div key={index} className={styles.logEntry}>
            {entry.speaker && (
              <span className={styles.logSpeaker}>{entry.speaker}: </span>
            )}
            <span className={styles.logText}>{entry.content}</span>
            {entry.choiceText && (
              <span className={styles.logChoice}> → {entry.choiceText}</span>
            )}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    )
  }

  // 현재 노드 렌더링
  const renderCurrentNode = () => {
    if (!currentNode) {
      return (
        <div className={styles.emptyState}>
          <span className={styles.emptyText}>No node to display</span>
        </div>
      )
    }

    // 특수 노드 (전투, 상점, 이벤트)
    if (currentNode.type === 'battle') {
      return (
        <div className={styles.currentSection}>
          <div className={styles.specialEvent}>
            <span className={styles.specialIcon}>⚔️</span>
            <span className={styles.specialText}>
              전투 발생{currentNode.battleGroupId ? `: ${currentNode.battleGroupId}` : ''}
            </span>
          </div>
          <button className={styles.actionButton} onClick={handleAdvance}>
            전투 진행
          </button>
        </div>
      )
    }

    if (currentNode.type === 'shop') {
      return (
        <div className={styles.currentSection}>
          <div className={styles.specialEvent}>
            <span className={styles.specialIcon}>🏪</span>
            <span className={styles.specialText}>상점에 도착했습니다.</span>
          </div>
          <button className={styles.actionButton} onClick={handleAdvance}>
            상점 이용
          </button>
        </div>
      )
    }

    if (currentNode.type === 'event') {
      return (
        <div className={styles.currentSection}>
          <div className={styles.specialEvent}>
            <span className={styles.specialIcon}>⭐</span>
            <span className={styles.specialText}>
              이벤트{currentNode.eventId ? `: ${currentNode.eventId}` : ''}
            </span>
          </div>
          <button className={styles.actionButton} onClick={handleAdvance}>
            계속
          </button>
        </div>
      )
    }

    if (currentNode.type === 'chapter_end') {
      return (
        <div className={styles.currentSection}>
          <div className={styles.specialEvent}>
            <span className={styles.specialIcon}>🏁</span>
            <span className={styles.specialText}>
              {currentNode.text || '챕터가 종료되었습니다.'}
            </span>
          </div>
          <button className={styles.actionButton} onClick={handleAdvance}>
            종료
          </button>
        </div>
      )
    }

    // 일반 대사 / 선택지 노드
    const isChoiceNode = currentNode.type === 'choice'

    return (
      <div className={styles.currentSection}>
        {/* 현재 대사 */}
        {currentNode.text && (
          <div className={styles.currentText}>
            {currentNode.speaker && (
              <span className={styles.currentSpeaker}>{currentNode.speaker}: </span>
            )}
            <span>{currentNode.text}</span>
          </div>
        )}

        {/* 선택지 */}
        {isChoiceNode && currentNode.choices && currentNode.choices.length > 0 ? (
          <div className={styles.choicesArea}>
            <div className={styles.choicesLabel}>선택하세요:</div>
            {currentNode.choices.map((choice, index) => (
              <button
                key={choice.id}
                className={styles.choiceButton}
                onClick={() => handleSelectChoice(index)}
              >
                <span className={styles.choiceNumber}>{index + 1}.</span>
                <span className={styles.choiceText}>{choice.text}</span>
              </button>
            ))}
          </div>
        ) : (
          <button className={styles.actionButton} onClick={handleAdvance}>
            계속 ▶
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      className={styles.screen}
      style={{
        '--ta-bg': theme.colors.background,
        '--ta-text': theme.colors.dialogueText,
        '--ta-primary': theme.colors.accent,
        '--ta-secondary': theme.colors.speakerName,
        '--ta-accent': theme.colors.accent,
        fontFamily: theme.fonts.dialogue,
      } as React.CSSProperties}
    >
      {/* 상단 스탯 바 */}
      {renderStatsBar()}

      {/* 메인 로그 영역 */}
      <div className={styles.mainArea}>
        {renderLog()}
      </div>

      {/* 하단 현재 노드/선택지 영역 */}
      {renderCurrentNode()}
    </div>
  )
}
