// 게임 화면 컴포넌트

import { useState, useEffect, useCallback } from 'react'
import { useGameStore } from '../../../stores/gameStore'
import type { GameTheme } from '../../../types/game'
import styles from '../styles/GameScreen.module.css'

interface GameScreenProps {
  theme: GameTheme
}

export function GameScreen({ theme }: GameScreenProps) {
  const { currentNode, status, advance, selectChoice } = useGameStore()
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  // 타이프라이터 효과
  useEffect(() => {
    if (!currentNode?.text) {
      setDisplayedText('')
      setIsTyping(false)
      return
    }

    const fullText = currentNode.text

    if (theme.effects.dialogueAnimation === 'instant') {
      setDisplayedText(fullText)
      setIsTyping(false)
      return
    }

    if (theme.effects.dialogueAnimation === 'fade') {
      setDisplayedText(fullText)
      setIsTyping(false)
      return
    }

    // 타이프라이터
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
  }, [currentNode?.text, currentNode?.id, theme.effects])

  // 클릭/스페이스로 진행
  const handleAdvance = useCallback(() => {
    if (status !== 'playing') return
    if (!currentNode) return

    // 타이핑 중이면 전체 텍스트 표시
    if (isTyping && currentNode.text) {
      setDisplayedText(currentNode.text)
      setIsTyping(false)
      return
    }

    // choice 노드면 진행 불가
    if (currentNode.type === 'choice') return

    advance()
  }, [status, currentNode, isTyping, advance])

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

  // 빈 상태
  if (!currentNode) {
    return (
      <div className={styles.screen}>
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📖</span>
          <span className={styles.emptyText}>No node to display</span>
        </div>
      </div>
    )
  }

  // 특수 노드 (전투, 상점, 이벤트)
  if (currentNode.type === 'battle') {
    return (
      <div className={styles.screen}>
        <div className={styles.specialNode}>
          <span className={styles.specialIcon}>⚔️</span>
          <span className={styles.specialTitle}>Battle</span>
          <span className={styles.specialDescription}>
            {currentNode.battleGroupId
              ? `Battle Group: ${currentNode.battleGroupId}`
              : 'A battle encounter'}
          </span>
          <button className={styles.specialButton} onClick={handleAdvance}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  if (currentNode.type === 'shop') {
    return (
      <div className={styles.screen}>
        <div className={styles.specialNode}>
          <span className={styles.specialIcon}>🏪</span>
          <span className={styles.specialTitle}>Shop</span>
          <span className={styles.specialDescription}>
            A merchant awaits...
          </span>
          <button className={styles.specialButton} onClick={handleAdvance}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  if (currentNode.type === 'event') {
    return (
      <div className={styles.screen}>
        <div className={styles.specialNode}>
          <span className={styles.specialIcon}>⭐</span>
          <span className={styles.specialTitle}>Event</span>
          <span className={styles.specialDescription}>
            {currentNode.eventId
              ? `Event: ${currentNode.eventId}`
              : 'Something happens...'}
          </span>
          <button className={styles.specialButton} onClick={handleAdvance}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  if (currentNode.type === 'chapter_end') {
    return (
      <div className={styles.screen}>
        <div className={styles.specialNode}>
          <span className={styles.specialIcon}>🏁</span>
          <span className={styles.specialTitle}>Chapter End</span>
          <span className={styles.specialDescription}>
            {currentNode.text || 'The chapter has ended.'}
          </span>
          <button className={styles.specialButton} onClick={handleAdvance}>
            Finish
          </button>
        </div>
      </div>
    )
  }

  // 일반 대사 / 선택지 노드
  const isChoiceNode = currentNode.type === 'choice'
  const showContinue = !isTyping && !isChoiceNode && status === 'playing'

  return (
    <div className={styles.screen}>
      <div className={styles.characterArea}>
        {/* 캐릭터 스탠딩 이미지 영역 (미래 확장) */}
      </div>

      <div
        className={`${styles.dialogueBox} ${isChoiceNode ? styles.noClick : ''}`}
        onClick={isChoiceNode ? undefined : handleAdvance}
      >
        {currentNode.speaker && (
          <span className={styles.speakerName}>
            {currentNode.speaker}
          </span>
        )}

        <div className={styles.dialogueText}>
          {displayedText}
          {isTyping && <span className={styles.cursor} />}
        </div>

        {showContinue && (
          <div className={styles.continueIndicator}>
            Click or Press Space ▼
          </div>
        )}

        {/* 선택지 */}
        {isChoiceNode && currentNode.choices && currentNode.choices.length > 0 && !isTyping && (
          <div className={styles.choicesArea}>
            {currentNode.choices.map((choice, index) => (
              <button
                key={choice.id}
                className={styles.choiceButton}
                onClick={() => handleSelectChoice(index)}
              >
                {choice.text}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
