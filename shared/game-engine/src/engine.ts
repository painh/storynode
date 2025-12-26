// StoryNode Game Engine
// Core game logic for running story projects

import type {
  StoryProject,
  Stage,
  Chapter,
  StoryNode,
  GameState,
  GameVariables,
  GameEngineOptions,
  Condition,
  Effects,
  VariableOperation,
  ImageNode,
  ConditionNode,
  VariableNode,
  ChoiceNode,
} from './types';

const DEFAULT_GAME_VARIABLES: GameVariables = {
  gold: 0,
  hp: 100,
  flags: {},
  affection: {},
  reputation: {},
  choicesMade: [],
};

export class GameEngine {
  private project: StoryProject;
  private options: GameEngineOptions;
  private state: GameState;
  private imageInstanceCounter: number;

  constructor(project: StoryProject, options: GameEngineOptions = {}) {
    this.project = project;
    this.options = options;
    this.state = this.createInitialState();
    this.imageInstanceCounter = 0;
  }

  private createInitialState(): GameState {
    // Get initial variable values from project settings
    const projectVars = this.project.variables || {};

    return {
      currentNodeId: '',
      currentStageId: '',
      currentChapterId: '',
      variables: {
        gold: projectVars.gold ?? DEFAULT_GAME_VARIABLES.gold,
        hp: projectVars.hp ?? DEFAULT_GAME_VARIABLES.hp,
        flags: { ...(projectVars.flags || {}) },
        affection: {},
        reputation: {},
        choicesMade: [],
      },
      history: [],
      activeImages: [],
      startedAt: Date.now(),
      playTime: 0,
    };
  }

  start(stageId?: string, chapterId?: string): void {
    const stage = stageId
      ? this.project.stages.find((s) => s.id === stageId)
      : this.project.stages[0];

    if (!stage) {
      console.error('No stage found');
      return;
    }

    const chapter = chapterId
      ? stage.chapters.find((c) => c.id === chapterId)
      : stage.chapters[0];

    if (!chapter) {
      console.error('No chapter found');
      return;
    }

    let startNodeId = chapter.startNodeId;
    if (!startNodeId && chapter.nodes.length > 0) {
      const startNode = chapter.nodes.find((n) => n.type === 'start');
      startNodeId = startNode?.id || chapter.nodes[0].id;
    }

    this.state = {
      ...this.createInitialState(),
      currentStageId: stage.id,
      currentChapterId: chapter.id,
      currentNodeId: startNodeId || '',
    };

    const currentNode = this.getCurrentNode();
    if (currentNode) {
      this.processNodeEntry(currentNode);
    }

    this.notifyStateChange();
    this.notifyNodeChange();
  }

  getCurrentStage(): Stage | null {
    return this.project.stages.find((s) => s.id === this.state.currentStageId) || null;
  }

  getCurrentChapter(): Chapter | null {
    const stage = this.getCurrentStage();
    return stage?.chapters.find((c) => c.id === this.state.currentChapterId) || null;
  }

  getCurrentNode(): StoryNode | null {
    const chapter = this.getCurrentChapter();
    return chapter?.nodes.find((n) => n.id === this.state.currentNodeId) || null;
  }

  getNodeById(nodeId: string): StoryNode | null {
    const chapter = this.getCurrentChapter();
    return chapter?.nodes.find((n) => n.id === nodeId) || null;
  }

  private processNodeEntry(node: StoryNode): void {
    if (node.onEnterEffects) {
      this.applyEffects(node.onEnterEffects);
    }

    if (node.type === 'variable') {
      this.executeVariableOperations(node as VariableNode);
      if (node.nextNodeId) {
        this.goToNode(node.nextNodeId);
        return;
      }
    }

    if (node.type === 'condition') {
      const nextNodeId = this.processConditionNode(node as ConditionNode);
      if (nextNodeId) {
        this.goToNode(nextNodeId);
        return;
      }
    }

    if (node.type === 'image') {
      const imageNode = node as ImageNode;
      this.processImageNode(imageNode);
      this.addImageToHistory(imageNode);

      const effectDuration = imageNode.imageData?.effectDuration || 0;
      const effects = imageNode.imageData?.effects || [];
      const legacyEffect =
        imageNode.imageData?.effect && imageNode.imageData.effect !== 'none'
          ? imageNode.imageData.effect
          : null;
      const hasEffect = effects.length > 0 || legacyEffect;

      if (hasEffect && effectDuration > 0 && node.nextNodeId) {
        setTimeout(() => {
          if (node.nextNodeId) {
            this.goToNode(node.nextNodeId);
          }
        }, effectDuration);
        return;
      }

      if (node.nextNodeId) {
        this.goToNode(node.nextNodeId);
        return;
      }
    }

    if (node.type !== 'variable' && node.type !== 'condition' && node.type !== 'image') {
      this.addToHistory(node);
    }
  }

