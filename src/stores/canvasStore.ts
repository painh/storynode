import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Node, Edge, Viewport } from '@xyflow/react'
import type { EditorNodeData, CommentNodeData } from '../types/editor'

// Comment 노드 저장 데이터
interface CommentNodeStore {
  id: string
  position: { x: number; y: number }
  data: CommentNodeData
}

interface CanvasState {
  // React Flow 상태
  nodes: Node<EditorNodeData>[]
  edges: Edge[]
  viewport: Viewport

  // 노드 위치 저장 (챕터별)
  nodePositions: Record<string, Record<string, { x: number; y: number }>>

  // Comment 노드 저장 (챕터별)
  commentNodes: Record<string, CommentNodeStore[]>

  // 액션
  setNodes: (nodes: Node<EditorNodeData>[]) => void
  setEdges: (edges: Edge[]) => void
  setViewport: (viewport: Viewport) => void

  updateNodePosition: (chapterId: string, nodeId: string, position: { x: number; y: number }) => void
  getNodePosition: (chapterId: string, nodeId: string) => { x: number; y: number } | undefined

  // Comment 노드 관리
  createCommentNode: (chapterId: string, position: { x: number; y: number }) => string
  updateCommentNode: (chapterId: string, nodeId: string, updates: Partial<CommentNodeData>) => void
  updateCommentPosition: (chapterId: string, nodeId: string, position: { x: number; y: number }) => void
  deleteCommentNode: (chapterId: string, nodeId: string) => void
  getCommentNodes: (chapterId: string) => CommentNodeStore[]

  clearCanvas: () => void
}

const generateCommentId = () => `comment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      nodePositions: {},
      commentNodes: {},

      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),
      setViewport: (viewport) => set({ viewport }),

      updateNodePosition: (chapterId, nodeId, position) => set((state) => ({
        nodePositions: {
          ...state.nodePositions,
          [chapterId]: {
            ...state.nodePositions[chapterId],
            [nodeId]: position
          }
        }
      })),

      getNodePosition: (chapterId, nodeId) => {
        const state = get()
        return state.nodePositions[chapterId]?.[nodeId]
      },

      // Comment 노드 관리
      createCommentNode: (chapterId, position) => {
        const id = generateCommentId()
        const newComment: CommentNodeStore = {
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
        set((state) => ({
          commentNodes: {
            ...state.commentNodes,
            [chapterId]: [...(state.commentNodes[chapterId] || []), newComment]
          }
        }))
        return id
      },

      updateCommentNode: (chapterId, nodeId, updates) => set((state) => ({
        commentNodes: {
          ...state.commentNodes,
          [chapterId]: (state.commentNodes[chapterId] || []).map(comment =>
            comment.id === nodeId
              ? { ...comment, data: { ...comment.data, ...updates } }
              : comment
          )
        }
      })),

      updateCommentPosition: (chapterId, nodeId, position) => set((state) => ({
        commentNodes: {
          ...state.commentNodes,
          [chapterId]: (state.commentNodes[chapterId] || []).map(comment =>
            comment.id === nodeId
              ? { ...comment, position }
              : comment
          )
        }
      })),

      deleteCommentNode: (chapterId, nodeId) => set((state) => ({
        commentNodes: {
          ...state.commentNodes,
          [chapterId]: (state.commentNodes[chapterId] || []).filter(c => c.id !== nodeId)
        }
      })),

      getCommentNodes: (chapterId) => {
        const state = get()
        return state.commentNodes[chapterId] || []
      },

      clearCanvas: () => set({ nodes: [], edges: [] }),
    }),
    {
      name: 'storynode-canvas',
      partialize: (state) => ({
        nodePositions: state.nodePositions,
        commentNodes: state.commentNodes,
      }),
    }
  )
)
