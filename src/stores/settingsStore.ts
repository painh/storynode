import { create } from 'zustand'
import { invoke } from '@tauri-apps/api/core'
import { isTauri, readStoryFile, writeStoryFile, createDirectory } from '../utils/fileUtils'
import { detectSystemLanguage, type Language } from '../i18n'

// 최근 프로젝트 정보
export interface RecentProject {
  path: string
  name: string
  lastOpened: number // timestamp
}

// 설정 인터페이스
export interface AppSettings {
  // 일반 설정
  openLastProjectOnStartup: boolean

  // 언어 설정
  language: Language

  // 최근 프로젝트 목록
  recentProjects: RecentProject[]

  // 마지막으로 열었던 프로젝트 경로
  lastProjectPath: string | null
}

// 기본 설정값
const defaultSettings: AppSettings = {
  openLastProjectOnStartup: true,
  language: detectSystemLanguage(),
  recentProjects: [],
  lastProjectPath: null,
}

interface SettingsState {
  settings: AppSettings
  configPath: string | null
  isLoaded: boolean

  // 액션
  loadSettings: () => Promise<void>
  saveSettings: () => Promise<void>
  updateSettings: (updates: Partial<AppSettings>) => void

  // 최근 프로젝트 관리
  addRecentProject: (path: string, name: string) => void
  removeRecentProject: (path: string) => void
  clearRecentProjects: () => void

  // 설정 개별 업데이트
  setOpenLastProjectOnStartup: (value: boolean) => void
  setLastProjectPath: (path: string | null) => void
  setLanguage: (language: Language) => void
}

const MAX_RECENT_PROJECTS = 10

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,
  configPath: null,
  isLoaded: false,

  loadSettings: async () => {
    if (!isTauri()) {
      // 웹 환경에서는 localStorage 사용
      try {
        const stored = localStorage.getItem('storynode-settings')
        if (stored) {
          const parsed = JSON.parse(stored)
          set({ settings: { ...defaultSettings, ...parsed }, isLoaded: true })
        } else {
          set({ isLoaded: true })
        }
      } catch {
        set({ isLoaded: true })
      }
      return
    }

    try {
      // config 디렉토리 가져오기
      const configDir = await invoke<string>('get_config_dir')
      const configPath = `${configDir}/settings.json`

      // 디렉토리 생성 (없으면)
      await createDirectory(configDir)

      set({ configPath })

      // 설정 파일 읽기
      try {
        const content = await readStoryFile(configPath)
        const parsed = JSON.parse(content)
        set({ settings: { ...defaultSettings, ...parsed }, isLoaded: true })
      } catch {
        // 파일이 없으면 기본값 사용
        set({ isLoaded: true })
        // 기본 설정 저장
        await get().saveSettings()
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
      set({ isLoaded: true })
    }
  },

  saveSettings: async () => {
    const { settings, configPath } = get()

    if (!isTauri()) {
      // 웹 환경에서는 localStorage 사용
      localStorage.setItem('storynode-settings', JSON.stringify(settings))
      return
    }

    if (!configPath) return

    try {
      const content = JSON.stringify(settings, null, 2)
      await writeStoryFile(configPath, content)
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  },

  updateSettings: (updates) => {
    set((state) => ({
      settings: { ...state.settings, ...updates }
    }))
    get().saveSettings()
  },

  addRecentProject: (path, name) => {
    set((state) => {
      // 이미 있으면 제거
      const filtered = state.settings.recentProjects.filter(p => p.path !== path)

      // 앞에 추가
      const newRecent: RecentProject = {
        path,
        name,
        lastOpened: Date.now(),
      }

      const recentProjects = [newRecent, ...filtered].slice(0, MAX_RECENT_PROJECTS)

      return {
        settings: {
          ...state.settings,
          recentProjects,
          lastProjectPath: path,
        }
      }
    })
    get().saveSettings()
  },

  removeRecentProject: (path) => {
    set((state) => ({
      settings: {
        ...state.settings,
        recentProjects: state.settings.recentProjects.filter(p => p.path !== path),
      }
    }))
    get().saveSettings()
  },

  clearRecentProjects: () => {
    set((state) => ({
      settings: {
        ...state.settings,
        recentProjects: [],
      }
    }))
    get().saveSettings()
  },

  setOpenLastProjectOnStartup: (value) => {
    set((state) => ({
      settings: { ...state.settings, openLastProjectOnStartup: value }
    }))
    get().saveSettings()
  },

  setLastProjectPath: (path) => {
    set((state) => ({
      settings: { ...state.settings, lastProjectPath: path }
    }))
    get().saveSettings()
  },

  setLanguage: (language) => {
    set((state) => ({
      settings: { ...state.settings, language }
    }))
    get().saveSettings()
  },
}))
