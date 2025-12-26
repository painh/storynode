import type { StoryProject, StoryStage, StoryChapter, StoryNode, StoryNodeType, GameSettings, CustomTheme, ProjectResource, ResourceType, CommentNode, CustomNodeTemplate, VariableDefinition } from '../../types/story'

export interface EditorState {
  // 프로젝트 데이터
  project: StoryProject

  // 변경사항 추적
  isDirty: boolean
  setDirty: (dirty: boolean) => void
  markClean: () => void

  // 현재 선택 상태
  currentStageId: string | null
  currentChapterId: string | null
  selectedNodeIds: string[]
  selectedCommentId: string | null

  // 액션
  setProject: (project: StoryProject) => void

  // Stage CRUD
  createStage: (stage: Partial<StoryStage>) => void
  updateStage: (id: string, updates: Partial<StoryStage>) => void
  deleteStage: (id: string) => void
  setCurrentStage: (stageId: string | null) => void

  // Chapter CRUD
  createChapter: (stageId: string, chapter: Partial<StoryChapter>) => void
  updateChapter: (stageId: string, chapterId: string, updates: Partial<StoryChapter>) => void
  deleteChapter: (stageId: string, chapterId: string) => void
  setCurrentChapter: (chapterId: string | null) => void

  // Node CRUD
  createNode: (type: StoryNodeType, position?: { x: number; y: number }) => StoryNode | null
  updateNode: (nodeId: string, updates: Partial<StoryNode>) => void
  deleteNode: (nodeId: string) => void
  deleteNodes: (nodeIds: string[]) => void
  pasteNodes: (nodes: Array<{ node: StoryNode; position: { x: number; y: number } }>) => string[]

  // Selection
  setSelectedNodes: (nodeIds: string[]) => void
  clearSelection: () => void

  // Helpers
  getCurrentStage: () => StoryStage | undefined
  getCurrentChapter: () => StoryChapter | undefined
  getNodeById: (nodeId: string) => StoryNode | undefined

  // Game Settings
  updateGameSettings: (settings: Partial<GameSettings>) => void
  addCustomTheme: (theme: CustomTheme) => void
  updateCustomTheme: (themeId: string, updates: Partial<CustomTheme>) => void
  deleteCustomTheme: (themeId: string) => void

  // Resources
  addResource: (resource: ProjectResource) => void
  updateResource: (resourceId: string, updates: Partial<ProjectResource>) => void
  deleteResource: (resourceId: string) => void
  getResourcesByType: (type: ResourceType) => ProjectResource[]
  loadTemplateResources: () => Promise<void>

  // Comment Nodes (에디터용)
  createCommentNode: (position: { x: number; y: number }) => string | null
  updateCommentNode: (commentId: string, updates: Partial<CommentNode['data']>) => void
  updateCommentPosition: (commentId: string, position: { x: number; y: number }) => void
  deleteCommentNode: (commentId: string) => void
  getCommentNodes: () => CommentNode[]
  getCommentById: (commentId: string) => CommentNode | undefined
  setSelectedComment: (commentId: string | null) => void
  wrapNodesWithComment: (flowNodes?: Array<{ id: string; position: { x: number; y: number }; measured?: { width?: number; height?: number } }>) => string | null

  // Custom Node Templates
  createTemplate: (template?: Partial<CustomNodeTemplate>) => CustomNodeTemplate
  updateTemplate: (templateId: string, updates: Partial<CustomNodeTemplate>) => void
  deleteTemplate: (templateId: string) => void
  getTemplateById: (templateId: string) => CustomNodeTemplate | undefined
  getTemplates: () => CustomNodeTemplate[]
  createNodeFromTemplate: (templateId: string, position?: { x: number; y: number }) => StoryNode | null
  syncNodeWithTemplate: (nodeId: string) => void
  detachNodeFromTemplate: (nodeId: string) => void

  // Variable Definitions (전역 변수)
  createVariable: (variable?: Partial<VariableDefinition>) => VariableDefinition | null
  updateVariable: (variableId: string, updates: Partial<VariableDefinition>) => void
  deleteVariable: (variableId: string) => void
  getVariables: () => VariableDefinition[]
  getVariableById: (variableId: string) => VariableDefinition | undefined
  
  // Chapter Variables (챕터 로컬 변수)
  createChapterVariable: (variable?: Partial<VariableDefinition>) => VariableDefinition | null
  updateChapterVariable: (variableId: string, updates: Partial<VariableDefinition>) => void
  deleteChapterVariable: (variableId: string) => void
  getChapterVariables: () => VariableDefinition[]
  getAllVariables: () => VariableDefinition[]
}

// Immer의 set 함수 타입
export type ImmerSet = (fn: (state: EditorState) => void) => void
export type ImmerGet = () => EditorState
