/**
 * GameEngine 테스트
 * 샘플 프로젝트의 노드 그래프 흐름을 테스트합니다.
 * 
 * 노드 그래프 구조:
 * start → bgImage → char1Image → char2Image → variableInit → dialogue1 → dialogue2 → choice
 *   ├─ [선택지1: 물건 구매] → choice1Result → choice1Variable → condition → flagBranch → chapterEnd
 *   ├─ [선택지2: 구경만] → choice2Result → condition → defaultBranch → chapterEnd
 *   └─ [선택지3: 비밀거래] → choice3Result → javascript → condition → goldBranch → chapterEnd
 * 
 * 조건 노드 분기:
 *   - bought_item == true → flagBranch
 *   - gold >= 100 → goldBranch
 *   - default → defaultBranch
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GameEngine } from './GameEngine'
import type { StoryProject, StoryNode, VariableDefinition } from '../../../types/story'

// 테스트용 고정 ID
const NODE_IDS = {
  start: 'test_start',
  bgImage: 'test_bg_image',
  char1Image: 'test_char1_image',
  char2Image: 'test_char2_image',
  variableInit: 'test_variable_init',
  dialogue1: 'test_dialogue1',
  dialogue2: 'test_dialogue2',
  choice: 'test_choice',
  choice1Result: 'test_choice1_result',
  choice1Variable: 'test_choice1_variable',
  choice2Result: 'test_choice2_result',
  choice3Result: 'test_choice3_result',
  javascript: 'test_javascript',
  condition: 'test_condition',
  goldBranch: 'test_gold_branch',
  flagBranch: 'test_flag_branch',
  defaultBranch: 'test_default_branch',
  chapterEnd: 'test_chapter_end',
}



// 테스트용 전역 변수 정의 (함수로 변경하여 매번 새 객체 생성)
function createGlobalVariables(): VariableDefinition[] {
  return [
    { id: 'gold', name: 'Gold', type: 'number', defaultValue: 100 },
    { id: 'hp', name: 'HP', type: 'number', defaultValue: 100 },
    { id: 'playerName', name: 'Player Name', type: 'string', defaultValue: '용사' },
    { id: 'inventory', name: 'Inventory', type: 'array', defaultValue: [], arrayItemType: 'string' },
  ]
}

// 테스트용 챕터 변수 정의 (함수로 변경)
function createChapterVariables(): VariableDefinition[] {
  return [
    { id: 'met_merchant', name: 'Met Merchant', type: 'boolean', defaultValue: false },
    { id: 'bought_item', name: 'Bought Item', type: 'boolean', defaultValue: false },
  ]
}

// 테스트용 노드 생성
function createTestNodes(): StoryNode[] {
  return [
    {
      id: NODE_IDS.start,
      type: 'start',
      nextNodeId: NODE_IDS.bgImage,
    },
    {
      id: NODE_IDS.bgImage,
      type: 'image',
      nextNodeId: NODE_IDS.char1Image,
      imageData: {
        resourcePath: 'test/background.png',
        layer: 'background',
        layerOrder: 0,
        alignment: 'center',
        effectDuration: 0,
      },
    },
    {
      id: NODE_IDS.char1Image,
      type: 'image',
      nextNodeId: NODE_IDS.char2Image,
      imageData: {
        resourcePath: 'test/char1.png',
        layer: 'character',
        layerOrder: 0,
        alignment: 'left',
        effectDuration: 0,
      },
    },
    {
      id: NODE_IDS.char2Image,
      type: 'image',
      nextNodeId: NODE_IDS.variableInit,
      imageData: {
        resourcePath: 'test/char2.png',
        layer: 'character',
        layerOrder: 1,
        alignment: 'right',
        effectDuration: 0,
      },
    },
    {
      id: NODE_IDS.variableInit,
      type: 'variable',
      nextNodeId: NODE_IDS.dialogue1,
      variableOperations: [
        { target: 'variable', action: 'set', variableId: 'gold', value: 75 },
        { target: 'variable', action: 'set', variableId: 'met_merchant', value: false },
        { target: 'variable', action: 'set', variableId: 'bought_item', value: false },
      ],
    },
    {
      id: NODE_IDS.dialogue1,
      type: 'dialogue',
      speaker: '상인',
      text: '{{Player Name}}님, 어서오세요!',
      nextNodeId: NODE_IDS.dialogue2,
    },
    {
      id: NODE_IDS.dialogue2,
      type: 'dialogue',
      speaker: '상인',
      text: '현재 {{Gold}} 골드를 가지고 계시네요.',
      nextNodeId: NODE_IDS.choice,
    },
    {
      id: NODE_IDS.choice,
      type: 'choice',
      text: '어떻게 하시겠습니까?',
      choices: [
        {
          id: 'choice_buy',
          text: '물건 구매하기 (50골드)',
          nextNodeId: NODE_IDS.choice1Result,
          condition: { type: 'variable', variableId: 'gold', operator: '>=', value: 50 },
        },
        {
          id: 'choice_browse',
          text: '그냥 구경만 하기',
          nextNodeId: NODE_IDS.choice2Result,
        },
        {
          id: 'choice_secret',
          text: '비밀 거래 제안하기',
          nextNodeId: NODE_IDS.choice3Result,
          condition: { type: 'variable', variableId: 'gold', operator: '>=', value: 200 },
        },
      ],
    },
    {
      id: NODE_IDS.choice1Result,
      type: 'dialogue',
      speaker: '상인',
      text: '좋은 선택이십니다!',
      nextNodeId: NODE_IDS.choice1Variable,
    },
    {
      id: NODE_IDS.choice1Variable,
      type: 'variable',
      nextNodeId: NODE_IDS.condition,
      variableOperations: [
        { target: 'variable', action: 'subtract', variableId: 'gold', value: 50 },
        { target: 'variable', action: 'add', variableId: 'hp', value: 10 },
        { target: 'variable', action: 'set', variableId: 'bought_item', value: true },
        { target: 'variable', action: 'push', variableId: 'inventory', value: '체력 물약' },
      ],
    },
    {
      id: NODE_IDS.choice2Result,
      type: 'dialogue',
      speaker: '상인',
      text: '천천히 구경하세요~',
      nextNodeId: NODE_IDS.condition,
    },
    {
      id: NODE_IDS.choice3Result,
      type: 'dialogue',
      speaker: '상인',
      text: '비밀 거래를 해드리죠...',
      nextNodeId: NODE_IDS.javascript,
    },
    {
      id: NODE_IDS.javascript,
      type: 'javascript',
      nextNodeId: NODE_IDS.condition,
      javascriptCode: `
        const bonus = (variables.hp * 2) + (variables.gold * 0.5) + 100;
        variables.gold = Math.floor(bonus);
        chapters.shop.met_merchant = true;
      `,
    },
    {
      id: NODE_IDS.condition,
      type: 'condition',
      conditionBranches: [
        {
          id: 'branch_bought',
          condition: { type: 'variable', variableId: 'bought_item', operator: '==', value: true },
          nextNodeId: NODE_IDS.flagBranch,
        },
        {
          id: 'branch_rich',
          condition: { type: 'variable', variableId: 'gold', operator: '>=', value: 100 },
          nextNodeId: NODE_IDS.goldBranch,
        },
      ],
      defaultNextNodeId: NODE_IDS.defaultBranch,
    },
    {
      id: NODE_IDS.goldBranch,
      type: 'dialogue',
      speaker: '시스템',
      text: '{{Gold}} 골드나 가지고 계시다니, 부자시군요!',
      nextNodeId: NODE_IDS.chapterEnd,
    },
    {
      id: NODE_IDS.flagBranch,
      type: 'dialogue',
      speaker: '시스템',
      text: '물건을 구매하셨군요! 남은 골드: {{Gold}}',
      nextNodeId: NODE_IDS.chapterEnd,
    },
    {
      id: NODE_IDS.defaultBranch,
      type: 'dialogue',
      speaker: '시스템',
      text: '{{Player Name}}님, 다음에 또 오세요!',
      nextNodeId: NODE_IDS.chapterEnd,
    },
    {
      id: NODE_IDS.chapterEnd,
      type: 'chapter_end',
      text: 'End',
    },
  ]
}

// 테스트용 프로젝트 생성
function createTestProject(goldOverride?: number): StoryProject {
  const nodes = createTestNodes()
  
  // gold 초기값 오버라이드
  if (goldOverride !== undefined) {
    const variableInitNode = nodes.find(n => n.id === NODE_IDS.variableInit)!
    variableInitNode.variableOperations![0].value = goldOverride
  }
  
  return {
    name: 'Test Project',
    version: '1.0.0',
    stages: [
      {
        id: 'stage_1',
        title: 'Stage 1',
        description: 'Test stage',
        partyCharacters: [],
        chapters: [
          {
            id: 'chapter_1',
            title: 'Chapter 1',
            description: 'Test chapter',
            nodes,
            startNodeId: NODE_IDS.start,
            variables: createChapterVariables(),
            alias: 'shop',
          },
        ],
      },
    ],
    variables: createGlobalVariables(),
  }
}

// 헬퍼: 게임을 특정 노드까지 진행
function advanceToNode(engine: GameEngine, targetNodeId: string, maxSteps = 50): boolean {
  for (let i = 0; i < maxSteps; i++) {
    const current = engine.getCurrentNode()
    if (!current) return false
    if (current.id === targetNodeId) return true
    
    if (current.type === 'choice') {
      // choice 노드면 멈춤 (수동 선택 필요)
      return current.id === targetNodeId
    }
    
    if (current.type === 'chapter_end') {
      return current.id === targetNodeId
    }
    
    engine.advance()
  }
  return false
}

// 방문한 노드 기록 (게임 시작부터 끝까지 전체 경로)
function runGameAndCollectNodes(project: StoryProject, choiceIndex: number): string[] {
  const engine = new GameEngine(project)
  const visited: string[] = []
  const maxSteps = 50
  
  engine.start()
  
  for (let i = 0; i < maxSteps; i++) {
    const current = engine.getCurrentNode()
    if (!current) break
    
    visited.push(current.id)
    
    if (current.type === 'chapter_end') break
    
    if (current.type === 'choice') {
      engine.selectChoice(choiceIndex)
    } else {
      engine.advance()
    }
  }
  
  return visited
}

describe('GameEngine', () => {
  describe('게임 시작 및 초기화', () => {
    it('start() 호출 시 첫 번째 대사 노드까지 자동 진행', () => {
      const engine = new GameEngine(createTestProject())
      engine.start()
      
      const currentNode = engine.getCurrentNode()
      expect(currentNode?.id).toBe(NODE_IDS.dialogue1)
      expect(currentNode?.type).toBe('dialogue')
    })

    it('전역 변수가 올바르게 초기화됨', () => {
      const engine = new GameEngine(createTestProject())
      engine.start()
      
      const vars = engine.getVariables()
      expect(vars.variables['gold']).toBe(75) // variableInit에서 설정
      expect(vars.variables['hp']).toBe(100)
      expect(vars.variables['playerName']).toBe('용사')
      expect(vars.variables['inventory']).toEqual([])
    })

    it('챕터 변수가 올바르게 초기화됨', () => {
      const engine = new GameEngine(createTestProject())
      engine.start()
      
      const vars = engine.getVariables()
      expect(vars.variables['met_merchant']).toBe(false)
      expect(vars.variables['bought_item']).toBe(false)
    })

    it('이미지 레이어가 올바르게 설정됨', () => {
      const engine = new GameEngine(createTestProject())
      engine.start()
      
      const state = engine.getState()
      expect(state.activeImages.length).toBe(3)
      
      const bgImage = state.activeImages.find(img => img.layer === 'background')
      const char1 = state.activeImages.find(img => img.layer === 'character' && img.layerOrder === 0)
      const char2 = state.activeImages.find(img => img.layer === 'character' && img.layerOrder === 1)
      
      expect(bgImage?.resourcePath).toBe('test/background.png')
      expect(char1?.resourcePath).toBe('test/char1.png')
      expect(char2?.resourcePath).toBe('test/char2.png')
    })
  })

  describe('텍스트 변수 치환', () => {
    it('{{변수명}} 형식으로 전역 변수 치환', () => {
      const engine = new GameEngine(createTestProject())
      engine.start()
      
      const interpolated = engine.interpolateText('{{Player Name}}님, 골드: {{Gold}}')
      expect(interpolated).toBe('용사님, 골드: 75')
    })

    it('dialogue1에서 Player Name 치환', () => {
      const engine = new GameEngine(createTestProject())
      engine.start()
      
      const node = engine.getCurrentNode()
      const interpolated = engine.interpolateText(node?.text || '')
      expect(interpolated).toBe('용사님, 어서오세요!')
    })

    it('dialogue2에서 Gold 치환', () => {
      const engine = new GameEngine(createTestProject())
      engine.start()
      engine.advance()
      
      const node = engine.getCurrentNode()
      const interpolated = engine.interpolateText(node?.text || '')
      expect(interpolated).toBe('현재 75 골드를 가지고 계시네요.')
    })
  })

  describe('경로 1: 물건 구매 (gold=75)', () => {
    // 경로: start → images → variableInit → dialogue1 → dialogue2 → choice
    //       → choice1Result → choice1Variable → condition → flagBranch → chapterEnd
    
    let engine: GameEngine
    
    beforeEach(() => {
      engine = new GameEngine(createTestProject(75))
      engine.start()
    })

    it('선택지1 조건(gold>=50) 충족 확인', () => {
      advanceToNode(engine, NODE_IDS.choice)
      const node = engine.getCurrentNode()
      const condition = node?.choices?.[0].condition
      expect(engine.checkCondition(condition!)).toBe(true)
    })

    it('물건 구매 선택 후 올바른 노드 경로로 진행', () => {
      const visitedNodes = runGameAndCollectNodes(createTestProject(75), 0)
      
      expect(visitedNodes).toContain(NODE_IDS.choice1Result)
      expect(visitedNodes).toContain(NODE_IDS.flagBranch)
      expect(visitedNodes).toContain(NODE_IDS.chapterEnd)
      // 조건분기에서 bought_item=true이므로 goldBranch, defaultBranch는 방문하지 않음
      expect(visitedNodes).not.toContain(NODE_IDS.goldBranch)
      expect(visitedNodes).not.toContain(NODE_IDS.defaultBranch)
    })

    it('구매 후 변수 업데이트 확인', () => {
      advanceToNode(engine, NODE_IDS.choice)
      engine.selectChoice(0) // 물건 구매
      advanceToNode(engine, NODE_IDS.chapterEnd)
      
      const vars = engine.getVariables()
      expect(vars.variables['gold']).toBe(25) // 75 - 50
      expect(vars.variables['hp']).toBe(110) // 100 + 10
      expect(vars.variables['bought_item']).toBe(true)
      expect(vars.variables['inventory']).toEqual(['체력 물약'])
    })

    it('flagBranch 대사 텍스트 치환 확인', () => {
      advanceToNode(engine, NODE_IDS.choice)
      engine.selectChoice(0)
      advanceToNode(engine, NODE_IDS.flagBranch)
      
      const node = engine.getCurrentNode()
      const interpolated = engine.interpolateText(node?.text || '')
      expect(interpolated).toBe('물건을 구매하셨군요! 남은 골드: 25')
    })
  })

  describe('경로 2: 구경만 하기 (gold=75)', () => {
    // 경로: ... → choice → choice2Result → condition → defaultBranch → chapterEnd
    
    let engine: GameEngine
    
    beforeEach(() => {
      engine = new GameEngine(createTestProject(75))
      engine.start()
    })

    it('구경 선택 후 올바른 노드 경로로 진행', () => {
      const visitedNodes = runGameAndCollectNodes(createTestProject(75), 1)
      
      expect(visitedNodes).toContain(NODE_IDS.choice2Result)
      expect(visitedNodes).toContain(NODE_IDS.defaultBranch) // bought_item=false, gold=75<100
      expect(visitedNodes).toContain(NODE_IDS.chapterEnd)
      expect(visitedNodes).not.toContain(NODE_IDS.flagBranch)
      expect(visitedNodes).not.toContain(NODE_IDS.goldBranch)
    })

    it('구경만 했을 때 변수 변경 없음', () => {
      advanceToNode(engine, NODE_IDS.choice)
      engine.selectChoice(1)
      advanceToNode(engine, NODE_IDS.chapterEnd)
      
      const vars = engine.getVariables()
      expect(vars.variables['gold']).toBe(75) // 변경 없음
      expect(vars.variables['hp']).toBe(100)
      expect(vars.variables['bought_item']).toBe(false)
      expect(vars.variables['inventory']).toEqual([])
    })

    it('defaultBranch 대사 텍스트 치환 확인', () => {
      advanceToNode(engine, NODE_IDS.choice)
      engine.selectChoice(1)
      advanceToNode(engine, NODE_IDS.defaultBranch)
      
      const node = engine.getCurrentNode()
      const interpolated = engine.interpolateText(node?.text || '')
      expect(interpolated).toBe('용사님, 다음에 또 오세요!')
    })
  })

  describe('경로 3: 비밀 거래 (gold=200)', () => {
    // 경로: ... → choice → choice3Result → javascript → condition → goldBranch → chapterEnd
    
    let engine: GameEngine
    
    beforeEach(() => {
      // gold를 200으로 설정해서 비밀 거래 조건 충족
      engine = new GameEngine(createTestProject(200))
      engine.start()
    })

    it('선택지3 조건(gold>=200) 충족 확인', () => {
      advanceToNode(engine, NODE_IDS.choice)
      
      const vars = engine.getVariables()
      expect(vars.variables['gold']).toBe(200)
      
      const node = engine.getCurrentNode()
      const condition = node?.choices?.[2].condition
      expect(engine.checkCondition(condition!)).toBe(true)
    })

    it('비밀 거래 선택 후 JavaScript 노드 실행', () => {
      const visitedNodes = runGameAndCollectNodes(createTestProject(200), 2)
      
      expect(visitedNodes).toContain(NODE_IDS.choice3Result)
      // JavaScript 노드는 goToNode()에서 자동으로 실행 후 다음 노드로 진행되므로 
      // getCurrentNode()에서 캡처되지 않음 - 대신 결과로 goldBranch에 도달하는지 확인
      expect(visitedNodes).toContain(NODE_IDS.goldBranch) // JavaScript 후 gold >= 100
      expect(visitedNodes).toContain(NODE_IDS.chapterEnd)
    })

    it('JavaScript 노드에서 전역 변수 계산', () => {
      advanceToNode(engine, NODE_IDS.choice)
      engine.selectChoice(2)
      advanceToNode(engine, NODE_IDS.chapterEnd)
      
      const vars = engine.getVariables()
      // bonus = (100 * 2) + (200 * 0.5) + 100 = 200 + 100 + 100 = 400
      expect(vars.variables['gold']).toBe(400)
    })

    it('JavaScript 노드에서 챕터 변수 접근 (chapters.shop.met_merchant)', () => {
      advanceToNode(engine, NODE_IDS.choice)
      engine.selectChoice(2)
      advanceToNode(engine, NODE_IDS.chapterEnd)
      
      const vars = engine.getVariables()
      expect(vars.variables['met_merchant']).toBe(true)
    })

    it('goldBranch 대사 텍스트 치환 확인', () => {
      advanceToNode(engine, NODE_IDS.choice)
      engine.selectChoice(2)
      advanceToNode(engine, NODE_IDS.goldBranch)
      
      const node = engine.getCurrentNode()
      const interpolated = engine.interpolateText(node?.text || '')
      expect(interpolated).toBe('400 골드나 가지고 계시다니, 부자시군요!')
    })
  })

  describe('경로 3: 비밀 거래 조건 미충족 (gold=75)', () => {
    it('선택지3 조건(gold>=200) 미충족 확인', () => {
      const engine = new GameEngine(createTestProject(75))
      engine.start()
      advanceToNode(engine, NODE_IDS.choice)
      
      const node = engine.getCurrentNode()
      const condition = node?.choices?.[2].condition
      expect(engine.checkCondition(condition!)).toBe(false)
    })
  })

  describe('노드 커버리지', () => {
    it('경로 1,2,3 을 모두 실행하면 모든 노드 방문', () => {
      const allVisited = new Set<string>()
      
      // 경로 1: 물건 구매
      runGameAndCollectNodes(createTestProject(75), 0).forEach(id => allVisited.add(id))
      
      // 경로 2: 구경만
      runGameAndCollectNodes(createTestProject(75), 1).forEach(id => allVisited.add(id))
      
      // 경로 3: 비밀 거래 (gold=200)
      runGameAndCollectNodes(createTestProject(200), 2).forEach(id => allVisited.add(id))
      
      // 모든 노드 방문 확인 (start, condition, variable 노드는 자동 진행되어 기록 안됨)
      const dialogueAndChoiceNodes = [
        NODE_IDS.dialogue1,
        NODE_IDS.dialogue2,
        NODE_IDS.choice,
        NODE_IDS.choice1Result,
        NODE_IDS.choice2Result,
        NODE_IDS.choice3Result,
        NODE_IDS.goldBranch,
        NODE_IDS.flagBranch,
        NODE_IDS.defaultBranch,
        NODE_IDS.chapterEnd,
      ]
      
      for (const nodeId of dialogueAndChoiceNodes) {
        expect(allVisited.has(nodeId), `Node ${nodeId} should be visited`).toBe(true)
      }
    })
  })

  describe('조건 노드 분기 테스트', () => {
    it('bought_item=true면 flagBranch로 분기', () => {
      const engine = new GameEngine(createTestProject(75))
      engine.start()
      advanceToNode(engine, NODE_IDS.choice)
      engine.selectChoice(0) // 구매 → bought_item = true
      advanceToNode(engine, NODE_IDS.chapterEnd)
      
      const history = engine.getHistory()
      expect(history.some(h => h.nodeId === NODE_IDS.flagBranch)).toBe(true)
      expect(history.some(h => h.nodeId === NODE_IDS.goldBranch)).toBe(false)
    })

    it('bought_item=false, gold>=100이면 goldBranch로 분기', () => {
      const engine = new GameEngine(createTestProject(200))
      engine.start()
      advanceToNode(engine, NODE_IDS.choice)
      engine.selectChoice(2) // 비밀 거래 → gold=400, bought_item=false
      advanceToNode(engine, NODE_IDS.chapterEnd)
      
      const history = engine.getHistory()
      expect(history.some(h => h.nodeId === NODE_IDS.goldBranch)).toBe(true)
      expect(history.some(h => h.nodeId === NODE_IDS.flagBranch)).toBe(false)
    })

    it('bought_item=false, gold<100이면 defaultBranch로 분기', () => {
      const engine = new GameEngine(createTestProject(75))
      engine.start()
      advanceToNode(engine, NODE_IDS.choice)
      engine.selectChoice(1) // 구경만 → gold=75, bought_item=false
      advanceToNode(engine, NODE_IDS.chapterEnd)
      
      const history = engine.getHistory()
      expect(history.some(h => h.nodeId === NODE_IDS.defaultBranch)).toBe(true)
      expect(history.some(h => h.nodeId === NODE_IDS.goldBranch)).toBe(false)
      expect(history.some(h => h.nodeId === NODE_IDS.flagBranch)).toBe(false)
    })
  })

  describe('게임 종료 및 콜백', () => {
    it('chapter_end 도달 후 advance시 onGameEnd 호출', () => {
      const onGameEnd = vi.fn()
      const engine = new GameEngine(createTestProject(75), { onGameEnd })
      
      engine.start()
      advanceToNode(engine, NODE_IDS.choice)
      engine.selectChoice(1)
      advanceToNode(engine, NODE_IDS.chapterEnd)
      
      expect(engine.getCurrentNode()?.type).toBe('chapter_end')
      
      engine.advance()
      expect(onGameEnd).toHaveBeenCalledTimes(1)
    })
  })

  describe('세이브/로드', () => {
    it('게임 상태 저장 및 복원', () => {
      const engine1 = new GameEngine(createTestProject(75))
      engine1.start()
      advanceToNode(engine1, NODE_IDS.choice)
      engine1.selectChoice(0) // 물건 구매
      advanceToNode(engine1, NODE_IDS.flagBranch)
      
      const saveData = engine1.save()
      const vars1 = engine1.getVariables()
      
      // 새 엔진에서 복원
      const engine2 = new GameEngine(createTestProject(75))
      engine2.load(saveData)
      const vars2 = engine2.getVariables()
      
      expect(vars2.variables['gold']).toBe(vars1.variables['gold'])
      expect(vars2.variables['bought_item']).toBe(vars1.variables['bought_item'])
      expect(vars2.variables['inventory']).toEqual(vars1.variables['inventory'])
    })
  })

  describe('다중 실행 테스트 (디버그 시나리오)', () => {
    it('첫 번째 실행 후 gold 변경하여 다른 경로 테스트', () => {
      // 1차: gold=75로 구경만 하기
      let engine = new GameEngine(createTestProject(75))
      engine.start()
      advanceToNode(engine, NODE_IDS.choice)
      
      let node = engine.getCurrentNode()
      let choice3Condition = node?.choices?.[2].condition
      expect(engine.checkCondition(choice3Condition!)).toBe(false) // 비밀거래 불가
      
      engine.selectChoice(1)
      advanceToNode(engine, NODE_IDS.chapterEnd)
      
      let history = engine.getHistory()
      expect(history.some(h => h.nodeId === NODE_IDS.defaultBranch)).toBe(true)
      
      // 2차: gold=200으로 비밀 거래
      engine = new GameEngine(createTestProject(200))
      engine.start()
      advanceToNode(engine, NODE_IDS.choice)
      
      node = engine.getCurrentNode()
      choice3Condition = node?.choices?.[2].condition
      expect(engine.checkCondition(choice3Condition!)).toBe(true) // 비밀거래 가능
      
      engine.selectChoice(2)
      advanceToNode(engine, NODE_IDS.chapterEnd)
      
      history = engine.getHistory()
      expect(history.some(h => h.nodeId === NODE_IDS.goldBranch)).toBe(true)
      
      const vars = engine.getVariables()
      expect(vars.variables['gold']).toBe(400) // JavaScript 계산 결과
    })
  })
})
