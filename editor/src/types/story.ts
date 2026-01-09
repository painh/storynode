// 스토리 모드 타입 정의 (gosunideckbuilding 호환)

// 스토리 노드 타입
export type StoryNodeType =
  | 'start' | 'dialogue' | 'choice' | 'chapter_end'
  | 'battle' | 'shop' | 'event'
  | 'variable' | 'condition'
  | 'image' | 'javascript' | 'custom'

// 이미지 정렬 타입
export type ImageAlignment = 'left' | 'center' | 'right' | 'custom'

// 이미지 레이어 (배경이 더 아래에 렌더링됨)
export type ImageLayer = 'background' | 'character' | string

// 이미지 효과 타입 (개별 효과)
export type ImageEffectType =
  | 'fadeIn'
  | 'shake'
  | 'slideLeft'
  | 'slideRight'
  | 'slideUp'
  | 'slideDown'
  | 'zoomIn'
  | 'zoomOut'
  | 'bounce'
  | 'flash'
  | 'pulse'

// 하위 호환용 (deprecated)
export type ImageEffect = ImageEffectType | 'none'

// 퇴장 이펙트 타입
export type ImageExitEffectType =
  | 'none'           // 즉시 제거
  | 'fadeOut'
  | 'slideOutLeft'
  | 'slideOutRight'
  | 'slideOutUp'
  | 'slideOutDown'
  | 'zoomOut'
  | 'shrink'         // 축소되며 사라짐

// 이미지 교체 타이밍
export type ImageTransitionTiming = 'sequential' | 'crossfade'

// 이미지 채우기 방식
export type ImageObjectFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'

// 효과 그룹 (동시 적용 불가능한 효과들)
export const IMAGE_EFFECT_GROUPS: Record<string, ImageEffectType[]> = {
  slide: ['slideLeft', 'slideRight', 'slideUp', 'slideDown'],
  zoom: ['zoomIn', 'zoomOut'],
}

// 그룹에 속하지 않는 효과들 (다른 효과와 자유롭게 조합 가능)
export const COMBINABLE_EFFECTS: ImageEffectType[] = ['fadeIn', 'shake', 'bounce', 'flash', 'pulse']

// ===== 텍스트 효과 타입 =====

// 출력 방식 (하나만 선택 가능)
export type TextOutputMode = 'typewriter' | 'instant' | 'fadeIn'

// 연출 효과 (동시 적용 가능)
export type TextDisplayEffect = 'shake' | 'wave' | 'glitch' | 'rainbow'

// 강조 효과 (동시 적용 가능)
export type TextEmphasisEffect = 'pulse' | 'flicker' | 'zoom' | 'scramble' | 'bounce' | 'blur'

// 텍스트 효과 설정
export interface TextEffectSettings {
  outputMode?: TextOutputMode            // 출력 방식 (기본: typewriter)
  outputSpeed?: number                   // 출력 속도 - 글자당 ms (기본: 30)
  displayEffects?: TextDisplayEffect[]   // 연출 효과 (복수 선택 가능)
  emphasisEffects?: TextEmphasisEffect[] // 강조 효과 (복수 선택 가능)
  effectDuration?: number                // 효과 지속 시간 ms (기본: 500)
}

