// StoryNode Game Engine
// Shared library for Editor and Player

// Core engine
export { GameEngine } from './engine';

// Player UI
export { GamePlayer } from './player';
export type { GamePlayerOptions, GameMode, PlayerStatus } from './player';

// Themes
export { THEMES, getTheme } from './themes';
export type { Theme, ThemeColors } from './themes';

// Styles
export { PLAYER_STYLES, getPlayerStylesHtml } from './styles';

// Types
export type {
  // Project types
  StoryProject,
  GameSettings,
  ProjectResources,
  ResourceItem,
  ProjectVariables,
  VariableDefinition,
  Stage,
  Chapter,
  Edge,
  // Node types
  StoryNode,
  BaseNode,
  StartNode,
  DialogueNode,
  ChoiceNode,
  Choice,
  ConditionNode,
  ConditionBranch,
  VariableNode,
  ImageNode,
  ImageData,
  ImageEffect,
  ChapterEndNode,
  // Game logic types
  Condition,
  Effects,
  AffectionChange,
  ReputationChange,
  VariableOperation,
  // State types
  GameState,
  GameVariables,
  HistoryEntry,
  ActiveImage,
  GameEngineOptions,
} from './types';
