import { useEffect, useCallback, useRef } from 'react'
import { useEditorStore } from '../stores/editorStore'
import { useSettingsStore } from '../stores/settingsStore'
import { useSearchStore } from '../stores/searchStore'
import {
  isTauri,
  saveProjectToFolder,
  loadProjectFromFolder,
} from '../utils/fileUtils'

// Tauri dialog import (조건부)
let openDialog: typeof import('@tauri-apps/plugin-dialog').open | null = null
let confirmDialog: typeof import('@tauri-apps/plugin-dialog').confirm | null = null
if (isTauri()) {
  import('@tauri-apps/plugin-dialog').then((mod) => {
    openDialog = mod.open
    confirmDialog = mod.confirm
  })
}

interface UseKeyboardShortcutsOptions {
  onSave?: () => void
  onOpen?: () => void
  onNew?: () => void
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const {
    project,
    clearSelection,
    setProject,
  } = useEditorStore()

  // Undo/Redo from temporal store
  const { undo, redo } = useEditorStore.temporal.getState()

  // Cmd+A: 모든 노드 선택
  const selectAllNodes = useCallback(() => {
    const { getCurrentChapter, setSelectedNodes } = useEditorStore.getState()
    const chapter = getCurrentChapter()
    if (chapter) {
      setSelectedNodes(chapter.nodes.map(n => n.id))
    }
  }, [])

  // Delete: 선택된 노드 삭제
  const deleteSelectedNodes = useCallback(() => {
    const { selectedNodeIds, deleteNode, setSelectedNodes } = useEditorStore.getState()
    selectedNodeIds.forEach(id => deleteNode(id))
    setSelectedNodes([])
  }, [])

  // Escape: 선택 해제
  const handleEscape = useCallback(() => {
    clearSelection()
  }, [clearSelection])

  // Cmd+Z: Undo
  const handleUndo = useCallback(() => {
    undo()
  }, [undo])

  // Cmd+Shift+Z: Redo
  const handleRedo = useCallback(() => {
    redo()
  }, [redo])

  // Cmd+L: 자동 정렬
  const handleAutoLayout = useCallback(() => {
    window.dispatchEvent(new CustomEvent('storynode:auto-layout'))
  }, [])

  // Cmd+F: 검색 (현재 캔버스)
  const handleSearch = useCallback(() => {
    useSearchStore.getState().openSearch('canvas')
  }, [])

  // Cmd+Shift+F: 전체 검색
  const handleGlobalSearch = useCallback(() => {
    useSearchStore.getState().openSearch('global')
  }, [])

  // Cmd+S: 저장
  const handleSave = useCallback(async () => {
    if (options.onSave) {
      options.onSave()
      return
    }

    if (!isTauri() || !openDialog) {
      alert('Save is only available in desktop app')
      return
    }

    try {
      const selected = await openDialog({
        directory: true,
        multiple: false,
        title: 'Select folder to save project',
      })

      if (selected && typeof selected === 'string') {
        await saveProjectToFolder(selected, project)
        alert('Project saved!')
      }
    } catch (error) {
      alert('Failed to save: ' + (error as Error).message)
    }
  }, [options, project])

  // Cmd+O: 열기
  const handleOpen = useCallback(async () => {
    if (options.onOpen) {
      options.onOpen()
      return
    }

    if (!isTauri() || !openDialog) {
      alert('Open is only available in desktop app')
      return
    }

    try {
      const selected = await openDialog({
        directory: true,
        multiple: false,
        title: 'Select project folder to open',
      })

      if (selected && typeof selected === 'string') {
        const loadedProject = await loadProjectFromFolder(selected)
        setProject(loadedProject)
        alert('Project loaded!')
      }
    } catch (error) {
      alert('Failed to open: ' + (error as Error).message)
    }
  }, [options, setProject])