// 텍스트 효과 그룹 정의 (UI용)
export const TEXT_EFFECT_GROUPS = {
  outputMode: {
    label: '출력 방식',
    exclusive: true, // 하나만 선택
    options: [
      { value: 'typewriter', label: '타자기', description: '한 글자씩 순차 출력' },
      { value: 'instant', label: '즉시', description: '텍스트 전체를 바로 표시' },
      { value: 'fadeIn', label: '페이드 인', description: '텍스트가 서서히 나타남' },
    ] as const,
  },
  displayEffects: {
    label: '연출 효과',
    exclusive: false, // 복수 선택 가능
    options: [
      { value: 'shake', label: '흔들림', description: '텍스트가 좌우로 떨림' },
      { value: 'wave', label: '물결', description: '글자들이 출렁임' },
      { value: 'glitch', label: '글리치', description: '텍스트가 깜빡이며 어긋남' },
      { value: 'rainbow', label: '무지개', description: '글자 색상이 변화' },
    ] as const,
  },
  emphasisEffects: {
    label: '강조 효과',
    exclusive: false, // 복수 선택 가능
    options: [
      { value: 'pulse', label: '펄스', description: '부드럽게 커졌다 작아짐' },
      { value: 'flicker', label: '깜빡임', description: '불규칙하게 깜빡거림' },
      { value: 'zoom', label: '확대 등장', description: '작은 크기에서 커지며 등장' },
      { value: 'scramble', label: '스크램블', description: '임의 문자가 원래 글자로 변환' },
      { value: 'bounce', label: '통통', description: '글자가 튀어오르며 등장' },
      { value: 'blur', label: '흐림', description: '흐릿하다가 선명해짐' },
    ] as const,
  },
} as const

// 이미지 노드 데이터
export interface ImageNodeData {
  resourcePath: string      // 리소스 경로 또는 base64
  layer: ImageLayer         // 레이어 이름 (background, character 등)
  layerOrder: number        // 같은 레이어 내 렌더링 순서
  alignment: ImageAlignment // 정렬 (left, center, right, custom)
  x?: number                // custom 정렬시 x 좌표
  y?: number                // custom 정렬시 y 좌표
  flipHorizontal?: boolean  // 좌우 반전
  objectFit?: ImageObjectFit // 이미지 채우기 방식 (기본: contain)
  effect?: ImageEffect      // 이미지 효과 (deprecated, 하위 호환용)
  effects?: ImageEffectType[] // 다중 이미지 효과
  effectDuration?: number   // 효과 지속 시간 (ms)
  exitEffect?: ImageExitEffectType    // 기존 이미지 퇴장 이펙트
  exitEffectDuration?: number         // 퇴장 이펙트 지속 시간 (ms)
  transitionTiming?: ImageTransitionTiming  // 교체 타이밍 (기본: sequential)
}

// 커스텀 필드 타입
export type CustomFieldType = 'text' | 'textarea' | 'number' | 'boolean' | 'select'

// 커스텀 필드 정의
export interface CustomFieldDefinition {
  id: string
  name: string
  type: CustomFieldType
  defaultValue?: string | number | boolean
  options?: string[]  // select 타입용
  placeholder?: string
}

// 커스텀 노드 데이터
export interface CustomNodeData {
  title: string                    // 커스텀 노드 제목
  description?: string             // 노드 설명
  color?: string                   // 노드 색상
  fields: CustomFieldDefinition[]  // 필드 정의
  values: Record<string, string | number | boolean>  // 필드 값들
  templateId?: string              // 템플릿 ID (동기화용)
}

// 커스텀 노드 템플릿 (재사용 가능)
export interface CustomNodeTemplate {
  id: string
  name: string                     // 템플릿 표시 이름
  description?: string             // 템플릿 설명
  color: string                    // 노드 헤더 색상
  icon?: string                    // 아이콘 (이모지)
  fields: CustomFieldDefinition[]  // 필드 스키마
  defaultValues: Record<string, string | number | boolean>  // 기본 필드 값
  createdAt: number                // 생성 시간
  updatedAt: number                // 수정 시간
}

// 캐릭터 ID 타입 (레거시 호환용)
export type CharacterId = string

// 세력 ID 타입 (레거시 호환용)
export type FactionId = string

// 비교 연산자 타입
export type ComparisonOperator = '==' | '!=' | '>' | '>=' | '<' | '<='

// 스토리 조건 타입
export interface StoryCondition {
  type: 'gold' | 'hp' | 'has_relic' | 'character' | 'flag' | 'choice_made' | 'affection' | 'reputation' | 'variable'
  value?: number | string | boolean
  characterId?: CharacterId
  flagKey?: string
  flagValue?: boolean | number | string
  eventId?: string
  choiceId?: string
  factionId?: FactionId
  min?: number
  max?: number
  // variable 타입용
  variableId?: string
  operator?: ComparisonOperator
}

