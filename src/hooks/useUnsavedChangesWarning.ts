import { useEffect, useCallback } from 'react'
import { useEditorStore } from '../stores/editorStore'
import { isTauri } from '../utils/fileUtils'

/**
 * 저장하지 않은 변경사항이 있을 때 종료 경고를 표시하는 훅
 * - 웹: beforeunload 이벤트로 브라우저 종료 시 경고
 * - Tauri: window close 이벤트로 앱 종료 시 경고
 */
export function useUnsavedChangesWarning() {
  const isDirty = useEditorStore((state) => state.isDirty)

  // beforeunload 핸들러 (웹 버전)
  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (isDirty) {
      e.preventDefault()
      // 대부분의 최신 브라우저는 사용자 정의 메시지를 무시하고 기본 메시지를 표시함
      e.returnValue = '저장하지 않은 변경사항이 있습니다. 정말 나가시겠습니까?'
      return e.returnValue
    }
  }, [isDirty])

  // 웹 버전: beforeunload 이벤트 리스너
  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [handleBeforeUnload])

  // Tauri 버전: 창 닫기 이벤트 처리
  useEffect(() => {
    if (!isTauri()) return

    let unlisten: (() => void) | undefined

    const setupTauriCloseHandler = async () => {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window')
        const currentWindow = getCurrentWindow()

        unlisten = await currentWindow.onCloseRequested(async (event) => {
          // isDirty 상태를 직접 스토어에서 가져옴 (클로저 문제 방지)
          const currentIsDirty = useEditorStore.getState().isDirty

          if (currentIsDirty) {
            // 닫기 기본 동작 방지
            event.preventDefault()

            // Tauri 다이얼로그로 확인
            const { confirm } = await import('@tauri-apps/plugin-dialog')
            const confirmed = await confirm(
              '저장하지 않은 변경사항이 있습니다. 정말 종료하시겠습니까?',
              {
                title: '변경사항 저장',
                kind: 'warning',
                okLabel: '저장하지 않고 종료',
                cancelLabel: '취소',
              }
            )

            if (confirmed) {
              // 사용자가 종료를 확인하면 창 닫기
              await currentWindow.destroy()
            }
          }
        })
      } catch (error) {
        console.error('Failed to setup Tauri close handler:', error)
      }
    }

    setupTauriCloseHandler()

    return () => {
      if (unlisten) {
        unlisten()
      }
    }
  }, [])

  return { isDirty }
}
