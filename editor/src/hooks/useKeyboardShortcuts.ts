import { useEffect, useCallback, useRef } from 'react'
import { useEditorStore } from '../stores/editorStore'
import { useCanvasStore } from '../stores/canvasStore'
import { useSettingsStore } from '../stores/settingsStore'
import { useSearchStore } from '../stores/searchStore'
import { useGameStore } from '../stores/gameStore'
import {
  isTauri,
  saveProjectToFolder,
  loadProjectFromFolder,
  isFileSystemAccessSupported,
  pickWebDirectory,
  getWebDirectoryHandle,
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

  // Undo/Redo from temporal store (editor + canvas)
  const editorTemporal = useEditorStore.temporal.getState()
  const canvasTemporal = useCanvasStore.temporal.getState()

  // Cmd+A: 모든 노드 선택 (React Flow 이벤트로 처리)
  const selectAllNodes = useCallback(() => {
    window.dispatchEvent(new CustomEvent('storynode:select-all'))
  }, [])

  // Delete: 선택된 노드 삭제 (한 번에 삭제하여 Undo 시 한 번에 복원)
  const deleteSelectedNodes = useCallback(() => {
    const { selectedNodeIds, deleteNodes, deleteCommentNode, getCommentNodes, getCurrentChapter } = useEditorStore.getState()
    if (selectedNodeIds.length > 0) {
      // Comment 노드와 일반 노드 분리
      const commentNodes = getCommentNodes()
      const commentIds = commentNodes.map(c => c.id)

      // Start node는 삭제 불가
      const chapter = getCurrentChapter()
      const startNodeId = chapter?.startNodeId

      const storyNodeIds = selectedNodeIds.filter(id => !commentIds.includes(id) && id !== startNodeId)
      const selectedCommentIds = selectedNodeIds.filter(id => commentIds.includes(id))

      // 일반 노드 삭제
      if (storyNodeIds.length > 0) {
        deleteNodes(storyNodeIds)
      }

      // Comment 노드 삭제
      selectedCommentIds.forEach(id => {
        deleteCommentNode(id)
      })
    }
  }, [])

  // Escape: 선택 해제
  const handleEscape = useCallback(() => {
    clearSelection()
  }, [clearSelection])

  // Cmd+Z: Undo (editor와 canvas 동시에)
  const handleUndo = useCallback(() => {
    editorTemporal.undo()
    canvasTemporal.undo()
  }, [editorTemporal, canvasTemporal])

  // Cmd+Shift+Z: Redo (editor와 canvas 동시에)
  const handleRedo = useCallback(() => {
    editorTemporal.redo()
    canvasTemporal.redo()
  }, [editorTemporal, canvasTemporal])

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

  // F5: 게임 실행
  const handlePlayGame = useCallback(() => {
    const gameStore = useGameStore.getState()
    if (gameStore.status === 'idle') {
      gameStore.openGame()
    } else if (gameStore.status === 'paused') {
      gameStore.resume()
    }
  }, [])

  // Ctrl+/ 또는 Cmd+/: 선택된 노드들을 Comment로 감싸기
  const handleWrapWithComment = useCallback(() => {
    const { wrapNodesWithComment } = useEditorStore.getState()
    const { nodes } = useCanvasStore.getState()
    // React Flow nodes의 실제 측정된 크기를 전달
    wrapNodesWithComment(nodes)
  }, [])

  // Cmd+C: 복사 (시스템 클립보드 사용)
  const handleCopy = useCallback(async () => {
    const { selectedNodeIds, getCurrentChapter } = useEditorStore.getState()
    const { getNodePosition, getCommentNodes } = useCanvasStore.getState()
    const chapter = getCurrentChapter()

    if (!chapter || selectedNodeIds.length === 0) return

    const commentNodes = getCommentNodes(chapter.id)

    // 선택된 노드들의 데이터와 위치 수집
    const nodesToCopy = selectedNodeIds
      .map(id => {
        const node = chapter.nodes.find(n => n.id === id)
        if (node) {
          return {
            node,
            position: getNodePosition(chapter.id, id) || { x: 0, y: 0 },
          }
        }
        return null
      })
      .filter((item): item is { node: typeof chapter.nodes[0]; position: { x: number; y: number } } => item !== null)

    // 선택된 Comment 노드들 수집
    const commentsToCopy = commentNodes.filter(c => selectedNodeIds.includes(c.id))

    if (nodesToCopy.length === 0 && commentsToCopy.length === 0) return

    const clipboardData = {
      type: 'storynode-clipboard',
      nodes: nodesToCopy,
      comments: commentsToCopy,
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(clipboardData))
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }, [])

  // Cmd+V: 붙여넣기 (시스템 클립보드 사용)
  const handlePaste = useCallback(async () => {
    const { currentChapterId, pasteNodes } = useEditorStore.getState()
    const { updateNodePosition } = useCanvasStore.getState()

    if (!currentChapterId) return

    try {
      const text = await navigator.clipboard.readText()
      const parsed = JSON.parse(text)

      // StoryNode 클립보드 데이터인지 확인
      if (parsed.type !== 'storynode-clipboard') {
        // 다른 타입의 데이터면 무시 (토스트 메시지 표시 가능)
        console.log('Clipboard does not contain StoryNode data')
        return
      }

      const clipboard = parsed as {
        type: string
        nodes: Array<{ node: import('../types/story').StoryNode; position: { x: number; y: number } }>
        comments: Array<{ id: string; position: { x: number; y: number }; data: import('../types/editor').CommentNodeData }>
      }

      // 붙여넣기 오프셋 (기존 위치에서 약간 이동)
      const offset = { x: 50, y: 50 }

      // Story 노드 붙여넣기
      if (clipboard.nodes.length > 0) {
        const nodesWithOffset = clipboard.nodes.map(item => ({
          node: item.node,
          position: {
            x: item.position.x + offset.x,
            y: item.position.y + offset.y,
          },
        }))

        const newIds = pasteNodes(nodesWithOffset)

        // 새 노드들의 위치 저장
        nodesWithOffset.forEach((item, index) => {
          if (newIds[index]) {
            updateNodePosition(currentChapterId, newIds[index], item.position)
          }
        })
      }

      // Comment 노드 붙여넣기
      if (clipboard.comments.length > 0) {
        clipboard.comments.forEach(comment => {
          const newId = useCanvasStore.getState().createCommentNode(currentChapterId, {
            x: comment.position.x + offset.x,
            y: comment.position.y + offset.y,
          })
          // Comment 데이터 업데이트
          useCanvasStore.getState().updateCommentNode(currentChapterId, newId, comment.data)
        })
      }
    } catch (error) {
      // JSON 파싱 실패 또는 클립보드 접근 실패시 무시
      console.log('Failed to paste:', error)
    }
  }, [])

  // Cmd+S: 저장 (lastProjectPath가 있으면 바로 저장, 없으면 Save As)
  const handleSave = useCallback(async () => {
    if (options.onSave) {
      options.onSave()
      return
    }

    // 웹 환경에서 File System Access API 사용
    if (!isTauri() && isFileSystemAccessSupported()) {
      const handle = getWebDirectoryHandle()
      if (handle) {
        try {
          await saveProjectToFolder('', project)
          useEditorStore.getState().markClean()
        } catch (error) {
          alert('Failed to save: ' + (error as Error).message)
        }
      } else {
        await handleSaveAs()
      }
      return
    }

    if (!isTauri()) {
      alert('Save is only available in desktop app or browsers with File System Access API')
      return
    }

    const { settings, addRecentProject } = useSettingsStore.getState()
    const lastPath = settings.lastProjectPath

    if (lastPath) {
      // 기존 경로에 바로 저장
      try {
        await saveProjectToFolder(lastPath, project)
        addRecentProject(lastPath, project.name)
        useEditorStore.getState().markClean()
      } catch (error) {
        alert('Failed to save: ' + (error as Error).message)
      }
    } else {
      // 경로가 없으면 Save As 동작
      await handleSaveAs()
    }
  }, [options, project])

  // Cmd+Shift+S: 다른 이름으로 저장
  const handleSaveAs = useCallback(async () => {
    // 웹 환경에서 File System Access API 사용
    if (!isTauri() && isFileSystemAccessSupported()) {
      try {
        const handle = await pickWebDirectory()
        if (handle) {
          await saveProjectToFolder('', project)
          useEditorStore.getState().markClean()
        }
      } catch (error) {
        alert('Failed to save: ' + (error as Error).message)
      }
      return
    }

    if (!isTauri() || !openDialog) {
      alert('Save is only available in desktop app or browsers with File System Access API')
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
        useSettingsStore.getState().addRecentProject(selected, project.name)
        useEditorStore.getState().markClean()
      }
    } catch (error) {
      alert('Failed to save: ' + (error as Error).message)
    }
  }, [project])

  // Cmd+O: 열기
  const handleOpen = useCallback(async () => {
    if (options.onOpen) {
      options.onOpen()
      return
    }

    // 웹 환경에서 File System Access API 사용
    if (!isTauri() && isFileSystemAccessSupported()) {
      try {
        const handle = await pickWebDirectory()
        if (handle) {
          const loadedProject = await loadProjectFromFolder('')
          setProject(loadedProject)
        }
      } catch (error) {
        alert('Failed to open: ' + (error as Error).message)
      }
      return
    }

    if (!isTauri() || !openDialog) {
      alert('Open is only available in desktop app or browsers with File System Access API')
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

      // F12: 개발자 도구 토글은 Rust 레벨에서 처리 (JS 크래시 시에도 동작)

      // Cmd+Shift+S: 다른 이름으로 저장
      if (isMod && isShift && e.key === 's') {
        e.preventDefault()
        handleSaveAs()
        return
      }

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

      // F5: 게임 실행
      if (e.key === 'F5') {
        e.preventDefault()
        handlePlayGame()
        return
      }

      // Cmd+/: 선택된 노드들을 Comment로 감싸기
      if (isMod && e.key === '/') {
        e.preventDefault()
        handleWrapWithComment()
        return
      }

      // Cmd+A: 모든 노드 선택 (입력 필드 체크 전에 처리)
      if (isMod && e.key.toLowerCase() === 'a' && !isInputFocused) {
        console.log('[Shortcut] Cmd+A triggered, selecting all nodes')
        e.preventDefault()
        selectAllNodes()
        return
      }

      // 입력 필드에 포커스가 있으면 아래 단축키는 무시
      if (isInputFocused) return

      // Cmd+C: 복사
      if (isMod && e.key === 'c') {
        e.preventDefault()
        handleCopy()
        return
      }

      // Cmd+V: 붙여넣기
      if (isMod && e.key === 'v') {
        e.preventDefault()
        handlePaste()
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
    handleSaveAs,
    handleOpen,
    handleNew,
    handleUndo,
    handleRedo,
    handleAutoLayout,
    handleSearch,
    handleGlobalSearch,
    handlePlayGame,
    handleCopy,
    handlePaste,
    handleWrapWithComment,
  ])

  return {
    selectAllNodes,
    deleteSelectedNodes,
    handleEscape,
    handleSave,
    handleSaveAs,
    handleOpen,
    handleNew,
    handleUndo,
    handleRedo,
    handleAutoLayout,
    handleSearch,
    handleGlobalSearch,
    handlePlayGame,
    handleCopy,
    handlePaste,
    handleWrapWithComment,
  }
}
