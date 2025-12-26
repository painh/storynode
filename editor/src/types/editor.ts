import type { Node, Edge } from '@xyflow/react'
import type { StoryNode, StoryNodeType } from './story'

// 에디터 전용 노드 타입 (게임 데이터에 포함 안됨)
export type EditorOnlyNodeType = 'comment'

// 모든 노드 타입 (스토리 + 에디터 전용)
export type AllNodeType = StoryNodeType | EditorOnlyNodeType

// Comment 노드 데이터
export interface CommentNodeData {
  title: string
  description: string
  color: string
  width: number
  height: number
  isCollapsed?: boolean  // 포스트잇 접기 모드
}

// React Flow 노드에 저장될 데이터
export interface EditorNodeData extends Record<string, unknown> {
  storyNode?: StoryNode
  commentData?: CommentNodeData
  label: string
  isPlaying?: boolean // 게임 실행 중 현재 노드 표시
}

// React Flow 노드 타입
export type EditorNode = Node<EditorNodeData>

// React Flow 엣지 타입
export type EditorEdge = Edge

// 노드 타입별 색상
export const NODE_COLORS: Record<AllNodeType, string> = {
  start: '#4CAF50',       // 초록 (시작)
  dialogue: '#4A6FA5',    // 파랑
  choice: '#8B4A6B',      // 보라
  battle: '#C62828',      // 빨강
  shop: '#2E7D32',        // 초록
  event: '#F9A825',       // 노랑
  chapter_end: '#4CAF50', // 초록 (시작과 동일)
  variable: '#7B1FA2',    // 보라 (진함)
  condition: '#00796B',   // 청록
  image: '#00BCD4',       // 시안 (이미지)
  javascript: '#F0DB4F',  // JavaScript 노란색
  custom: '#9C27B0',      // 딥 퍼플 (커스텀)
  comment: '#5C6BC0',     // 인디고 (코멘트)
}

// 노드 타입별 아이콘
export const NODE_ICONS: Record<AllNodeType, string> = {
  start: '▶️',
  dialogue: '💬',
  choice: '🔀',
  battle: '⚔️',
  shop: '🏪',
  event: '⭐',
  chapter_end: '🏁',
  variable: '📊',
  condition: '❓',
  image: '🖼️',
  javascript: '📜',
  custom: '🧩',
  comment: '📝',
}

// 노드 타입별 레이블 (deprecated - use i18n instead)
export const NODE_LABELS: Record<AllNodeType, string> = {
  start: 'Start',
  dialogue: 'Dialogue',
  choice: 'Choice',
  battle: 'Battle',
  shop: 'Shop',
  event: 'Event',
  chapter_end: 'Chapter End',
  variable: 'Variable',
  condition: 'Condition',
  image: 'Image',
  javascript: 'JavaScript',
  custom: 'Custom',
  comment: 'Comment',
}