  private processImageNode(node: ImageNode): void {
    if (!node.imageData) return;

    const { resourcePath, layer, layerOrder, alignment, x, y, flipHorizontal, objectFit, effect, effects, effectDuration } =
      node.imageData;

    if (!resourcePath) {
      this.state.activeImages = this.state.activeImages.filter(
        (img) => !(img.layer === layer && img.layerOrder === layerOrder)
      );
      return;
    }

    this.imageInstanceCounter++;
    const newImage = {
      id: node.id,
      instanceId: this.imageInstanceCounter,
      resourcePath,
      layer,
      layerOrder,
      alignment,
      x,
      y,
      flipHorizontal,
      objectFit,
      effect,
      effects,
      effectDuration,
    };

    this.state.activeImages = [
      ...this.state.activeImages.filter((img) => !(img.layer === layer && img.layerOrder === layerOrder)),
      newImage,
    ];
  }

  private addImageToHistory(node: ImageNode): void {
    if (!node.imageData) return;

    const { resourcePath, layer, effect, effects, effectDuration } = node.imageData;
    const isRemoval = !resourcePath;

    this.state.history.push({
      nodeId: node.id,
      type: 'image',
      content: isRemoval ? '[Image removed]' : '',
      timestamp: Date.now(),
      imageData: {
        resourcePath: resourcePath || '',
        layer,
        isRemoval,
        effect,
        effects,
        effectDuration,
      },
    });

    if (this.state.history.length > 100) {
      this.state.history = this.state.history.slice(-100);
    }
  }

  advance(): void {
    const currentNode = this.getCurrentNode();
    if (!currentNode) return;

    if (currentNode.type === 'choice') return;

    if (currentNode.type === 'chapter_end') {
      this.options.onGameEnd?.();
      return;
    }

    if (currentNode.nextNodeId) {
      this.goToNode(currentNode.nextNodeId);
    }
  }

  goToNode(nodeId: string): void {
    const node = this.getNodeById(nodeId);
    if (!node) {
      console.error('Node not found:', nodeId);
      return;
    }

    this.state.currentNodeId = nodeId;
    this.processNodeEntry(node);
    this.notifyStateChange();
    this.notifyNodeChange();
  }

  selectChoice(choiceIndex: number): void {
    const currentNode = this.getCurrentNode();
    if (!currentNode || currentNode.type !== 'choice') return;

    const choiceNode = currentNode as ChoiceNode;
    if (!choiceNode.choices || choiceIndex >= choiceNode.choices.length) return;

    const choice = choiceNode.choices[choiceIndex];

    if (choice.condition && !this.evaluateCondition(choice.condition)) {
      return;
    }

    this.state.variables.choicesMade.push(choice.id);

    this.state.history.push({
      nodeId: currentNode.id,
      type: 'choice',
      content: currentNode.text || '',
      timestamp: Date.now(),
      choiceText: choice.text,
    });

    if (choice.effects) {
      this.applyEffects(choice.effects);
    }

    if (choice.nextNodeId) {
      this.goToNode(choice.nextNodeId);
    }
  }

  evaluateCondition(condition: Condition): boolean {
    const vars = this.state.variables;

    switch (condition.type) {
      case 'gold':
        return this.checkNumberRange(vars.gold, condition.min, condition.max, condition.value);
      case 'hp':
        return this.checkNumberRange(vars.hp, condition.min, condition.max, condition.value);
      case 'flag':
        if (condition.flagKey) {
          const flagValue = vars.flags[condition.flagKey];
          if (condition.flagValue !== undefined) {
            return flagValue === condition.flagValue;
          }
          return Boolean(flagValue);
        }
        return false;
      case 'choice_made':
        return condition.choiceId ? vars.choicesMade.includes(condition.choiceId) : false;
      case 'affection':
        if (condition.characterId) {
          const affection = vars.affection[condition.characterId] || 0;
          return this.checkNumberRange(affection, condition.min, condition.max, condition.value);
        }
        return false;
      case 'reputation':
        if (condition.factionId) {
          const reputation = vars.reputation[condition.factionId] || 0;
          return this.checkNumberRange(reputation, condition.min, condition.max, condition.value);
        }
        return false;
      default:
        return true;
    }
  }

