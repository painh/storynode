import type { StoryProject, ProjectResource, StoryNode } from '../../types/story'
import { autoLayoutNodes } from '../../utils/autoLayout'

// ID 생성 함수
export const generateId = () => `node_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
export const generateResourceId = () => `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
export const generateCommentId = () => `comment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

// 새 챕터용 기본 노드 생성
export const createDefaultChapterNodes = (): { nodes: StoryNode[]; startNodeId: string } => {
  // 노드 ID 생성
  const startId = generateId()
  const bgImageId = generateId()
  const char1ImageId = generateId()
  const char2ImageId = generateId()
  const dialogue1Id = generateId()
  const dialogue2Id = generateId()
  const choiceId = generateId()
  const conditionId = generateId()
  const endBranch1Id = generateId()
  const endBranch2Id = generateId()
  const chapterEndId = generateId()

  const nodes: StoryNode[] = [
    // Start 노드
    {
      id: startId,
      type: 'start',
      position: { x: 100, y: 300 },
      nextNodeId: bgImageId,
    },
    // 배경 이미지 (fadeIn)
    {
      id: bgImageId,
      type: 'image',
      position: { x: 350, y: 200 },
      nextNodeId: char1ImageId,
      imageData: {
        resourcePath: 'templates/default/backgrounds/background.png',
        layer: 'background',
        layerOrder: 0,
        alignment: 'center',
        effect: 'fadeIn',
        effectDuration: 500,
      },
    },
    // 캐릭터 1 (왼쪽, 오른쪽 바라봄)
    {
      id: char1ImageId,
      type: 'image',
      position: { x: 600, y: 100 },
      nextNodeId: char2ImageId,
      imageData: {
        resourcePath: 'templates/default/characters/char1.png',
        layer: 'character',
        layerOrder: 0,
        alignment: 'left',
        effect: 'fadeIn',
        effectDuration: 300,
      },
    },
    // 캐릭터 2 (오른쪽, 좌우반전으로 왼쪽 바라봄)
    {
      id: char2ImageId,
      type: 'image',
      position: { x: 600, y: 400 },
      nextNodeId: dialogue1Id,
      imageData: {
        resourcePath: 'templates/default/characters/char2.png',
        layer: 'character',
        layerOrder: 1,
        alignment: 'right',
        flipHorizontal: true,
        effect: 'fadeIn',
        effectDuration: 300,
      },
    },
    // 대사 1
    {
      id: dialogue1Id,
      type: 'dialogue',
      position: { x: 850, y: 200 },
      speaker: '캐릭터 1',
      text: '안녕하세요!',
      nextNodeId: dialogue2Id,
    },
    // 대사 2
    {
      id: dialogue2Id,
      type: 'dialogue',
      position: { x: 1100, y: 200 },
      speaker: '캐릭터 2',
      text: '반갑습니다! 어떻게 할까요?',
      nextNodeId: choiceId,
    },
    // 선택지
    {
      id: choiceId,
      type: 'choice',
      position: { x: 1350, y: 200 },
      text: '무엇을 선택하시겠습니까?',
      choices: [
        { id: generateId(), text: '선택 1', nextNodeId: conditionId },
        { id: generateId(), text: '선택 2', nextNodeId: conditionId },
      ],
    },
    // 조건 노드
    {
      id: conditionId,
      type: 'condition',
      position: { x: 1600, y: 200 },
      conditionBranches: [
        {
          id: generateId(),
          condition: { type: 'flag', flagKey: 'example_flag', flagValue: true },
          nextNodeId: endBranch1Id,
        },
      ],
      defaultNextNodeId: endBranch2Id,
    },
    // 분기 결과 1
    {
      id: endBranch1Id,
      type: 'dialogue',
      position: { x: 1850, y: 100 },
      speaker: '시스템',
      text: '조건을 만족했습니다!',
      nextNodeId: chapterEndId,
    },
    // 분기 결과 2 (기본)
    {
      id: endBranch2Id,
      type: 'dialogue',
      position: { x: 1850, y: 350 },
      speaker: '시스템',
      text: '기본 분기입니다.',
      nextNodeId: chapterEndId,
    },
    // 챕터 종료
    {
      id: chapterEndId,
      type: 'chapter_end',
      position: { x: 2100, y: 225 },
    },
  ]

  // 자동 정렬 적용
  const layoutResult = autoLayoutNodes(nodes, startId)
  const layoutedNodes = nodes.map(node => ({
    ...node,
    position: layoutResult[node.id] || node.position,
  }))

  return { nodes: layoutedNodes, startNodeId: startId }
}

// Base path 가져오기 (GitHub Pages 등에서 사용)
const getBasePath = (): string => {
  // Vite에서 설정한 base path 사용
  return import.meta.env.BASE_URL || '/'
}

// 기본 템플릿 리소스 경로 생성 (base path 적용)
const createTemplateResourcePath = (relativePath: string): string => {
  const basePath = getBasePath()
  // basePath가 '/'로 끝나면 그대로, 아니면 '/' 추가
  const base = basePath.endsWith('/') ? basePath : basePath + '/'
  return base + relativePath
}

// 기본 템플릿 리소스
export const defaultTemplateResources: ProjectResource[] = [
  {
    id: 'img_char1',
    name: 'char1',
    type: 'image',
    path: createTemplateResourcePath('templates/default/characters/char1.png'),
  },
  {
    id: 'img_char2',
    name: 'char2',
    type: 'image',
    path: createTemplateResourcePath('templates/default/characters/char2.png'),
  },
  {
    id: 'img_background',
    name: 'background',
    type: 'image',
    path: createTemplateResourcePath('templates/default/backgrounds/background.png'),
  },
]

// 기본 프로젝트 생성
export const createDefaultProject = (): StoryProject => {
  const { nodes, startNodeId } = createDefaultChapterNodes()

  return {
    name: 'New Story Project',
    version: '1.0.0',
    stages: [
      {
        id: 'stage_1',
        title: 'Stage 1',
        description: 'First stage',
        partyCharacters: ['kairen'],
        chapters: [
          {
            id: 'chapter_1',
            title: 'Chapter 1',
            description: 'First chapter',
            nodes,
            startNodeId,
          }
        ]
      }
    ],
    gameSettings: {
      defaultGameMode: 'visualNovel',
      defaultThemeId: 'dark',
      customThemes: [],
    },
    resources: [...defaultTemplateResources],
  }
}

// 기본 gameSettings 생성
export const createDefaultGameSettings = () => ({
  defaultGameMode: 'visualNovel' as const,
  defaultThemeId: 'dark',
  customThemes: [],
})
