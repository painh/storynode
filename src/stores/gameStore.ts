// 게임 실행 상태 관리 스토어

import { create } from 'zustand'
import type { GameStatus, GameState, DebugInfo, GameMode } from '../types/game'
import type { StoryNode } from '../types/story'
import { GameEngine } from '../features/game/engine/GameEngine'
import { useEditorStore } from './editorStore'

interface GameStoreState {
  // 게임 상태
  status: GameStatus
  gameState: GameState | null
  currentNode: StoryNode | null
  engine: GameEngine | null

  // 모달 상태
  isModalOpen: boolean

  // 디버그 상태
  debug: DebugInfo

  // 테마
  currentThemeId: string

  // 게임 모드
  gameMode: GameMode

  // 액션
  openGame: (stageId?: string, chapterId?: string) => void
  closeGame: () => void

  advance: () => void
  selectChoice: (index: number) => void

  pause: () => void
  resume: () => void
  restart: () => void

  // 디버그 토글
  toggleDebug: () => void
  setDebugOption: (option: keyof DebugInfo, value: boolean) => void

  // 테마
  setTheme: (themeId: string) => void

  // 게임 모드
  setGameMode: (mode: GameMode) => void

  // 내부 업데이트 (엔진에서 호출)
  _setCurrentNode: (node: StoryNode | null) => void
  _setGameState: (state: GameState) => void
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  status: 'idle',
  gameState: null,
  currentNode: null,
  engine: null,
  isModalOpen: false,

  debug: {
    enabled: false,
    showVariables: true,
    showHistory: true,
    showNodeInfo: true,
  },

  currentThemeId: 'dark',

  gameMode: 'visualNovel',

  openGame: (stageId, chapterId) => {
    const editorState = useEditorStore.getState()
    const project = editorState.project

    // 스테이지/챕터 ID가 없으면 현재 에디터 상태 사용
    const targetStageId = stageId || editorState.currentStageId
    const targetChapterId = chapterId || editorState.currentChapterId

    if (!targetStageId || !targetChapterId) {
      console.error('No stage or chapter selected')
      return
    }

    // 엔진 생성
    const engine = new GameEngine(project, {
      onStateChange: (state) => {
        get()._setGameState(state)
      },
      onNodeChange: (node) => {
        get()._setCurrentNode(node)
      },
      onGameEnd: () => {
        set({ status: 'ended' })
      },
    })

    // 게임 시작
    engine.start(targetStageId, targetChapterId)

    set({
      engine,
      status: 'playing',
      isModalOpen: true,
    })
  },

  closeGame: () => {
    set({
      status: 'idle',
      isModalOpen: false,
      gameState: null,
      currentNode: null,
      engine: null,
    })
  },

  advance: () => {
    const { engine, status } = get()
    if (engine && status === 'playing') {
      engine.advance()
    }
  },

  selectChoice: (index) => {
    const { engine, status } = get()
    if (engine && status === 'playing') {
      engine.selectChoice(index)
    }
  },

  pause: () => {
    const { status } = get()
    if (status === 'playing') {
      set({ status: 'paused' })
    }
  },

  resume: () => {
    const { status } = get()
    if (status === 'paused') {
      set({ status: 'playing' })
    }
  },

  restart: () => {
    const { engine } = get()
    if (engine) {
      engine.restart()
      set({ status: 'playing' })
    }
  },

  toggleDebug: () => {
    set((state) => ({
      debug: {
        ...state.debug,
        enabled: !state.debug.enabled,
      },
    }))
  },

  setDebugOption: (option, value) => {
    set((state) => ({
      debug: {
        ...state.debug,
        [option]: value,
      },
    }))
  },

  setTheme: (themeId) => {
    set({ currentThemeId: themeId })
  },

  setGameMode: (mode) => {
    set({ gameMode: mode })
  },

  _setCurrentNode: (node) => {
    set({ currentNode: node })
  },

  _setGameState: (state) => {
    set({ gameState: state })
  },
}))

// 편의 훅들
export const useGameStatus = () => useGameStore((state) => state.status)
export const useGameState = () => useGameStore((state) => state.gameState)
export const useCurrentNode = () => useGameStore((state) => state.currentNode)
export const useDebugInfo = () => useGameStore((state) => state.debug)
export const useGameTheme = () => useGameStore((state) => state.currentThemeId)
export const useGameMode = () => useGameStore((state) => state.gameMode)