  private checkNumberRange(value: number, min?: number, max?: number, exact?: number): boolean {
    if (exact !== undefined) return value === exact;
    if (min !== undefined && value < min) return false;
    if (max !== undefined && value > max) return false;
    return true;
  }

  private applyEffects(effects: Effects): void {
    const vars = this.state.variables;

    if (effects.gold !== undefined) {
      vars.gold += effects.gold;
      if (vars.gold < 0) vars.gold = 0;
    }

    if (effects.hp !== undefined) {
      vars.hp += effects.hp;
      if (vars.hp < 0) vars.hp = 0;
    }

    if (effects.setFlags) {
      Object.assign(vars.flags, effects.setFlags);
    }

    if (effects.affection) {
      for (const change of effects.affection) {
        vars.affection[change.characterId] = (vars.affection[change.characterId] || 0) + change.delta;
      }
    }

    if (effects.reputation) {
      for (const change of effects.reputation) {
        vars.reputation[change.factionId] = (vars.reputation[change.factionId] || 0) + change.delta;
      }
    }
  }

  private executeVariableOperations(node: VariableNode): void {
    if (!node.variableOperations) return;
    for (const op of node.variableOperations) {
      this.executeVariableOperation(op);
    }
  }

  private executeVariableOperation(op: VariableOperation): void {
    const vars = this.state.variables;
    const numValue = typeof op.value === 'number' ? op.value : 0;

    switch (op.target) {
      case 'gold':
        vars.gold = this.applyAction(vars.gold, op.action, numValue);
        break;
      case 'hp':
        vars.hp = this.applyAction(vars.hp, op.action, numValue);
        break;
      case 'flag':
        if (op.key) {
          if (op.action === 'set') {
            vars.flags[op.key] = op.value;
          } else if (typeof vars.flags[op.key] === 'number') {
            vars.flags[op.key] = this.applyAction(vars.flags[op.key] as number, op.action, numValue);
          }
        }
        break;
      case 'affection':
        if (op.characterId) {
          vars.affection[op.characterId] = this.applyAction(vars.affection[op.characterId] || 0, op.action, numValue);
        }
        break;
      case 'reputation':
        if (op.factionId) {
          vars.reputation[op.factionId] = this.applyAction(vars.reputation[op.factionId] || 0, op.action, numValue);
        }
        break;
    }
  }

  private applyAction(current: number, action: string, value: number): number {
    switch (action) {
      case 'set':
        return value;
      case 'add':
        return current + value;
      case 'subtract':
        return current - value;
      case 'multiply':
        return current * value;
      default:
        return current;
    }
  }

  private processConditionNode(node: ConditionNode): string | null {
    if (!node.conditionBranches) return node.defaultNextNodeId || null;

    for (const branch of node.conditionBranches) {
      if (this.evaluateCondition(branch.condition)) {
        return branch.nextNodeId || null;
      }
    }

    return node.defaultNextNodeId || null;
  }

  private addToHistory(node: StoryNode): void {
    // Prevent duplicate entries
    const lastEntry = this.state.history[this.state.history.length - 1];
    if (lastEntry && lastEntry.nodeId === node.id && lastEntry.type === node.type) {
      return;
    }

    this.state.history.push({
      nodeId: node.id,
      type: node.type,
      content: node.text || '',
      speaker: 'speaker' in node ? node.speaker : undefined,
      timestamp: Date.now(),
    });

    if (this.state.history.length > 100) {
      this.state.history = this.state.history.slice(-100);
    }
  }

  private notifyStateChange(): void {
    this.options.onStateChange?.({ ...this.state });
  }

  private notifyNodeChange(): void {
    this.options.onNodeChange?.(this.getCurrentNode());
  }

  getState(): GameState {
    return { ...this.state };
  }

  getVariables(): GameVariables {
    return { ...this.state.variables };
  }

  getHistory() {
    return [...this.state.history];
  }

  restart(): void {
    this.start(this.state.currentStageId, this.state.currentChapterId);
  }

  getProject(): StoryProject {
    return this.project;
  }
}
