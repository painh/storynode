// 게임 실행 관련 타입 정의

import type { ImageLayer, ImageAlignment, ImageEffectType } from './story'

// 활성 이미지 (현재 화면에 표시 중인 이미지)
export interface ActiveImage {
  id: string               // 이미지 식별자 (노드 ID)
  instanceId: number       // 인스턴스 ID (애니메이션 재생용)
  resourcePath: string     // 리소스 경로 또는 base64
  layer: ImageLayer        // 레이어 (background, character 등)
  layerOrder: number       // 레이어 내 순서
  alignment: ImageAlignment
  x?: number
  y?: number
  flipHorizontal?: boolean
  effect?: string          // 이미지 효과 (deprecated, 하위 호환용)
  effects?: ImageEffectType[] // 다중 이미지 효과
  effectDuration?: number  // 효과 지속 시간 (ms)
  isExiting?: boolean      // 퇴장 중인지 여부
  exitEffect?: string      // 퇴장 이펙트
  exitEffectDuration?: number  // 퇴장 지속 시간 (ms)
}

// 게임 실행 상태
export type GameStatus = 'idle' | 'playing' | 'paused' | 'ended'

// 게임 모드 타입
export type GameMode = 'visualNovel' | 'textAdventure'

// 게임 변수 상태 (모든 변수는 variables에서 관리)
export interface GameVariables {
  // 레거시 호환용
  flags: Record<string, boolean | number | string>
  choicesMade: string[] // 선택한 choice ID 기록
  // 모든 변수 (챕터에서 선언)
  variables: Record<string, boolean | number | string | Array<boolean | number | string>>
}

// 게임 히스토리 엔트리
export interface GameHistoryEntry {
  nodeId: string
  type: string
  content: string
  speaker?: string
  timestamp: number
  choiceText?: string // 선택지였다면 선택한 텍스트
  // 이미지 노드용 정보 (텍스트 어드벤처 모드에서 인라인 표시)
  imageData?: {
    resourcePath: string
    layer: string
    isRemoval?: boolean // 이미지 제거인 경우 true
    effect?: string  // deprecated, 하위 호환용
    effects?: ImageEffectType[] // 다중 이미지 효과
    effectDuration?: number
  }
}

// 게임 상태 (세이브/로드용)
export interface GameState {
  currentNodeId: string
  currentStageId: string
  currentChapterId: string
  variables: GameVariables
  history: GameHistoryEntry[]
  activeImages: ActiveImage[]  // 현재 표시 중인 이미지들
  startedAt: number
  playTime: number
  // 마지막 선택 정보 (JavaScript 노드에서 Game.lastChoiceIndex로 접근)
  lastChoiceIndex?: number     // 마지막 선택한 선택지 인덱스 (0부터 시작)
  lastChoiceText?: string      // 마지막 선택한 선택지 텍스트
}

// 디버그 정보
export interface DebugInfo {
  enabled: boolean
  showVariables: boolean
  showHistory: boolean
  showNodeInfo: boolean
  hiddenImageIds: Set<string>  // 숨긴 이미지 ID 목록
  borderedImageIds: Set<string>  // 경계선 표시할 이미지 ID 목록
  originImageIds: Set<string>  // 원점 표시할 이미지 ID 목록
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

// 레트로 GUI 윈도우 스타일
export type WindowStyle = 'none' | 'dos' | 'win31' | 'win95' | 'system7'

// 윈도우 스타일 설정
export interface GameThemeWindow {
  style: WindowStyle
  titleBarHeight?: number
  showCloseButton?: boolean
  showMinMaxButtons?: boolean
  borderWidth?: number
  titleBarColor?: string
  titleBarTextColor?: string
  titleBarGradient?: string  // CSS gradient
  buttonStyle?: 'flat' | '3d' | 'pixel'
}

// 전체 테마 설정
export interface GameTheme {
  id: string
  name: string
  colors: GameThemeColors
  fonts: GameThemeFonts
  effects: GameThemeEffects
  window?: GameThemeWindow  // 레트로 GUI 윈도우 스타일 (선택적)
}

// 초기 게임 변수
export const DEFAULT_GAME_VARIABLES: GameVariables = {
  flags: {},
  choicesMade: [],
  variables: {},
}
