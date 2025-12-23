// 게임 엔진 - 순수 TypeScript, React 의존성 없음 (독립 익스포트 가능)

import type {
  StoryProject,
  StoryStage,
  StoryChapter,
  StoryNode,
  StoryCondition,
  StoryChoiceEffect,
  VariableOperation,
} from '../../../types/story'
import type { GameState, GameVariables, GameHistoryEntry, ActiveImage } from '../../../types/game'
import { DEFAULT_GAME_VARIABLES } from '../../../types/game'

export interface GameEngineOptions {
  onStateChange?: (state: GameState) => void
  onNodeChange?: (node: StoryNode | null) => void
  onGameEnd?: () => void
}

export class GameEngine {
  private project: StoryProject
  private state: GameState
  private options: GameEngineOptions

  constructor(project: StoryProject, options: GameEngineOptions = {}) {
    this.project = project
    this.options = options
    this.state = this.createInitialState()
  }

  // 초기 상태 생성
  private createInitialState(): GameState {
    return {
      currentNodeId: '',
      currentStageId: '',
      currentChapterId: '',
      variables: { ...DEFAULT_GAME_VARIABLES },
      history: [],
      activeImages: [],
      startedAt: Date.now(),
      playTime: 0,
    }
  }

  // 게임 시작
  start(stageId?: string, chapterId?: string): void {
    const stage = stageId
      ? this.project.stages.find((s) => s.id === stageId)
      : this.project.stages[0]

    if (!stage) {
      console.error('No stage found')
      return
    }

    const chapter = chapterId
      ? stage.chapters.find((c) => c.id === chapterId)
      : stage.chapters[0]

    if (!chapter) {
      console.error('No chapter found')
      return
    }

    // startNodeId가 비어있으면 첫 번째 노드 또는 start 타입 노드 찾기
    let startNodeId = chapter.startNodeId
    if (!startNodeId && chapter.nodes.length > 0) {
      const startNode = chapter.nodes.find(n => n.type === 'start')
      startNodeId = startNode?.id || chapter.nodes[0].id
    }

    this.state = {
      ...this.createInitialState(),
      currentStageId: stage.id,
      currentChapterId: chapter.id,
      currentNodeId: startNodeId,
    }

    const currentNode = this.getCurrentNode()
    if (currentNode) {
      this.processNodeEntry(currentNode)
    } else {
      console.warn('No start node found in chapter. Add a Start node to begin the story.')
    }

    this.notifyStateChange()
    this.notifyNodeChange()
  }

  // 현재 Stage 가져오기
  private getCurrentStage(): StoryStage | null {
    return this.project.stages.find((s) => s.id === this.state.currentStageId) || null
  }

  // 현재 Chapter 가져오기
  private getCurrentChapter(): StoryChapter | null {
    const stage = this.getCurrentStage()
    return stage?.chapters.find((c) => c.id === this.state.currentChapterId) || null
  }

  // 현재 노드 가져오기
  getCurrentNode(): StoryNode | null {
    const chapter = this.getCurrentChapter()
    return chapter?.nodes.find((n) => n.id === this.state.currentNodeId) || null
  }

  // ID로 노드 찾기
  private getNodeById(nodeId: string): StoryNode | null {
    const chapter = this.getCurrentChapter()
    return chapter?.nodes.find((n) => n.id === nodeId) || null
  }

  // 노드 진입 시 처리
  private processNodeEntry(node: StoryNode): void {
    // onEnterEffects 적용
    if (node.onEnterEffects) {
      this.applyEffects(node.onEnterEffects)
    }

    // variable 노드면 변수 연산 실행 후 자동 진행
    if (node.type === 'variable') {
      this.executeVariableOperations(node)
      if (node.nextNodeId) {
        this.goToNode(node.nextNodeId)
        return
      }
    }

    // condition 노드면 조건 평가 후 자동 진행
    if (node.type === 'condition') {
      const nextNodeId = this.processConditionNode(node)
      if (nextNodeId) {
        this.goToNode(nextNodeId)
        return
      }
    }

    // image 노드면 이미지 레이어 업데이트 후 자동 진행
    if (node.type === 'image') {
      this.processImageNode(node)
      if (node.nextNodeId) {
        this.goToNode(node.nextNodeId)
        return
      }
    }

    // 히스토리에 추가 (variable, condition, image 제외)
    if (node.type !== 'variable' && node.type !== 'condition' && node.type !== 'image') {
      this.addToHistory(node)
    }
  }

