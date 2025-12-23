// 스토리 모드 타입 정의 (gosunideckbuilding 호환)

// 스토리 노드 타입
export type StoryNodeType =
  | 'start' | 'dialogue' | 'choice' | 'chapter_end'
  | 'battle' | 'shop' | 'event'
  | 'variable' | 'condition'

// 캐릭터 ID 타입
export type CharacterId = 'kairen' | 'zed' | 'lyra' | 'elise'

// 세력 ID 타입
export type FactionId = 'kingdom' | 'elves' | 'dwarves' | 'free_cities' | 'mage_tower' | 'dark_lands'

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
export type VariableTarget = 'flag' | 'gold' | 'hp' | 'affection' | 'reputation'

export interface VariableOperation {
  target: VariableTarget
  action: VariableAction
  key?: string              // flag용
  characterId?: CharacterId // affection용
  factionId?: FactionId     // reputation용
  value: number | string | boolean
}

// Condition 노드용 - 다중 출력
export interface ConditionBranch {
  id: string
  condition: StoryCondition
  nextNodeId?: string
}

// 스토리 노드
export interface StoryNode {
  id: string
  type: StoryNodeType
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

// 프로젝트 전체 구조
export interface StoryProject {
  name: string
  version: string
  stages: StoryStage[]
}
