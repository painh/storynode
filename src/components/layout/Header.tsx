import { useState, useRef, useEffect } from 'react'
import { useEditorStore } from '../../stores/editorStore'
import { useSettingsStore } from '../../stores/settingsStore'
import {
  downloadJson,
  isTauri,
  exportForGame,
  saveProjectToFolder,
  loadProjectFromFolder,
} from '../../utils/fileUtils'
import { useTranslation, type Language } from '../../i18n'
import styles from './Header.module.css'

// Tauri dialog import (조건부)
let openDialog: typeof import('@tauri-apps/plugin-dialog').open | null = null

export function Header() {
  const { project, currentStageId, currentChapterId, setCurrentStage, setCurrentChapter, getCurrentStage, setProject } = useEditorStore()
  const { settings, addRecentProject, clearRecentProjects, setLanguage } = useSettingsStore()
  const { menu, settings: settingsT } = useTranslation()
  const currentStage = getCurrentStage()
  const [showFileMenu, setShowFileMenu] = useState(false)
  const [showEditMenu, setShowEditMenu] = useState(false)
  const [showViewMenu, setShowViewMenu] = useState(false)
  const [showRecentSubmenu, setShowRecentSubmenu] = useState(false)
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)
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

  // 폴더 저장 (Tauri)
  const handleSaveToFolder = async () => {
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
                setShowSettingsMenu(false)
              }}
            >
              File
            </button>
            {showFileMenu && (
              <div className={styles.dropdown}>
                <button onClick={handleNew}>New Project</button>
                <div className={styles.divider} />
                {isDesktop ? (
                  <>
                    <button onClick={handleOpenFolder}>Open Folder...</button>
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
                    <button onClick={handleSaveToFolder}>Save to Folder...</button>
                    <div className={styles.divider} />
                  </>
                ) : null}
                <button onClick={handleImportJson}>Import JSON...</button>
                <button onClick={handleExportJson}>Export as JSON</button>
                <div className={styles.divider} />
                <button onClick={handleExportForGame}>Export for Game</button>
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
                setShowSettingsMenu(false)
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
                  const chapter = getCurrentStage()?.chapters.find(c => c.id === currentChapterId)
                  if (chapter) {
                    useEditorStore.getState().setSelectedNodes(chapter.nodes.map(n => n.id))
                  }
                  setShowEditMenu(false)
                }}>
                  <span>Select All</span>
                  <span className={styles.shortcut}>⌘A</span>
                </button>
                <button onClick={() => {
                  const { selectedNodeIds, deleteNode } = useEditorStore.getState()
                  selectedNodeIds.forEach(deleteNode)
                  setShowEditMenu(false)
                }}>
                  <span>Delete</span>
                  <span className={styles.shortcut}>⌫</span>
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
                setShowSettingsMenu(false)
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
              </div>
            )}
          </div>

          {/* Settings Menu */}
          <div className={styles.menuWrapper}>
            <button
              className={styles.menuItem}
              onClick={() => {
                setShowSettingsMenu(!showSettingsMenu)
                setShowFileMenu(false)
                setShowEditMenu(false)
                setShowViewMenu(false)
              }}
            >
              {menu.settings}
            </button>
            {showSettingsMenu && (
              <div className={styles.dropdown}>
                <div className={styles.settingRow}>
                  <span className={styles.settingLabel}>{settingsT.language}</span>
                  <select
                    className={styles.settingSelect}
                    value={settings.language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                  >
                    <option value="ko">한국어</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className={styles.divider} />
                <SettingsCheckbox
                  label={settingsT.openLastProjectOnStartup}
                  checked={settings.openLastProjectOnStartup}
                  onChange={(checked) => {
                    useSettingsStore.getState().setOpenLastProjectOnStartup(checked)
                  }}
                />
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
      </div>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.story.json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </header>
  )
}

// 설정 체크박스 컴포넌트
function SettingsCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        cursor: 'pointer',
        fontSize: '12px',
        color: 'var(--text-primary)',
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ cursor: 'pointer' }}
      />
      {label}
    </label>
  )
}