  // Cmd+N: 새 프로젝트
  const isNewDialogOpenRef = useRef(false)
  const handleNew = useCallback(async () => {
    if (options.onNew) {
      options.onNew()
      return
    }

    // 중복 실행 방지
    if (isNewDialogOpenRef.current) return
    isNewDialogOpenRef.current = true

    try {
      const confirmed = confirmDialog
        ? await confirmDialog('Create a new project? Unsaved changes will be lost.', { title: 'New Project', kind: 'warning' })
        : confirm('Create a new project? Unsaved changes will be lost.')

      if (confirmed) {
        // 새 프로젝트 생성 시 lastProjectPath 초기화 (자동저장이 이전 경로에 저장하지 않도록)
        useSettingsStore.getState().setLastProjectPath(null)

        setProject({
          name: 'New Story Project',
          version: '1.0.0',
          stages: [
            {
              id: 'stage_1',
              title: 'Stage 1',
              description: 'First stage',
              partyCharacters: ['kairen'],
              chapters: [
                {
                  id: 'chapter_1',
                  title: 'Chapter 1',
                  description: 'First chapter',
                  nodes: [],
                  startNodeId: '',
                }
              ]
            }
          ]
        })
      }
    } finally {
      isNewDialogOpenRef.current = false
    }
  }, [options, setProject])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey
      const isShift = e.shiftKey
      const target = e.target as HTMLElement
      const isInputFocused = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

      // Cmd+S: 저장 (항상 가로채기)
      if (isMod && e.key === 's') {
        e.preventDefault()
        handleSave()
        return
      }

      // Cmd+O: 열기 (항상 가로채기)
      if (isMod && e.key === 'o') {
        e.preventDefault()
        handleOpen()
        return
      }

      // Cmd+N: 새 프로젝트 (항상 가로채기)
      if (isMod && e.key === 'n') {
        e.preventDefault()
        handleNew()
        return
      }

      // Cmd+Z: Undo (항상 가로채기)
      if (isMod && !isShift && e.key === 'z') {
        e.preventDefault()
        handleUndo()
        return
      }

      // Cmd+Shift+Z: Redo (항상 가로채기)
      if (isMod && isShift && e.key === 'z') {
        e.preventDefault()
        handleRedo()
        return
      }

      // Cmd+Y: Redo (Windows 스타일, 항상 가로채기)
      if (isMod && e.key === 'y') {
        e.preventDefault()
        handleRedo()
        return
      }

      // Cmd+L: 자동 정렬 (항상 가로채기)
      if (isMod && e.key === 'l') {
        e.preventDefault()
        handleAutoLayout()
        return
      }

      // Cmd+F: 검색 (현재 캔버스)
      if (isMod && !isShift && e.key === 'f') {
        e.preventDefault()
        handleSearch()
        return
      }

      // Cmd+Shift+F: 전체 검색
      if (isMod && isShift && e.key === 'f') {
        e.preventDefault()
        handleGlobalSearch()
        return
      }

      // 입력 필드에 포커스가 있으면 아래 단축키는 무시
      if (isInputFocused) return

      // Cmd+A: 모든 노드 선택
      if (isMod && e.key === 'a') {
        e.preventDefault()
        selectAllNodes()
        return
      }

      // Delete/Backspace: 노드 삭제
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        deleteSelectedNodes()
        return
      }

      // Escape: 선택 해제
      if (e.key === 'Escape') {
        e.preventDefault()
        handleEscape()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    selectAllNodes,
    deleteSelectedNodes,
    handleEscape,
    handleSave,
    handleOpen,
    handleNew,
    handleUndo,
    handleRedo,
    handleAutoLayout,
    handleSearch,
    handleGlobalSearch,
  ])

  return {
    selectAllNodes,
    deleteSelectedNodes,
    handleEscape,
    handleSave,
    handleOpen,
    handleNew,
    handleUndo,
    handleRedo,
    handleAutoLayout,
    handleSearch,
    handleGlobalSearch,
  }
}
