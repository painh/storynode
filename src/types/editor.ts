import type { Node, Edge } from '@xyflow/react'
import type { StoryNode, StoryNodeType, StoryChoice } from './story'

// React Flow 노드에 저장될 데이터
export interface EditorNodeData {
  storyNode: StoryNode
  label: string
}

// React Flow 노드 타입
export type EditorNode = Node<EditorNodeData>

// React Flow 엣지 타입
export type EditorEdge = Edge

// 노드 타입별 색상
export const NODE_COLORS: Record<StoryNodeType, string> = {
  dialogue: '#4A6FA5',    // 파랑
  choice: '#8B4A6B',      // 보라
  battle: '#C62828',      // 빨강
  shop: '#2E7D32',        // 초록
  event: '#F9A825',       // 노랑
  chapter_end: '#37474F', // 회색
}

// 노드 타입별 아이콘
export const NODE_ICONS: Record<StoryNodeType, string> = {
  dialogue: '💬',
  choice: '🔀',
  battle: '⚔️',
  shop: '🏪',
  event: '⭐',
  chapter_end: '🏁',
}

// 노드 타입별 레이블
export const NODE_LABELS: Record<StoryNodeType, string> = {
  dialogue: 'Dialogue',
  choice: 'Choice',
  battle: 'Battle',
  shop: 'Shop',
  event: 'Event',
  chapter_end: 'Chapter End',
}
