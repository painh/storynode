import type { CommentNode } from '../../types/story'
import type { EditorState, ImmerSet } from './types'
import { generateCommentId } from '../utils/editorUtils'

export const createCommentActions = (set: ImmerSet, get: () => EditorState) => ({
  createCommentNode: (position: { x: number; y: number }) => {
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
        state.isDirty = true
      }
    })

    return id
  },

  updateCommentNode: (commentId: string, updates: Partial<CommentNode['data']>) => set((state) => {
    const stage = state.project.stages.find(s => s.id === state.currentStageId)
    const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)
    const comment = chapter?.commentNodes?.find(c => c.id === commentId)
    if (comment) {
      Object.assign(comment.data, updates)
      state.isDirty = true
    }
  }),

  updateCommentPosition: (commentId: string, position: { x: number; y: number }) => set((state) => {
    const stage = state.project.stages.find(s => s.id === state.currentStageId)
    const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)
    const comment = chapter?.commentNodes?.find(c => c.id === commentId)
    if (comment) {
      comment.position = position
      state.isDirty = true
    }
  }),

  deleteCommentNode: (commentId: string) => set((state) => {
    const stage = state.project.stages.find(s => s.id === state.currentStageId)
    const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)
    if (chapter && chapter.commentNodes) {
      chapter.commentNodes = chapter.commentNodes.filter(c => c.id !== commentId)
      state.isDirty = true
    }
  }),

  getCommentNodes: () => {
    const state = get()
    const stage = state.project.stages.find(s => s.id === state.currentStageId)
    const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)
    return chapter?.commentNodes || []
  },

  getCommentById: (commentId: string) => {
    const state = get()
    const stage = state.project.stages.find(s => s.id === state.currentStageId)
    const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)
    return chapter?.commentNodes?.find(c => c.id === commentId)
  },

  setSelectedComment: (commentId: string | null) => set((state) => {
    state.selectedCommentId = commentId
    if (commentId) {
      state.selectedNodeIds = []
    }
  }),

  wrapNodesWithComment: (flowNodes?: Array<{ id: string; position: { x: number; y: number }; measured?: { width?: number; height?: number } }>) => {
    const state = get()
    const { selectedNodeIds, currentStageId, currentChapterId } = state

    if (selectedNodeIds.length === 0) return null

    const stage = state.project.stages.find(s => s.id === currentStageId)
    const chapter = stage?.chapters.find(c => c.id === currentChapterId)

    if (!chapter) return null

    const positions: Array<{ x: number; y: number; width: number; height: number }> = []
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
        state.isDirty = true
      }
    })

    return id
  },
})
