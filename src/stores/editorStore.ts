import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { temporal } from 'zundo'
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
  deleteNodes: (nodeIds: string[]) => void
  pasteNodes: (nodes: Array<{ node: StoryNode; position: { x: number; y: number } }>) => string[]

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
    temporal(
      immer((set, get) => ({
        project: createDefaultProject(),
        currentStageId: 'stage_1',
        currentChapterId: 'chapter_1',
        selectedNodeIds: [],

        setProject: (project) => set({
          project,
          currentStageId: project.stages[0]?.id || null,
          currentChapterId: project.stages[0]?.chapters[0]?.id || null,
          selectedNodeIds: [],
        }),

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
        createNode: (type, _position) => {
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
          // start 노드는 추가 속성 없음

          set((state) => {
            const stage = state.project.stages.find(s => s.id === state.currentStageId)
            const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)
            if (chapter) {
              // start 노드는 챕터당 1개만 허용
              if (type === 'start') {
                const existingStart = chapter.nodes.find(n => n.type === 'start')
                if (existingStart) {
                  return // 이미 start 노드가 있으면 추가하지 않음
                }
              }
              chapter.nodes.push(newNode)
              // start 노드면 startNodeId로 설정
              if (type === 'start') {
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

        // 여러 노드 한 번에 삭제 (Undo 시 한 번에 복원되도록)
        deleteNodes: (nodeIds) => set((state) => {
          const stage = state.project.stages.find(s => s.id === state.currentStageId)
          const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)
          if (chapter) {
            const nodeIdSet = new Set(nodeIds)
            chapter.nodes = chapter.nodes.filter(n => !nodeIdSet.has(n.id))
            // 삭제된 노드를 참조하는 nextNodeId들 정리
            chapter.nodes.forEach(node => {
              if (node.nextNodeId && nodeIdSet.has(node.nextNodeId)) {
                node.nextNodeId = undefined
              }
              if (node.choices) {
                node.choices.forEach(choice => {
                  if (nodeIdSet.has(choice.nextNodeId)) {
                    choice.nextNodeId = ''
                  }
                })
              }
              if (node.conditionBranches) {
                node.conditionBranches.forEach(branch => {
                  if (branch.nextNodeId && nodeIdSet.has(branch.nextNodeId)) {
                    branch.nextNodeId = undefined
                  }
                })
              }
              if (node.defaultNextNodeId && nodeIdSet.has(node.defaultNextNodeId)) {
                node.defaultNextNodeId = undefined
              }
            })
            if (nodeIdSet.has(chapter.startNodeId)) {
              chapter.startNodeId = chapter.nodes[0]?.id || ''
            }
            state.selectedNodeIds = []
          }
        }),

        // 노드 붙여넣기 (복사된 노드들을 새 ID로 생성)
        pasteNodes: (nodeDataList) => {
          const state = get()
          const stage = state.project.stages.find(s => s.id === state.currentStageId)
          const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)

          if (!chapter) return []

          // 기존 ID -> 새 ID 매핑
          const idMap: Record<string, string> = {}
          const newNodes: StoryNode[] = []

          nodeDataList.forEach(({ node }) => {
            // start 노드는 복사 불가 (챕터당 1개만)
            if (node.type === 'start') return

            const newId = generateId()
            idMap[node.id] = newId

            // 노드 복사 (deep clone)
            const newNode: StoryNode = JSON.parse(JSON.stringify(node))
            newNode.id = newId

            // nextNodeId, choices, conditionBranches의 참조는 일단 제거
            // (복사된 노드들 간의 연결만 나중에 복원)
            newNode.nextNodeId = undefined
            newNode.defaultNextNodeId = undefined
            if (newNode.choices) {
              newNode.choices = newNode.choices.map(c => ({ ...c, nextNodeId: '' }))
            }
            if (newNode.conditionBranches) {
              newNode.conditionBranches = newNode.conditionBranches.map(b => ({ ...b, nextNodeId: undefined }))
            }

            newNodes.push(newNode)
          })

          // 복사된 노드들 간의 연결 복원
          nodeDataList.forEach(({ node }) => {
            if (node.type === 'start') return
            const newNode = newNodes.find(n => n.id === idMap[node.id])
            if (!newNode) return

            // nextNodeId가 복사된 노드 중 하나를 가리키면 새 ID로 업데이트
            if (node.nextNodeId && idMap[node.nextNodeId]) {
              newNode.nextNodeId = idMap[node.nextNodeId]
            }
            if (node.defaultNextNodeId && idMap[node.defaultNextNodeId]) {
              newNode.defaultNextNodeId = idMap[node.defaultNextNodeId]
            }
            if (node.choices) {
              newNode.choices = node.choices.map(c => ({
                ...c,
                nextNodeId: idMap[c.nextNodeId] || '',
              }))
            }
            if (node.conditionBranches) {
              newNode.conditionBranches = node.conditionBranches.map(b => ({
                ...b,
                nextNodeId: b.nextNodeId && idMap[b.nextNodeId] ? idMap[b.nextNodeId] : undefined,
              }))
            }
          })

          const newIds = newNodes.map(n => n.id)

          set((state) => {
            const stage = state.project.stages.find(s => s.id === state.currentStageId)
            const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)
            if (chapter) {
              chapter.nodes.push(...newNodes)
            }
            state.selectedNodeIds = newIds
          })

          return newIds
        },

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
        // Undo/Redo 설정
        limit: 50, // 최대 50개 히스토리
        partialize: (state) => {
          // project 데이터만 Undo/Redo 대상으로
          const { project } = state
          return { project }
        },
        equality: (pastState, currentState) => {
          // 깊은 비교로 실제 변경만 기록
          return JSON.stringify(pastState) === JSON.stringify(currentState)
        },
      }
    ),
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

// Undo/Redo 훅 export
export const useTemporalStore = <T>(
  _selector: (state: {
    pastStates: EditorState[]
    futureStates: EditorState[]
    undo: () => void
    redo: () => void
    clear: () => void
  }) => T
) => useEditorStore.temporal.getState() as T
