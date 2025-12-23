import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { temporal } from 'zundo'
import type { StoryProject, StoryStage, StoryChapter, StoryNode, StoryNodeType, GameSettings, CustomTheme, ProjectResource, ResourceType, CommentNode } from '../types/story'
import { getNestedValue, setNestedValue } from '../utils/nestedProperty'

interface EditorState {
  // 프로젝트 데이터
  project: StoryProject

  // 변경사항 추적
  isDirty: boolean
  setDirty: (dirty: boolean) => void
  markClean: () => void

  // 현재 선택 상태
  currentStageId: string | null
  currentChapterId: string | null
  selectedNodeIds: string[]
  selectedCommentId: string | null  // 선택된 코멘트 노드

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

  // Game Settings
  updateGameSettings: (settings: Partial<GameSettings>) => void
  addCustomTheme: (theme: CustomTheme) => void
  updateCustomTheme: (themeId: string, updates: Partial<CustomTheme>) => void
  deleteCustomTheme: (themeId: string) => void

  // Resources
  addResource: (resource: ProjectResource) => void
  updateResource: (resourceId: string, updates: Partial<ProjectResource>) => void
  deleteResource: (resourceId: string) => void
  getResourcesByType: (type: ResourceType) => ProjectResource[]
  loadTemplateResources: () => Promise<void>

  // Comment Nodes (에디터용)
  createCommentNode: (position: { x: number; y: number }) => string | null
  updateCommentNode: (commentId: string, updates: Partial<CommentNode['data']>) => void
  updateCommentPosition: (commentId: string, position: { x: number; y: number }) => void
  deleteCommentNode: (commentId: string) => void
  getCommentNodes: () => CommentNode[]
  getCommentById: (commentId: string) => CommentNode | undefined
  setSelectedComment: (commentId: string | null) => void
  wrapNodesWithComment: (flowNodes?: Array<{ id: string; position: { x: number; y: number }; measured?: { width?: number; height?: number } }>) => string | null
}

