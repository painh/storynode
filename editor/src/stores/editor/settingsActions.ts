import type { GameSettings, CustomTheme } from '../../types/story'
import type { ImmerSet } from './types'
import { createDefaultGameSettings } from '../utils/editorUtils'

export const createSettingsActions = (set: ImmerSet) => ({
  updateGameSettings: (settings: Partial<GameSettings>) => set((state) => {
    if (!state.project.gameSettings) {
      state.project.gameSettings = createDefaultGameSettings()
    }
    Object.assign(state.project.gameSettings, settings)
    state.isDirty = true
  }),

  addCustomTheme: (theme: CustomTheme) => set((state) => {
    if (!state.project.gameSettings) {
      state.project.gameSettings = createDefaultGameSettings()
    }
    if (!state.project.gameSettings.customThemes) {
      state.project.gameSettings.customThemes = []
    }
    state.project.gameSettings.customThemes.push(theme)
    state.isDirty = true
  }),

  updateCustomTheme: (themeId: string, updates: Partial<CustomTheme>) => set((state) => {
    const themes = state.project.gameSettings?.customThemes
    if (themes) {
      const index = themes.findIndex(t => t.id === themeId)
      if (index !== -1) {
        Object.assign(themes[index], updates)
        state.isDirty = true
      }
    }
  }),

  deleteCustomTheme: (themeId: string) => set((state) => {
    const themes = state.project.gameSettings?.customThemes
    if (themes) {
      const index = themes.findIndex(t => t.id === themeId)
      if (index !== -1) {
        themes.splice(index, 1)
        state.isDirty = true
      }
    }
  }),
})
