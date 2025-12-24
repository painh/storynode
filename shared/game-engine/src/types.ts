// StoryNode Game Engine Types

export interface StoryProject {
  name: string;
  version: string;
  stages: Stage[];
  gameSettings?: GameSettings;
  resources?: ProjectResources;
  variables?: ProjectVariables;
}

export interface GameSettings {
  defaultThemeId?: string;
  defaultGameMode?: 'visualNovel' | 'textAdventure';
  title?: string;
  windowWidth?: number;
  windowHeight?: number;
  resizable?: boolean;
  fullscreen?: boolean;
}

export interface ProjectResources {
  images?: ResourceItem[];
  audio?: ResourceItem[];
}

export interface ResourceItem {
  id: string;
  name: string;
  path: string;
  type: 'image' | 'audio';
}

export interface ProjectVariables {
  gold?: number;
  hp?: number;
  flags?: Record<string, unknown>;
  custom?: VariableDefinition[];
}

export interface VariableDefinition {
  id: string;
  name: string;
  type: 'number' | 'string' | 'boolean';
  defaultValue: unknown;
}

export interface Stage {
  id: string;
  title: string;
  description?: string;
  partyCharacters?: string[];
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  title: string;
  description?: string;
  startNodeId?: string;
  nodes: StoryNode[];
  edges?: Edge[];
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export type StoryNode =
  | StartNode
  | DialogueNode
  | ChoiceNode
  | ConditionNode
  | VariableNode
  | ImageNode
  | ChapterEndNode;

export interface BaseNode {
  id: string;
  type: string;
  text?: string;
  nextNodeId?: string;
  onEnterEffects?: Effects;
}

export interface StartNode extends BaseNode {
  type: 'start';
}

export interface DialogueNode extends BaseNode {
  type: 'dialogue';
  speaker?: string;
  text: string;
}

export interface ChoiceNode extends BaseNode {
  type: 'choice';
  text?: string;
  choices: Choice[];
}

export interface Choice {
  id: string;
  text: string;
  nextNodeId?: string;
  condition?: Condition;
  effects?: Effects;
}

export interface ConditionNode extends BaseNode {
  type: 'condition';
  conditionBranches: ConditionBranch[];
  defaultNextNodeId?: string;
}

export interface ConditionBranch {
  condition: Condition;
  nextNodeId?: string;
}

export interface VariableNode extends BaseNode {
  type: 'variable';
  variableOperations: VariableOperation[];
}

export interface ImageNode extends BaseNode {
  type: 'image';
  imageData?: ImageData;
}

export interface ImageData {
  resourcePath?: string;
  layer: 'background' | 'character';
  layerOrder?: number;
  alignment?: 'left' | 'center' | 'right';
  x?: number;
  y?: number;
  flipHorizontal?: boolean;
  effect?: ImageEffect;
  effects?: ImageEffect[];
  effectDuration?: number;
}

export type ImageEffect =
  | 'none'
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
  | 'pulse';

export interface ChapterEndNode extends BaseNode {
  type: 'chapter_end';
}

export interface Condition {
  type: 'gold' | 'hp' | 'flag' | 'choice_made' | 'affection' | 'reputation';
  min?: number;
  max?: number;
  value?: number;
  flagKey?: string;
  flagValue?: unknown;
  choiceId?: string;
  characterId?: string;
  factionId?: string;
}

export interface Effects {
  gold?: number;
  hp?: number;
  setFlags?: Record<string, unknown>;
  affection?: AffectionChange[];
  reputation?: ReputationChange[];
}

export interface AffectionChange {
  characterId: string;
  delta: number;
}

export interface ReputationChange {
  factionId: string;
  delta: number;
}

export interface VariableOperation {
  target: 'gold' | 'hp' | 'flag' | 'affection' | 'reputation';
  action: 'set' | 'add' | 'subtract' | 'multiply';
  value: number | string | boolean;
  key?: string;
  characterId?: string;
  factionId?: string;
}

// Game State Types

export interface GameState {
  currentNodeId: string;
  currentStageId: string;
  currentChapterId: string;
  variables: GameVariables;
  history: HistoryEntry[];
  activeImages: ActiveImage[];
  startedAt: number;
  playTime: number;
}

export interface GameVariables {
  gold: number;
  hp: number;
  flags: Record<string, unknown>;
  affection: Record<string, number>;
  reputation: Record<string, number>;
  choicesMade: string[];
}

export interface HistoryEntry {
  nodeId: string;
  type: string;
  content: string;
  speaker?: string;
  timestamp: number;
  choiceText?: string;
  imageData?: {
    resourcePath: string;
    layer: 'background' | 'character';
    isRemoval: boolean;
    effect?: ImageEffect;
    effects?: ImageEffect[];
    effectDuration?: number;
  };
}

export interface ActiveImage {
  id: string;
  instanceId: number;
  resourcePath: string;
  layer: 'background' | 'character';
  layerOrder?: number;
  alignment?: 'left' | 'center' | 'right';
  x?: number;
  y?: number;
  flipHorizontal?: boolean;
  effect?: ImageEffect;
  effects?: ImageEffect[];
  effectDuration?: number;
}

// Engine Options

export interface GameEngineOptions {
  onStateChange?: (state: GameState) => void;
  onNodeChange?: (node: StoryNode | null) => void;
  onGameEnd?: () => void;
}