const generateId = () => `node_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
const generateResourceId = () => `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
const generateCommentId = () => `comment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

// 기본 템플릿 리소스
const defaultTemplateResources: ProjectResource[] = [
  {
    id: 'img_char1',
    name: 'char1',
    type: 'image',
    path: '/templates/default/resources/images/char1.png',
  },
  {
    id: 'img_char2',
    name: 'char2',
    type: 'image',
    path: '/templates/default/resources/images/char2.png',
  },
  {
    id: 'img_background',
    name: 'background',
    type: 'image',
    path: '/templates/default/resources/images/background.png',
  },
]

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
  ],
  gameSettings: {
    defaultGameMode: 'visualNovel',
    defaultThemeId: 'dark',
    customThemes: [],
  },
  resources: [...defaultTemplateResources],
})

export const useEditorStore = create<EditorState>()(
  temporal(
    immer((set, get) => ({
        project: createDefaultProject(),
        currentStageId: 'stage_1',
        currentChapterId: 'chapter_1',
        selectedNodeIds: [],
        selectedCommentId: null,
        isDirty: false,

        setDirty: (dirty) => set({ isDirty: dirty }),
        markClean: () => set({ isDirty: false }),

        setProject: (project) => set({
          project: {
            ...project,
            // resources가 없으면 기본 템플릿 리소스로 초기화
            resources: project.resources || [...defaultTemplateResources],
            // gameSettings가 없으면 기본값으로 초기화
            gameSettings: project.gameSettings || {
              defaultGameMode: 'visualNovel',
              defaultThemeId: 'dark',
              customThemes: [],
            },
          },
          currentStageId: project.stages[0]?.id || null,
          currentChapterId: project.stages[0]?.chapters[0]?.id || null,
          selectedNodeIds: [],
          selectedCommentId: null,
          isDirty: false, // 프로젝트 로드 시 clean 상태
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
          state.selectedCommentId = null
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
          state.selectedCommentId = null
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
          } else if (type === 'custom') {
            newNode.customData = {
              title: 'Custom Node',
              description: '',
              color: '#9C27B0',
              fields: [],
              values: {},
            }
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
          if (node && chapter) {
            Object.assign(node, updates)

            // 데이터 바인딩 동기화: 이 노드를 소스로 하는 바인딩들 찾아서 값 전파
            chapter.nodes.forEach(targetNode => {
              if (targetNode.dataBindings) {
                targetNode.dataBindings.forEach(binding => {
                  if (binding.sourceNodeId === nodeId) {
                    // 소스 노드에서 값 가져오기
                    const sourceValue = getNestedValue(node as unknown as Record<string, unknown>, binding.sourcePath)
                    if (sourceValue !== undefined) {
                      // 타겟 노드에 값 설정
                      const updated = setNestedValue(
                        targetNode as unknown as Record<string, unknown>,
                        binding.targetPath,
                        sourceValue
                      )
                      Object.assign(targetNode, updated)
                    }
                  }
                })
              }
            })
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

        // Game Settings
        updateGameSettings: (settings) => set((state) => {
          if (!state.project.gameSettings) {
            state.project.gameSettings = {
              defaultGameMode: 'visualNovel',
              defaultThemeId: 'dark',
              customThemes: [],
            }
          }
          Object.assign(state.project.gameSettings, settings)
        }),

        addCustomTheme: (theme) => set((state) => {
          if (!state.project.gameSettings) {
            state.project.gameSettings = {
              defaultGameMode: 'visualNovel',
              defaultThemeId: 'dark',
              customThemes: [],
            }
          }
          if (!state.project.gameSettings.customThemes) {
            state.project.gameSettings.customThemes = []
          }
          state.project.gameSettings.customThemes.push(theme)
        }),

        updateCustomTheme: (themeId, updates) => set((state) => {
          const themes = state.project.gameSettings?.customThemes
          if (themes) {
            const index = themes.findIndex(t => t.id === themeId)
            if (index !== -1) {
              Object.assign(themes[index], updates)
            }
          }
        }),

        deleteCustomTheme: (themeId) => set((state) => {
          const themes = state.project.gameSettings?.customThemes
          if (themes) {
            const index = themes.findIndex(t => t.id === themeId)
            if (index !== -1) {
              themes.splice(index, 1)
            }
          }
        }),

        // Resources
        addResource: (resource) => set((state) => {
          if (!state.project.resources) {
            state.project.resources = []
          }
          // ID가 없으면 생성
          if (!resource.id) {
            resource.id = generateResourceId()
          }
          state.project.resources.push(resource)
        }),

        updateResource: (resourceId, updates) => set((state) => {
          const resources = state.project.resources
          if (resources) {
            const index = resources.findIndex(r => r.id === resourceId)
            if (index !== -1) {
              Object.assign(resources[index], updates)
            }
          }
        }),

        deleteResource: (resourceId) => set((state) => {
          if (state.project.resources) {
            const index = state.project.resources.findIndex(r => r.id === resourceId)
            if (index !== -1) {
              state.project.resources.splice(index, 1)
            }
          }
        }),

        getResourcesByType: (type) => {
          const state = get()
          return (state.project.resources || []).filter(r => r.type === type)
        },

        loadTemplateResources: async () => {
          set((state) => {
            if (!state.project.resources) {
              state.project.resources = []
            }
            // 템플릿 리소스 중 아직 없는 것만 추가
            defaultTemplateResources.forEach(template => {
              const exists = state.project.resources!.some(r => r.path === template.path)
              if (!exists) {
                state.project.resources!.push({ ...template })
              }
            })
          })
        },

        // Comment Nodes
        createCommentNode: (position) => {
          const state = get()
          const stage = state.project.stages.find(s => s.id === state.currentStageId)
          const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)

          if (!chapter) return null

          const id = generateCommentId()
          const newComment: CommentNode = {
            id,
            position,
            data: {
              title: 'Comment',
              description: '',
              color: '#5C6BC0',
              width: 300,
              height: 200,
            }
          }

          set((state) => {
            const stage = state.project.stages.find(s => s.id === state.currentStageId)
            const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)
            if (chapter) {
              if (!chapter.commentNodes) {
                chapter.commentNodes = []
              }
              chapter.commentNodes.push(newComment)
            }
          })

          return id
        },

        updateCommentNode: (commentId, updates) => set((state) => {
          const stage = state.project.stages.find(s => s.id === state.currentStageId)
          const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)
          const comment = chapter?.commentNodes?.find(c => c.id === commentId)
          if (comment) {
            Object.assign(comment.data, updates)
          }
        }),

        updateCommentPosition: (commentId, position) => set((state) => {
          const stage = state.project.stages.find(s => s.id === state.currentStageId)
          const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)
          const comment = chapter?.commentNodes?.find(c => c.id === commentId)
          if (comment) {
            comment.position = position
          }
        }),

        deleteCommentNode: (commentId) => set((state) => {
          const stage = state.project.stages.find(s => s.id === state.currentStageId)
          const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)
          if (chapter && chapter.commentNodes) {
            chapter.commentNodes = chapter.commentNodes.filter(c => c.id !== commentId)
          }
        }),

        getCommentNodes: () => {
          const state = get()
          const stage = state.project.stages.find(s => s.id === state.currentStageId)
          const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)
          return chapter?.commentNodes || []
        },

        getCommentById: (commentId) => {
          const state = get()
          const stage = state.project.stages.find(s => s.id === state.currentStageId)
          const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)
          return chapter?.commentNodes?.find(c => c.id === commentId)
        },

        setSelectedComment: (commentId) => set((state) => {
          state.selectedCommentId = commentId
          // 코멘트 선택 시 노드 선택 해제
          if (commentId) {
            state.selectedNodeIds = []
          }
        }),

        // 선택된 노드들을 Comment로 감싸기 (React Flow nodes에서 실제 크기 사용)
        wrapNodesWithComment: (flowNodes?: Array<{ id: string; position: { x: number; y: number }; measured?: { width?: number; height?: number } }>) => {
          const state = get()
          const { selectedNodeIds, currentStageId, currentChapterId } = state

          if (selectedNodeIds.length === 0) return null

          const stage = state.project.stages.find(s => s.id === currentStageId)
          const chapter = stage?.chapters.find(c => c.id === currentChapterId)

          if (!chapter) return null

          // 선택된 노드들의 위치 수집
          const positions: Array<{ x: number; y: number; width: number; height: number }> = []

          // React Flow nodes에서 실제 크기 가져오기
          const flowNodeMap = new Map(flowNodes?.map(n => [n.id, n]) || [])

          chapter.nodes.forEach(node => {
            if (selectedNodeIds.includes(node.id) && node.position) {
              const flowNode = flowNodeMap.get(node.id)
              const measured = flowNode?.measured
              positions.push({
                x: node.position.x,
                y: node.position.y,
                width: measured?.width || 280,
                height: measured?.height || 180,
              })
            }
          })

          // Comment 노드들의 위치
          chapter.commentNodes?.forEach(comment => {
            if (selectedNodeIds.includes(comment.id)) {
              positions.push({
                x: comment.position.x,
                y: comment.position.y,
                width: comment.data.width,
                height: comment.data.height,
              })
            }
          })

          if (positions.length === 0) return null

          // 바운딩 박스 계산 (패딩 포함)
          const padding = 40
          const minX = Math.min(...positions.map(p => p.x)) - padding
          const minY = Math.min(...positions.map(p => p.y)) - padding
          const maxX = Math.max(...positions.map(p => p.x + p.width)) + padding
          const maxY = Math.max(...positions.map(p => p.y + p.height)) + padding

          const id = generateCommentId()
          const newComment: CommentNode = {
            id,
            position: { x: minX, y: minY },
            data: {
              title: 'Comment',
              description: '',
              color: '#5C6BC0',
              width: maxX - minX,
              height: maxY - minY,
            }
          }

          set((state) => {
            const stage = state.project.stages.find(s => s.id === state.currentStageId)
            const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)
            if (chapter) {
              if (!chapter.commentNodes) {
                chapter.commentNodes = []
              }
              chapter.commentNodes.push(newComment)
            }
          })

          return id
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
