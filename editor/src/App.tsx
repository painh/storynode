import { useEffect, useState } from 'react'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { Inspector } from './components/layout/Inspector'
import { Canvas } from './features/canvas/Canvas'
import { SearchModal } from './components/common/SearchModal'
import { GameModal } from './features/game/components'
import { TemplateEditor } from './features/templateEditor/TemplateEditor'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useAutoSave } from './hooks/useAutoSave'
import { useUnsavedChangesWarning } from './hooks/useUnsavedChangesWarning'
import { useSettingsStore } from './stores/settingsStore'
import { useEditorStore } from './stores/editorStore'
import { useSearchStore } from './stores/searchStore'
import { useGameStore } from './stores/gameStore'
import { loadProjectFromFolder, isTauri } from './utils/fileUtils'
import styles from './App.module.css'

type ScreenType = 'editor' | 'templateEditor'

function App() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('editor')
  const { loadSettings, settings, isLoaded } = useSettingsStore()
  const { setProject } = useEditorStore()
  const { isOpen: isSearchOpen, closeSearch } = useSearchStore()
  const { isModalOpen: isGameModalOpen, closeGame } = useGameStore()

  console.log('[App] Render - isLoaded:', isLoaded, 'isInitialized:', isInitialized)

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

  // 설정 로드 후 마지막 프로젝트 자동 열기
  useEffect(() => {
    console.log('[App] Settings effect - isLoaded:', isLoaded, 'isInitialized:', isInitialized)
    if (!isLoaded || isInitialized) return

    const autoOpenLastProject = async () => {
      console.log('[App] autoOpenLastProject - isTauri:', isTauri())
      console.log('[App] settings:', settings)
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
  }, [isLoaded, isInitialized, settings, setProject])

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
        <Sidebar onOpenTemplateEditor={() => setCurrentScreen('templateEditor')} />
        <Canvas />
        <Inspector />
      </div>
      <SearchModal isOpen={isSearchOpen} onClose={closeSearch} />
      <GameModal isOpen={isGameModalOpen} onClose={closeGame} />
    </div>
  )
}

export default App
