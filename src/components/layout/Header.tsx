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
import styles from './Header.module.css'

// Tauri dialog import (조건부)
let openDialog: typeof import('@tauri-apps/plugin-dialog').open | null = null

export function Header() {
  const { project, currentStageId, currentChapterId, setCurrentStage, setCurrentChapter, getCurrentStage, setProject } = useEditorStore()
  const { settings, addRecentProject, clearRecentProjects } = useSettingsStore()
  const { openSearch } = useSearchStore()
  const { openGame, status: gameStatus } = useGameStore()
  const { menu, search: searchT } = useTranslation()
  const currentStage = getCurrentStage()
  const [showFileMenu, setShowFileMenu] = useState(false)
  const [showEditMenu, setShowEditMenu] = useState(false)
  const [showViewMenu, setShowViewMenu] = useState(false)
  const [showHelpMenu, setShowHelpMenu] = useState(false)
  const [showRecentSubmenu, setShowRecentSubmenu] = useState(false)
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

  // 저장 (Tauri) - lastProjectPath가 있으면 바로 저장, 없으면 Save As
  const handleSave = async () => {
    setShowFileMenu(false)
    if (!isTauri()) {
      alert('Folder save is only available in desktop app')
      return
    }

    const lastPath = settings.lastProjectPath
    if (lastPath) {
      // 기존 경로에 바로 저장
      try {
        await saveProjectToFolder(lastPath, project)
        addRecentProject(lastPath, project.name)
      } catch (error) {
        alert('Failed to save project: ' + (error as Error).message)
      }
    } else {
      // 경로가 없으면 Save As 동작
      await handleSaveAs()
    }
  }

  // 다른 이름으로 저장 (Tauri) - 항상 폴더 선택 다이얼로그
  const handleSaveAs = async () => {
    setShowFileMenu(false)
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
        alert('Project saved successfully!')
      }
    } catch (error) {
      alert('Failed to save project: ' + (error as Error).message)
    }
  }

  // 폴더 열기 (Tauri)
  const handleOpenFolder = async () => {
    setShowFileMenu(false)
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

  // 경로에서 프로젝트 열기 (공통 함수)
  const openProjectFromPath = async (path: string) => {
    try {
      const loadedProject = await loadProjectFromFolder(path)
      setProject(loadedProject)
      addRecentProject(path, loadedProject.name)
    } catch (error) {
      alert('Failed to load project: ' + (error as Error).message)
    }
  }

  // 최근 프로젝트 열기
  const handleOpenRecent = async (path: string) => {
    setShowFileMenu(false)
    setShowRecentSubmenu(false)
    await openProjectFromPath(path)
  }

  // 단일 JSON 내보내기 (웹 폴백)
  const handleExportJson = () => {
    const json = JSON.stringify(project, null, 2)
    downloadJson(json, `${project.name.toLowerCase().replace(/\s+/g, '_')}.story.json`)
    setShowFileMenu(false)
  }

  // 게임용 내보내기
  const handleExportForGame = () => {
    const json = exportForGame(project)
    downloadJson(json, `${project.name.toLowerCase().replace(/\s+/g, '_')}_game.json`)
    setShowFileMenu(false)
  }

  // 단일 JSON 가져오기 (웹 폴백)
  const handleImportJson = () => {
    fileInputRef.current?.click()
    setShowFileMenu(false)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const imported = JSON.parse(text)

      // stages가 객체 배열인지 확인 (폴더 구조용 project.json은 ID 배열이라 호환 안됨)
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
        // 폴더 구조용 project.json을 직접 import한 경우
        alert('This is a folder-based project. Please use "Open Folder" instead.')
      } else {
        alert('Invalid project file format. Expected a complete story project JSON.')
      }
    } catch (error) {
      alert('Failed to import file: ' + (error as Error).message)
    }

    // Reset input
    e.target.value = ''
  }

  const handleNew = () => {
    if (confirm('Create a new project? Unsaved changes will be lost.')) {
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
    setShowFileMenu(false)
  }

  const handleClearRecent = () => {
    clearRecentProjects()
    setShowRecentSubmenu(false)
  }

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.logo}>StoryNode</div>
        <div className={styles.menu}>
          {/* File Menu */}
          <div className={styles.menuWrapper}>
            <button
              className={styles.menuItem}
              onClick={() => {
                setShowFileMenu(!showFileMenu)
                setShowEditMenu(false)
                setShowViewMenu(false)
                setShowHelpMenu(false)
              }}
            >
              File
            </button>
            {showFileMenu && (
              <div className={styles.dropdown}>
                <button onClick={handleNew}>
                  <span>New Project</span>
                  <span className={styles.shortcut}>⌘N</span>
                </button>
                <div className={styles.divider} />
                {isDesktop ? (
                  <>
                    <button onClick={handleOpenFolder}>
                      <span>Open Folder...</span>
                      <span className={styles.shortcut}>⌘O</span>
                    </button>
                    {/* Open Recent 서브메뉴 */}
                    <div
                      className={styles.submenu}
                      onMouseEnter={() => setShowRecentSubmenu(true)}
                      onMouseLeave={() => setShowRecentSubmenu(false)}
                    >
                      <button className={styles.submenuTrigger}>
                        Open Recent
                      </button>
                      {showRecentSubmenu && (
                        <div className={styles.submenuContent}>
                          {settings.recentProjects.length > 0 ? (
                            <>
                              {settings.recentProjects.map((recent) => (
                                <button
                                  key={recent.path}
                                  onClick={() => handleOpenRecent(recent.path)}
                                >
                                  <span className={styles.recentName}>{recent.name}</span>
                                  <span className={styles.recentPath}>{recent.path}</span>
                                </button>
                              ))}
                              <div className={styles.divider} />
                              <button onClick={handleClearRecent}>Clear Recent</button>
                            </>
                          ) : (
                            <div className={styles.emptyRecent}>No recent projects</div>
                          )}
                        </div>
                      )}
                    </div>
                    <button onClick={handleSave}>
                      <span>Save</span>
                      <span className={styles.shortcut}>⌘S</span>
                    </button>
                    <button onClick={handleSaveAs}>
                      <span>Save As...</span>
                      <span className={styles.shortcut}>⇧⌘S</span>
                    </button>
                    <div className={styles.divider} />
                  </>
                ) : null}
                <button onClick={handleImportJson}>Import JSON...</button>
                <button onClick={handleExportJson}>Export as JSON</button>
                <div className={styles.divider} />
                <button onClick={handleExportForGame}>Export for Game</button>
                <div className={styles.divider} />
                <button onClick={() => { setShowSettingsModal(true); setShowFileMenu(false) }}>
                  {menu.settings}...
                </button>
              </div>
            )}
          </div>

          {/* Edit Menu */}
          <div className={styles.menuWrapper}>
            <button
              className={styles.menuItem}
              onClick={() => {
                setShowEditMenu(!showEditMenu)
                setShowFileMenu(false)
                setShowViewMenu(false)
                setShowHelpMenu(false)
              }}
            >
              Edit
            </button>
            {showEditMenu && (
              <div className={styles.dropdown}>
                <button
                  onClick={() => { undo(); setShowEditMenu(false) }}
                  disabled={!canUndo}
                  className={!canUndo ? styles.disabled : ''}
                >
                  <span>Undo</span>
                  <span className={styles.shortcut}>⌘Z</span>
                </button>
                <button
                  onClick={() => { redo(); setShowEditMenu(false) }}
                  disabled={!canRedo}
                  className={!canRedo ? styles.disabled : ''}
                >
                  <span>Redo</span>
                  <span className={styles.shortcut}>⇧⌘Z</span>
                </button>
                <div className={styles.divider} />
                <button onClick={() => {
                  const { getCurrentChapter, setSelectedNodes } = useEditorStore.getState()
                  const chapter = getCurrentChapter()
                  if (chapter) {
                    setSelectedNodes(chapter.nodes.map(n => n.id))
                  }
                  setShowEditMenu(false)
                }}>
                  <span>Select All</span>
                  <span className={styles.shortcut}>⌘A</span>
                </button>
                <button onClick={() => {
                  const { selectedNodeIds, deleteNode, setSelectedNodes } = useEditorStore.getState()
                  selectedNodeIds.forEach(id => deleteNode(id))
                  setSelectedNodes([])
                  setShowEditMenu(false)
                }}>
                  <span>Delete</span>
                  <span className={styles.shortcut}>⌫</span>
                </button>
                <div className={styles.divider} />
                <button onClick={() => {
                  openSearch('canvas')
                  setShowEditMenu(false)
                }}>
                  <span>{searchT.currentCanvas}</span>
                  <span className={styles.shortcut}>⌘F</span>
                </button>
                <button onClick={() => {
                  openSearch('global')
                  setShowEditMenu(false)
                }}>
                  <span>{searchT.allFiles}</span>
                  <span className={styles.shortcut}>⇧⌘F</span>
                </button>
              </div>
            )}
          </div>

          {/* View Menu */}
          <div className={styles.menuWrapper}>
            <button
              className={styles.menuItem}
              onClick={() => {
                setShowViewMenu(!showViewMenu)
                setShowFileMenu(false)
                setShowEditMenu(false)
                setShowHelpMenu(false)
              }}
            >
              View
            </button>
            {showViewMenu && (
              <div className={styles.dropdown}>
                <button onClick={() => {
                  window.dispatchEvent(new CustomEvent('storynode:auto-layout'))
                  setShowViewMenu(false)
                }}>
                  <span>{menu.autoLayout}</span>
                  <span className={styles.shortcut}>⌘L</span>
                </button>
                {import.meta.env.DEV && (
                  <>
                    <div className={styles.divider} />
                    <button onClick={() => {
                      window.location.reload()
                      setShowViewMenu(false)
                    }}>
                      <span>Reload</span>
                      <span className={styles.shortcut}>⌘R</span>
                    </button>
                    <button onClick={async () => {
                      if (isTauri()) {
                        const { invoke } = await import('@tauri-apps/api/core')
                        await invoke('toggle_devtools')
                      }
                      setShowViewMenu(false)
                    }}>
                      <span>Toggle DevTools</span>
                      <span className={styles.shortcut}>⌥⌘I</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Help Menu */}
          <div className={styles.menuWrapper}>
            <button
              className={styles.menuItem}
              onClick={() => {
                setShowHelpMenu(!showHelpMenu)
                setShowFileMenu(false)
                setShowEditMenu(false)
                setShowViewMenu(false)
              }}
            >
              Help
            </button>
            {showHelpMenu && (
              <div className={styles.dropdown}>
                <button onClick={() => {
                  setShowHelpModal(true)
                  setShowHelpMenu(false)
                }}>
                  <span>Keyboard Shortcuts</span>
                  <span className={styles.shortcut}>?</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.center}>
        <span className={styles.projectName}>{project.name}</span>
      </div>

      <div className={styles.right}>
        <select
          className={styles.select}
          value={currentStageId || ''}
          onChange={(e) => setCurrentStage(e.target.value)}
        >
          {project.stages.map((stage) => (
            <option key={stage.id} value={stage.id}>
              {stage.title}
            </option>
          ))}
        </select>

        <select
          className={styles.select}
          value={currentChapterId || ''}
          onChange={(e) => setCurrentChapter(e.target.value)}
        >
          {currentStage?.chapters.map((chapter) => (
            <option key={chapter.id} value={chapter.id}>
              {chapter.title}
            </option>
          ))}
        </select>

        <button
          className={styles.playButton}
          onClick={() => openGame()}
          disabled={gameStatus !== 'idle'}
          title="Play Story (F5)"
        >
          <span className={styles.playIcon}>▶</span>
          <span>Play</span>
        </button>
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
      {showHelpModal && (
        <div className={styles.modalOverlay} onClick={() => setShowHelpModal(false)}>
          <div className={styles.helpModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.helpHeader}>
              <h2>Keyboard Shortcuts</h2>
              <button className={styles.closeButton} onClick={() => setShowHelpModal(false)}>×</button>
            </div>
            <div className={styles.helpContent}>
              <section>
                <h3>General</h3>
                <div className={styles.shortcutList}>
                  <div><kbd>⌘</kbd> + <kbd>N</kbd><span>New Project</span></div>
                  <div><kbd>⌘</kbd> + <kbd>O</kbd><span>Open Folder</span></div>
                  <div><kbd>⌘</kbd> + <kbd>S</kbd><span>Save</span></div>
                  <div><kbd>⌘</kbd> + <kbd>Z</kbd><span>Undo</span></div>
                  <div><kbd>⇧</kbd> + <kbd>⌘</kbd> + <kbd>Z</kbd><span>Redo</span></div>
                </div>
              </section>
              <section>
                <h3>Canvas</h3>
                <div className={styles.shortcutList}>
                  <div><kbd>⌘</kbd> + <kbd>L</kbd><span>Auto Layout</span></div>
                  <div><kbd>⌘</kbd> + <kbd>F</kbd><span>Search in Canvas</span></div>
                  <div><kbd>⇧</kbd> + <kbd>⌘</kbd> + <kbd>F</kbd><span>Search All</span></div>
                  <div><kbd>⌘</kbd> + <kbd>A</kbd><span>Select All</span></div>
                  <div><kbd>Delete</kbd> / <kbd>⌫</kbd><span>Delete Selected</span></div>
                  <div><kbd>⌘</kbd> + <kbd>C</kbd><span>Copy</span></div>
                  <div><kbd>⌘</kbd> + <kbd>V</kbd><span>Paste</span></div>
                </div>
              </section>
              <section>
                <h3>Node Dragging</h3>
                <div className={styles.shortcutList}>
                  <div><kbd>Drag</kbd><span>Free movement (1px)</span></div>
                  <div><kbd>⇧</kbd> + <kbd>Drag</kbd><span>Snap to grid</span></div>
                </div>
              </section>
              <section>
                <h3>Search</h3>
                <div className={styles.shortcutList}>
                  <div><kbd>F3</kbd><span>Next Result</span></div>
                  <div><kbd>⇧</kbd> + <kbd>F3</kbd><span>Previous Result</span></div>
                  <div><kbd>Enter</kbd><span>Go to Result & Close</span></div>
                  <div><kbd>⇧</kbd> + <kbd>Enter</kbd><span>Go to Result (Keep Open)</span></div>
                  <div><kbd>↑</kbd> / <kbd>↓</kbd><span>Navigate Results</span></div>
                  <div><kbd>Esc</kbd><span>Close Search</span></div>
                </div>
              </section>
              <section>
                <h3>Playback</h3>
                <div className={styles.shortcutList}>
                  <div><kbd>F5</kbd><span>Play Story</span></div>
                  <div><kbd>Esc</kbd><span>Stop Playback</span></div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
