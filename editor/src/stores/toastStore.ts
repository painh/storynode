import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  message: string
  detail?: string  // 추가 정보 (예: 파일 경로)
  duration?: number
}

interface ToastState {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearAllToasts: () => void
}

let toastId = 0

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast_${++toastId}`
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 4000,
    }

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }))

    // 자동 제거
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }))
      }, newToast.duration)
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },

  clearAllToasts: () => {
    set({ toasts: [] })
  },
}))

// 편의 함수들
export const toast = {
  success: (message: string, detail?: string) => {
    useToastStore.getState().addToast({ type: 'success', message, detail })
  },
  error: (message: string, detail?: string) => {
    useToastStore.getState().addToast({ type: 'error', message, detail, duration: 6000 })
  },
  info: (message: string, detail?: string) => {
    useToastStore.getState().addToast({ type: 'info', message, detail })
  },
  warning: (message: string, detail?: string) => {
    useToastStore.getState().addToast({ type: 'warning', message, detail, duration: 5000 })
  },
}
