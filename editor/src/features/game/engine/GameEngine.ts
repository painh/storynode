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
  private imageInstanceCounter = 0  // 이미지 인스턴스 카운터 (애니메이션 재생용)

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

    // 프로젝트에 선언된 전역 변수들의 초기값 적용
    if (this.project.variables) {
      for (const varDef of this.project.variables) {
        this.state.variables.variables[varDef.id] = varDef.defaultValue
      }
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

  // 프로젝트 정보 가져오기 (게임에서 Project.xxx로 접근 가능)
  getProjectInfo(): { name: string; version: string; gameMode: string; theme: string } {
    return {
      name: this.project.name,
      version: this.project.version,
      gameMode: this.project.gameSettings?.defaultGameMode || 'visualNovel',
      theme: this.project.gameSettings?.defaultThemeId || 'dark',
    }
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

    // start 노드면 자동으로 다음 노드로 진행
    if (node.type === 'start') {
      if (node.nextNodeId) {
        this.goToNode(node.nextNodeId)
        return
      }
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

    // image 노드면 이미지 레이어 업데이트 후 효과 재생
    if (node.type === 'image') {
      this.processImageNode(node)
      // 히스토리에 이미지 추가 (텍스트 어드벤처 모드용)
      this.addImageToHistory(node)

      // 효과가 있으면 효과 완료 후 진행, 없으면 즉시 진행
      const effectDuration = node.imageData?.effectDuration || 0
      // 다중 효과 지원: effects 배열 우선, 없으면 기존 effect 사용
      const effects = node.imageData?.effects || []
      const legacyEffect = node.imageData?.effect && node.imageData.effect !== 'none' ? node.imageData.effect : null
      const hasEffect = effects.length > 0 || legacyEffect

      console.log('[GameEngine] Image node processing:', {
        nodeId: node.id,
        effects: effects.length > 0 ? effects : legacyEffect,
        effectDuration,
        hasEffect,
        nextNodeId: node.nextNodeId,
      })

      if (hasEffect && effectDuration > 0 && node.nextNodeId) {
        console.log(`[GameEngine] Waiting ${effectDuration}ms for effects: ${effects.length > 0 ? effects.join(', ') : legacyEffect}`)
        // 효과 재생 중에는 대기, 완료 후 다음 노드로
        setTimeout(() => {
          console.log(`[GameEngine] Effect timer completed, advancing to: ${node.nextNodeId}`)
          if (node.nextNodeId) {
            this.goToNode(node.nextNodeId)
          }
        }, effectDuration)
        return
      }

      // 효과가 없거나 duration이 0이면 즉시 진행
      console.log('[GameEngine] No effect or duration=0, advancing immediately')
      if (node.nextNodeId) {
        this.goToNode(node.nextNodeId)
        return
      }
    }

    // 히스토리에 추가 (variable, condition 제외, image는 별도 처리)
    if (node.type !== 'variable' && node.type !== 'condition' && node.type !== 'image') {
      this.addToHistory(node)
    }
  }

  // 이미지 노드 처리
  private processImageNode(node: StoryNode): void {
    if (!node.imageData) return

    const { resourcePath, layer, layerOrder, exitEffect, exitEffectDuration, transitionTiming = 'sequential' } = node.imageData

    // 빈 리소스 경로면 해당 레이어의 이미지 제거
    if (!resourcePath) {
      this.state.activeImages = this.state.activeImages.filter(
        img => !(img.layer === layer && img.layerOrder === layerOrder)
      )
      return
    }

    // 기존 이미지 찾기
    const existingImage = this.state.activeImages.find(
      img => img.layer === layer && img.layerOrder === layerOrder && !img.isExiting
    )

    // 퇴장 이펙트 처리
    if (existingImage && exitEffect && exitEffect !== 'none') {
      // 기존 이미지를 퇴장 상태로 변경
      existingImage.isExiting = true
      existingImage.exitEffect = exitEffect
      existingImage.exitEffectDuration = exitEffectDuration

      // 퇴장 완료 후 제거
      const exitDuration = exitEffectDuration || 500
      setTimeout(() => {
        this.state.activeImages = this.state.activeImages.filter(
          img => img !== existingImage
        )
        this.notifyStateChange()
      }, exitDuration)

      if (transitionTiming === 'sequential') {
        // 순차: 퇴장 완료 후 새 이미지 추가
        setTimeout(() => {
          this.addNewImage(node)
          this.notifyStateChange()
        }, exitDuration)
        return
      }
      // crossfade: 퇴장과 동시에 새 이미지 추가 (아래에서 처리)
    } else if (existingImage) {
      // 퇴장 이펙트 없이 기존 이미지 즉시 제거
      this.state.activeImages = this.state.activeImages.filter(
        img => img !== existingImage
      )
    }

    // 새 이미지 즉시 추가 (crossfade 또는 퇴장 이펙트 없는 경우)
    this.addNewImage(node)
  }

  // 새 이미지 추가 헬퍼 함수
  private addNewImage(node: StoryNode): void {
    if (!node.imageData) return

    const { resourcePath, layer, layerOrder, alignment, x, y, flipHorizontal, effect, effects, effectDuration } = node.imageData

    this.imageInstanceCounter++
    const newImage: ActiveImage = {
      id: node.id,
      instanceId: this.imageInstanceCounter,
      resourcePath,
      layer,
      layerOrder,
      alignment,
      x,
      y,
      flipHorizontal,
      effect,
      effects,
      effectDuration,
    }

    // 같은 레이어+순서에 있는 기존 이미지 (퇴장 중 아닌 것) 제거 후 새 이미지 추가
    this.state.activeImages = [
      ...this.state.activeImages.filter(
        img => !(img.layer === layer && img.layerOrder === layerOrder && !img.isExiting)
      ),
      newImage,
    ]
  }

  // 이미지를 히스토리에 추가 (텍스트 어드벤처 모드용)
  private addImageToHistory(node: StoryNode): void {
    if (!node.imageData) return

    // 중복 방지: 같은 이미지 노드가 연속으로 추가되는 것을 방지
    const lastEntry = this.state.history[this.state.history.length - 1]
    if (lastEntry && lastEntry.nodeId === node.id && lastEntry.type === 'image') {
      return
    }

    const { resourcePath, layer, effect, effects, effectDuration } = node.imageData
    const isRemoval = !resourcePath

    this.state.history.push({
      nodeId: node.id,
      type: 'image',
      content: isRemoval ? `[이미지 제거: ${layer}]` : '',
      timestamp: Date.now(),
      imageData: {
        resourcePath: resourcePath || '',
        layer,
        isRemoval,
        effect,
        effects,  // 다중 효과 지원
        effectDuration,
      },
    })

    // 최대 100개까지만 유지
    if (this.state.history.length > 100) {
      this.state.history = this.state.history.slice(-100)
    }
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
      case 'hp':
        // 레거시: variables에서 같은 이름의 변수를 찾음
        const legacyValue = vars.variables[condition.type]
        if (typeof legacyValue === 'number') {
          return this.checkNumberRange(legacyValue, condition.min, condition.max, condition.value as number)
        }
        console.warn(`Legacy condition type "${condition.type}" - define a variable with this name`)
        return true

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
        // 레거시: variables에서 "{characterId}_affection" 변수를 찾음
        if (condition.characterId) {
          const affectionVar = vars.variables[`${condition.characterId}_affection`]
          const affection = typeof affectionVar === 'number' ? affectionVar : 0
          return this.checkNumberRange(affection, condition.min, condition.max, condition.value as number)
        }
        return false

      case 'reputation':
        // 레거시: variables에서 "{factionId}_reputation" 변수를 찾음
        if (condition.factionId) {
          const reputationVar = vars.variables[`${condition.factionId}_reputation`]
          const reputation = typeof reputationVar === 'number' ? reputationVar : 0
          return this.checkNumberRange(reputation, condition.min, condition.max, condition.value as number)
        }
        return false

      case 'character':
        // 캐릭터 보유 여부 체크 (현재는 항상 true로 처리)
        return true

      case 'has_relic':
        // 렐릭 보유 여부 (현재는 flag로 대체 가능)
        return condition.value ? Boolean(vars.flags[`relic_${condition.value}`]) : false

      case 'variable':
        if (condition.variableId) {
          const varValue = vars.variables[condition.variableId]
          const compareValue = condition.value
          const operator = condition.operator || '=='
          return this.compareValues(varValue, operator, compareValue)
        }
        return false

      default:
        return true
    }
  }

  // 값 비교 (variable 조건용)
  private compareValues(
    left: boolean | number | string | Array<boolean | number | string> | undefined,
    operator: string,
    right: number | string | boolean | undefined
  ): boolean {
    // 배열은 길이로 비교
    if (Array.isArray(left)) {
      left = left.length
    }
    
    // undefined 처리
    if (left === undefined) {
      if (typeof right === 'number') left = 0
      else if (typeof right === 'boolean') left = false
      else if (typeof right === 'string') left = ''
      else left = false
    }

    switch (operator) {
      case '==':
        return left == right
      case '!=':
        return left != right
      case '>':
        return typeof left === 'number' && typeof right === 'number' && left > right
      case '>=':
        return typeof left === 'number' && typeof right === 'number' && left >= right
      case '<':
        return typeof left === 'number' && typeof right === 'number' && left < right
      case '<=':
        return typeof left === 'number' && typeof right === 'number' && left <= right
      default:
        return false
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

  // 효과 적용 (레거시 - 선택지 효과용)
  private applyEffects(effects: StoryChoiceEffect): void {
    const vars = this.state.variables

    // 플래그 설정
    if (effects.setFlags) {
      Object.assign(vars.flags, effects.setFlags)
    }

    // 레거시 효과들은 경고 출력
    if (effects.gold !== undefined || effects.hp !== undefined) {
      console.warn('Legacy effects (gold/hp) - use variable operations instead')
    }
    if (effects.affection?.length || effects.reputation?.length) {
      console.warn('Legacy effects (affection/reputation) - use variable operations instead')
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
    
    // 변수 참조인 경우 sourceVariableId에서 값 가져오기
    let operandValue = op.value
    if (op.useVariableValue && op.sourceVariableId) {
      const sourceValue = vars.variables[op.sourceVariableId]
      if (sourceValue !== undefined) {
        operandValue = sourceValue as number | string | boolean
      }
    }
    
    const numValue = typeof operandValue === 'number' ? operandValue : 0

    switch (op.target) {
      case 'variable':
        if (op.variableId) {
          const currentValue = vars.variables[op.variableId]

          // 배열 연산 처리
          if (Array.isArray(currentValue)) {
            this.executeArrayOperation(op.variableId, op.action, operandValue, op.index)
          } else if (op.action === 'set') {
            vars.variables[op.variableId] = operandValue
          } else if (typeof currentValue === 'number') {
            vars.variables[op.variableId] = this.applyAction(currentValue, op.action, numValue)
          } else if (typeof currentValue === 'string' && op.action === 'add') {
            // 문자열 더하기 (concatenation)
            vars.variables[op.variableId] = currentValue + String(operandValue)
          }
        }
        break

      case 'flag':
        // 레거시 호환
        if (op.key) {
          if (op.action === 'set') {
            vars.flags[op.key] = operandValue
          } else if (typeof vars.flags[op.key] === 'number') {
            vars.flags[op.key] = this.applyAction(vars.flags[op.key] as number, op.action, numValue)
          }
        }
        break

      // 레거시: gold, hp, affection, reputation은 이제 variable로 처리
      default:
        console.warn(`Legacy variable target "${op.target}" - use variable instead`)
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

  // 배열 연산 실행
  private executeArrayOperation(
    variableId: string,
    action: string,
    value: boolean | number | string,
    index?: number
  ): void {
    const vars = this.state.variables
    const arr = vars.variables[variableId]
    if (!Array.isArray(arr)) return

    switch (action) {
      case 'push':
        arr.push(value)
        break
      case 'pop':
        arr.pop()
        break
      case 'removeAt':
        if (index !== undefined && index >= 0 && index < arr.length) {
          arr.splice(index, 1)
        }
        break
      case 'setAt':
        if (index !== undefined && index >= 0 && index < arr.length) {
          arr[index] = value
        }
        break
      case 'clear':
        vars.variables[variableId] = []
        break
      case 'set':
        // 전체 배열 교체 (value가 배열이어야 함)
        if (Array.isArray(value)) {
          vars.variables[variableId] = value
        }
        break
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
    // 중복 방지: 같은 노드가 연속으로 추가되는 것을 방지
    const lastEntry = this.state.history[this.state.history.length - 1]
    if (lastEntry && lastEntry.nodeId === node.id && lastEntry.type === node.type) {
      return
    }

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

  // 조건 평가 (외부에서 호출 가능)
  checkCondition(condition: StoryCondition): boolean {
    return this.evaluateCondition(condition)
  }

  // 텍스트 내 변수 치환 ({{변수명}} 또는 {{변수ID}} 형식)
  interpolateText(text: string): string {
    if (!text) return text
    
    return text.replace(/\{\{([^}]+)\}\}/g, (match, varNameOrId) => {
      const trimmed = varNameOrId.trim()
      const vars = this.state.variables.variables
      
      // 1. 변수 ID로 먼저 찾기
      if (vars[trimmed] !== undefined) {
        const value = vars[trimmed]
        return Array.isArray(value) ? value.join(', ') : String(value)
      }
      
      // 2. 변수 이름으로 찾기 (프로젝트 변수 정의에서)
      if (this.project.variables) {
        const varDef = this.project.variables.find(v => v.name === trimmed)
        if (varDef && vars[varDef.id] !== undefined) {
          const value = vars[varDef.id]
          return Array.isArray(value) ? value.join(', ') : String(value)
        }
      }
      
      // 3. 찾지 못하면 원본 유지
      return match
    })
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
