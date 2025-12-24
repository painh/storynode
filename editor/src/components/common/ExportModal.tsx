import { useState, useEffect } from 'react'
import { save } from '@tauri-apps/plugin-dialog'
import { useTranslation } from '../../i18n'
import { useEditorStore } from '../../stores/editorStore'
import {
  isTauri,
  listPlayerBinaries,
  exportStandaloneGame,
  downloadGameBuildAsZip,
} from '../../utils/fileUtils'
import { generateGamePlayerHtml } from '../../utils/gamePlayerTemplate'
import styles from './ExportModal.module.css'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
}

type ExportType = 'web' | 'executable'
type Platform = 'windows' | 'macos' | 'linux'

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { export: exportT } = useTranslation()
  const { project } = useEditorStore()

  const [exportType, setExportType] = useState<ExportType>('web')
  const [platform, setPlatform] = useState<Platform>('windows')
  const [outputPath, setOutputPath] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [availableBinaries, setAvailableBinaries] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  // Load available player binaries
  useEffect(() => {
    if (isOpen && isTauri()) {
      listPlayerBinaries().then(setAvailableBinaries)
    }
  }, [isOpen])

  // Determine which binary matches the selected platform
  const getSelectedBinary = (): string | null => {
    const platformPatterns: Record<Platform, RegExp> = {
      windows: /\.(exe)$/i,
      macos: /macos|darwin/i,
      linux: /linux/i,
    }

    const pattern = platformPatterns[platform]
    return availableBinaries.find((b) => pattern.test(b)) || null
  }

  const handleSelectOutputPath = async () => {
    if (!isTauri()) return

    try {
      const defaultName = project?.name
        ? `${project.name.toLowerCase().replace(/\s+/g, '_')}${platform === 'windows' ? '.exe' : ''}`
        : `game${platform === 'windows' ? '.exe' : ''}`

      const result = await save({
        defaultPath: defaultName,
        filters: platform === 'windows'
          ? [{ name: 'Executable', extensions: ['exe'] }]
          : [{ name: 'Application', extensions: ['*'] }],
      })

      if (result) {
        setOutputPath(result)
      }
    } catch (error) {
      console.error('Failed to select output path:', error)
    }
  }

  const handleExport = async () => {
    if (!project) return

    setIsExporting(true)
    setError(null)

    try {
      if (exportType === 'web') {
        // Web export - download as ZIP
        const html = generateGamePlayerHtml()
        await downloadGameBuildAsZip(project, html)
        onClose()
      } else {
        // Executable export
        const binary = getSelectedBinary()
        if (!binary) {
          setError(exportT.noBinariesAvailable)
          return
        }

        if (!outputPath) {
          setError(exportT.selectOutputPath)
          return
        }

        await exportStandaloneGame(project, binary, outputPath)
        onClose()
      }
    } catch (error) {
      console.error('Export failed:', error)
      setError(`${exportT.exportFailed}: ${(error as Error).message}`)
    } finally {
      setIsExporting(false)
    }
  }

  if (!isOpen) return null

  const canExportExecutable = isTauri() && availableBinaries.length > 0
  const selectedBinary = getSelectedBinary()
  const canExport =
    exportType === 'web' ||
    (exportType === 'executable' && selectedBinary && outputPath)

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{exportT.title}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          {/* Export Type Selection */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{exportT.exportType}</h3>

            <div className={styles.typeOptions}>
              <label className={styles.typeOption}>
                <input
                  type="radio"
                  name="exportType"
                  checked={exportType === 'web'}
                  onChange={() => setExportType('web')}
                />
                <div className={styles.typeContent}>
                  <span className={styles.typeName}>{exportT.exportTypeWeb}</span>
                  <span className={styles.typeDesc}>{exportT.exportTypeWebDesc}</span>
                </div>
              </label>

              <label
                className={`${styles.typeOption} ${!canExportExecutable ? styles.disabled : ''}`}
              >
                <input
                  type="radio"
                  name="exportType"
                  checked={exportType === 'executable'}
                  onChange={() => setExportType('executable')}
                  disabled={!canExportExecutable}
                />
                <div className={styles.typeContent}>
                  <span className={styles.typeName}>{exportT.exportTypeExecutable}</span>
                  <span className={styles.typeDesc}>
                    {canExportExecutable
                      ? exportT.exportTypeExecutableDesc
                      : exportT.noBinariesAvailable}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Platform Selection (only for executable) */}
          {exportType === 'executable' && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>{exportT.platform}</h3>

              <div className={styles.platformOptions}>
                {(['windows', 'macos', 'linux'] as Platform[]).map((p) => {
                  const hasBinary = availableBinaries.some((b) => {
                    if (p === 'windows') return /\.(exe)$/i.test(b)
                    if (p === 'macos') return /macos|darwin/i.test(b)
                    return /linux/i.test(b)
                  })

                  return (
                    <label
                      key={p}
                      className={`${styles.platformOption} ${!hasBinary ? styles.disabled : ''}`}
                    >
                      <input
                        type="radio"
                        name="platform"
                        checked={platform === p}
                        onChange={() => setPlatform(p)}
                        disabled={!hasBinary}
                      />
                      <span>
                        {p === 'windows'
                          ? exportT.platformWindows
                          : p === 'macos'
                            ? exportT.platformMacOS
                            : exportT.platformLinux}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          {/* Output Path (only for executable) */}
          {exportType === 'executable' && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>{exportT.outputPath}</h3>

              <div className={styles.pathInput}>
                <input
                  type="text"
                  value={outputPath}
                  onChange={(e) => setOutputPath(e.target.value)}
                  placeholder={exportT.selectOutputPath}
                  readOnly
                />
                <button onClick={handleSelectOutputPath}>
                  {exportT.selectOutputPath}
                </button>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && <div className={styles.error}>{error}</div>}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={onClose}>
            {exportT.cancel}
          </button>
          <button
            className={styles.exportButton}
            onClick={handleExport}
            disabled={!canExport || isExporting}
          >
            {isExporting ? exportT.exporting : exportT.export}
          </button>
        </div>
      </div>
    </div>
  )
}