  // 이미지 노드 처리
  private processImageNode(node: StoryNode): void {
    if (!node.imageData) return

    const { resourcePath, layer, layerOrder, alignment, x, y } = node.imageData

    // 빈 리소스 경로면 해당 레이어의 이미지 제거
    if (!resourcePath) {
      this.state.activeImages = this.state.activeImages.filter(
        img => !(img.layer === layer && img.layerOrder === layerOrder)
      )
      return
    }

    // 새 이미지 객체
    const newImage: ActiveImage = {
      id: node.id,
      resourcePath,
      layer,
      layerOrder,
      alignment,
      x,
      y,
    }

    // 같은 레이어+순서에 있는 기존 이미지 제거 후 새 이미지 추가
    this.state.activeImages = [
      ...this.state.activeImages.filter(
        img => !(img.layer === layer && img.layerOrder === layerOrder)
      ),
      newImage,
    ]
  }

  // 다음 노드로 진행 (dialogue, event 등에서 클릭 시)
  advance(): void {
    const currentNode = this.getCurrentNode()
    if (!currentNode) return

    // choice 노드면 advance로 진행 불가 (선택 필요)
    if (currentNode.type === 'choice') {
      return
    }

    // chapter_end면 게임 종료
    if (currentNode.type === 'chapter_end') {
      this.options.onGameEnd?.()
      return
    }

    // 다음 노드로 이동
    if (currentNode.nextNodeId) {
      this.goToNode(currentNode.nextNodeId)
    }
  }

  // 특정 노드로 이동
  private goToNode(nodeId: string): void {
    const node = this.getNodeById(nodeId)
    if (!node) {
      console.error(`Node not found: ${nodeId}`)
      return
    }

    this.state.currentNodeId = nodeId
    this.processNodeEntry(node)
    this.notifyStateChange()
    this.notifyNodeChange()
  }

  // 선택지 선택
  selectChoice(choiceIndex: number): void {
    const currentNode = this.getCurrentNode()
    if (!currentNode || currentNode.type !== 'choice') return
    if (!currentNode.choices || choiceIndex >= currentNode.choices.length) return

    const choice = currentNode.choices[choiceIndex]

    // 조건 체크
    if (choice.condition && !this.evaluateCondition(choice.condition)) {
      return // 조건 불만족
    }

    // 선택 기록
    this.state.variables.choicesMade.push(choice.id)

    // 히스토리에 선택 추가
    this.state.history.push({
      nodeId: currentNode.id,
      type: 'choice',
      content: currentNode.text || '',
      timestamp: Date.now(),
      choiceText: choice.text,
    })

    // 효과 적용
    if (choice.effects) {
      this.applyEffects(choice.effects)
    }

    // 다음 노드로 이동
    if (choice.nextNodeId) {
      this.goToNode(choice.nextNodeId)
    }
  }

  // 조건 평가
  private evaluateCondition(condition: StoryCondition): boolean {
    const vars = this.state.variables

    switch (condition.type) {
      case 'gold':
        return this.checkNumberRange(vars.gold, condition.min, condition.max, condition.value as number)

      case 'hp':
        return this.checkNumberRange(vars.hp, condition.min, condition.max, condition.value as number)

      case 'flag':
        if (condition.flagKey) {
          const flagValue = vars.flags[condition.flagKey]
          if (condition.flagValue !== undefined) {
            return flagValue === condition.flagValue
          }
          return Boolean(flagValue)
        }
        return false

      case 'choice_made':
        return condition.choiceId ? vars.choicesMade.includes(condition.choiceId) : false

      case 'affection':
        if (condition.characterId) {
          const affection = vars.affection[condition.characterId] || 0
          return this.checkNumberRange(affection, condition.min, condition.max, condition.value as number)
        }
        return false

      case 'reputation':
        if (condition.factionId) {
          const reputation = vars.reputation[condition.factionId] || 0
          return this.checkNumberRange(reputation, condition.min, condition.max, condition.value as number)
        }
        return false

      case 'character':
        // 캐릭터 보유 여부 체크 (현재는 항상 true로 처리)
        return true

      case 'has_relic':
        // 렐릭 보유 여부 (현재는 flag로 대체 가능)
        return condition.value ? Boolean(vars.flags[`relic_${condition.value}`]) : false

      default:
        return true
    }
  }

  // 숫자 범위 체크
  private checkNumberRange(
    value: number,
    min?: number,
    max?: number,
    exact?: number
  ): boolean {
    if (exact !== undefined) {
      return value === exact
    }
    if (min !== undefined && value < min) return false
    if (max !== undefined && value > max) return false
    return true
  }

