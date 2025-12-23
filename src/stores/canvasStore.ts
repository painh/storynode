import { create } from 'zustand'
import type { Node, Edge, Viewport } from '@xyflow/react'
import type { EditorNodeData } from '../types/editor'

interface NodePosition {
  nodeId: string
  x: number
  y: number
}

interface CanvasState {
  // React Flow 상태
  nodes: Node<EditorNodeData>[]
  edges: Edge[]
  viewport: Viewport

  // 노드 위치 저장 (챕터별)
  nodePositions: Record<string, Record<string, { x: number; y: number }>>

  // 액션
  setNodes: (nodes: Node<EditorNodeData>[]) => void
  setEdges: (edges: Edge[]) => void
  setViewport: (viewport: Viewport) => void

  updateNodePosition: (chapterId: string, nodeId: string, position: { x: number; y: number }) => void
  getNodePosition: (chapterId: string, nodeId: string) => { x: number; y: number } | undefined

  clearCanvas: () => void
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  nodePositions: {},

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

  clearCanvas: () => set({ nodes: [], edges: [] }),
}))
