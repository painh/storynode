import { useEffect, useRef, useCallback } from 'react'
import { useEditorStore } from '../stores/editorStore'
import { useSettingsStore } from '../stores/settingsStore'
import { isTauri, saveProjectToFolder } from '../utils/fileUtils'

/**
 * 자동 저장 훅
 * - onChange 모드: 프로젝트 변경 시마다 저장
 * - interval 모드: 일정 시간 간격으로 저장
 * - both 모드: 둘 다 수행
 */
export function useAutoSave() {
  const project = useEditorStore((state) => state.project)
  const markClean = useEditorStore((state) => state.markClean)
  const { settings } = useSettingsStore()

  const lastSavedRef = useRef<string>('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastProjectPath = settings.lastProjectPath

  // 저장 함수
  const saveProject = useCallback(async () => {
    if (!isTauri() || !lastProjectPath) return

    // 안전장치: 빈 프로젝트(노드가 하나도 없는 프로젝트)는 자동저장하지 않음
    // 기존 프로젝트를 덮어쓰는 것을 방지
    const totalNodes = project.stages.reduce((sum, stage) =>
      sum + stage.chapters.reduce((chapterSum, chapter) =>
        chapterSum + chapter.nodes.length, 0), 0)

    if (totalNodes === 0) {
      console.log('[AutoSave] Skipped: Project has no nodes (safety check)')
      return
    }

    // 변경사항 확인
    const currentState = JSON.stringify(project)
    if (currentState === lastSavedRef.current) return

    try {
      await saveProjectToFolder(lastProjectPath, project)
      lastSavedRef.current = currentState
      markClean() // 자동 저장 후 isDirty를 false로
      console.log('[AutoSave] Project saved automatically')
    } catch (error) {
      console.error('[AutoSave] Failed to save:', error)
    }
  }, [project, lastProjectPath, markClean])

  // onChange 모드: 프로젝트 변경 감지
  useEffect(() => {
    if (!settings.autoSaveEnabled) return
    if (settings.autoSaveMode !== 'onChange' && settings.autoSaveMode !== 'both') return
    if (!lastProjectPath) return

    // 디바운스: 변경 후 1초 뒤에 저장
    const timeoutId = setTimeout(() => {
      saveProject()
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [project, settings.autoSaveEnabled, settings.autoSaveMode, lastProjectPath, saveProject])

  // interval 모드: 일정 시간마다 저장
  useEffect(() => {
    if (!settings.autoSaveEnabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    if (settings.autoSaveMode !== 'interval' && settings.autoSaveMode !== 'both') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    if (!lastProjectPath) return

    // 기존 인터벌 제거
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // 새 인터벌 설정
    const intervalMs = settings.autoSaveIntervalMinutes * 60 * 1000
    intervalRef.current = setInterval(() => {
      saveProject()
    }, intervalMs)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [settings.autoSaveEnabled, settings.autoSaveMode, settings.autoSaveIntervalMinutes, lastProjectPath, saveProject])

  // 마운트 해제 시 인터벌 정리
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return { saveProject }
}
