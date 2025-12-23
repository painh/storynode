import { useEffect, useState } from 'react'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { Inspector } from './components/layout/Inspector'
import { Canvas } from './features/canvas/Canvas'
import { SearchModal } from './components/common/SearchModal'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useAutoSave } from './hooks/useAutoSave'
import { useSettingsStore } from './stores/settingsStore'
import { useEditorStore } from './stores/editorStore'
import { useSearchStore } from './stores/searchStore'
import { loadProjectFromFolder, isTauri } from './utils/fileUtils'
import styles from './App.module.css'

function App() {
  const [isInitialized, setIsInitialized] = useState(false)
  const { loadSettings, settings, isLoaded } = useSettingsStore()
  const { setProject } = useEditorStore()
  const { isOpen: isSearchOpen, closeSearch } = useSearchStore()

  // 전역 단축키 활성화
  useKeyboardShortcuts()

  // 자동 저장 활성화
  useAutoSave()

  // 앱 시작 시 설정 로드
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  // 설정 로드 후 마지막 프로젝트 자동 열기
  useEffect(() => {
    if (!isLoaded || isInitialized) return

    const autoOpenLastProject = async () => {
      if (
        isTauri() &&
        settings.openLastProjectOnStartup &&
        settings.lastProjectPath
      ) {
        try {
          const project = await loadProjectFromFolder(settings.lastProjectPath)
          setProject(project)
          console.log('Auto-opened last project:', settings.lastProjectPath)
        } catch (error) {
          console.warn('Failed to auto-open last project:', error)
          // 실패해도 앱은 정상 시작
        }
      }
      setIsInitialized(true)
    }

    autoOpenLastProject()
  }, [isLoaded, isInitialized, settings, setProject])

  return (
    <div className={styles.app}>
      <Header />
      <div className={styles.workspace}>
        <Sidebar />
        <Canvas />
        <Inspector />
      </div>
      <SearchModal isOpen={isSearchOpen} onClose={closeSearch} />
    </div>
  )
}

export default App
