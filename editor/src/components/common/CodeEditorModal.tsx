import { useState, useEffect, useCallback } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import styles from './CodeEditorModal.module.css'

interface CodeEditorModalProps {
  isOpen: boolean
  onClose: () => void
  value: string
  onChange: (value: string) => void
  title?: string
}

export function CodeEditorModal({ 
  isOpen, 
  onClose, 
  value, 
  onChange,
  title = 'JavaScript Code'
}: CodeEditorModalProps) {
  const [localValue, setLocalValue] = useState(value)

  // Sync local value when modal opens or external value changes
  useEffect(() => {
    if (isOpen) {
      setLocalValue(value)
    }
  }, [isOpen, value])

  const handleSave = useCallback(() => {
    onChange(localValue)
    onClose()
  }, [localValue, onChange, onClose])

  const handleCancel = useCallback(() => {
    setLocalValue(value)
    onClose()
  }, [value, onClose])

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close without saving
      if (e.key === 'Escape') {
        e.preventDefault()
        handleCancel()
      }
      // Cmd/Ctrl + S to save and close
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleSave, handleCancel])

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={handleCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <span className={styles.icon}>{"</>"}</span>
            <h2 className={styles.title}>{title}</h2>
          </div>
          <button className={styles.closeButton} onClick={handleCancel}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.editorWrapper}>
            <CodeMirror
              value={localValue}
              height="100%"
              theme={oneDark}
              extensions={[javascript()]}
              onChange={setLocalValue}
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                highlightActiveLine: true,
                indentOnInput: true,
              }}
            />
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.helpText}>
            <span className={styles.shortcut}>Ctrl+S</span> 저장 · 
            <span className={styles.shortcut}>Esc</span> 취소
          </div>
          <div className={styles.actions}>
            <button className={styles.cancelBtn} onClick={handleCancel}>
              취소
            </button>
            <button className={styles.saveBtn} onClick={handleSave}>
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