// 선택 효과 타입
export interface StoryChoiceEffect {
  affection?: { characterId: CharacterId; delta: number }[]
  reputation?: { factionId: FactionId; delta: number }[]
  setFlags?: { [key: string]: boolean | number | string }
  gold?: number
  hp?: number
  cardId?: string
  relicId?: string
}

// 캐릭터 반응 (동료들의 코멘트)
export interface CharacterReaction {
  characterId: CharacterId
  text: string
  condition?: StoryCondition
}

// 스토리 선택지
export interface StoryChoice {
  id: string
  text: string
  nextNodeId: string
  condition?: StoryCondition
  effects?: StoryChoiceEffect
  resultText?: string
  disabledText?: string  // 조건 불만족 시 표시할 텍스트 (예: "골드 100 필요")
}

// 스토리 전투 보상
export interface StoryBattleReward {
  gold?: number
  cardIds?: string[]
  relicId?: string
  goldRange?: { min: number; max: number }
}

// JavaScript 함수 노드용 타입
export type JavaScriptArgType = 'string' | 'number' | 'boolean' | 'any'

export interface JavaScriptFunctionArg {
  id: string
  name: string
  type: JavaScriptArgType
  defaultValue?: string | number | boolean
}

export interface JavaScriptFunction {
  name: string
  arguments: JavaScriptFunctionArg[]
  body: string
}

// Variable 노드용 타입
export type VariableAction = 'set' | 'add' | 'subtract' | 'multiply'
export type ArrayAction = 'push' | 'pop' | 'removeAt' | 'setAt' | 'clear' | 'set'
// 변수 타겟 (variable, flag만 사용, 나머지는 레거시 호환용)
export type VariableTarget = 'variable' | 'flag' | 'gold' | 'hp' | 'affection' | 'reputation'

// 변수 정의 (선언)
export type VariableType = 'boolean' | 'number' | 'string' | 'array'
export type ArrayItemType = 'boolean' | 'number' | 'string'

export interface VariableDefinition {
  id: string
  name: string
  type: VariableType
  defaultValue: boolean | number | string | Array<boolean | number | string>
  arrayItemType?: ArrayItemType  // array 타입일 때 아이템 타입
  description?: string  // 변수 설명 (선택)
}

export interface VariableOperation {
  target: VariableTarget
  action: VariableAction | ArrayAction
  key?: string              // flag용
  variableId?: string       // variable용 (선언된 변수 참조)
  characterId?: CharacterId // affection용
  factionId?: FactionId     // reputation용
  value: number | string | boolean
  index?: number            // array setAt/removeAt용
  // 변수 참조용 (다른 변수의 값을 사용)
  useVariableValue?: boolean      // true면 value 대신 sourceVariableId의 값 사용
  sourceVariableId?: string       // 참조할 변수 ID
}

// Condition 노드용 - 다중 출력
export interface ConditionBranch {
  id: string
  condition: StoryCondition
  nextNodeId?: string
}

// 데이터 바인딩 (노드 간 데이터 연결)
export interface DataBinding {
  targetPath: string      // 받는 프로퍼티 경로
  sourceNodeId: string    // 주는 노드 ID
  sourcePath: string      // 주는 프로퍼티 경로
}

// 챕터 종료 후 액션 타입
export type ChapterEndAction = 'next' | 'select' | 'end' | 'goto'

// 챕터 종료 데이터
export interface ChapterEndData {
  action: ChapterEndAction
  nextChapterId?: string    // 'goto' 액션일 때 이동할 챕터 ID
  nextStageId?: string      // 다른 스테이지의 챕터로 이동할 때
  clearVisuals?: boolean    // 비주얼 요소 정리 여부 (기본: true)
}

