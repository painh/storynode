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

// 효과 그룹 (동시 적용 불가능한 효과들)
export const IMAGE_EFFECT_GROUPS: Record<string, ImageEffectType[]> = {
  slide: ['slideLeft', 'slideRight', 'slideUp', 'slideDown'],
  zoom: ['zoomIn', 'zoomOut'],
}

// 그룹에 속하지 않는 효과들 (다른 효과와 자유롭게 조합 가능)
export const COMBINABLE_EFFECTS: ImageEffectType[] = ['fadeIn', 'shake', 'bounce', 'flash', 'pulse']

// 이미지 노드 데이터
export interface ImageNodeData {
  resourcePath: string      // 리소스 경로 또는 base64
  layer: ImageLayer         // 레이어 이름 (background, character 등)
  layerOrder: number        // 같은 레이어 내 렌더링 순서
  alignment: ImageAlignment // 정렬 (left, center, right, custom)
  x?: number                // custom 정렬시 x 좌표
  y?: number                // custom 정렬시 y 좌표
  flipHorizontal?: boolean  // 좌우 반전
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

// 스토리 조건 타입
export interface StoryCondition {
  type: 'gold' | 'hp' | 'has_relic' | 'character' | 'flag' | 'choice_made' | 'affection' | 'reputation'
  value?: number | string
  characterId?: CharacterId
  flagKey?: string
  flagValue?: boolean | number | string
  eventId?: string
  choiceId?: string
  factionId?: FactionId
  min?: number
  max?: number
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
}

// 스토리 전투 보상
export interface StoryBattleReward {
  gold?: number
  cardIds?: string[]
  relicId?: string
  goldRange?: { min: number; max: number }
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
  javascriptCode?: string

  // custom 노드용
  customData?: CustomNodeData

  // 데이터 바인딩 (다른 노드에서 값 주입)
  dataBindings?: DataBinding[]
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
