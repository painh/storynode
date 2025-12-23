// 게임 실행 관련 타입 정의

import type { CharacterId, FactionId } from './story'

// 게임 실행 상태
export type GameStatus = 'idle' | 'playing' | 'paused' | 'ended'

// 게임 변수 상태
export interface GameVariables {
  gold: number
  hp: number
  flags: Record<string, boolean | number | string>
  affection: Record<CharacterId, number>
  reputation: Record<FactionId, number>
  choicesMade: string[] // 선택한 choice ID 기록
}

// 게임 히스토리 엔트리
export interface GameHistoryEntry {
  nodeId: string
  type: string
  content: string
  speaker?: string
  timestamp: number
  choiceText?: string // 선택지였다면 선택한 텍스트
}

// 게임 상태 (세이브/로드용)
export interface GameState {
  currentNodeId: string
  currentStageId: string
  currentChapterId: string
  variables: GameVariables
  history: GameHistoryEntry[]
  startedAt: number
  playTime: number
}

// 디버그 정보
export interface DebugInfo {
  enabled: boolean
  showVariables: boolean
  showHistory: boolean
  showNodeInfo: boolean
}

// 테마 색상 설정
export interface GameThemeColors {
  background: string
  dialogueBox: string
  dialogueBoxBorder: string
  dialogueText: string
  speakerName: string
  speakerNameBg: string
  choiceButton: string
  choiceButtonHover: string
  choiceButtonText: string
  choiceButtonBorder: string
  accent: string
  debugPanelBg: string
  debugPanelText: string
}

// 테마 폰트 설정
export interface GameThemeFonts {
  dialogue: string
  speaker: string
  ui: string
}

// 테마 효과 설정
export interface GameThemeEffects {
  typewriterSpeed: number // ms per character
  fadeTransition: boolean
  dialogueAnimation: 'typewriter' | 'instant' | 'fade'
}

// 전체 테마 설정
export interface GameTheme {
  id: string
  name: string
  colors: GameThemeColors
  fonts: GameThemeFonts
  effects: GameThemeEffects
}

// 초기 게임 변수
export const DEFAULT_GAME_VARIABLES: GameVariables = {
  gold: 0,
  hp: 100,
  flags: {},
  affection: {
    kairen: 0,
    zed: 0,
    lyra: 0,
    elise: 0,
  },
  reputation: {
    kingdom: 0,
    elves: 0,
    dwarves: 0,
    free_cities: 0,
    mage_tower: 0,
    dark_lands: 0,
  },
  choicesMade: [],
}
