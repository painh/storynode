import { useEditorStore } from '../../stores/editorStore'
import { useTranslation } from '../../i18n'
import { themePresets, getThemeById } from '../../features/game/themes'
import styles from './SettingsModal.module.css'

// 폰트 프리셋
const fontPresets = [
  { id: 'default', name: '테마 기본값', value: '' },
  { id: 'noto-sans', name: 'Noto Sans KR', value: "'Noto Sans KR', sans-serif" },
  { id: 'noto-serif', name: 'Noto Serif KR', value: "'Noto Serif KR', serif" },
  { id: 'gothic', name: 'Gothic (모노스페이스)', value: "'MS Gothic', 'Noto Sans JP', monospace" },
  { id: 'consolas', name: 'Consolas', value: "'Consolas', 'Courier New', monospace" },
  { id: 'times', name: 'Times New Roman', value: "'Times New Roman', serif" },
]

interface ProjectSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProjectSettingsModal({ isOpen, onClose }: ProjectSettingsModalProps) {
  const { project } = useEditorStore()
  const { projectSettings: t } = useTranslation()

  // 현재 테마의 기본값 가져오기
  const currentTheme = getThemeById(project.gameSettings?.defaultThemeId || 'dark')

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
                onChange={(e) => {
                  updateGameSettings({ defaultThemeId: e.target.value })
                  // 테마 변경 시 오버라이드 초기화 (옵션)
                }}
              >
                {themePresets.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.settingRow}>
              <span className={styles.settingLabel}>폰트</span>
              <select
                className={styles.select}
                value={project.gameSettings?.fontOverride || ''}
                onChange={(e) => updateGameSettings({ fontOverride: e.target.value || undefined })}
              >
                {fontPresets.map((font) => (
                  <option key={font.id} value={font.value}>
                    {font.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.settingRow}>
              <span className={styles.settingLabel}>타이프라이터 속도</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={project.gameSettings?.typewriterSpeedOverride || currentTheme.effects.typewriterSpeed}
                  onChange={(e) => updateGameSettings({ typewriterSpeedOverride: parseInt(e.target.value) })}
                  style={{ flex: 1 }}
                />
                <span style={{ minWidth: 50, textAlign: 'right', fontSize: 12 }}>
                  {project.gameSettings?.typewriterSpeedOverride || currentTheme.effects.typewriterSpeed}ms
                </span>
                {project.gameSettings?.typewriterSpeedOverride && (
                  <button
                    onClick={() => updateGameSettings({ typewriterSpeedOverride: undefined })}
                    style={{ padding: '2px 6px', fontSize: 11 }}
                    title="테마 기본값으로 초기화"
                  >
                    ↩
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
