import { create } from 'zustand'
import type { StoryNode } from '../types/story'

export type SearchScope = 'canvas' | 'global'

export interface SearchResult {
  nodeId: string
  nodeType: string
  stageId: string
  stageName: string
  chapterId: string
  chapterName: string
  matchedField: string  // 'text', 'speaker', 'choice', 'eventId', etc.
  matchedText: string
  matchIndex: number    // 매칭 위치
}

interface SearchState {
  // 검색 상태
  isOpen: boolean
  searchQuery: string
  searchScope: SearchScope
  results: SearchResult[]
  selectedResultIndex: number

  // 하이라이트 상태
  highlightedNodeId: string | null
  highlightQuery: string
  navigateTimestamp: number  // 이동 트리거용 타임스탬프

  // 액션
  openSearch: (scope?: SearchScope) => void
  closeSearch: () => void
  setSearchQuery: (query: string) => void
  setSearchScope: (scope: SearchScope) => void
  setResults: (results: SearchResult[]) => void
  selectResult: (index: number) => void
  selectNextResult: () => void
  selectPrevResult: () => void
  setHighlightedNode: (nodeId: string | null, query: string) => void
  clearHighlight: () => void
}

export const useSearchStore = create<SearchState>((set, get) => ({
  isOpen: false,
  searchQuery: '',
  searchScope: 'canvas',
  results: [],
  selectedResultIndex: -1,
  highlightedNodeId: null,
  highlightQuery: '',
  navigateTimestamp: 0,

  openSearch: (scope = 'canvas') => set({
    isOpen: true,
    searchScope: scope,
    results: [],
    selectedResultIndex: -1,
  }),

  closeSearch: () => set({
    isOpen: false,
    searchQuery: '',
    results: [],
    selectedResultIndex: -1,
    highlightedNodeId: null,
    highlightQuery: '',
  }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSearchScope: (scope) => set({
    searchScope: scope,
    results: [],
    selectedResultIndex: -1,
  }),

  setResults: (results) => set({
    results,
    selectedResultIndex: results.length > 0 ? 0 : -1,
  }),

  selectResult: (index) => set({ selectedResultIndex: index }),

  selectNextResult: () => {
    const { results, selectedResultIndex } = get()
    if (results.length === 0) return
    const nextIndex = (selectedResultIndex + 1) % results.length
    set({ selectedResultIndex: nextIndex })
  },

  selectPrevResult: () => {
    const { results, selectedResultIndex } = get()
    if (results.length === 0) return
    const prevIndex = selectedResultIndex <= 0 ? results.length - 1 : selectedResultIndex - 1
    set({ selectedResultIndex: prevIndex })
  },

  setHighlightedNode: (nodeId, query) => set({
    highlightedNodeId: nodeId,
    highlightQuery: query,
    navigateTimestamp: Date.now(),  // 매번 새 타임스탬프로 effect 트리거
  }),

  clearHighlight: () => set({
    highlightedNodeId: null,
    highlightQuery: '',
  }),
}))

// 노드에서 검색 가능한 텍스트 추출 헬퍼
export function extractSearchableText(node: StoryNode): { field: string; text: string }[] {
  const texts: { field: string; text: string }[] = []

  // 공통 필드
  if (node.text) {
    texts.push({ field: 'text', text: node.text })
  }
  if (node.speaker) {
    texts.push({ field: 'speaker', text: node.speaker })
  }

  // choice 노드
  if (node.choices) {
    node.choices.forEach((choice, index) => {
      if (choice.text) {
        texts.push({ field: `choice-${index}`, text: choice.text })
      }
    })
  }

  // event 노드
  if (node.eventId) {
    texts.push({ field: 'eventId', text: node.eventId })
  }

  // battle 노드
  if (node.battleGroupId) {
    texts.push({ field: 'battleGroupId', text: node.battleGroupId })
  }

  // variable 노드
  if (node.variableOperations) {
    node.variableOperations.forEach((op, index) => {
      if (op.key) {
        texts.push({ field: `variable-${index}-key`, text: op.key })
      }
    })
  }

  // condition 노드
  if (node.conditionBranches) {
    node.conditionBranches.forEach((branch, index) => {
      if (branch.condition.flagKey) {
        texts.push({ field: `condition-${index}-key`, text: branch.condition.flagKey })
      }
    })
  }

  return texts
}
