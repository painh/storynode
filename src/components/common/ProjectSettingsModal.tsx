import { useEditorStore } from '../../stores/editorStore'
import { useTranslation } from '../../i18n'
import styles from './SettingsModal.module.css'

interface ProjectSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProjectSettingsModal({ isOpen, onClose }: ProjectSettingsModalProps) {
  const { project } = useEditorStore()
  const { projectSettings: t } = useTranslation()

  if (!isOpen) return null

  const updateProject = (updates: Partial<typeof project>) => {
    useEditorStore.setState((state) => ({
      project: { ...state.project, ...updates },
      isDirty: true,
    }))
  }

  const updateGameSettings = (updates: Partial<NonNullable<typeof project.gameSettings>>) => {
    useEditorStore.setState((state) => ({
      project: {
        ...state.project,
        gameSettings: { ...state.project.gameSettings!, ...updates },
      },
      isDirty: true,
    }))
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t.title}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.content}>
          {/* 프로젝트 정보 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t.projectInfo}</h3>

            <div className={styles.settingRow}>
              <span className={styles.settingLabel}>{t.projectName}</span>
              <input
                type="text"
                className={styles.select}
                value={project.name}
                onChange={(e) => updateProject({ name: e.target.value })}
              />
            </div>

            <div className={styles.settingRow}>
              <span className={styles.settingLabel}>{t.projectVersion}</span>
              <input
                type="text"
                className={styles.select}
                value={project.version}
                onChange={(e) => updateProject({ version: e.target.value })}
              />
            </div>
          </div>

          {/* 게임 설정 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t.gameSettings}</h3>

            <div className={styles.settingRow}>
              <span className={styles.settingLabel}>{t.gameMode}</span>
              <select
                className={styles.select}
                value={project.gameSettings?.defaultGameMode || 'visualNovel'}
                onChange={(e) => updateGameSettings({ defaultGameMode: e.target.value as 'visualNovel' | 'textAdventure' })}
              >
                <option value="visualNovel">{t.gameModeVisualNovel}</option>
                <option value="textAdventure">{t.gameModeTextAdventure}</option>
              </select>
            </div>

            <div className={styles.settingRow}>
              <span className={styles.settingLabel}>{t.defaultTheme}</span>
              <select
                className={styles.select}
                value={project.gameSettings?.defaultThemeId || 'dark'}
                onChange={(e) => updateGameSettings({ defaultThemeId: e.target.value })}
              >
                <option value="dark">{t.themeDark}</option>
                <option value="light">{t.themeLight}</option>
                <option value="sepia">{t.themeSepia}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
