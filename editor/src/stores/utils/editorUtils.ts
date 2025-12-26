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
  const javascriptId = generateId()  // JavaScript 노드 추가
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
    // 대사 1 - 변수 출력 예시 ({{변수명}} 형식)
    {
      id: dialogue1Id,
      type: 'dialogue',
      position: { x: 1100, y: 200 },
      speaker: '상인',
      text: '{{Player Name}}님, 어서오세요! 무엇을 도와드릴까요?',
      nextNodeId: dialogue2Id,
    },
    // 대사 2 - 변수 출력 예시
    {
      id: dialogue2Id,
      type: 'dialogue',
      position: { x: 1350, y: 200 },
      speaker: '상인',
      text: '현재 {{Gold}} 골드를 가지고 계시네요. 좋은 물건이 많답니다!',
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
    // 선택 결과 3 - 비밀 거래 (JavaScript로 복잡한 계산)
    {
      id: choice3ResultId,
      type: 'dialogue',
      position: { x: 1850, y: 350 },
      speaker: '상인',
      text: '좋아요, 특별히 비밀 거래를 해드리죠...',
      nextNodeId: javascriptId,
    },
    // JavaScript 노드 - 복잡한 수식 계산 예시
    {
      id: javascriptId,
      type: 'javascript',
      position: { x: 2050, y: 350 },
      nextNodeId: conditionId,
      // 복잡한 수식 예시: Gold = (HP * 2) + (Gold * 0.5) + 100
      javascriptCode: `// 복잡한 수식 계산 예시
// 비밀 거래 보너스: HP의 2배 + 현재 골드의 50% + 100

// 전역 변수는 variables.변수ID 로 접근
const bonus = (variables.hp * 2) + (variables.gold * 0.5) + 100;
variables.gold = Math.floor(bonus);

// 챕터 변수는 chapters.별칭.변수ID 로 접근
// (이 챕터의 alias는 "shop")
chapters.shop.met_merchant = true;

// 콘솔에 결과 출력 (디버그용)
console.log('비밀 거래 완료! 새 골드:', variables.gold);
console.log('상인 만남:', chapters.shop.met_merchant);`,
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
    // 골드 분기 결과 - 변수 출력 예시
    {
      id: goldBranchId,
      type: 'dialogue',
      position: { x: 2350, y: 50 },
      speaker: '시스템',
      text: '{{Gold}} 골드나 가지고 계시다니, 부자시군요!',
      nextNodeId: chapterEndId,
    },
    // 플래그 분기 결과 - 변수 출력 예시
    {
      id: flagBranchId,
      type: 'dialogue',
      position: { x: 2350, y: 200 },
      speaker: '시스템',
      text: '물건을 구매하셨군요! 남은 골드: {{Gold}}',
      nextNodeId: chapterEndId,
    },
    // 기본 분기 결과
    {
      id: defaultBranchId,
      type: 'dialogue',
      position: { x: 2350, y: 350 },
      speaker: '시스템',
      text: '{{Player Name}}님, 다음에 또 오세요!',
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

// 기본 변수 정의 (전역 - 게임 전체에서 유지)
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
    id: 'inventory',
    name: 'Inventory',
    type: 'array',
    defaultValue: [],
    arrayItemType: 'string',
    description: '인벤토리 아이템 목록',
  },
]

// 챕터 로컬 변수 예시 (Chapter 1용 - 이 챕터 내에서만 의미있는 변수)
export const defaultChapterVariables: VariableDefinition[] = [
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
]

// 챕터 2 로컬 변수 (가위바위보 게임용)
export const chapter2Variables: VariableDefinition[] = [
  {
    id: 'player_choice',
    name: 'Player Choice',
    type: 'number',
    defaultValue: 0,
    description: '플레이어 선택 (0=가위, 1=바위, 2=보)',
  },
  {
    id: 'npc_choice',
    name: 'NPC Choice',
    type: 'number',
    defaultValue: 0,
    description: 'NPC 선택 (0=가위, 1=바위, 2=보)',
  },
  {
    id: 'game_result',
    name: 'Game Result',
    type: 'number',
    defaultValue: 0,
    description: '결과 (0=무승부, 1=승리, 2=패배)',
  },
  {
    id: 'win_count',
    name: 'Win Count',
    type: 'number',
    defaultValue: 0,
    description: '승리 횟수',
  },
  {
    id: 'bet_amount',
    name: 'Bet Amount',
    type: 'number',
    defaultValue: 10,
    description: '배팅 금액',
  },
]

// 챕터 2: 가위바위보 미니게임 노드 생성
export const createChapter2Nodes = (): { nodes: StoryNode[]; startNodeId: string } => {
  const startId = generateId()
  const bgImageId = generateId()
  const introId = generateId()
  const checkGoldId = generateId()
  const notEnoughGoldId = generateId()
  const showGoldId = generateId()
  const choiceId = generateId()
  const scissorsId = generateId()
  const rockId = generateId()
  const paperId = generateId()
  const randomNpcId = generateId()
  const checkResultId = generateId()
  const winBranchId = generateId()
  const loseBranchId = generateId()
  const drawBranchId = generateId()
  const winRewardId = generateId()
  const loseRewardId = generateId()
  const playAgainId = generateId()
  const exitGameId = generateId()
  const chapterEndId = generateId()

  const nodes: StoryNode[] = [
    // Start
    {
      id: startId,
      type: 'start',
      position: { x: 100, y: 300 },
      nextNodeId: bgImageId,
    },
    // 배경 이미지
    {
      id: bgImageId,
      type: 'image',
      position: { x: 300, y: 300 },
      nextNodeId: introId,
      imageData: {
        resourcePath: 'templates/default/backgrounds/background.png',
        layer: 'background',
        layerOrder: 0,
        alignment: 'center',
        effect: 'fadeIn',
        effectDuration: 300,
      },
    },
    // 인트로 - 챕터1 변수 참조
    {
      id: introId,
      type: 'dialogue',
      position: { x: 500, y: 300 },
      speaker: '도박사',
      text: '어서오게 {{Player Name}}! 가위바위보 한 판 어떤가?\n현재 자네의 골드는 {{Gold}}이군.',
      nextNodeId: checkGoldId,
    },
    // 골드 체크 (10골드 이상인지)
    {
      id: checkGoldId,
      type: 'condition',
      position: { x: 700, y: 300 },
      conditionBranches: [
        {
          id: generateId(),
          condition: { type: 'variable', variableId: 'gold', operator: '>=', value: 10 },
          nextNodeId: showGoldId,
        },
      ],
      defaultNextNodeId: notEnoughGoldId,
    },
    // 골드 부족
    {
      id: notEnoughGoldId,
      type: 'dialogue',
      position: { x: 900, y: 450 },
      speaker: '도박사',
      text: '흠, 10골드도 없군... 돈 벌어서 다시 오게나.',
      nextNodeId: chapterEndId,
    },
    // 게임 설명
    {
      id: showGoldId,
      type: 'dialogue',
      position: { x: 900, y: 200 },
      speaker: '도박사',
      text: '10골드를 걸고 가위바위보를 하지. 이기면 20골드를 받고, 지면 10골드를 잃네!',
      nextNodeId: choiceId,
    },
    // 가위바위보 선택
    {
      id: choiceId,
      type: 'choice',
      position: { x: 1100, y: 200 },
      text: '무엇을 낼까?',
      choices: [
        {
          id: generateId(),
          text: '✌️ 가위',
          nextNodeId: scissorsId,
        },
        {
          id: generateId(),
          text: '✊ 바위',
          nextNodeId: rockId,
        },
        {
          id: generateId(),
          text: '🖐️ 보',
          nextNodeId: paperId,
        },
        {
          id: generateId(),
          text: '그만하기',
          nextNodeId: exitGameId,
        },
      ],
    },
    // 가위 선택
    {
      id: scissorsId,
      type: 'variable',
      position: { x: 1300, y: 50 },
      nextNodeId: randomNpcId,
      variableOperations: [
        { target: 'variable', action: 'set', variableId: 'player_choice', value: 0 },
      ],
    },
    // 바위 선택
    {
      id: rockId,
      type: 'variable',
      position: { x: 1300, y: 200 },
      nextNodeId: randomNpcId,
      variableOperations: [
        { target: 'variable', action: 'set', variableId: 'player_choice', value: 1 },
      ],
    },
    // 보 선택
    {
      id: paperId,
      type: 'variable',
      position: { x: 1300, y: 350 },
      nextNodeId: randomNpcId,
      variableOperations: [
        { target: 'variable', action: 'set', variableId: 'player_choice', value: 2 },
      ],
    },
    // JavaScript로 NPC 랜덤 선택 및 결과 계산
    {
      id: randomNpcId,
      type: 'javascript',
      position: { x: 1500, y: 200 },
      nextNodeId: checkResultId,
      javascriptCode: `// 가위바위보 로직
// 0=가위, 1=바위, 2=보

// NPC 랜덤 선택 (0~2)
const npcChoice = Math.floor(Math.random() * 3);
chapters.rps.npc_choice = npcChoice;

// 플레이어 선택
const playerChoice = chapters.rps.player_choice;

// 승패 판정
// (player - npc + 3) % 3 => 0:무승부, 1:패배, 2:승리
const result = (playerChoice - npcChoice + 3) % 3;

// 결과 저장 (0=무승부, 1=승리, 2=패배로 변환)
if (result === 0) {
  chapters.rps.game_result = 0; // 무승부
} else if (result === 2) {
  chapters.rps.game_result = 1; // 승리
} else {
  chapters.rps.game_result = 2; // 패배
}

// 선택 이름 배열
const choices = ['가위', '바위', '보'];
console.log('플레이어:', choices[playerChoice], '/ NPC:', choices[npcChoice]);
console.log('결과:', chapters.rps.game_result === 0 ? '무승부' : chapters.rps.game_result === 1 ? '승리' : '패배');`,
    },
    // 결과 분기
    {
      id: checkResultId,
      type: 'condition',
      position: { x: 1700, y: 200 },
      conditionBranches: [
        {
          id: generateId(),
          condition: { type: 'variable', variableId: 'game_result', operator: '==', value: 1 },
          nextNodeId: winBranchId,
        },
        {
          id: generateId(),
          condition: { type: 'variable', variableId: 'game_result', operator: '==', value: 2 },
          nextNodeId: loseBranchId,
        },
      ],
      defaultNextNodeId: drawBranchId,
    },
    // 승리
    {
      id: winBranchId,
      type: 'dialogue',
      position: { x: 1900, y: 50 },
      speaker: '도박사',
      text: '이런, 졌군! 자네 운이 좋아.\n20골드를 가져가게!',
      nextNodeId: winRewardId,
    },
    // 승리 보상
    {
      id: winRewardId,
      type: 'variable',
      position: { x: 2100, y: 50 },
      nextNodeId: playAgainId,
      variableOperations: [
        { target: 'variable', action: 'add', variableId: 'gold', value: 20 },
        { target: 'variable', action: 'add', variableId: 'win_count', value: 1 },
      ],
    },
    // 패배
    {
      id: loseBranchId,
      type: 'dialogue',
      position: { x: 1900, y: 200 },
      speaker: '도박사',
      text: '하하! 내가 이겼네!\n10골드는 내 것이야.',
      nextNodeId: loseRewardId,
    },
    // 패배 페널티
    {
      id: loseRewardId,
      type: 'variable',
      position: { x: 2100, y: 200 },
      nextNodeId: playAgainId,
      variableOperations: [
        { target: 'variable', action: 'subtract', variableId: 'gold', value: 10 },
      ],
    },
    // 무승부
    {
      id: drawBranchId,
      type: 'dialogue',
      position: { x: 1900, y: 350 },
      speaker: '도박사',
      text: '오호, 비겼군! 다시 해볼까?',
      nextNodeId: playAgainId,
    },
    // 다시 할지 선택
    {
      id: playAgainId,
      type: 'dialogue',
      position: { x: 2300, y: 200 },
      speaker: '시스템',
      text: '현재 골드: {{Gold}}\n승리 횟수: {{win_count}}회',
      nextNodeId: checkGoldId, // 다시 골드 체크로 루프
    },
    // 그만하기
    {
      id: exitGameId,
      type: 'dialogue',
      position: { x: 1300, y: 500 },
      speaker: '도박사',
      text: '그래, 다음에 또 오게나!\n{{win_count}}번 이겼으니 대단하군.',
      nextNodeId: chapterEndId,
    },
    // 챕터 종료
    {
      id: chapterEndId,
      type: 'chapter_end',
      position: { x: 1500, y: 500 },
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

// 기본 프로젝트 생성
export const createDefaultProject = (): StoryProject => {
  const { nodes: chapter1Nodes, startNodeId: chapter1StartId } = createDefaultChapterNodes()
  const { nodes: chapter2Nodes, startNodeId: chapter2StartId } = createChapter2Nodes()

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
            title: 'Chapter 1: 상점',
            description: '상인과의 만남 - 변수, 조건분기, JavaScript 예시',
            nodes: chapter1Nodes,
            startNodeId: chapter1StartId,
            variables: [...defaultChapterVariables],
            alias: 'shop', // JavaScript에서 chapters.shop.변수명 으로 접근
          },
          {
            id: 'chapter_2',
            title: 'Chapter 2: 가위바위보',
            description: '도박사와의 미니게임 - 랜덤, 루프, 전역변수 참조',
            nodes: chapter2Nodes,
            startNodeId: chapter2StartId,
            variables: [...chapter2Variables],
            alias: 'rps', // Rock-Paper-Scissors
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
