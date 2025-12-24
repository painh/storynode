// 텍스트 어드벤처 스타일 게임 화면 컴포넌트
// 스크롤링 로그 UI

import { useRef, useEffect, useCallback, useState } from 'react'
import { useGameStore } from '../../../stores/gameStore'
import type { GameTheme, GameHistoryEntry } from '../../../types/game'
import styles from '../styles/TextAdventureScreen.module.css'

interface TextAdventureScreenProps {
  theme: GameTheme
}

export function TextAdventureScreen({ theme }: TextAdventureScreenProps) {
  const { currentNode, gameState, status, advance, selectChoice } = useGameStore()
  const mainAreaRef = useRef<HTMLDivElement>(null)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const lastHistoryLengthRef = useRef(0)

  // 마지막 히스토리 항목에 대한 타이프라이터 효과
  useEffect(() => {
    const history = gameState?.history || []
    const lastEntry = history[history.length - 1]

    // 새 항목이 추가되지 않았으면 무시
    if (history.length <= lastHistoryLengthRef.current) {
      lastHistoryLengthRef.current = history.length
      return
    }
    lastHistoryLengthRef.current = history.length

    // 이미지 타입이거나 텍스트가 없으면 타이핑 효과 없음
    if (!lastEntry || lastEntry.type === 'image' || !lastEntry.content) {
      setDisplayedText('')
      setIsTyping(false)
      return
    }

    const fullText = lastEntry.content

    // instant 모드면 바로 표시
    if (theme.effects.dialogueAnimation === 'instant') {
      setDisplayedText(fullText)
      setIsTyping(false)
      return
    }

    // 타이프라이터 효과
    setDisplayedText('')
    setIsTyping(true)
    let index = 0

    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1))
        index++
      } else {
        setIsTyping(false)
        clearInterval(interval)
      }
    }, theme.effects.typewriterSpeed)

    return () => clearInterval(interval)
  }, [gameState?.history?.length, theme.effects])

  // 로그 맨 아래로 자동 스크롤
  useEffect(() => {
    if (mainAreaRef.current) {
      mainAreaRef.current.scrollTop = mainAreaRef.current.scrollHeight
    }
  }, [gameState?.history?.length])

  // 자동 진행이 필요한 노드인지 확인
  const shouldAutoAdvance = useCallback(() => {
    if (status !== 'playing') return false
    if (!currentNode) return false

    // 선택지 노드는 사용자 입력 대기
    if (currentNode.type === 'choice') return false

    // 특수 노드들 (전투, 상점, 이벤트, 챕터 종료)는 사용자 입력 대기
    if (['battle', 'shop', 'event', 'chapter_end'].includes(currentNode.type)) return false

    // 그 외 노드들 (dialogue, start, condition, variable)은 자동 진행
    return true
  }, [status, currentNode])

  // 텍스트 어드벤처 모드: 선택지/특수 노드까지 자동 진행
  useEffect(() => {
    if (!shouldAutoAdvance()) return
    // 타이핑 중이면 대기
    if (isTyping) return

    // 타이핑 완료 후 약간의 딜레이 후 자동 진행
    const timer = setTimeout(() => {
      advance()
    }, 300)

    return () => clearTimeout(timer)
  }, [currentNode?.id, shouldAutoAdvance, advance, isTyping])

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

  // 효과 클래스 가져오기 (단일)
  const getEffectClass = (effect?: string): string => {
    if (!effect || effect === 'none') return ''
    switch (effect) {
      case 'fadeIn': return styles.effectFadeIn
      case 'shake': return styles.effectShake
      case 'slideLeft': return styles.effectSlideLeft
      case 'slideRight': return styles.effectSlideRight
      case 'slideUp': return styles.effectSlideUp
      case 'slideDown': return styles.effectSlideDown
      case 'zoomIn': return styles.effectZoomIn
      case 'zoomOut': return styles.effectZoomOut
      case 'bounce': return styles.effectBounce
      case 'flash': return styles.effectFlash
      case 'pulse': return styles.effectPulse
      default: return ''
    }
  }

  // 다중 효과 클래스 가져오기 (effects 배열 지원)
  const getEffectClasses = (effects?: string[], effect?: string): string => {
    // effects 배열이 있으면 사용, 없으면 기존 effect 사용
    const effectList = effects && effects.length > 0 ? effects : (effect && effect !== 'none' ? [effect] : [])
    return effectList.map(e => getEffectClass(e)).filter(Boolean).join(' ')
  }

  // 이미지 로그 항목 렌더링
  const renderImageEntry = (entry: GameHistoryEntry, index: number) => {
    if (!entry.imageData) return null

    if (entry.imageData.isRemoval) {
      return (
        <div key={index} className={`${styles.logEntry} ${styles.imageRemovalEntry}`}>
          <span className={styles.logText}>{entry.content}</span>
        </div>
      )
    }

    const effectStyle: React.CSSProperties = entry.imageData.effectDuration
      ? { animationDuration: `${entry.imageData.effectDuration}ms` }
      : {}

    return (
      <div key={index} className={`${styles.logEntry} ${styles.imageLogEntry}`}>
        <div className={styles.imageWrapper}>
          <img
            src={entry.imageData.resourcePath}
            alt=""
            className={`${styles.inlineImage} ${getEffectClasses(entry.imageData.effects, entry.imageData.effect)}`}
            style={effectStyle}
          />
        </div>
      </div>
    )
  }

  // 히스토리 로그 렌더링
  const renderLog = () => {
    if (!gameState?.history) return null

    const historyLength = gameState.history.length

    return (
      <div className={styles.logContainer}>
        {gameState.history.map((entry, index) => {
          const isLastEntry = index === historyLength - 1

          // 이미지 타입 항목
          if (entry.type === 'image') {
            return renderImageEntry(entry, index)
          }

          // 마지막 항목이고 타이핑 중이면 타이핑 효과 적용
          const textToShow = isLastEntry && isTyping ? displayedText : entry.content

          // 일반 텍스트 항목
          return (
            <div key={index} className={styles.logEntry}>
              {entry.speaker && (
                <span className={styles.logSpeaker}>{entry.speaker}: </span>
              )}
              <span className={styles.logText}>{textToShow}</span>
              {isLastEntry && isTyping && <span className={styles.cursor}>|</span>}
              {entry.choiceText && (
                <span className={styles.logChoice}> → {entry.choiceText}</span>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // 특수 노드 진행 핸들러
  const handleSpecialAdvance = useCallback(() => {
    if (status !== 'playing') return
    advance()
  }, [status, advance])

  // 현재 노드 렌더링 (선택지/특수 노드만 표시)
  const renderCurrentNode = () => {
    if (!currentNode) {
      return null
    }

    // 자동 진행되는 노드는 하단에 표시하지 않음
    if (shouldAutoAdvance()) {
      return (
        <div className={styles.currentSection}>
          <div className={styles.autoAdvancing}>진행 중...</div>
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
          <button className={styles.actionButton} onClick={handleSpecialAdvance}>
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
          <button className={styles.actionButton} onClick={handleSpecialAdvance}>
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
          <button className={styles.actionButton} onClick={handleSpecialAdvance}>
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
          <button className={styles.actionButton} onClick={handleSpecialAdvance}>
            종료
          </button>
        </div>
      )
    }

    // 선택지 노드
    if (currentNode.type === 'choice' && currentNode.choices && currentNode.choices.length > 0) {
      return (
        <div className={styles.currentSection}>
          {/* 선택지 질문 텍스트 */}
          {currentNode.text && (
            <div className={styles.currentText}>
              {currentNode.speaker && (
                <span className={styles.currentSpeaker}>{currentNode.speaker}: </span>
              )}
              <span>{currentNode.text}</span>
            </div>
          )}

          {/* 선택지 */}
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
        </div>
      )
    }

    return null
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
      <div ref={mainAreaRef} className={styles.mainArea}>
        {renderLog()}
      </div>

      {/* 하단 현재 노드/선택지 영역 */}
      {renderCurrentNode()}
    </div>
  )
}
