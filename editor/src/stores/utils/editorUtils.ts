import type { StoryProject, ProjectResource, StoryNode, VariableDefinition } from '../../types/story'
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
  const variableInitId = generateId()
  const dialogue1Id = generateId()
  const dialogue2Id = generateId()
  const choiceId = generateId()
  const choice1ResultId = generateId()
  const choice1VariableId = generateId()  // 구매 후 변수 처리
  const choice2ResultId = generateId()
  const choice3ResultId = generateId()
  const conditionId = generateId()
  const goldBranchId = generateId()
  const flagBranchId = generateId()
  const defaultBranchId = generateId()
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
      nextNodeId: variableInitId,
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
    // 변수 초기화 (골드 설정 - 이제 variable 타겟 사용)
    // gold를 75로 설정해서 50골드 선택지는 활성화, 200골드 선택지는 비활성화 테스트
    {
      id: variableInitId,
      type: 'variable',
      position: { x: 850, y: 300 },
      nextNodeId: dialogue1Id,
      variableOperations: [
        { target: 'variable', action: 'set', variableId: 'gold', value: 75 },
        { target: 'variable', action: 'set', variableId: 'met_merchant', value: false },
        { target: 'variable', action: 'set', variableId: 'bought_item', value: false },
      ],
    },
    // 대사 1
    {
      id: dialogue1Id,
      type: 'dialogue',
      position: { x: 1100, y: 200 },
      speaker: '상인',
      text: '어서오세요! 무엇을 도와드릴까요?',
      nextNodeId: dialogue2Id,
    },
    // 대사 2
    {
      id: dialogue2Id,
      type: 'dialogue',
      position: { x: 1350, y: 200 },
      speaker: '상인',
      text: '좋은 물건이 많이 있답니다. 골드가 충분하신가요?',
      nextNodeId: choiceId,
    },
    // 선택지 노드 - 모든 입력값 활용
    {
      id: choiceId,
      type: 'choice',
      position: { x: 1600, y: 200 },
      text: '어떻게 하시겠습니까?',
      choices: [
        // 선택지 1: 조건부 선택지 (골드가 50 이상일 때만 활성화)
        {
          id: generateId(),
          text: '물건 구매하기 (50골드)',
          nextNodeId: choice1ResultId,
          condition: { type: 'variable', variableId: 'gold', operator: '>=', value: 50 },
          disabledText: '골드 50 필요',
          effects: {
            gold: -50,
            setFlags: { bought_item: true, met_merchant: true },
            affection: [{ characterId: 'kairen', delta: 5 }],
          },
          resultText: '물건을 구매했습니다!',
        },
        // 선택지 2: 효과가 있는 선택지 (플래그 설정 + 호감도)
        {
          id: generateId(),
          text: '그냥 구경만 하기',
          nextNodeId: choice2ResultId,
          effects: {
            setFlags: { met_merchant: true },
            reputation: [{ factionId: 'free_cities', delta: 1 }],
          },
          resultText: '가게를 둘러보았습니다.',
        },
        // 선택지 3: 조건부 선택지 (골드가 200 이상일 때만 활성화)
        {
          id: generateId(),
          text: '비밀 거래 제안하기',
          nextNodeId: choice3ResultId,
          condition: { type: 'variable', variableId: 'gold', operator: '>=', value: 200 },
          disabledText: '골드 200 필요',
          effects: {
            gold: 100,
            setFlags: { secret_deal_done: true },
            affection: [
              { characterId: 'zed', delta: 10 },
              { characterId: 'lyra', delta: -5 },
            ],
          },
          resultText: '비밀 거래가 성사되었습니다.',
        },
      ],
    },
    // 선택 결과 1 - 구매
    {
      id: choice1ResultId,
      type: 'dialogue',
      position: { x: 1850, y: 50 },
      speaker: '상인',
      text: '좋은 선택이십니다! 감사합니다.',
      nextNodeId: choice1VariableId,
    },
    // 구매 후 변수 처리 - 변수 참조 예시 포함
    {
      id: choice1VariableId,
      type: 'variable',
      position: { x: 2050, y: 50 },
      nextNodeId: conditionId,
      variableOperations: [
        // Gold -= 50 (구매 비용)
        { target: 'variable', action: 'subtract', variableId: 'gold', value: 50 },
        // HP += 10 (물약 효과)
        { target: 'variable', action: 'add', variableId: 'hp', value: 10 },
        // bought_item = true
        { target: 'variable', action: 'set', variableId: 'bought_item', value: true },
        // Inventory.push("체력 물약")
        { target: 'variable', action: 'push', variableId: 'inventory', value: '체력 물약' },
      ],
    },
    // 선택 결과 2 - 구경
    {
      id: choice2ResultId,
      type: 'dialogue',
      position: { x: 1850, y: 200 },
      speaker: '상인',
      text: '천천히 구경하세요~',
      nextNodeId: conditionId,
    },
    // 선택 결과 3 - 비밀 거래 (변수 참조 예시)
    {
      id: choice3ResultId,
      type: 'variable',
      position: { x: 1850, y: 350 },
      nextNodeId: conditionId,
      variableOperations: [
        // Gold += HP (HP만큼 골드 추가 - 변수 참조 예시!)
        { 
          target: 'variable', 
          action: 'add', 
          variableId: 'gold', 
          value: 0,
          useVariableValue: true, 
          sourceVariableId: 'hp' 
        },
        // met_merchant = true
        { target: 'variable', action: 'set', variableId: 'met_merchant', value: true },
      ],
    },
    // 조건 노드 - 여러 조건 타입 활용
    {
      id: conditionId,
      type: 'condition',
      position: { x: 2250, y: 200 },
      conditionBranches: [
        // 조건 1: 물건 구매 여부 (먼저 체크)
        {
          id: generateId(),
          condition: { type: 'variable', variableId: 'bought_item', operator: '==', value: true },
          nextNodeId: flagBranchId,
        },
        // 조건 2: 골드 100 이상 체크
        {
          id: generateId(),
          condition: { type: 'variable', variableId: 'gold', operator: '>=', value: 100 },
          nextNodeId: goldBranchId,
        },
      ],
      defaultNextNodeId: defaultBranchId,
    },
    // 골드 분기 결과
    {
      id: goldBranchId,
      type: 'dialogue',
      position: { x: 2350, y: 50 },
      speaker: '시스템',
      text: '당신은 부자군요! (골드 100 이상)',
      nextNodeId: chapterEndId,
    },
    // 플래그 분기 결과
    {
      id: flagBranchId,
      type: 'dialogue',
      position: { x: 2350, y: 200 },
      speaker: '시스템',
      text: '물건을 구매하셨군요!',
      nextNodeId: chapterEndId,
    },
    // 기본 분기 결과
    {
      id: defaultBranchId,
      type: 'dialogue',
      position: { x: 2350, y: 350 },
      speaker: '시스템',
      text: '특별한 조건을 만족하지 않았습니다.',
      nextNodeId: chapterEndId,
    },
    // 챕터 종료
    {
      id: chapterEndId,
      type: 'chapter_end',
      position: { x: 2600, y: 200 },
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

// 기본 변수 정의 (샘플)
export const defaultVariables: VariableDefinition[] = [
  {
    id: 'gold',
    name: 'Gold',
    type: 'number',
    defaultValue: 100,
    description: '보유 골드',
  },
  {
    id: 'hp',
    name: 'HP',
    type: 'number',
    defaultValue: 100,
    description: '체력',
  },
  {
    id: 'playerName',
    name: 'Player Name',
    type: 'string',
    defaultValue: '용사',
    description: '플레이어 이름',
  },
  {
    id: 'met_merchant',
    name: 'Met Merchant',
    type: 'boolean',
    defaultValue: false,
    description: '상인을 만났는지 여부',
  },
  {
    id: 'bought_item',
    name: 'Bought Item',
    type: 'boolean',
    defaultValue: false,
    description: '아이템을 구매했는지 여부',
  },
  {
    id: 'inventory',
    name: 'Inventory',
    type: 'array',
    defaultValue: [],
    arrayItemType: 'string',
    description: '인벤토리 아이템 목록',
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
    variables: [...defaultVariables],
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
