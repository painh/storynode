import styles from '../Header.module.css'

interface RecentProject {
  path: string
  name: string
}

interface FileMenuProps {
  isOpen: boolean
  canFolderOperations: boolean
  showRecentProjects: boolean
  recentProjects: RecentProject[]
  showRecentSubmenu: boolean
  setShowRecentSubmenu: (show: boolean) => void
  menu: {
    newProject: string
    openFolder: string
    openRecent: string
    clearRecent: string
    noRecentProjects: string
    save: string
    saveAs: string
    importJson: string
    exportJson: string
    exportForGame: string
    settings: string
    projectSettings: string
  }
  onNew: () => void
  onOpenFolder: () => void
  onOpenRecent: (path: string) => void
  onClearRecent: () => void
  onSave: () => void
  onSaveAs: () => void
  onImportJson: () => void
  onExportJson: () => void
  onExportForGame: () => void
  onOpenSettings: () => void
  onOpenProjectSettings: () => void
}

export function FileMenu({
  isOpen,
  canFolderOperations,
  showRecentProjects,
  recentProjects,
  showRecentSubmenu,
  setShowRecentSubmenu,
  menu,
  onNew,
  onOpenFolder,
  onOpenRecent,
  onClearRecent,
  onSave,
  onSaveAs,
  onImportJson,
  onExportJson,
  onExportForGame,
  onOpenSettings,
  onOpenProjectSettings,
}: FileMenuProps) {
  if (!isOpen) return null

  return (
    <div className={styles.dropdown}>
      <button onClick={onNew}>
        <span>{menu.newProject}</span>
        <span className={styles.shortcut}>⌘N</span>
      </button>
      <div className={styles.divider} />
      {canFolderOperations ? (
        <>
          <button onClick={onOpenFolder}>
            <span>{menu.openFolder}</span>
            <span className={styles.shortcut}>⌘O</span>
          </button>
          {showRecentProjects && (
            <div
              className={styles.submenu}
              onMouseEnter={() => setShowRecentSubmenu(true)}
              onMouseLeave={() => setShowRecentSubmenu(false)}
            >
              <button className={styles.submenuTrigger}>
                {menu.openRecent}
              </button>
              {showRecentSubmenu && (
                <div className={styles.submenuContent}>
                  {recentProjects.length > 0 ? (
                    <>
                      {recentProjects.map((recent) => (
                        <button
                          key={recent.path}
                          onClick={() => onOpenRecent(recent.path)}
                        >
                          <span className={styles.recentName}>{recent.name}</span>
                          <span className={styles.recentPath}>{recent.path}</span>
                        </button>
                      ))}
                      <div className={styles.divider} />
                      <button onClick={onClearRecent}>{menu.clearRecent}</button>
                    </>
                  ) : (
                    <div className={styles.emptyRecent}>{menu.noRecentProjects}</div>
                  )}
                </div>
              )}
            </div>
          )}
          <button onClick={onSave}>
            <span>{menu.save}</span>
            <span className={styles.shortcut}>⌘S</span>
          </button>
          <button onClick={onSaveAs}>
            <span>{menu.saveAs}</span>
            <span className={styles.shortcut}>⇧⌘S</span>
          </button>
          <div className={styles.divider} />
        </>
      ) : null}
      <button onClick={onImportJson}>{menu.importJson}</button>
      <button onClick={onExportJson}>{menu.exportJson}</button>
      <div className={styles.divider} />
      <button onClick={onExportForGame}>{menu.exportForGame}</button>
      <div className={styles.divider} />
      <button onClick={onOpenProjectSettings}>
        {menu.projectSettings}...
      </button>
      <button onClick={onOpenSettings}>
        {menu.settings}...
      </button>
    </div>
  )
}
