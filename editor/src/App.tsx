import { useEffect, useState, useCallback, useRef } from 'react'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { Inspector } from './components/layout/Inspector'
import { Canvas } from './features/canvas/Canvas'
import { SearchModal } from './components/common/SearchModal'
import { ValidationWarningModal } from './components/common/ValidationWarningModal'
import { ToastContainer } from './components/common/Toast'
import { GameModal } from './features/game/components'
import { TemplateEditor } from './features/templateEditor/TemplateEditor'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useAutoSave } from './hooks/useAutoSave'
import { useUnsavedChangesWarning } from './hooks/useUnsavedChangesWarning'
import { useSettingsStore } from './stores/settingsStore'
import { useEditorStore } from './stores/editorStore'
import { useSearchStore } from './stores/searchStore'
import { useGameStore } from './stores/gameStore'
import { useEmbedStore } from './stores/embedStore'
import { loadProjectFromFolder, loadProjectFromServer, isTauri } from './utils/fileUtils'
import styles from './App.module.css'

type ScreenType = 'editor' | 'templateEditor'

const MIN_PANEL_WIDTH = 200
const MAX_PANEL_WIDTH = 600

function App() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('editor')
  const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null)
  const { loadSettings, settings, isLoaded, setPanelWidths } = useSettingsStore()
  const { setProject } = useEditorStore()
  const { isOpen: isSearchOpen, closeSearch } = useSearchStore()
  const {
    isModalOpen: isGameModalOpen,
    closeGame,
    showValidationWarning,
    validationResult,
    dismissValidationWarning,
    proceedAfterValidation,
  } = useGameStore()
  const { isEmbedMode, projectId: embedProjectId, serverUrl } = useEmbedStore()

  // 패널 너비는 설정에서 가져오되, 리사이즈 중에는 로컬 상태 사용 (성능)
  const [localLeftWidth, setLocalLeftWidth] = useState(settings.leftPanelWidth)
  const [localRightWidth, setLocalRightWidth] = useState(settings.rightPanelWidth)
  const saveTimeoutRef = useRef<number | null>(null)

  // 설정이 로드되면 로컬 상태 동기화
  useEffect(() => {
    if (isLoaded) {
      setLocalLeftWidth(settings.leftPanelWidth)
      setLocalRightWidth(settings.rightPanelWidth)
    }
  }, [isLoaded, settings.leftPanelWidth, settings.rightPanelWidth])

  // Resize handlers
  const handleMouseDown = useCallback((side: 'left' | 'right') => {
    setIsResizing(side)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return

    if (isResizing === 'left') {
      const newWidth = Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, e.clientX))
      setLocalLeftWidth(newWidth)
    } else if (isResizing === 'right') {
      const newWidth = Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, window.innerWidth - e.clientX))
      setLocalRightWidth(newWidth)
    }
  }, [isResizing])

  const handleMouseUp = useCallback(() => {
    if (isResizing) {
      // 드래그 끝날 때 설정 저장 (debounced)
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = window.setTimeout(() => {
        setPanelWidths(localLeftWidth, localRightWidth)
      }, 100)
    }
    setIsResizing(null)
  }, [isResizing, localLeftWidth, localRightWidth, setPanelWidths])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  // 전역 단축키 활성화
  useKeyboardShortcuts()

  // 자동 저장 활성화
  useAutoSave()

  // 저장하지 않은 변경사항 경고
  useUnsavedChangesWarning()

  // 앱 시작 시 설정 로드
  useEffect(() => {
    console.log('[App] Loading settings...')
    loadSettings()
  }, [loadSettings])

  // 설정 로드 후 마지막 프로젝트 자동 열기 (또는 임베드 모드에서 서버 프로젝트 로드)
  useEffect(() => {
    console.log('[App] Settings effect - isLoaded:', isLoaded, 'isInitialized:', isInitialized)
    if (!isLoaded || isInitialized) return

    const autoOpenLastProject = async () => {
      console.log('[App] autoOpenLastProject - isTauri:', isTauri(), 'isEmbedMode:', isEmbedMode)
      console.log('[App] settings:', settings)

      // 임베드 모드: 서버에서 프로젝트 로드
      if (isEmbedMode && embedProjectId && serverUrl) {
        try {
          console.log('[App] Loading project from server:', embedProjectId)
          const project = await loadProjectFromServer(serverUrl, embedProjectId)
          if (project) {
            setProject(project)
            console.log('[App] Loaded project from server:', embedProjectId)
          } else {
            console.log('[App] Project not found on server, using default')
          }
        } catch (error) {
          console.warn('[App] Failed to load project from server:', error)
        }
        setIsInitialized(true)
        return
      }

      // Tauri 환경: 마지막 프로젝트 자동 열기
      if (
        isTauri() &&
        settings.openLastProjectOnStartup &&
        settings.lastProjectPath
      ) {
        try {
          console.log('[App] Loading project from:', settings.lastProjectPath)
          const project = await loadProjectFromFolder(settings.lastProjectPath)
          setProject(project)
          console.log('[App] Auto-opened last project:', settings.lastProjectPath)
        } catch (error) {
          console.warn('[App] Failed to auto-open last project:', error)
          // 실패해도 앱은 정상 시작
        }
      }
      console.log('[App] Setting isInitialized to true')
      setIsInitialized(true)
    }

    autoOpenLastProject()
  }, [isLoaded, isInitialized, settings, setProject, isEmbedMode, embedProjectId, serverUrl])

  if (currentScreen === 'templateEditor') {
    return (
      <div className={styles.app}>
        <TemplateEditor onClose={() => setCurrentScreen('editor')} />
      </div>
    )
  }

  return (
    <div className={styles.app}>
      <Header onOpenTemplateEditor={() => setCurrentScreen('templateEditor')} />
      <div className={styles.workspace}>
        {/* Left Panel (Sidebar) */}
        <div 
          className={`${styles.panelContainer} ${styles.left}`}
          style={{ width: localLeftWidth }}
        >
          <Sidebar onOpenTemplateEditor={() => setCurrentScreen('templateEditor')} />
          <div 
            className={`${styles.resizeHandle} ${isResizing === 'left' ? styles.active : ''}`}
            onMouseDown={() => handleMouseDown('left')}
          />
        </div>

        <Canvas />

        {/* Right Panel (Inspector) */}
        <div 
          className={`${styles.panelContainer} ${styles.right}`}
          style={{ width: localRightWidth }}
        >
          <div 
            className={`${styles.resizeHandle} ${isResizing === 'right' ? styles.active : ''}`}
            onMouseDown={() => handleMouseDown('right')}
          />
          <Inspector />
        </div>
      </div>
      <SearchModal isOpen={isSearchOpen} onClose={closeSearch} />
      <GameModal isOpen={isGameModalOpen} onClose={closeGame} />
      {validationResult && (
        <ValidationWarningModal
          isOpen={showValidationWarning}
          result={validationResult}
          onContinue={proceedAfterValidation}
          onCancel={dismissValidationWarning}
          allowContinueWithErrors={false}
        />
      )}
      <ToastContainer />
    </div>
  )
}

export default App
