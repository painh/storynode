// 게임 화면 컴포넌트

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useGameStore } from '../../../stores/gameStore'
import type { GameTheme, ActiveImage, WindowStyle } from '../../../types/game'
import styles from '../styles/GameScreen.module.css'

interface GameScreenProps {
  theme: GameTheme
}

// 윈도우 스타일 클래스 가져오기
const getWindowStyleClass = (style?: WindowStyle): string => {
  switch (style) {
    case 'dos': return styles.windowDos
    case 'win31': return styles.windowWin31
    case 'win95': return styles.windowWin95
    case 'system7': return styles.windowSystem7
    default: return ''
  }
}

// 윈도우 타이틀바 컴포넌트
function WindowTitleBar({ theme, title }: { theme: GameTheme; title: string }) {
  const windowConfig = theme.window
  if (!windowConfig || windowConfig.style === 'none') return null

  const renderButtons = () => {
    const buttons = []

    if (windowConfig.showMinMaxButtons) {
      if (windowConfig.style === 'win95') {
        buttons.push(
          <button key="min" className={styles.titleBarButton}>_</button>,
          <button key="max" className={styles.titleBarButton}>□</button>
        )
      } else if (windowConfig.style === 'win31') {
        buttons.push(
          <button key="min" className={styles.titleBarButton}>▼</button>,
          <button key="max" className={styles.titleBarButton}>▲</button>
        )
      }
    }

    if (windowConfig.showCloseButton) {
      buttons.push(
        <button
          key="close"
          className={`${styles.titleBarButton} ${windowConfig.style === 'win95' ? styles.close : ''}`}
        >
          {windowConfig.style === 'system7' ? '' : '×'}
        </button>
      )
    }

    return buttons
  }

  return (
    <div
      className={styles.titleBar}
      style={{
        background: windowConfig.titleBarGradient || windowConfig.titleBarColor,
        color: windowConfig.titleBarTextColor,
        height: windowConfig.titleBarHeight,
      }}
    >
      <span className={styles.titleBarText}>{title}</span>
      <div className={styles.titleBarButtons}>
        {renderButtons()}
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

// 퇴장 효과 클래스 가져오기
const getExitEffectClass = (effect?: string): string => {
  if (!effect || effect === 'none') return ''
  switch (effect) {
    case 'fadeOut': return styles.exitFadeOut
    case 'slideOutLeft': return styles.exitSlideOutLeft
    case 'slideOutRight': return styles.exitSlideOutRight
    case 'slideOutUp': return styles.exitSlideOutUp
    case 'slideOutDown': return styles.exitSlideOutDown
    case 'zoomOut': return styles.exitZoomOut
    case 'shrink': return styles.exitShrink
    default: return ''
  }
}

// 이미지 레이어 컴포넌트
function ImageLayers({ images, hiddenImageIds, borderedImageIds }: { 
  images: ActiveImage[]
  hiddenImageIds: Set<string>
  borderedImageIds: Set<string>
}) {
  // 레이어 순서로 정렬 (background가 가장 뒤, 그 다음 character)
  const sortedImages = useMemo(() => {
    const layerPriority: Record<string, number> = {
      background: 0,
      character: 1,
    }
    return [...images].sort((a, b) => {
      const aPriority = layerPriority[a.layer] ?? 2
      const bPriority = layerPriority[b.layer] ?? 2
      if (aPriority !== bPriority) return aPriority - bPriority
      return a.layerOrder - b.layerOrder
    })
  }, [images])

  const getAlignmentClass = (alignment: string) => {
    switch (alignment) {
      case 'left': return styles.alignLeft
      case 'center': return styles.alignCenter
      case 'right': return styles.alignRight
      default: return styles.alignCustom
    }
  }

  const getImageStyle = (img: ActiveImage): React.CSSProperties => {
    const style: React.CSSProperties = {}
    if (img.alignment === 'custom') {
      if (img.x !== undefined) style.left = `${img.x}%`
      if (img.y !== undefined) style.top = `${img.y}%`
    }
    if (img.flipHorizontal) {
      style.transform = (style.transform || '') + ' scaleX(-1)'
    }
    // 퇴장 중이면 퇴장 애니메이션 지속 시간, 아니면 등장 애니메이션 지속 시간
    if (img.isExiting && img.exitEffectDuration) {
      style.animationDuration = `${img.exitEffectDuration}ms`
    } else if (img.effectDuration) {
      style.animationDuration = `${img.effectDuration}ms`
    }
    return style
  }

  if (sortedImages.length === 0) return null

  return (
    <div className={styles.imageLayerContainer}>
      {sortedImages.map((img) => 
        hiddenImageIds.has(img.id) ? null : (
          <img
            // instanceId로 키를 설정하여 매번 새 애니메이션 재생
            key={`${img.layer}-${img.layerOrder}-${img.instanceId}`}
            src={img.resourcePath}
            alt=""
            className={`${styles.layerImage} ${img.layer === 'background' ? styles.background : ''} ${getAlignmentClass(img.alignment)} ${img.isExiting ? getExitEffectClass(img.exitEffect) : getEffectClasses(img.effects, img.effect)} ${borderedImageIds.has(img.id) ? styles.debugBorder : ''}`}
            style={getImageStyle(img)}
          />
        )
      )}
    </div>
  )
}

export function GameScreen({ theme }: GameScreenProps) {
  const { currentNode, status, advance, selectChoice, gameState, debug, engine } = useGameStore()
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  // 활성 이미지 목록
  const activeImages = gameState?.activeImages || []

  // 타이프라이터 효과
  useEffect(() => {
    if (!currentNode?.text) {
      setDisplayedText('')
      setIsTyping(false)
      return
    }

    // 변수 치환 적용
    const fullText = engine ? engine.interpolateText(currentNode.text) : currentNode.text

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
      const fullText = engine ? engine.interpolateText(currentNode.text) : currentNode.text
      setDisplayedText(fullText)
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
  const windowStyleClass = getWindowStyleClass(theme.window?.style)
  const hasWindowStyle = theme.window && theme.window.style !== 'none'

  return (
    <div className={styles.screen}>
      {/* 이미지 레이어 */}
      <ImageLayers 
        images={activeImages} 
        hiddenImageIds={debug.hiddenImageIds}
        borderedImageIds={debug.borderedImageIds}
      />

      <div className={styles.characterArea}>
        {/* 캐릭터 스탠딩 이미지 영역 */}
      </div>

      <div className={`${styles.windowFrame} ${windowStyleClass}`}>
        {/* 레트로 윈도우 타이틀바 */}
        <WindowTitleBar
          theme={theme}
          title={currentNode.speaker || 'Message'}
        />

        <div
          className={`${styles.dialogueBox} ${isChoiceNode ? styles.noClick : ''}`}
          onClick={isChoiceNode ? undefined : handleAdvance}
        >
          {/* 윈도우 스타일이 아닐 때만 화자 이름 표시 (타이틀바에 표시되므로) */}
          {currentNode.speaker && !hasWindowStyle && (
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
              {currentNode.choices.map((choice, index) => {
                const isDisabled = !!(choice.condition && engine && !engine.checkCondition(choice.condition))
                const choiceText = engine ? engine.interpolateText(choice.text) : choice.text
                const disabledText = choice.disabledText && engine 
                  ? engine.interpolateText(choice.disabledText) 
                  : choice.disabledText
                return (
                  <button
                    key={choice.id}
                    className={`${styles.choiceButton} ${isDisabled ? styles.disabled : ''}`}
                    onClick={() => !isDisabled && handleSelectChoice(index)}
                    disabled={isDisabled}
                  >
                    {choiceText}
                    {isDisabled && disabledText && (
                      <span className={styles.disabledReason}>{disabledText}</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
