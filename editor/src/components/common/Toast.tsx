import { useToastStore, type ToastType } from '../../stores/toastStore'
import styles from './Toast.module.css'

const icons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className={styles.toastContainer}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[toast.type]}`}
        >
          <span className={styles.icon}>{icons[toast.type]}</span>
          <div className={styles.content}>
            <div className={styles.message}>{toast.message}</div>
            {toast.detail && (
              <div className={styles.detail}>{toast.detail}</div>
            )}
          </div>
          <button
            className={styles.closeBtn}
            onClick={() => removeToast(toast.id)}
            title="닫기"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
