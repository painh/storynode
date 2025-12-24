import type { StoryChapter } from '../../types/story'
import type { EditorState, ImmerSet } from './types'

export const createChapterActions = (set: ImmerSet, get: () => EditorState) => ({
  createChapter: (stageId: string, chapter: Partial<StoryChapter>) => set((state) => {
    const stage = state.project.stages.find(s => s.id === stageId)
    if (stage) {
      const newChapter: StoryChapter = {
        id: `chapter_${Date.now()}`,
        title: chapter.title || 'New Chapter',
        description: chapter.description || '',
        nodes: chapter.nodes || [],
        startNodeId: chapter.startNodeId || '',
        ...chapter,
      }
      stage.chapters.push(newChapter)
      state.isDirty = true
    }
  }),

  updateChapter: (stageId: string, chapterId: string, updates: Partial<StoryChapter>) => set((state) => {
    const stage = state.project.stages.find(s => s.id === stageId)
    const chapter = stage?.chapters.find(c => c.id === chapterId)
    if (chapter) {
      Object.assign(chapter, updates)
      state.isDirty = true
    }
  }),

  deleteChapter: (stageId: string, chapterId: string) => set((state) => {
    const stage = state.project.stages.find(s => s.id === stageId)
    if (stage) {
      stage.chapters = stage.chapters.filter(c => c.id !== chapterId)
      if (state.currentChapterId === chapterId) {
        state.currentChapterId = stage.chapters[0]?.id || null
      }
      state.isDirty = true
    }
  }),

  setCurrentChapter: (chapterId: string | null) => set((state) => {
    state.currentChapterId = chapterId
    state.selectedNodeIds = []
    state.selectedCommentId = null
  }),

  getCurrentChapter: () => {
    const state = get()
    const stage = state.project.stages.find(s => s.id === state.currentStageId)
    return stage?.chapters.find(c => c.id === state.currentChapterId)
  },
})