// 스토리 노드
export interface StoryNode {
  id: string
  type: StoryNodeType
  position?: { x: number; y: number }  // 노드 위치 (캔버스에서)
  speaker?: string
  text?: string
  nextNodeId?: string
  choices?: StoryChoice[]
  battleGroupId?: string
  battleRewards?: StoryBattleReward
  eventId?: string
  characterReactions?: CharacterReaction[]
  onEnterEffects?: StoryChoiceEffect

  // variable 노드용
  variableOperations?: VariableOperation[]

  // condition 노드용
  conditionBranches?: ConditionBranch[]
  defaultNextNodeId?: string  // 어떤 조건도 안 맞을 때

  // image 노드용
  imageData?: ImageNodeData

  // javascript 노드용
  javascriptCode?: string  // 레거시 (단순 코드)
  javascriptFunction?: JavaScriptFunction  // 새 방식 (함수 + 인자)

  // custom 노드용
  customData?: CustomNodeData

  // chapter_end 노드용
  chapterEndData?: ChapterEndData

  // 데이터 바인딩 (다른 노드에서 값 주입)
  dataBindings?: DataBinding[]

  // 텍스트 효과 설정
  textEffects?: TextEffectSettings
}

// 코멘트 노드 (에디터용)
export interface CommentNode {
  id: string
  position: { x: number; y: number }
  data: {
    title: string
    description: string
    color: string
    width: number
    height: number
    isCollapsed?: boolean  // 포스트잇 접기 모드
  }
}


// 스토리 챕터
export interface StoryChapter {
  id: string
  title: string
  description: string
  nodes: StoryNode[]
  startNodeId: string
  partyCharacters?: string[]
  rewards?: {
    gold?: number
    cardId?: string
    relicId?: string
  }
  // 에디터용 코멘트 노드
  commentNodes?: CommentNode[]
  // 챕터 로컬 변수 (챕터 시작 시 초기화됨)
  variables?: VariableDefinition[]
  // 챕터 별칭 (JavaScript에서 chapters.별칭.변수명 으로 접근)
  alias?: string
}

// 스토리 스테이지 (챕터 묶음)
export interface StoryStage {
  id: string
  title: string
  description: string
  icon?: string
  unlockCondition?: {
    type: 'stage_clear' | 'always'
    stageId?: string
  }
  partyCharacters: string[]
  chapters: StoryChapter[]
}

// 리소스 타입
export type ResourceType = 'image'

// 프로젝트 리소스 (캐릭터, 배경 등)
export interface ProjectResource {
  id: string
  name: string
  type: ResourceType
  path: string  // 상대 경로 또는 URL
  thumbnail?: string
}

// 게임 설정 (프로젝트에 저장, 익스포트 시 포함)
export interface GameSettings {
  // 기본 게임 모드
  defaultGameMode: 'visualNovel' | 'textAdventure'
  // 기본 테마 ID (프리셋 또는 커스텀)
  defaultThemeId: string
  // 커스텀 테마 (사용자 정의)
  customThemes?: CustomTheme[]
  // 오버라이드 설정 (테마 기본값 대신 사용)
  fontOverride?: string              // 폰트 오버라이드
  typewriterSpeedOverride?: number   // 타이프라이터 속도 오버라이드 (ms)
}

// 커스텀 테마 정의
export interface CustomTheme {
  id: string
  name: string
  colors: {
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
  }
  fonts: {
    dialogue: string
    speaker: string
    ui: string
  }
  effects: {
    typewriterSpeed: number
    fadeTransition: boolean
    dialogueAnimation: 'typewriter' | 'fade' | 'instant'
  }
}

// 프로젝트 전체 구조
export interface StoryProject {
  name: string
  version: string
  stages: StoryStage[]
  // 전역 변수 정의 (프로젝트 전체에서 사용)
  variables?: VariableDefinition[]
  // 게임 설정 (익스포트 시 포함)
  gameSettings?: GameSettings
  // 프로젝트 리소스 (캐릭터, 배경 등)
  resources?: ProjectResource[]
  // 커스텀 노드 템플릿 (재사용 가능한 노드 정의)
  customNodeTemplates?: CustomNodeTemplate[]
}