  // 효과 적용
  private applyEffects(effects: StoryChoiceEffect): void {
    const vars = this.state.variables

    // 골드 변화
    if (effects.gold !== undefined) {
      vars.gold += effects.gold
      if (vars.gold < 0) vars.gold = 0
    }

    // HP 변화
    if (effects.hp !== undefined) {
      vars.hp += effects.hp
      if (vars.hp < 0) vars.hp = 0
    }

    // 플래그 설정
    if (effects.setFlags) {
      Object.assign(vars.flags, effects.setFlags)
    }

    // 호감도 변화
    if (effects.affection) {
      for (const change of effects.affection) {
        vars.affection[change.characterId] =
          (vars.affection[change.characterId] || 0) + change.delta
      }
    }

    // 평판 변화
    if (effects.reputation) {
      for (const change of effects.reputation) {
        vars.reputation[change.factionId] =
          (vars.reputation[change.factionId] || 0) + change.delta
      }
    }
  }

  // 변수 연산 실행 (variable 노드용)
  private executeVariableOperations(node: StoryNode): void {
    if (!node.variableOperations) return

    for (const op of node.variableOperations) {
      this.executeVariableOperation(op)
    }
  }

  // 단일 변수 연산 실행
  private executeVariableOperation(op: VariableOperation): void {
    const vars = this.state.variables
    const numValue = typeof op.value === 'number' ? op.value : 0

    switch (op.target) {
      case 'gold':
        vars.gold = this.applyAction(vars.gold, op.action, numValue)
        break

      case 'hp':
        vars.hp = this.applyAction(vars.hp, op.action, numValue)
        break

      case 'flag':
        if (op.key) {
          if (op.action === 'set') {
            vars.flags[op.key] = op.value
          } else if (typeof vars.flags[op.key] === 'number') {
            vars.flags[op.key] = this.applyAction(vars.flags[op.key] as number, op.action, numValue)
          }
        }
        break

      case 'affection':
        if (op.characterId) {
          vars.affection[op.characterId] = this.applyAction(
            vars.affection[op.characterId] || 0,
            op.action,
            numValue
          )
        }
        break

      case 'reputation':
        if (op.factionId) {
          vars.reputation[op.factionId] = this.applyAction(
            vars.reputation[op.factionId] || 0,
            op.action,
            numValue
          )
        }
        break
    }
  }

  // 연산 적용
  private applyAction(current: number, action: string, value: number): number {
    switch (action) {
      case 'set':
        return value
      case 'add':
        return current + value
      case 'subtract':
        return current - value
      case 'multiply':
        return current * value
      default:
        return current
    }
  }

  // 조건 분기 처리 (condition 노드용)
  private processConditionNode(node: StoryNode): string | null {
    if (!node.conditionBranches) return node.defaultNextNodeId || null

    for (const branch of node.conditionBranches) {
      if (this.evaluateCondition(branch.condition)) {
        return branch.nextNodeId || null
      }
    }

    return node.defaultNextNodeId || null
  }

  // 히스토리에 추가
  private addToHistory(node: StoryNode): void {
    this.state.history.push({
      nodeId: node.id,
      type: node.type,
      content: node.text || '',
      speaker: node.speaker,
      timestamp: Date.now(),
    })

    // 최대 100개까지만 유지
    if (this.state.history.length > 100) {
      this.state.history = this.state.history.slice(-100)
    }
  }

  // 상태 변경 알림
  private notifyStateChange(): void {
    this.options.onStateChange?.({ ...this.state })
  }

  // 노드 변경 알림
  private notifyNodeChange(): void {
    this.options.onNodeChange?.(this.getCurrentNode())
  }

  // 상태 가져오기
  getState(): GameState {
    return { ...this.state }
  }

  // 변수 가져오기
  getVariables(): GameVariables {
    return { ...this.state.variables }
  }

  // 히스토리 가져오기
  getHistory(): GameHistoryEntry[] {
    return [...this.state.history]
  }

  // 세이브 (JSON 문자열 반환)
  save(): string {
    return JSON.stringify({
      ...this.state,
      playTime: this.state.playTime + (Date.now() - this.state.startedAt),
    })
  }

  // 로드
  load(saveData: string): void {
    try {
      const loaded = JSON.parse(saveData) as GameState
      this.state = {
        ...loaded,
        startedAt: Date.now(),
      }
      this.notifyStateChange()
      this.notifyNodeChange()
    } catch (e) {
      console.error('Failed to load save data:', e)
    }
  }

  // 재시작
  restart(): void {
    this.start(this.state.currentStageId, this.state.currentChapterId)
  }
}
