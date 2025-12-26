import { describe, it, expect } from 'vitest'
import { GameEngine } from './GameEngine'
import type { StoryProject, StoryNode, VariableDefinition } from '../../../types/story'

// 테스트용 프로젝트 생성 헬퍼
function createTestProject(
  nodes: StoryNode[],
  variables: VariableDefinition[] = []
): StoryProject {
  return {
    name: 'Test Project',
    version: '1.0.0',
    stages: [
      {
        id: 'stage_1',
        title: 'Test Stage',
        description: '',
        partyCharacters: [],
        chapters: [
          {
            id: 'chapter_1',
            title: 'Test Chapter',
            description: '',
            nodes,
            startNodeId: nodes[0]?.id || '',
          },
        ],
      },
    ],
    variables,
  }
}

describe('GameEngine', () => {
  describe('Basic Flow', () => {
    it('should start from start node and advance to next node', () => {
      const nodes: StoryNode[] = [
        { id: 'start', type: 'start', nextNodeId: 'dialogue1' },
        { id: 'dialogue1', type: 'dialogue', speaker: 'NPC', text: 'Hello!', nextNodeId: 'end' },
        { id: 'end', type: 'chapter_end', text: 'The End' },
      ]
      const project = createTestProject(nodes)
      const engine = new GameEngine(project)

      engine.start('stage_1', 'chapter_1')

      // start 노드는 자동으로 다음 노드로 진행
      const currentNode = engine.getCurrentNode()
      expect(currentNode?.id).toBe('dialogue1')
      expect(currentNode?.text).toBe('Hello!')
    })

    it('should advance through dialogue nodes', () => {
      const nodes: StoryNode[] = [
        { id: 'start', type: 'start', nextNodeId: 'dialogue1' },
        { id: 'dialogue1', type: 'dialogue', text: 'First', nextNodeId: 'dialogue2' },
        { id: 'dialogue2', type: 'dialogue', text: 'Second', nextNodeId: 'end' },
        { id: 'end', type: 'chapter_end' },
      ]
      const project = createTestProject(nodes)
      const engine = new GameEngine(project)

      engine.start('stage_1', 'chapter_1')
      expect(engine.getCurrentNode()?.text).toBe('First')

      engine.advance()
      expect(engine.getCurrentNode()?.text).toBe('Second')
    })
  })

  describe('Variable Node', () => {
    it('should set variable value', () => {
      const nodes: StoryNode[] = [
        { id: 'start', type: 'start', nextNodeId: 'var1' },
        {
          id: 'var1',
          type: 'variable',
          nextNodeId: 'end',
          variableOperations: [
            { target: 'variable', action: 'set', variableId: 'gold', value: 100 },
          ],
        },
        { id: 'end', type: 'chapter_end' },
      ]
      const variables: VariableDefinition[] = [
        { id: 'gold', name: 'Gold', type: 'number', defaultValue: 0 },
      ]
      const project = createTestProject(nodes, variables)
      const engine = new GameEngine(project)

      engine.start('stage_1', 'chapter_1')

      const vars = engine.getVariables()
      expect(vars.variables.gold).toBe(100)
    })

    it('should add to variable value', () => {
      const nodes: StoryNode[] = [
        { id: 'start', type: 'start', nextNodeId: 'var1' },
        {
          id: 'var1',
          type: 'variable',
          nextNodeId: 'end',
          variableOperations: [
            { target: 'variable', action: 'add', variableId: 'gold', value: 50 },
          ],
        },
        { id: 'end', type: 'chapter_end' },
      ]
      const variables: VariableDefinition[] = [
        { id: 'gold', name: 'Gold', type: 'number', defaultValue: 100 },
      ]
      const project = createTestProject(nodes, variables)
      const engine = new GameEngine(project)

      engine.start('stage_1', 'chapter_1')

      const vars = engine.getVariables()
      expect(vars.variables.gold).toBe(150)
    })

    it('should subtract from variable value', () => {
      const nodes: StoryNode[] = [
        { id: 'start', type: 'start', nextNodeId: 'var1' },
        {
          id: 'var1',
          type: 'variable',
          nextNodeId: 'end',
          variableOperations: [
            { target: 'variable', action: 'subtract', variableId: 'gold', value: 30 },
          ],
        },
        { id: 'end', type: 'chapter_end' },
      ]
      const variables: VariableDefinition[] = [
        { id: 'gold', name: 'Gold', type: 'number', defaultValue: 100 },
      ]
      const project = createTestProject(nodes, variables)
      const engine = new GameEngine(project)

      engine.start('stage_1', 'chapter_1')

      const vars = engine.getVariables()
      expect(vars.variables.gold).toBe(70)
    })

    it('should multiply variable value', () => {
      const nodes: StoryNode[] = [
        { id: 'start', type: 'start', nextNodeId: 'var1' },
        {
          id: 'var1',
          type: 'variable',
          nextNodeId: 'end',
          variableOperations: [
            { target: 'variable', action: 'multiply', variableId: 'gold', value: 2 },
          ],
        },
        { id: 'end', type: 'chapter_end' },
      ]
      const variables: VariableDefinition[] = [
        { id: 'gold', name: 'Gold', type: 'number', defaultValue: 50 },
      ]
      const project = createTestProject(nodes, variables)
      const engine = new GameEngine(project)

      engine.start('stage_1', 'chapter_1')

      const vars = engine.getVariables()
      expect(vars.variables.gold).toBe(100)
    })

    it('should use variable reference (useVariableValue)', () => {
      const nodes: StoryNode[] = [
        { id: 'start', type: 'start', nextNodeId: 'var1' },
        {
          id: 'var1',
          type: 'variable',
          nextNodeId: 'end',
          variableOperations: [
            // gold += hp (hp 값만큼 gold 증가)
            {
              target: 'variable',
              action: 'add',
              variableId: 'gold',
              value: 0,
              useVariableValue: true,
              sourceVariableId: 'hp',
            },
          ],
        },
        { id: 'end', type: 'chapter_end' },
      ]
      const variables: VariableDefinition[] = [
        { id: 'gold', name: 'Gold', type: 'number', defaultValue: 50 },
        { id: 'hp', name: 'HP', type: 'number', defaultValue: 100 },
      ]
      const project = createTestProject(nodes, variables)
      const engine = new GameEngine(project)

      engine.start('stage_1', 'chapter_1')

      const vars = engine.getVariables()
      expect(vars.variables.gold).toBe(150) // 50 + 100
    })

    it('should set boolean variable', () => {
      const nodes: StoryNode[] = [
        { id: 'start', type: 'start', nextNodeId: 'var1' },
        {
          id: 'var1',
          type: 'variable',
          nextNodeId: 'end',
          variableOperations: [
            { target: 'variable', action: 'set', variableId: 'bought_item', value: true },
          ],
        },
        { id: 'end', type: 'chapter_end' },
      ]
      const variables: VariableDefinition[] = [
        { id: 'bought_item', name: 'Bought Item', type: 'boolean', defaultValue: false },
      ]
      const project = createTestProject(nodes, variables)
      const engine = new GameEngine(project)

      engine.start('stage_1', 'chapter_1')

      const vars = engine.getVariables()
      expect(vars.variables.bought_item).toBe(true)
    })

    it('should handle array push operation', () => {
      const nodes: StoryNode[] = [
        { id: 'start', type: 'start', nextNodeId: 'var1' },
        {
          id: 'var1',
          type: 'variable',
          nextNodeId: 'end',
          variableOperations: [
            { target: 'variable', action: 'push', variableId: 'inventory', value: 'Sword' },
            { target: 'variable', action: 'push', variableId: 'inventory', value: 'Shield' },
          ],
        },
        { id: 'end', type: 'chapter_end' },
      ]
      const variables: VariableDefinition[] = [
        { id: 'inventory', name: 'Inventory', type: 'array', defaultValue: [], arrayItemType: 'string' },
      ]
      const project = createTestProject(nodes, variables)
      const engine = new GameEngine(project)

      engine.start('stage_1', 'chapter_1')

      const vars = engine.getVariables()
      expect(vars.variables.inventory).toEqual(['Sword', 'Shield'])
    })
  })

  describe('Condition Node', () => {
    it('should branch based on variable condition (>=)', () => {
      const nodes: StoryNode[] = [
        { id: 'start', type: 'start', nextNodeId: 'condition1' },
        {
          id: 'condition1',
          type: 'condition',
          conditionBranches: [
            {
              id: 'branch1',
              condition: { type: 'variable', variableId: 'gold', operator: '>=', value: 100 },
              nextNodeId: 'rich',
            },
          ],
          defaultNextNodeId: 'poor',
        },
        { id: 'rich', type: 'dialogue', text: 'You are rich!' },
        { id: 'poor', type: 'dialogue', text: 'You are poor!' },
      ]
      const variables: VariableDefinition[] = [
        { id: 'gold', name: 'Gold', type: 'number', defaultValue: 150 },
      ]
      const project = createTestProject(nodes, variables)
      const engine = new GameEngine(project)

      engine.start('stage_1', 'chapter_1')

      expect(engine.getCurrentNode()?.text).toBe('You are rich!')
    })

    it('should go to default branch when condition not met', () => {
      const nodes: StoryNode[] = [
        { id: 'start', type: 'start', nextNodeId: 'condition1' },
        {
          id: 'condition1',
          type: 'condition',
          conditionBranches: [
            {
              id: 'branch1',
              condition: { type: 'variable', variableId: 'gold', operator: '>=', value: 100 },
              nextNodeId: 'rich',
            },
          ],
          defaultNextNodeId: 'poor',
        },
        { id: 'rich', type: 'dialogue', text: 'You are rich!' },
        { id: 'poor', type: 'dialogue', text: 'You are poor!' },
      ]
      const variables: VariableDefinition[] = [
        { id: 'gold', name: 'Gold', type: 'number', defaultValue: 50 },
      ]
      const project = createTestProject(nodes, variables)
      const engine = new GameEngine(project)

      engine.start('stage_1', 'chapter_1')

      expect(engine.getCurrentNode()?.text).toBe('You are poor!')
    })

    it('should branch based on boolean condition (==)', () => {
      const nodes: StoryNode[] = [
        { id: 'start', type: 'start', nextNodeId: 'condition1' },
        {
          id: 'condition1',
          type: 'condition',
          conditionBranches: [
            {
              id: 'branch1',
              condition: { type: 'variable', variableId: 'bought_item', operator: '==', value: true },
              nextNodeId: 'bought',
            },
          ],
          defaultNextNodeId: 'not_bought',
        },
        { id: 'bought', type: 'dialogue', text: 'Thanks for buying!' },
        { id: 'not_bought', type: 'dialogue', text: 'Just browsing?' },
      ]
      const variables: VariableDefinition[] = [
        { id: 'bought_item', name: 'Bought Item', type: 'boolean', defaultValue: true },
      ]
      const project = createTestProject(nodes, variables)
      const engine = new GameEngine(project)

      engine.start('stage_1', 'chapter_1')

      expect(engine.getCurrentNode()?.text).toBe('Thanks for buying!')
    })

    it('should check first matching condition in order', () => {
      const nodes: StoryNode[] = [
        { id: 'start', type: 'start', nextNodeId: 'condition1' },
        {
          id: 'condition1',
          type: 'condition',
          conditionBranches: [
            {
              id: 'branch1',
              condition: { type: 'variable', variableId: 'bought_item', operator: '==', value: true },
              nextNodeId: 'bought',
            },
            {
              id: 'branch2',
              condition: { type: 'variable', variableId: 'gold', operator: '>=', value: 100 },
              nextNodeId: 'rich',
            },
          ],
          defaultNextNodeId: 'default',
        },
        { id: 'bought', type: 'dialogue', text: 'Thanks for buying!' },
        { id: 'rich', type: 'dialogue', text: 'You are rich!' },
        { id: 'default', type: 'dialogue', text: 'Default branch' },
      ]
      const variables: VariableDefinition[] = [
        { id: 'bought_item', name: 'Bought Item', type: 'boolean', defaultValue: true },
        { id: 'gold', name: 'Gold', type: 'number', defaultValue: 200 },
      ]
      const project = createTestProject(nodes, variables)
      const engine = new GameEngine(project)

      engine.start('stage_1', 'chapter_1')

      // 첫 번째 조건(bought_item)이 먼저 매칭되어야 함
      expect(engine.getCurrentNode()?.text).toBe('Thanks for buying!')
    })
  })

  describe('Choice Node with Conditions', () => {
    it('should allow choice when condition is met', () => {
      const nodes: StoryNode[] = [
        { id: 'start', type: 'start', nextNodeId: 'choice1' },
        {
          id: 'choice1',
          type: 'choice',
          text: 'What do you want to do?',
          choices: [
            {
              id: 'buy',
              text: 'Buy item (50 gold)',
              nextNodeId: 'bought',
              condition: { type: 'variable', variableId: 'gold', operator: '>=', value: 50 },
            },
            {
              id: 'leave',
              text: 'Leave',
              nextNodeId: 'left',
            },
          ],
        },
        { id: 'bought', type: 'dialogue', text: 'You bought the item!' },
        { id: 'left', type: 'dialogue', text: 'Goodbye!' },
      ]
      const variables: VariableDefinition[] = [
        { id: 'gold', name: 'Gold', type: 'number', defaultValue: 100 },
      ]
      const project = createTestProject(nodes, variables)
      const engine = new GameEngine(project)

      engine.start('stage_1', 'chapter_1')
      expect(engine.getCurrentNode()?.type).toBe('choice')

      // 조건 충족 - 선택 가능
      expect(engine.checkCondition({ type: 'variable', variableId: 'gold', operator: '>=', value: 50 })).toBe(true)

      engine.selectChoice(0) // Buy item
      expect(engine.getCurrentNode()?.text).toBe('You bought the item!')
    })

    it('should block choice when condition is not met', () => {
      const nodes: StoryNode[] = [
        { id: 'start', type: 'start', nextNodeId: 'choice1' },
        {
          id: 'choice1',
          type: 'choice',
          text: 'What do you want to do?',
          choices: [
            {
              id: 'buy',
              text: 'Buy item (50 gold)',
              nextNodeId: 'bought',
              condition: { type: 'variable', variableId: 'gold', operator: '>=', value: 50 },
            },
            {
              id: 'leave',
              text: 'Leave',
              nextNodeId: 'left',
            },
          ],
        },
        { id: 'bought', type: 'dialogue', text: 'You bought the item!' },
        { id: 'left', type: 'dialogue', text: 'Goodbye!' },
      ]
      const variables: VariableDefinition[] = [
        { id: 'gold', name: 'Gold', type: 'number', defaultValue: 30 }, // 부족한 골드
      ]
      const project = createTestProject(nodes, variables)
      const engine = new GameEngine(project)

      engine.start('stage_1', 'chapter_1')

      // 조건 미충족 - 선택 불가능해야 함
      expect(engine.checkCondition({ type: 'variable', variableId: 'gold', operator: '>=', value: 50 })).toBe(false)

      // 조건 미충족 선택지 선택 시도 - 진행되지 않아야 함
      engine.selectChoice(0)
      expect(engine.getCurrentNode()?.type).toBe('choice') // 여전히 choice 노드에 있어야 함
    })

    it('should allow unconditional choice', () => {
      const nodes: StoryNode[] = [
        { id: 'start', type: 'start', nextNodeId: 'choice1' },
        {
          id: 'choice1',
          type: 'choice',
          text: 'What do you want to do?',
          choices: [
            {
              id: 'buy',
              text: 'Buy item (50 gold)',
              nextNodeId: 'bought',
              condition: { type: 'variable', variableId: 'gold', operator: '>=', value: 50 },
            },
            {
              id: 'leave',
              text: 'Leave',
              nextNodeId: 'left',
            },
          ],
        },
        { id: 'bought', type: 'dialogue', text: 'You bought the item!' },
        { id: 'left', type: 'dialogue', text: 'Goodbye!' },
      ]
      const variables: VariableDefinition[] = [
        { id: 'gold', name: 'Gold', type: 'number', defaultValue: 30 },
      ]
      const project = createTestProject(nodes, variables)
      const engine = new GameEngine(project)

      engine.start('stage_1', 'chapter_1')

      // 조건 없는 선택지(Leave)는 선택 가능
      engine.selectChoice(1)
      expect(engine.getCurrentNode()?.text).toBe('Goodbye!')
    })
  })

  describe('Sample Template Scenario', () => {
    it('should correctly branch after browsing (not buying)', () => {
      // 샘플 템플릿 시나리오: 구경만 하기 선택 후 조건 분기
      const nodes: StoryNode[] = [
        { id: 'start', type: 'start', nextNodeId: 'init_vars' },
        {
          id: 'init_vars',
          type: 'variable',
          nextNodeId: 'choice1',
          variableOperations: [
            { target: 'variable', action: 'set', variableId: 'gold', value: 75 },
            { target: 'variable', action: 'set', variableId: 'bought_item', value: false },
          ],
        },
        {
          id: 'choice1',
          type: 'choice',
          text: 'What would you like to do?',
          choices: [
            {
              id: 'buy',
              text: 'Buy item (50 gold)',
              nextNodeId: 'buy_result',
              condition: { type: 'variable', variableId: 'gold', operator: '>=', value: 50 },
            },
            {
              id: 'browse',
              text: 'Just browse',
              nextNodeId: 'browse_result',
            },
          ],
        },
        {
          id: 'buy_result',
          type: 'variable',
          nextNodeId: 'condition1',
          variableOperations: [
            { target: 'variable', action: 'subtract', variableId: 'gold', value: 50 },
            { target: 'variable', action: 'set', variableId: 'bought_item', value: true },
          ],
        },
        {
          id: 'browse_result',
          type: 'dialogue',
          text: 'Take your time~',
          nextNodeId: 'condition1',
        },
        {
          id: 'condition1',
          type: 'condition',
          conditionBranches: [
            {
              id: 'branch_bought',
              condition: { type: 'variable', variableId: 'bought_item', operator: '==', value: true },
              nextNodeId: 'bought_msg',
            },
            {
              id: 'branch_rich',
              condition: { type: 'variable', variableId: 'gold', operator: '>=', value: 100 },
              nextNodeId: 'rich_msg',
            },
          ],
          defaultNextNodeId: 'default_msg',
        },
        { id: 'bought_msg', type: 'dialogue', text: 'Thanks for buying!' },
        { id: 'rich_msg', type: 'dialogue', text: 'You are rich!' },
        { id: 'default_msg', type: 'dialogue', text: 'Just browsing, huh?' },
      ]
      const variables: VariableDefinition[] = [
        { id: 'gold', name: 'Gold', type: 'number', defaultValue: 0 },
        { id: 'bought_item', name: 'Bought Item', type: 'boolean', defaultValue: false },
      ]
      const project = createTestProject(nodes, variables)
      const engine = new GameEngine(project)

      engine.start('stage_1', 'chapter_1')

      // 변수 초기화 후 choice 노드에 있어야 함
      expect(engine.getCurrentNode()?.type).toBe('choice')

      // "Just browse" 선택 (인덱스 1)
      engine.selectChoice(1)
      expect(engine.getCurrentNode()?.text).toBe('Take your time~')

      // 다음으로 진행
      engine.advance()

      // 조건 분기 결과: bought_item이 false이고 gold가 75이므로 default로 가야 함
      expect(engine.getCurrentNode()?.text).toBe('Just browsing, huh?')
    })

    it('should correctly branch after buying', () => {
      const nodes: StoryNode[] = [
        { id: 'start', type: 'start', nextNodeId: 'init_vars' },
        {
          id: 'init_vars',
          type: 'variable',
          nextNodeId: 'choice1',
          variableOperations: [
            { target: 'variable', action: 'set', variableId: 'gold', value: 75 },
            { target: 'variable', action: 'set', variableId: 'bought_item', value: false },
          ],
        },
        {
          id: 'choice1',
          type: 'choice',
          text: 'What would you like to do?',
          choices: [
            {
              id: 'buy',
              text: 'Buy item (50 gold)',
              nextNodeId: 'buy_result',
              condition: { type: 'variable', variableId: 'gold', operator: '>=', value: 50 },
            },
            {
              id: 'browse',
              text: 'Just browse',
              nextNodeId: 'browse_result',
            },
          ],
        },
        {
          id: 'buy_result',
          type: 'variable',
          nextNodeId: 'condition1',
          variableOperations: [
            { target: 'variable', action: 'subtract', variableId: 'gold', value: 50 },
            { target: 'variable', action: 'set', variableId: 'bought_item', value: true },
          ],
        },
        {
          id: 'browse_result',
          type: 'dialogue',
          text: 'Take your time~',
          nextNodeId: 'condition1',
        },
        {
          id: 'condition1',
          type: 'condition',
          conditionBranches: [
            {
              id: 'branch_bought',
              condition: { type: 'variable', variableId: 'bought_item', operator: '==', value: true },
              nextNodeId: 'bought_msg',
            },
            {
              id: 'branch_rich',
              condition: { type: 'variable', variableId: 'gold', operator: '>=', value: 100 },
              nextNodeId: 'rich_msg',
            },
          ],
          defaultNextNodeId: 'default_msg',
        },
        { id: 'bought_msg', type: 'dialogue', text: 'Thanks for buying!' },
        { id: 'rich_msg', type: 'dialogue', text: 'You are rich!' },
        { id: 'default_msg', type: 'dialogue', text: 'Just browsing, huh?' },
      ]
      const variables: VariableDefinition[] = [
        { id: 'gold', name: 'Gold', type: 'number', defaultValue: 0 },
        { id: 'bought_item', name: 'Bought Item', type: 'boolean', defaultValue: false },
      ]
      const project = createTestProject(nodes, variables)
      const engine = new GameEngine(project)

      engine.start('stage_1', 'chapter_1')

      // "Buy item" 선택 (인덱스 0)
      engine.selectChoice(0)

      // 변수 노드는 자동 진행되므로 바로 condition 결과로
      // bought_item이 true이므로 bought_msg로 가야 함
      expect(engine.getCurrentNode()?.text).toBe('Thanks for buying!')

      // 변수 확인
      const vars = engine.getVariables()
      expect(vars.variables.gold).toBe(25) // 75 - 50
      expect(vars.variables.bought_item).toBe(true)
    })
  })

  describe('Comparison Operators', () => {
    it('should evaluate == correctly', () => {
      const nodes: StoryNode[] = [
        { id: 'start', type: 'start', nextNodeId: 'cond' },
        {
          id: 'cond',
          type: 'condition',
          conditionBranches: [
            {
              id: 'b1',
              condition: { type: 'variable', variableId: 'num', operator: '==', value: 5 },
              nextNodeId: 'yes',
            },
          ],
          defaultNextNodeId: 'no',
        },
        { id: 'yes', type: 'dialogue', text: 'Equal' },
        { id: 'no', type: 'dialogue', text: 'Not equal' },
      ]
      const variables: VariableDefinition[] = [
        { id: 'num', name: 'Num', type: 'number', defaultValue: 5 },
      ]
      const project = createTestProject(nodes, variables)
      const engine = new GameEngine(project)

      engine.start('stage_1', 'chapter_1')
      expect(engine.getCurrentNode()?.text).toBe('Equal')
    })

    it('should evaluate != correctly', () => {
      const nodes: StoryNode[] = [
        { id: 'start', type: 'start', nextNodeId: 'cond' },
        {
          id: 'cond',
          type: 'condition',
          conditionBranches: [
            {
              id: 'b1',
              condition: { type: 'variable', variableId: 'num', operator: '!=', value: 5 },
              nextNodeId: 'yes',
            },
          ],
          defaultNextNodeId: 'no',
        },
        { id: 'yes', type: 'dialogue', text: 'Not five' },
        { id: 'no', type: 'dialogue', text: 'Is five' },
      ]
      const variables: VariableDefinition[] = [
        { id: 'num', name: 'Num', type: 'number', defaultValue: 3 },
      ]
      const project = createTestProject(nodes, variables)
      const engine = new GameEngine(project)

      engine.start('stage_1', 'chapter_1')
      expect(engine.getCurrentNode()?.text).toBe('Not five')
    })

    it('should evaluate > correctly', () => {
      const nodes: StoryNode[] = [
        { id: 'start', type: 'start', nextNodeId: 'cond' },
        {
          id: 'cond',
          type: 'condition',
          conditionBranches: [
            {
              id: 'b1',
              condition: { type: 'variable', variableId: 'num', operator: '>', value: 5 },
              nextNodeId: 'yes',
            },
          ],
          defaultNextNodeId: 'no',
        },
        { id: 'yes', type: 'dialogue', text: 'Greater' },
        { id: 'no', type: 'dialogue', text: 'Not greater' },
      ]
      const variables: VariableDefinition[] = [
        { id: 'num', name: 'Num', type: 'number', defaultValue: 10 },
      ]
      const project = createTestProject(nodes, variables)
      const engine = new GameEngine(project)

      engine.start('stage_1', 'chapter_1')
      expect(engine.getCurrentNode()?.text).toBe('Greater')
    })

    it('should evaluate < correctly', () => {
      const nodes: StoryNode[] = [
        { id: 'start', type: 'start', nextNodeId: 'cond' },
        {
          id: 'cond',
          type: 'condition',
          conditionBranches: [
            {
              id: 'b1',
              condition: { type: 'variable', variableId: 'num', operator: '<', value: 5 },
              nextNodeId: 'yes',
            },
          ],
          defaultNextNodeId: 'no',
        },
        { id: 'yes', type: 'dialogue', text: 'Less' },
        { id: 'no', type: 'dialogue', text: 'Not less' },
      ]
      const variables: VariableDefinition[] = [
        { id: 'num', name: 'Num', type: 'number', defaultValue: 3 },
      ]
      const project = createTestProject(nodes, variables)
      const engine = new GameEngine(project)

      engine.start('stage_1', 'chapter_1')
      expect(engine.getCurrentNode()?.text).toBe('Less')
    })

    it('should evaluate <= correctly (equal case)', () => {
      const nodes: StoryNode[] = [
        { id: 'start', type: 'start', nextNodeId: 'cond' },
        {
          id: 'cond',
          type: 'condition',
          conditionBranches: [
            {
              id: 'b1',
              condition: { type: 'variable', variableId: 'num', operator: '<=', value: 5 },
              nextNodeId: 'yes',
            },
          ],
          defaultNextNodeId: 'no',
        },
        { id: 'yes', type: 'dialogue', text: 'Less or equal' },
        { id: 'no', type: 'dialogue', text: 'Greater' },
      ]
      const variables: VariableDefinition[] = [
        { id: 'num', name: 'Num', type: 'number', defaultValue: 5 },
      ]
      const project = createTestProject(nodes, variables)
      const engine = new GameEngine(project)

      engine.start('stage_1', 'chapter_1')
      expect(engine.getCurrentNode()?.text).toBe('Less or equal')
    })
  })
})
