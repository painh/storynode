import { useTranslation } from '../../i18n'
import type { ValidationResult, ValidationIssue } from '../../utils/validation'
import styles from './ValidationWarningModal.module.css'

interface ValidationWarningModalProps {
  isOpen: boolean
  result: ValidationResult
  onContinue: () => void
  onCancel: () => void
  /** true면 오류가 있어도 계속 버튼 활성화 (경고만 표시) */
  allowContinueWithErrors?: boolean
}

export function ValidationWarningModal({
  isOpen,
  result,
  onContinue,
  onCancel,
  allowContinueWithErrors = false,
}: ValidationWarningModalProps) {
  const { validation } = useTranslation()

  if (!isOpen) return null

  const hasErrors = result.errors.length > 0
  const hasWarnings = result.warnings.length > 0
  const canContinue = allowContinueWithErrors || !hasErrors

  const formatLocation = (issue: ValidationIssue): string => {
    const parts: string[] = []
    if (issue.stageTitle) parts.push(issue.stageTitle)
    if (issue.chapterTitle) parts.push(issue.chapterTitle)
    return parts.join(' > ')
  }

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={`${styles.icon} ${hasErrors ? styles.iconError : styles.iconWarning}`}>
            {hasErrors ? '⚠️' : '⚡'}
          </span>
          <h2 className={styles.title}>
            {hasErrors ? validation.validationFailed : validation.title}
          </h2>
        </div>

        <div className={styles.content}>
          <div className={styles.summary}>
            {hasErrors && (
              <div className={`${styles.summaryItem} ${styles.summaryError}`}>
                <span>❌</span>
                <span>{validation.errorCount.replace('{count}', String(result.errors.length))}</span>
              </div>
            )}
            {hasWarnings && (
              <div className={`${styles.summaryItem} ${styles.summaryWarning}`}>
                <span>⚠️</span>
                <span>{validation.warningCount.replace('{count}', String(result.warnings.length))}</span>
              </div>
            )}
          </div>

          <div className={styles.issueList}>
            {result.errors.map((issue, index) => (
              <div key={`error-${index}`} className={`${styles.issueItem} ${styles.issueError}`}>
                <span className={styles.issueIcon}>❌</span>
                <div className={styles.issueContent}>
                  {formatLocation(issue) && (
                    <div className={styles.issueLocation}>{formatLocation(issue)}</div>
                  )}
                  <div className={styles.issueMessage}>{issue.message}</div>
                </div>
              </div>
            ))}
            {result.warnings.map((issue, index) => (
              <div key={`warning-${index}`} className={`${styles.issueItem} ${styles.issueWarning}`}>
                <span className={styles.issueIcon}>⚠️</span>
                <div className={styles.issueContent}>
                  {formatLocation(issue) && (
                    <div className={styles.issueLocation}>{formatLocation(issue)}</div>
                  )}
                  <div className={styles.issueMessage}>{issue.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onCancel}>
            {validation.cancel}
          </button>
          <button 
            className={styles.continueBtn} 
            onClick={onContinue}
            disabled={!canContinue}
          >
            {validation.continueAnyway}
          </button>
        </div>
      </div>
    </div>
  )
}
