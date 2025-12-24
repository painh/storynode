import type { StoryStage } from '../../types/story'
import type { EditorState, ImmerSet } from './types'

export const createStageActions = (set: ImmerSet, get: () => EditorState) => ({
  createStage: (stage: Partial<StoryStage>) => set((state) => {
    const newStage: StoryStage = {
      id: `stage_${Date.now()}`,
      title: stage.title || 'New Stage',
      description: stage.description || '',
      partyCharacters: stage.partyCharacters || [],
      chapters: stage.chapters || [],
      ...stage,
    }
    state.project.stages.push(newStage)
    state.isDirty = true
  }),

  updateStage: (id: string, updates: Partial<StoryStage>) => set((state) => {
    const stage = state.project.stages.find(s => s.id === id)
    if (stage) {
      Object.assign(stage, updates)
      state.isDirty = true
    }
  }),

  deleteStage: (id: string) => set((state) => {
    state.project.stages = state.project.stages.filter(s => s.id !== id)
    if (state.currentStageId === id) {
      state.currentStageId = state.project.stages[0]?.id || null
      state.currentChapterId = state.project.stages[0]?.chapters[0]?.id || null
    }
    state.isDirty = true
  }),

  setCurrentStage: (stageId: string | null) => set((state) => {
    state.currentStageId = stageId
    const stage = state.project.stages.find(s => s.id === stageId)
    state.currentChapterId = stage?.chapters[0]?.id || null
    state.selectedNodeIds = []
    state.selectedCommentId = null
  }),

  getCurrentStage: () => {
    const state = get()
    return state.project.stages.find(s => s.id === state.currentStageId)
  },
})
