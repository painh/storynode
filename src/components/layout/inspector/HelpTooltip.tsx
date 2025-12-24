import { useState, useRef, useEffect } from 'react'
import styles from '../Inspector.module.css'

interface HelpTooltipProps {
  content: string
}

export function HelpTooltip({ content }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div className={styles.helpContainer}>
      <button
        ref={buttonRef}
        className={styles.helpButton}
        onClick={() => setIsOpen(!isOpen)}
        title="도움말"
      >
        ?
      </button>
      {isOpen && (
        <div ref={tooltipRef} className={styles.helpTooltip}>
          <div className={styles.helpTooltipContent}>
            {content}
          </div>
        </div>
      )}
    </div>
  )
}
