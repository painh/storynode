import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { StoryProject, StoryStage, StoryChapter, StoryNode, StoryNodeType } from '../types/story'

interface EditorState {
  // 프로젝트 데이터
  project: StoryProject

  // 현재 선택 상태
  currentStageId: string | null
  currentChapterId: string | null
  selectedNodeIds: string[]

  // 액션
  setProject: (project: StoryProject) => void

  // Stage CRUD
  createStage: (stage: Partial<StoryStage>) => void
  updateStage: (id: string, updates: Partial<StoryStage>) => void
  deleteStage: (id: string) => void
  setCurrentStage: (stageId: string | null) => void

  // Chapter CRUD
  createChapter: (stageId: string, chapter: Partial<StoryChapter>) => void
  updateChapter: (stageId: string, chapterId: string, updates: Partial<StoryChapter>) => void
  deleteChapter: (stageId: string, chapterId: string) => void
  setCurrentChapter: (chapterId: string | null) => void

  // Node CRUD
  createNode: (type: StoryNodeType, position?: { x: number; y: number }) => StoryNode | null
  updateNode: (nodeId: string, updates: Partial<StoryNode>) => void
  deleteNode: (nodeId: string) => void

  // Selection
  setSelectedNodes: (nodeIds: string[]) => void
  clearSelection: () => void

  // Helpers
  getCurrentStage: () => StoryStage | undefined
  getCurrentChapter: () => StoryChapter | undefined
  getNodeById: (nodeId: string) => StoryNode | undefined
}

const generateId = () => `node_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

const createDefaultProject = (): StoryProject => ({
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

export const useEditorStore = create<EditorState>()(
  persist(
    immer((set, get) => ({
      project: createDefaultProject(),
      currentStageId: 'stage_1',
      currentChapterId: 'chapter_1',
      selectedNodeIds: [],

      setProject: (project) => set({ project }),

      // Stage CRUD
      createStage: (stage) => set((state) => {
        const newStage: StoryStage = {
          id: `stage_${Date.now()}`,
          title: stage.title || 'New Stage',
          description: stage.description || '',
          partyCharacters: stage.partyCharacters || [],
          chapters: stage.chapters || [],
          ...stage,
        }
        state.project.stages.push(newStage)
      }),

      updateStage: (id, updates) => set((state) => {
        const stage = state.project.stages.find(s => s.id === id)
        if (stage) {
          Object.assign(stage, updates)
        }
      }),

      deleteStage: (id) => set((state) => {
        state.project.stages = state.project.stages.filter(s => s.id !== id)
        if (state.currentStageId === id) {
          state.currentStageId = state.project.stages[0]?.id || null
          state.currentChapterId = state.project.stages[0]?.chapters[0]?.id || null
        }
      }),

      setCurrentStage: (stageId) => set((state) => {
        state.currentStageId = stageId
        const stage = state.project.stages.find(s => s.id === stageId)
        state.currentChapterId = stage?.chapters[0]?.id || null
        state.selectedNodeIds = []
      }),

      // Chapter CRUD
      createChapter: (stageId, chapter) => set((state) => {
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
        }
      }),

      updateChapter: (stageId, chapterId, updates) => set((state) => {
        const stage = state.project.stages.find(s => s.id === stageId)
        const chapter = stage?.chapters.find(c => c.id === chapterId)
        if (chapter) {
          Object.assign(chapter, updates)
        }
      }),

      deleteChapter: (stageId, chapterId) => set((state) => {
        const stage = state.project.stages.find(s => s.id === stageId)
        if (stage) {
          stage.chapters = stage.chapters.filter(c => c.id !== chapterId)
          if (state.currentChapterId === chapterId) {
            state.currentChapterId = stage.chapters[0]?.id || null
          }
        }
      }),

      setCurrentChapter: (chapterId) => set((state) => {
        state.currentChapterId = chapterId
        state.selectedNodeIds = []
      }),

      // Node CRUD
      createNode: (type, position) => {
        const state = get()
        const stage = state.project.stages.find(s => s.id === state.currentStageId)
        const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)

        if (!chapter) return null

        const newNode: StoryNode = {
          id: generateId(),
          type,
        }

        if (type === 'dialogue') {
          newNode.text = ''
          newNode.speaker = ''
        } else if (type === 'choice') {
          newNode.text = ''
          newNode.choices = []
        } else if (type === 'chapter_end') {
          newNode.text = ''
        }

        set((state) => {
          const stage = state.project.stages.find(s => s.id === state.currentStageId)
          const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)
          if (chapter) {
            chapter.nodes.push(newNode)
            // 첫 노드면 startNodeId로 설정
            if (chapter.nodes.length === 1) {
              chapter.startNodeId = newNode.id
            }
          }
        })

        return newNode
      },

      updateNode: (nodeId, updates) => set((state) => {
        const stage = state.project.stages.find(s => s.id === state.currentStageId)
        const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)
        const node = chapter?.nodes.find(n => n.id === nodeId)
        if (node) {
          Object.assign(node, updates)
        }
      }),

      deleteNode: (nodeId) => set((state) => {
        const stage = state.project.stages.find(s => s.id === state.currentStageId)
        const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)
        if (chapter) {
          chapter.nodes = chapter.nodes.filter(n => n.id !== nodeId)
          // 삭제된 노드를 참조하는 nextNodeId들 정리
          chapter.nodes.forEach(node => {
            if (node.nextNodeId === nodeId) {
              node.nextNodeId = undefined
            }
            if (node.choices) {
              node.choices.forEach(choice => {
                if (choice.nextNodeId === nodeId) {
                  choice.nextNodeId = ''
                }
              })
            }
          })
          if (chapter.startNodeId === nodeId) {
            chapter.startNodeId = chapter.nodes[0]?.id || ''
          }
          state.selectedNodeIds = state.selectedNodeIds.filter(id => id !== nodeId)
        }
      }),

      // Selection
      setSelectedNodes: (nodeIds) => set({ selectedNodeIds: nodeIds }),
      clearSelection: () => set({ selectedNodeIds: [] }),

      // Helpers
      getCurrentStage: () => {
        const state = get()
        return state.project.stages.find(s => s.id === state.currentStageId)
      },

      getCurrentChapter: () => {
        const state = get()
        const stage = state.project.stages.find(s => s.id === state.currentStageId)
        return stage?.chapters.find(c => c.id === state.currentChapterId)
      },

      getNodeById: (nodeId) => {
        const state = get()
        const stage = state.project.stages.find(s => s.id === state.currentStageId)
        const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)
        return chapter?.nodes.find(n => n.id === nodeId)
      },
    })),
    {
      name: 'storynode-editor',
      partialize: (state) => ({
        project: state.project,
        currentStageId: state.currentStageId,
        currentChapterId: state.currentChapterId,
      }),
    }
  )
)
