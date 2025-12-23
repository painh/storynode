import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { temporal } from 'zundo'
import type { Node, Edge, Viewport } from '@xyflow/react'
import type { EditorNodeData, CommentNodeData } from '../types/editor'

// Comment 노드 저장 데이터
interface CommentNodeStore {
  id: string
  position: { x: number; y: number }
  data: CommentNodeData
}

// 클립보드 데이터 타입
interface ClipboardData {
  nodes: Array<{
    node: import('../types/story').StoryNode
    position: { x: number; y: number }
  }>
  comments: CommentNodeStore[]
}

interface CanvasState {
  // React Flow 상태
  nodes: Node<EditorNodeData>[]
  edges: Edge[]
  viewport: Viewport

  // Grid 설정
  snapGrid: number
  showGrid: boolean

  // 노드 위치 저장 (챕터별)
  nodePositions: Record<string, Record<string, { x: number; y: number }>>

  // Comment 노드 저장 (챕터별)
  commentNodes: Record<string, CommentNodeStore[]>

  // 클립보드 (복사/붙여넣기)
  clipboard: ClipboardData | null

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

  // 클립보드 관리
  setClipboard: (data: ClipboardData) => void
  getClipboard: () => ClipboardData | null

  // Grid 설정
  setSnapGrid: (size: number) => void
  setShowGrid: (show: boolean) => void

  clearCanvas: () => void
}

const generateCommentId = () => `comment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

export const useCanvasStore = create<CanvasState>()(
  persist(
    temporal(
      (set, get) => ({
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      snapGrid: 20,
      showGrid: true,
      nodePositions: {},
      commentNodes: {},
      clipboard: null,

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

      // 클립보드
      setClipboard: (data) => set({ clipboard: data }),
      getClipboard: () => get().clipboard,

      // Grid 설정
      setSnapGrid: (size) => set({ snapGrid: size }),
      setShowGrid: (show) => set({ showGrid: show }),

      clearCanvas: () => set({ nodes: [], edges: [] }),
      }),
      {
        // Undo/Redo 설정 - nodePositions와 commentNodes만 추적
        limit: 50,
        partialize: (state) => ({
          nodePositions: state.nodePositions,
          commentNodes: state.commentNodes,
        }),
        equality: (pastState, currentState) => {
          return JSON.stringify(pastState) === JSON.stringify(currentState)
        },
      }
    ),
    {
      name: 'storynode-canvas',
      partialize: (state) => ({
        nodePositions: state.nodePositions,
        commentNodes: state.commentNodes,
        snapGrid: state.snapGrid,
        showGrid: state.showGrid,
      }),
    }
  )
)
