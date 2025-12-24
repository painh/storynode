import type { StoryNode, StoryNodeType } from '../../types/story'
import type { EditorState, ImmerSet } from './types'
import { generateId } from '../utils/editorUtils'
import { getNestedValue, setNestedValue } from '../../utils/nestedProperty'

export const createNodeActions = (set: ImmerSet, get: () => EditorState) => ({
  createNode: (type: StoryNodeType, _position?: { x: number; y: number }) => {
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

    set((state) => {
      const stage = state.project.stages.find(s => s.id === state.currentStageId)
      const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)
      if (chapter) {
        if (type === 'start') {
          const existingStart = chapter.nodes.find(n => n.type === 'start')
          if (existingStart) {
            return
          }
        }
        chapter.nodes.push(newNode)
        if (type === 'start') {
          chapter.startNodeId = newNode.id
        }
        state.isDirty = true
      }
    })

    return newNode
  },

  updateNode: (nodeId: string, updates: Partial<StoryNode>) => set((state) => {
    const stage = state.project.stages.find(s => s.id === state.currentStageId)
    const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)
    const node = chapter?.nodes.find(n => n.id === nodeId)
    if (node && chapter) {
      Object.assign(node, updates)
      state.isDirty = true

      // 데이터 바인딩 동기화
      chapter.nodes.forEach(targetNode => {
        if (targetNode.dataBindings) {
          targetNode.dataBindings.forEach(binding => {
            if (binding.sourceNodeId === nodeId) {
              const sourceValue = getNestedValue(node as unknown as Record<string, unknown>, binding.sourcePath)
              if (sourceValue !== undefined) {
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

  deleteNode: (nodeId: string) => set((state) => {
    const stage = state.project.stages.find(s => s.id === state.currentStageId)
    const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)
    if (chapter) {
      chapter.nodes = chapter.nodes.filter(n => n.id !== nodeId)
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
      state.isDirty = true
    }
  }),

  deleteNodes: (nodeIds: string[]) => set((state) => {
    const stage = state.project.stages.find(s => s.id === state.currentStageId)
    const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)
    if (chapter) {
      const nodeIdSet = new Set(nodeIds)
      chapter.nodes = chapter.nodes.filter(n => !nodeIdSet.has(n.id))
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
      state.isDirty = true
    }
  }),

  pasteNodes: (nodeDataList: Array<{ node: StoryNode; position: { x: number; y: number } }>) => {
    const state = get()
    const stage = state.project.stages.find(s => s.id === state.currentStageId)
    const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)

    if (!chapter) return []

    const idMap: Record<string, string> = {}
    const newNodes: StoryNode[] = []

    nodeDataList.forEach(({ node }) => {
      if (node.type === 'start') return

      const newId = generateId()
      idMap[node.id] = newId

      const newNode: StoryNode = JSON.parse(JSON.stringify(node))
      newNode.id = newId
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

    nodeDataList.forEach(({ node }) => {
      if (node.type === 'start') return
      const newNode = newNodes.find(n => n.id === idMap[node.id])
      if (!newNode) return

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
        state.isDirty = true
      }
      state.selectedNodeIds = newIds
    })

    return newIds
  },

  getNodeById: (nodeId: string) => {
    const state = get()
    const stage = state.project.stages.find(s => s.id === state.currentStageId)
    const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)
    return chapter?.nodes.find(n => n.id === nodeId)
  },
})
