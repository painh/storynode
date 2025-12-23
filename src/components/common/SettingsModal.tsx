import { useSettingsStore, type AutoSaveMode } from '../../stores/settingsStore'
import { useTranslation, type Language } from '../../i18n'
import styles from './SettingsModal.module.css'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings } = useSettingsStore()
  const { settings: settingsT } = useTranslation()

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{settingsT.autoSave ? 'Settings' : 'Settings'}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.content}>
          {/* 일반 설정 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>General</h3>

            <div className={styles.settingRow}>
              <span className={styles.settingLabel}>{settingsT.language}</span>
              <select
                className={styles.select}
                value={settings.language}
                onChange={(e) => useSettingsStore.getState().setLanguage(e.target.value as Language)}
              >
                <option value="ko">한국어</option>
                <option value="en">English</option>
              </select>
            </div>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={settings.openLastProjectOnStartup}
                onChange={(e) => useSettingsStore.getState().setOpenLastProjectOnStartup(e.target.checked)}
              />
              <span>{settingsT.openLastProjectOnStartup}</span>
            </label>
          </div>

          {/* 자동 저장 설정 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{settingsT.autoSave}</h3>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={settings.autoSaveEnabled}
                onChange={(e) => useSettingsStore.getState().setAutoSaveEnabled(e.target.checked)}
              />
              <span>{settingsT.autoSaveEnabled}</span>
            </label>

            {settings.autoSaveEnabled && (
              <>
                <div className={styles.settingRow}>
                  <span className={styles.settingLabel}>{settingsT.autoSaveMode}</span>
                  <select
                    className={styles.select}
                    value={settings.autoSaveMode}
                    onChange={(e) => useSettingsStore.getState().setAutoSaveMode(e.target.value as AutoSaveMode)}
                  >
                    <option value="onChange">{settingsT.autoSaveModeOnChange}</option>
                    <option value="interval">{settingsT.autoSaveModeInterval}</option>
                    <option value="both">{settingsT.autoSaveModeBoth}</option>
                  </select>
                </div>

                {(settings.autoSaveMode === 'interval' || settings.autoSaveMode === 'both') && (
                  <div className={styles.settingRow}>
                    <span className={styles.settingLabel}>{settingsT.autoSaveInterval}</span>
                    <div className={styles.inputGroup}>
                      <input
                        type="number"
                        className={styles.numberInput}
                        value={settings.autoSaveIntervalMinutes}
                        min={1}
                        max={60}
                        onChange={(e) => useSettingsStore.getState().setAutoSaveIntervalMinutes(parseInt(e.target.value) || 5)}
                      />
                      <span className={styles.unit}>{settingsT.autoSaveIntervalMinutes}</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 게임 실행 설정 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{settingsT.gameSettings}</h3>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={settings.saveBeforeGameRun}
                onChange={(e) => useSettingsStore.getState().setSaveBeforeGameRun(e.target.checked)}
              />
              <span>{settingsT.saveBeforeGameRun}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
