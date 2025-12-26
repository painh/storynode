import { create } from 'zustand'
import { temporal } from 'zundo'
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

  // 선택 상태
  selectedEdgeId: string | null
  
  // 엣지 삭제 요청 (Canvas에서 처리)
  pendingEdgeDelete: string | null
  
  // 엣지 업데이트 요청 (Canvas에서 처리)
  pendingEdgeUpdate: { edgeId: string; data: Record<string, unknown> } | null

  // Grid 설정
  snapGrid: number
  showGrid: boolean

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

  // 선택 상태
  setSelectedEdgeId: (edgeId: string | null) => void
  requestEdgeDelete: (edgeId: string) => void
  clearPendingEdgeDelete: () => void
  requestEdgeUpdate: (edgeId: string, data: Record<string, unknown>) => void
  clearPendingEdgeUpdate: () => void

  // Grid 설정
  setSnapGrid: (size: number) => void
  setShowGrid: (show: boolean) => void

  clearCanvas: () => void
}

const generateCommentId = () => `comment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

export const useCanvasStore = create<CanvasState>()(
  temporal(
    (set, get) => ({
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      selectedEdgeId: null,
      pendingEdgeDelete: null,
      pendingEdgeUpdate: null,
      snapGrid: 20,
      showGrid: true,
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

      // 선택 상태
      setSelectedEdgeId: (edgeId) => set({ selectedEdgeId: edgeId }),
      requestEdgeDelete: (edgeId) => set({ pendingEdgeDelete: edgeId }),
      clearPendingEdgeDelete: () => set({ pendingEdgeDelete: null }),
      requestEdgeUpdate: (edgeId, data) => set({ pendingEdgeUpdate: { edgeId, data } }),
      clearPendingEdgeUpdate: () => set({ pendingEdgeUpdate: null }),

      // Grid 설정
      setSnapGrid: (size) => set({ snapGrid: size }),
      setShowGrid: (show) => set({ showGrid: show }),

      clearCanvas: () => set({ nodes: [], edges: [], selectedEdgeId: null }),
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
  )
)
