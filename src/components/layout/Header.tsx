import { useState, useRef, useEffect } from 'react'
import { useEditorStore } from '../../stores/editorStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useSearchStore } from '../../stores/searchStore'
import { useGameStore } from '../../stores/gameStore'
import {
  downloadJson,
  isTauri,
  exportForGame,
  saveProjectToFolder,
  loadProjectFromFolder,
} from '../../utils/fileUtils'
import { useTranslation } from '../../i18n'
import { SettingsModal } from '../common/SettingsModal'
import { useMenuState } from './header/useMenuState'
import { FileMenu } from './header/FileMenu'
import { EditMenu } from './header/EditMenu'
import { ViewMenu } from './header/ViewMenu'
import { HelpMenu } from './header/HelpMenu'
import { KeyboardShortcutsModal } from './header/KeyboardShortcutsModal'
import { StageChapterSelector } from './header/StageChapterSelector'
import { PlayButton } from './header/PlayButton'
import styles from './Header.module.css'

// Tauri dialog import (조건부)
let openDialog: typeof import('@tauri-apps/plugin-dialog').open | null = null

export function Header() {
  const { project, currentStageId, currentChapterId, setCurrentStage, setCurrentChapter, getCurrentStage, setProject, markClean } = useEditorStore()
  const { settings, addRecentProject, clearRecentProjects } = useSettingsStore()
  const { openSearch } = useSearchStore()
  const { openGame, status: gameStatus } = useGameStore()
  const { menu, search: searchT } = useTranslation()
  const currentStage = getCurrentStage()

  const {
    menuRef,
    showFileMenu,
    showEditMenu,
    showViewMenu,
    showHelpMenu,
    showRecentSubmenu,
    setShowRecentSubmenu,
    closeAllMenus,
    toggleFileMenu,
    toggleEditMenu,
    toggleViewMenu,
    toggleHelpMenu,
  } = useMenuState()

  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Undo/Redo
  const { undo, redo, pastStates, futureStates } = useEditorStore.temporal.getState()
  const canUndo = pastStates.length > 0
  const canRedo = futureStates.length > 0

  // Tauri 환경 감지 및 dialog 로드
  useEffect(() => {
    const checkTauri = async () => {
      if (isTauri()) {
        setIsDesktop(true)
        try {
          const mod = await import('@tauri-apps/plugin-dialog')
          openDialog = mod.open
        } catch (e) {
          console.error('Failed to load Tauri dialog plugin:', e)
        }
      }
    }
    checkTauri()
  }, [])

  // 프로젝트 리로드 이벤트 리스너
  useEffect(() => {
    const handleReloadProject = async () => {
      const lastPath = settings.lastProjectPath
      if (lastPath && isTauri()) {
        try {
          const loadedProject = await loadProjectFromFolder(lastPath)
          setProject(loadedProject)
        } catch (error) {
          console.error('Failed to reload project:', error)
        }
      }
    }

    window.addEventListener('storynode:reload-project', handleReloadProject)
    return () => window.removeEventListener('storynode:reload-project', handleReloadProject)
  }, [settings.lastProjectPath, setProject])

  // 경로에서 프로젝트 열기
  const openProjectFromPath = async (path: string) => {
    try {
      const loadedProject = await loadProjectFromFolder(path)
      setProject(loadedProject)
      addRecentProject(path, loadedProject.name)
    } catch (error) {
      alert('Failed to load project: ' + (error as Error).message)
    }
  }

  // File Menu Handlers
  const handleNew = () => {
    if (confirm('Create a new project? Unsaved changes will be lost.')) {
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
    closeAllMenus()
  }

  const handleSave = async () => {
    closeAllMenus()
    if (!isTauri()) {
      alert('Folder save is only available in desktop app')
      return
    }

    const lastPath = settings.lastProjectPath
    if (lastPath) {
      try {
        await saveProjectToFolder(lastPath, project)
        addRecentProject(lastPath, project.name)
        markClean()
      } catch (error) {
        alert('Failed to save project: ' + (error as Error).message)
      }
    } else {
      await handleSaveAs()
    }
  }

  const handleSaveAs = async () => {
    closeAllMenus()
    if (!isTauri() || !openDialog) {
      alert('Folder save is only available in desktop app')
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
        addRecentProject(selected, project.name)
        markClean()
      }
    } catch (error) {
      alert('Failed to save project: ' + (error as Error).message)
    }
  }

  const handleOpenFolder = async () => {
    closeAllMenus()
    if (!isTauri() || !openDialog) {
      alert('Folder open is only available in desktop app')
      return
    }

    try {
      const selected = await openDialog({
        directory: true,
        multiple: false,
        title: 'Select project folder to open',
      })

      if (selected && typeof selected === 'string') {
        await openProjectFromPath(selected)
      }
    } catch (error) {
      alert('Failed to load project: ' + (error as Error).message)
    }
  }

  const handleOpenRecent = async (path: string) => {
    closeAllMenus()
    await openProjectFromPath(path)
  }

  const handleClearRecent = () => {
    clearRecentProjects()
    setShowRecentSubmenu(false)
  }

  const handleExportJson = () => {
    const json = JSON.stringify(project, null, 2)
    downloadJson(json, `${project.name.toLowerCase().replace(/\s+/g, '_')}.story.json`)
    closeAllMenus()
  }

  const handleExportForGame = () => {
    const json = exportForGame(project)
    downloadJson(json, `${project.name.toLowerCase().replace(/\s+/g, '_')}_game.json`)
    closeAllMenus()
  }

  const handleImportJson = () => {
    fileInputRef.current?.click()
    closeAllMenus()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const imported = JSON.parse(text)

      const hasValidStages = Array.isArray(imported.stages) &&
        imported.stages.length > 0 &&
        typeof imported.stages[0] === 'object' &&
        imported.stages[0].chapters

      if (hasValidStages) {
        const newProject = {
          name: imported.name || 'Imported Project',
          version: imported.version || '1.0.0',
          stages: imported.stages,
        }
        setProject(newProject)
        alert('Project imported successfully!')
      } else if (imported.stages && typeof imported.stages[0] === 'string') {
        alert('This is a folder-based project. Please use "Open Folder" instead.')
      } else {
        alert('Invalid project file format. Expected a complete story project JSON.')
      }
    } catch (error) {
      alert('Failed to import file: ' + (error as Error).message)
    }

    e.target.value = ''
  }

  // Edit Menu Handlers
  const handleUndo = () => {
    undo()
    closeAllMenus()
  }

  const handleRedo = () => {
    redo()
    closeAllMenus()
  }

  const handleSelectAll = () => {
    const { getCurrentChapter, setSelectedNodes } = useEditorStore.getState()
    const chapter = getCurrentChapter()
    if (chapter) {
      setSelectedNodes(chapter.nodes.map(n => n.id))
    }
    closeAllMenus()
  }

  const handleDelete = () => {
    const { selectedNodeIds, deleteNode, setSelectedNodes } = useEditorStore.getState()
    selectedNodeIds.forEach(id => deleteNode(id))
    setSelectedNodes([])
    closeAllMenus()
  }

  const handleSearchCanvas = () => {
    openSearch('canvas')
    closeAllMenus()
  }

  const handleSearchAll = () => {
    openSearch('global')
    closeAllMenus()
  }

  // View Menu Handlers
  const handleAutoLayout = () => {
    window.dispatchEvent(new CustomEvent('storynode:auto-layout'))
    closeAllMenus()
  }

  // Help Menu Handlers
  const handleShowShortcuts = () => {
    setShowHelpModal(true)
    closeAllMenus()
  }

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.logo}>StoryNode</div>
        <div className={styles.menu} ref={menuRef}>
          {/* File Menu */}
          <div className={styles.menuWrapper}>
            <button className={styles.menuItem} onClick={toggleFileMenu}>
              {menu.file}
            </button>
            <FileMenu
              isOpen={showFileMenu}
              isDesktop={isDesktop}
              recentProjects={settings.recentProjects}
              showRecentSubmenu={showRecentSubmenu}
              setShowRecentSubmenu={setShowRecentSubmenu}
              menu={menu}
              onNew={handleNew}
              onOpenFolder={handleOpenFolder}
              onOpenRecent={handleOpenRecent}
              onClearRecent={handleClearRecent}
              onSave={handleSave}
              onSaveAs={handleSaveAs}
              onImportJson={handleImportJson}
              onExportJson={handleExportJson}
              onExportForGame={handleExportForGame}
              onOpenSettings={() => { setShowSettingsModal(true); closeAllMenus() }}
            />
          </div>

          {/* Edit Menu */}
          <div className={styles.menuWrapper}>
            <button className={styles.menuItem} onClick={toggleEditMenu}>
              {menu.edit}
            </button>
            <EditMenu
              isOpen={showEditMenu}
              canUndo={canUndo}
              canRedo={canRedo}
              menu={menu}
              search={searchT}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onSelectAll={handleSelectAll}
              onDelete={handleDelete}
              onSearchCanvas={handleSearchCanvas}
              onSearchAll={handleSearchAll}
            />
          </div>

          {/* View Menu */}
          <div className={styles.menuWrapper}>
            <button className={styles.menuItem} onClick={toggleViewMenu}>
              {menu.view}
            </button>
            <ViewMenu
              isOpen={showViewMenu}
              menu={menu}
              onAutoLayout={handleAutoLayout}
              onClose={closeAllMenus}
            />
          </div>

          {/* Help Menu */}
          <div className={styles.menuWrapper}>
            <button className={styles.menuItem} onClick={toggleHelpMenu}>
              {menu.help}
            </button>
            <HelpMenu
              isOpen={showHelpMenu}
              menu={menu}
              onShowShortcuts={handleShowShortcuts}
            />
          </div>
        </div>
      </div>

      <div className={styles.center}>
        <span className={styles.projectName}>{project.name}</span>
      </div>

      <div className={styles.right}>
        <StageChapterSelector
          stages={project.stages}
          currentStageId={currentStageId}
          currentChapterId={currentChapterId}
          currentStageChapters={currentStage?.chapters}
          onStageChange={setCurrentStage}
          onChapterChange={setCurrentChapter}
        />
        <PlayButton
          disabled={gameStatus !== 'idle'}
          onClick={() => openGame()}
        />
      </div>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.story.json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      {/* Help Modal */}
      <KeyboardShortcutsModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </header>
  )
}
