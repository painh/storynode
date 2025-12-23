import { useState, useRef } from 'react'
import { useEditorStore } from '../../stores/editorStore'
import { downloadJson, isTauri, saveProject, loadProject, exportForGame } from '../../utils/fileUtils'
import styles from './Header.module.css'

export function Header() {
  const { project, currentStageId, currentChapterId, setCurrentStage, setCurrentChapter, getCurrentStage, setProject } = useEditorStore()
  const currentStage = getCurrentStage()
  const [showFileMenu, setShowFileMenu] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const json = JSON.stringify(project, null, 2)
    downloadJson(json, `${project.name.toLowerCase().replace(/\s+/g, '_')}.story.json`)
    setShowFileMenu(false)
  }

  const handleExportForGame = () => {
    const json = exportForGame(project)
    downloadJson(json, `${project.name.toLowerCase().replace(/\s+/g, '_')}_game.json`)
    setShowFileMenu(false)
  }

  const handleImport = () => {
    fileInputRef.current?.click()
    setShowFileMenu(false)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const imported = JSON.parse(text)

      // Validate basic structure
      if (imported.stages || (imported.name && imported.version)) {
        const newProject = {
          name: imported.name || 'Imported Project',
          version: imported.version || '1.0.0',
          stages: imported.stages || [],
        }
        setProject(newProject)
        alert('Project imported successfully!')
      } else {
        alert('Invalid project file format')
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

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.logo}>StoryNode</div>
        <div className={styles.menu}>
          <div className={styles.menuWrapper}>
            <button
              className={styles.menuItem}
              onClick={() => setShowFileMenu(!showFileMenu)}
            >
              File
            </button>
            {showFileMenu && (
              <div className={styles.dropdown}>
                <button onClick={handleNew}>New Project</button>
                <button onClick={handleImport}>Import JSON...</button>
                <div className={styles.divider} />
                <button onClick={handleExport}>Export Project</button>
                <button onClick={handleExportForGame}>Export for Game</button>
              </div>
            )}
          </div>
          <button className={styles.menuItem}>Edit</button>
          <button className={styles.menuItem}>View</button>
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
