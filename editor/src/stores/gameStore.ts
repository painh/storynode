// 게임 실행 상태 관리 스토어

import { create } from 'zustand'
import type { GameStatus, GameState, DebugInfo, GameMode } from '../types/game'
import type { StoryNode } from '../types/story'
import { GameEngine, type ChapterTransition } from '../features/game/engine/GameEngine'
import { useEditorStore } from './editorStore'
import { useSettingsStore } from './settingsStore'
import { isTauri, saveProjectToFolder } from '../utils/fileUtils'
import { validateChapterById, type ValidationResult } from '../utils/validation'

interface GameStoreState {
  // 게임 상태
  status: GameStatus
  gameState: GameState | null
  currentNode: StoryNode | null
  engine: GameEngine | null

  // 모달 상태
  isModalOpen: boolean

  // 유효성 검사 상태
  validationResult: ValidationResult | null
  showValidationWarning: boolean
  pendingGameStart: { stageId: string; chapterId: string } | null

  // 디버그 상태
  debug: DebugInfo

  // 테마
  currentThemeId: string

  // 게임 모드
  gameMode: GameMode

  // 액션
  openGame: (stageId?: string, chapterId?: string) => void
  closeGame: () => void
  
  // 유효성 검사 관련
  dismissValidationWarning: () => void
  proceedAfterValidation: () => void

  // 내부 함수
  _startGame: (stageId: string, chapterId: string) => Promise<void>

  advance: () => void
  selectChoice: (index: number) => void

  pause: () => void
  resume: () => void
  restart: () => void

  // 디버그 토글
  toggleDebug: () => void
  setDebugOption: (option: keyof DebugInfo, value: boolean) => void
  toggleImageVisibility: (imageId: string) => void
  toggleImageBorder: (imageId: string) => void

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

  // 유효성 검사 상태
  validationResult: null,
  showValidationWarning: false,
  pendingGameStart: null,

  debug: {
    enabled: false,
    showVariables: true,
    showHistory: true,
    showNodeInfo: true,
    hiddenImageIds: new Set<string>(),
    borderedImageIds: new Set<string>(),
  },

  currentThemeId: 'dark',

  gameMode: 'visualNovel',

  openGame: async (stageId, chapterId) => {
    const editorState = useEditorStore.getState()
    const project = editorState.project

    // 스테이지/챕터 ID가 없으면 현재 에디터 상태 사용
    const targetStageId = stageId || editorState.currentStageId
    const targetChapterId = chapterId || editorState.currentChapterId

    if (!targetStageId || !targetChapterId) {
      console.error('No stage or chapter selected')
      return
    }

    // 유효성 검사
    const validationResult = validateChapterById(project, targetStageId, targetChapterId)
    console.log('[GameStore] Validation result:', validationResult)
    
    // 오류 또는 경고가 있으면 경고 모달 표시
    if (!validationResult.isValid || validationResult.warnings.length > 0) {
      console.log('[GameStore] Validation failed, showing warning modal')
      set({
        validationResult,
        showValidationWarning: true,
        pendingGameStart: { stageId: targetStageId, chapterId: targetChapterId },
      })
      return
    }
    
    console.log('[GameStore] Validation passed, starting game')

    // 유효성 검사 통과 - 게임 시작
    await get()._startGame(targetStageId, targetChapterId)
  },

  // 실제 게임 시작 내부 함수
  _startGame: async (targetStageId: string, targetChapterId: string) => {
    const editorState = useEditorStore.getState()
    const settingsState = useSettingsStore.getState()
    const project = editorState.project

    // 게임 실행 전 자동 저장
    if (settingsState.settings.saveBeforeGameRun && isTauri() && settingsState.settings.lastProjectPath) {
      try {
        await saveProjectToFolder(settingsState.settings.lastProjectPath, project)
        console.log('[GameStore] Project saved before game run')
      } catch (error) {
        console.error('[GameStore] Failed to save before game run:', error)
      }
    }

    // 프로젝트 게임 설정 적용
    const gameSettings = project.gameSettings
    const themeId = gameSettings?.defaultThemeId || 'dark'
    const mode = gameSettings?.defaultGameMode || 'visualNovel'

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
      onChapterEnd: (transition: ChapterTransition) => {
        const { engine } = get()
        if (!engine) return

        switch (transition.action) {
          case 'next':
          case 'goto':
            // 다음 챕터가 있으면 자동 전환
            if (transition.nextChapterId && transition.nextStageId) {
              engine.startChapter(transition.nextStageId, transition.nextChapterId)
            } else {
              // 다음 챕터가 없으면 게임 종료
              set({ status: 'ended' })
            }
            break
          case 'select':
            // TODO: 챕터 선택 UI 표시
            set({ status: 'ended' })
            break
          case 'end':
            set({ status: 'ended' })
            break
        }
      },
    })

    // 게임 시작
    engine.start(targetStageId, targetChapterId)

    set({
      engine,
      status: 'playing',
      isModalOpen: true,
      currentThemeId: themeId,
      gameMode: mode,
      // 유효성 검사 상태 초기화
      validationResult: null,
      showValidationWarning: false,
      pendingGameStart: null,
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

  toggleImageVisibility: (imageId) => {
    set((state) => {
      const newHiddenIds = new Set(state.debug.hiddenImageIds)
      if (newHiddenIds.has(imageId)) {
        newHiddenIds.delete(imageId)
      } else {
        newHiddenIds.add(imageId)
      }
      return {
        debug: {
          ...state.debug,
          hiddenImageIds: newHiddenIds,
        },
      }
    })
  },

  toggleImageBorder: (imageId) => {
    set((state) => {
      const newBorderedIds = new Set(state.debug.borderedImageIds)
      if (newBorderedIds.has(imageId)) {
        newBorderedIds.delete(imageId)
      } else {
        newBorderedIds.add(imageId)
      }
      return {
        debug: {
          ...state.debug,
          borderedImageIds: newBorderedIds,
        },
      }
    })
  },

  setTheme: (themeId) => {
    set({ currentThemeId: themeId })
  },

  setGameMode: (mode) => {
    set({ gameMode: mode })
  },

  // 유효성 검사 경고 닫기
  dismissValidationWarning: () => {
    set({
      validationResult: null,
      showValidationWarning: false,
      pendingGameStart: null,
    })
  },

  // 유효성 검사 경고 후 계속 진행
  proceedAfterValidation: async () => {
    const { pendingGameStart } = get()
    if (pendingGameStart) {
      set({
        showValidationWarning: false,
      })
      await get()._startGame(pendingGameStart.stageId, pendingGameStart.chapterId)
    }
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

// 프로젝트 정보 (게임에서 Project.xxx로 접근 가능)
export const useProjectInfo = () => {
  const engine = useGameStore((state) => state.engine)
  return engine?.getProjectInfo() || { name: '', version: '', gameMode: 'visualNovel', theme: 'dark' }
}
