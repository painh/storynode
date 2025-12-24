// 게임 플레이어 HTML 템플릿 생성
// 프로젝트 폴더 구조를 그대로 사용하는 standalone HTML 플레이어

/**
 * 게임 플레이어 HTML 생성 (폴더 기반)
 * fetch로 project.json, stage.json, chapter.json을 로드
 */
export function generateGamePlayerHtml(): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Story Player</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&family=Noto+Serif+KR:wght@400;700&family=Press+Start+2P&family=Orbitron:wght@400;700&display=swap" rel="stylesheet">
  <style>
${getStyles()}
  </style>
</head>
<body>
  <div id="app">
    <div id="loading">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>
  </div>
  <script>
${getGameEngineScript()}
${getPlayerScript()}
  </script>
</body>
</html>`
}

function getStyles(): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Noto Sans KR', sans-serif;
      background: var(--bg-color, #1a1a1a);
      color: var(--text-color, #ffffff);
      min-height: 100vh;
      overflow: hidden;
    }

    #app {
      width: 100vw;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* Loading */
    #loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      gap: 20px;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(255, 255, 255, 0.2);
      border-top-color: #FFB74D;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Header */
    .game-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 20px;
      background: rgba(0, 0, 0, 0.8);
      border-bottom: 1px solid #404040;
    }

    .game-header h1 {
      font-size: 16px;
      color: #FFB74D;
    }

    .game-controls {
      display: flex;
      gap: 10px;
    }

    .game-controls select, .game-controls button {
      padding: 6px 12px;
      background: #2a2a2a;
      border: 1px solid #404040;
      color: #fff;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    .game-controls select:hover, .game-controls button:hover {
      background: #3a3a3a;
    }

    /* Game Screen */
    .game-screen {
      flex: 1;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }

    /* Image Layers */
    .image-layers {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
    }

    .image-layer {
      position: absolute;
      width: 100%;
      height: 100%;
    }

    .image-layer.background {
      z-index: 1;
    }

    .image-layer.character {
      z-index: 2;
    }

    .image-layer img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .image-layer.background img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-layer.character {
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }

    .image-layer.character img {
      max-height: 80%;
    }

    /* Dialogue Box */
    .dialogue-box {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--dialogue-bg, rgba(30, 30, 30, 0.95));
      border-top: 2px solid var(--dialogue-border, #404040);
      padding: 20px;
      min-height: 180px;
      z-index: 10;
    }

    .speaker-name {
      display: inline-block;
      background: var(--speaker-bg, rgba(255, 183, 77, 0.15));
      color: var(--speaker-color, #FFB74D);
      padding: 4px 12px;
      border-radius: 4px;
      margin-bottom: 10px;
      font-weight: bold;
    }

    .dialogue-text {
      font-size: 18px;
      line-height: 1.8;
      color: var(--text-color, #ffffff);
      min-height: 60px;
    }

    .continue-indicator {
      position: absolute;
      bottom: 15px;
      right: 20px;
      color: var(--accent-color, #FFB74D);
      font-size: 14px;
      animation: blink 1s infinite;
    }

    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0.3; }
    }

    /* Choices */
    .choices-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 15px;
    }

    .choice-button {
      padding: 12px 20px;
      background: var(--choice-bg, #2a2a2a);
      border: 1px solid var(--choice-border, #505050);
      color: var(--choice-text, #ffffff);
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      text-align: left;
      transition: all 0.2s;
    }

    .choice-button:hover {
      background: var(--choice-hover, #3a3a3a);
      border-color: var(--accent-color, #FFB74D);
    }

    .choice-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Text Adventure Mode */
    .text-adventure {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .stats-bar {
      display: flex;
      gap: 20px;
      padding: 10px 20px;
      background: rgba(0, 0, 0, 0.5);
      font-size: 14px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .history-log {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }

    .history-entry {
      margin-bottom: 15px;
      padding: 10px;
      border-radius: 6px;
    }

    .history-entry.dialogue {
      background: rgba(255, 255, 255, 0.05);
    }

    .history-entry .speaker {
      color: var(--speaker-color, #FFB74D);
      font-weight: bold;
      margin-bottom: 5px;
    }

    .history-entry .content {
      line-height: 1.6;
    }

    .history-entry.choice {
      background: rgba(255, 183, 77, 0.1);
      border-left: 3px solid var(--accent-color, #FFB74D);
    }

    .history-entry .choice-text {
      color: var(--accent-color, #FFB74D);
      font-style: italic;
    }

    .history-entry.image img {
      max-width: 300px;
      max-height: 200px;
      border-radius: 6px;
      margin-top: 10px;
    }

    .current-section {
      padding: 20px;
      background: var(--dialogue-bg, rgba(30, 30, 30, 0.95));
      border-top: 1px solid #404040;
    }

    /* Stage/Chapter Select */
    .stage-select {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      gap: 30px;
      padding: 40px;
    }

    .stage-select h1 {
      font-size: 32px;
      color: var(--accent-color, #FFB74D);
    }

    .stage-list, .chapter-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 500px;
      width: 100%;
    }

    .stage-item, .chapter-item {
      padding: 15px 20px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid #404040;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .stage-item:hover, .chapter-item:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: var(--accent-color, #FFB74D);
    }

    .stage-item h3, .chapter-item h3 {
      font-size: 18px;
      margin-bottom: 5px;
    }

    .stage-item p, .chapter-item p {
      font-size: 14px;
      opacity: 0.7;
    }

    .back-button {
      margin-top: 20px;
      padding: 10px 30px;
      background: transparent;
      border: 1px solid #666;
      color: #fff;
      border-radius: 6px;
      cursor: pointer;
    }

    .back-button:hover {
      border-color: #fff;
    }

    /* Chapter End */
    .chapter-end {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 20px;
      text-align: center;
    }

    .chapter-end h2 {
      font-size: 28px;
      color: var(--accent-color, #FFB74D);
    }

    .chapter-end-buttons {
      display: flex;
      gap: 15px;
      margin-top: 20px;
    }

    .chapter-end-buttons button {
      padding: 12px 30px;
      font-size: 16px;
      border-radius: 6px;
      cursor: pointer;
      border: none;
    }

    .chapter-end-buttons .primary {
      background: var(--accent-color, #FFB74D);
      color: #000;
    }

    .chapter-end-buttons .secondary {
      background: transparent;
      border: 1px solid #666;
      color: #fff;
    }

    /* Image Effects */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }

    @keyframes slideLeft {
      from { transform: translateX(-100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    @keyframes slideRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    @keyframes slideUp {
      from { transform: translateY(50%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    @keyframes slideDown {
      from { transform: translateY(-50%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    @keyframes zoomIn {
      from { transform: scale(0.5); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    @keyframes zoomOut {
      from { transform: scale(1.5); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }

    @keyframes flash {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .effect-fadeIn { animation: fadeIn var(--effect-duration, 500ms) ease-out; }
    .effect-shake { animation: shake var(--effect-duration, 500ms) ease-out; }
    .effect-slideLeft { animation: slideLeft var(--effect-duration, 500ms) ease-out; }
    .effect-slideRight { animation: slideRight var(--effect-duration, 500ms) ease-out; }
    .effect-slideUp { animation: slideUp var(--effect-duration, 500ms) ease-out; }
    .effect-slideDown { animation: slideDown var(--effect-duration, 500ms) ease-out; }
    .effect-zoomIn { animation: zoomIn var(--effect-duration, 500ms) ease-out; }
    .effect-zoomOut { animation: zoomOut var(--effect-duration, 500ms) ease-out; }
    .effect-bounce { animation: bounce var(--effect-duration, 500ms) ease-out; }
    .effect-flash { animation: flash var(--effect-duration, 500ms) ease-out; }
    .effect-pulse { animation: pulse var(--effect-duration, 500ms) ease-out; }

    /* 다중 효과 조합 (effects 배열용) */
    .multi-effect {
      animation-duration: var(--effect-duration, 500ms);
      animation-timing-function: ease-out;
      animation-fill-mode: both;
    }
  `
}

function getGameEngineScript(): string {
  return `
    // ============================================
    // Game Engine (순수 JavaScript)
    // ============================================

    const DEFAULT_GAME_VARIABLES = {
      gold: 0,
      hp: 100,
      flags: {},
      affection: {},
      reputation: {},
      choicesMade: [],
    };

    class GameEngine {
      constructor(project, options = {}) {
        this.project = project;
        this.options = options;
        this.state = this.createInitialState();
        this.imageInstanceCounter = 0;
      }

      createInitialState() {
        return {
          currentNodeId: '',
          currentStageId: '',
          currentChapterId: '',
          variables: { ...DEFAULT_GAME_VARIABLES, flags: {}, affection: {}, reputation: {}, choicesMade: [] },
          history: [],
          activeImages: [],
          startedAt: Date.now(),
          playTime: 0,
        };
      }

      start(stageId, chapterId) {
        const stage = stageId
          ? this.project.stages.find(s => s.id === stageId)
          : this.project.stages[0];

        if (!stage) {
          console.error('No stage found');
          return;
        }

        const chapter = chapterId
          ? stage.chapters.find(c => c.id === chapterId)
          : stage.chapters[0];

        if (!chapter) {
          console.error('No chapter found');
          return;
        }

        let startNodeId = chapter.startNodeId;
        if (!startNodeId && chapter.nodes.length > 0) {
          const startNode = chapter.nodes.find(n => n.type === 'start');
          startNodeId = startNode?.id || chapter.nodes[0].id;
        }

        this.state = {
          ...this.createInitialState(),
          currentStageId: stage.id,
          currentChapterId: chapter.id,
          currentNodeId: startNodeId,
        };

        const currentNode = this.getCurrentNode();
        if (currentNode) {
          this.processNodeEntry(currentNode);
        }

        this.notifyStateChange();
        this.notifyNodeChange();
      }

      getCurrentStage() {
        return this.project.stages.find(s => s.id === this.state.currentStageId) || null;
      }

      getCurrentChapter() {
        const stage = this.getCurrentStage();
        return stage?.chapters.find(c => c.id === this.state.currentChapterId) || null;
      }

      getCurrentNode() {
        const chapter = this.getCurrentChapter();
        return chapter?.nodes.find(n => n.id === this.state.currentNodeId) || null;
      }

      getNodeById(nodeId) {
        const chapter = this.getCurrentChapter();
        return chapter?.nodes.find(n => n.id === nodeId) || null;
      }

      processNodeEntry(node) {
        if (node.onEnterEffects) {
          this.applyEffects(node.onEnterEffects);
        }

        if (node.type === 'variable') {
          this.executeVariableOperations(node);
          if (node.nextNodeId) {
            this.goToNode(node.nextNodeId);
            return;
          }
        }

        if (node.type === 'condition') {
          const nextNodeId = this.processConditionNode(node);
          if (nextNodeId) {
            this.goToNode(nextNodeId);
            return;
          }
        }

        if (node.type === 'image') {
          this.processImageNode(node);
          this.addImageToHistory(node);

          const effectDuration = node.imageData?.effectDuration || 0;
          // 다중 효과 지원
          const effects = node.imageData?.effects || [];
          const legacyEffect = node.imageData?.effect && node.imageData.effect !== 'none' ? node.imageData.effect : null;
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

      processImageNode(node) {
        if (!node.imageData) return;

        const { resourcePath, layer, layerOrder, alignment, x, y, flipHorizontal, effect, effects, effectDuration } = node.imageData;

        if (!resourcePath) {
          this.state.activeImages = this.state.activeImages.filter(
            img => !(img.layer === layer && img.layerOrder === layerOrder)
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
          effect,
          effects,  // 다중 효과 지원
          effectDuration,
        };

        this.state.activeImages = [
          ...this.state.activeImages.filter(
            img => !(img.layer === layer && img.layerOrder === layerOrder)
          ),
          newImage,
        ];
      }

      addImageToHistory(node) {
        if (!node.imageData) return;

        const { resourcePath, layer, effect, effects, effectDuration } = node.imageData;
        const isRemoval = !resourcePath;

        this.state.history.push({
          nodeId: node.id,
          type: 'image',
          content: isRemoval ? '[이미지 제거]' : '',
          timestamp: Date.now(),
          imageData: {
            resourcePath: resourcePath || '',
            layer,
            isRemoval,
            effect,
            effects,  // 다중 효과 지원
            effectDuration,
          },
        });

        if (this.state.history.length > 100) {
          this.state.history = this.state.history.slice(-100);
        }
      }

      advance() {
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

      goToNode(nodeId) {
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

      selectChoice(choiceIndex) {
        const currentNode = this.getCurrentNode();
        if (!currentNode || currentNode.type !== 'choice') return;
        if (!currentNode.choices || choiceIndex >= currentNode.choices.length) return;

        const choice = currentNode.choices[choiceIndex];

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

      evaluateCondition(condition) {
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

      checkNumberRange(value, min, max, exact) {
        if (exact !== undefined) return value === exact;
        if (min !== undefined && value < min) return false;
        if (max !== undefined && value > max) return false;
        return true;
      }

      applyEffects(effects) {
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

      executeVariableOperations(node) {
        if (!node.variableOperations) return;
        for (const op of node.variableOperations) {
          this.executeVariableOperation(op);
        }
      }

      executeVariableOperation(op) {
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
                vars.flags[op.key] = this.applyAction(vars.flags[op.key], op.action, numValue);
              }
            }
            break;
          case 'affection':
            if (op.characterId) {
              vars.affection[op.characterId] = this.applyAction(
                vars.affection[op.characterId] || 0, op.action, numValue
              );
            }
            break;
          case 'reputation':
            if (op.factionId) {
              vars.reputation[op.factionId] = this.applyAction(
                vars.reputation[op.factionId] || 0, op.action, numValue
              );
            }
            break;
        }
      }

      applyAction(current, action, value) {
        switch (action) {
          case 'set': return value;
          case 'add': return current + value;
          case 'subtract': return current - value;
          case 'multiply': return current * value;
          default: return current;
        }
      }

      processConditionNode(node) {
        if (!node.conditionBranches) return node.defaultNextNodeId || null;

        for (const branch of node.conditionBranches) {
          if (this.evaluateCondition(branch.condition)) {
            return branch.nextNodeId || null;
          }
        }

        return node.defaultNextNodeId || null;
      }

      addToHistory(node) {
        // 중복 방지: 같은 노드가 연속으로 추가되는 것을 방지
        const lastEntry = this.state.history[this.state.history.length - 1];
        if (lastEntry && lastEntry.nodeId === node.id && lastEntry.type === node.type) {
          return;
        }

        this.state.history.push({
          nodeId: node.id,
          type: node.type,
          content: node.text || '',
          speaker: node.speaker,
          timestamp: Date.now(),
        });

        if (this.state.history.length > 100) {
          this.state.history = this.state.history.slice(-100);
        }
      }

      notifyStateChange() {
        this.options.onStateChange?.({ ...this.state });
      }

      notifyNodeChange() {
        this.options.onNodeChange?.(this.getCurrentNode());
      }

      getState() {
        return { ...this.state };
      }

      getVariables() {
        return { ...this.state.variables };
      }

      getHistory() {
        return [...this.state.history];
      }

      restart() {
        this.start(this.state.currentStageId, this.state.currentChapterId);
      }
    }
  `
}

function getPlayerScript(): string {
  return `
    // ============================================
    // Theme Presets
    // ============================================

    const THEMES = {
      dark: {
        id: 'dark',
        name: 'Dark',
        colors: {
          background: '#1a1a1a',
          dialogueBox: 'rgba(30, 30, 30, 0.95)',
          dialogueBoxBorder: '#404040',
          dialogueText: '#ffffff',
          speakerName: '#FFB74D',
          speakerNameBg: 'rgba(255, 183, 77, 0.15)',
          choiceButton: '#2a2a2a',
          choiceButtonHover: '#3a3a3a',
          choiceButtonText: '#ffffff',
          choiceButtonBorder: '#505050',
          accent: '#FFB74D',
        },
        typewriterSpeed: 30,
      },
      light: {
        id: 'light',
        name: 'Light',
        colors: {
          background: '#f5f5f5',
          dialogueBox: 'rgba(255, 255, 255, 0.95)',
          dialogueBoxBorder: '#ddd',
          dialogueText: '#333333',
          speakerName: '#1976D2',
          speakerNameBg: 'rgba(25, 118, 210, 0.1)',
          choiceButton: '#ffffff',
          choiceButtonHover: '#e3f2fd',
          choiceButtonText: '#333333',
          choiceButtonBorder: '#ccc',
          accent: '#1976D2',
        },
        typewriterSpeed: 30,
      },
      retro: {
        id: 'retro',
        name: 'Retro',
        colors: {
          background: '#0f380f',
          dialogueBox: 'rgba(15, 56, 15, 0.95)',
          dialogueBoxBorder: '#306230',
          dialogueText: '#9bbc0f',
          speakerName: '#8bac0f',
          speakerNameBg: 'rgba(139, 172, 15, 0.2)',
          choiceButton: '#0f380f',
          choiceButtonHover: '#306230',
          choiceButtonText: '#9bbc0f',
          choiceButtonBorder: '#306230',
          accent: '#9bbc0f',
        },
        typewriterSpeed: 50,
      },
      novel: {
        id: 'novel',
        name: 'Novel',
        colors: {
          background: '#f8f4e8',
          dialogueBox: 'rgba(248, 244, 232, 0.98)',
          dialogueBoxBorder: '#d4c4a8',
          dialogueText: '#3d3d3d',
          speakerName: '#8b4513',
          speakerNameBg: 'rgba(139, 69, 19, 0.1)',
          choiceButton: '#fffef8',
          choiceButtonHover: '#f0ead6',
          choiceButtonText: '#3d3d3d',
          choiceButtonBorder: '#c4b498',
          accent: '#8b4513',
        },
        typewriterSpeed: 40,
      },
      cyberpunk: {
        id: 'cyberpunk',
        name: 'Cyberpunk',
        colors: {
          background: '#0a0a12',
          dialogueBox: 'rgba(10, 10, 25, 0.95)',
          dialogueBoxBorder: '#ff00ff',
          dialogueText: '#00ffff',
          speakerName: '#ff00ff',
          speakerNameBg: 'rgba(255, 0, 255, 0.2)',
          choiceButton: 'rgba(20, 20, 40, 0.9)',
          choiceButtonHover: 'rgba(255, 0, 255, 0.3)',
          choiceButtonText: '#00ffff',
          choiceButtonBorder: '#ff00ff',
          accent: '#ff00ff',
        },
        typewriterSpeed: 20,
      },
    };

    // ============================================
    // Game Player
    // ============================================

    class GamePlayer {
      constructor() {
        this.project = null;
        this.engine = null;
        this.currentTheme = THEMES.dark;
        this.gameMode = 'visualNovel'; // 'visualNovel' | 'textAdventure'
        this.status = 'select'; // 'select' | 'playing' | 'ended'
        this.currentNode = null;
        this.gameState = null;
        this.typewriterText = '';
        this.typewriterTimer = null;
        this.selectedStage = null;
      }

      async init() {
        // 임베딩된 데이터가 있으면 사용
        if (window.EMBEDDED_PROJECT) {
          this.project = window.EMBEDDED_PROJECT;
          this.render();
          return;
        }

        // 폴더 구조에서 로드
        try {
          await this.loadFromFolder();
          this.render();
        } catch (error) {
          console.error('Failed to load project:', error);
          document.getElementById('app').innerHTML = \`
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; color: #ff6b6b;">
              <h2>Failed to load game data</h2>
              <p>\${error.message}</p>
              <p style="margin-top: 20px; opacity: 0.7;">Make sure to run this file from a local server (e.g., npx serve)</p>
            </div>
          \`;
        }
      }

      async loadFromFolder() {
        // project.json 로드
        const projectRes = await fetch('./project.json');
        if (!projectRes.ok) throw new Error('project.json not found');
        const projectMeta = await projectRes.json();

        // 각 스테이지 로드
        const stages = [];
        for (const stageId of projectMeta.stages) {
          const stageRes = await fetch(\`./\${stageId}/stage.json\`);
          if (!stageRes.ok) throw new Error(\`\${stageId}/stage.json not found\`);
          const stageMeta = await stageRes.json();

          // 각 챕터 로드
          const chapters = [];
          for (const chapterId of stageMeta.chapters) {
            const chapterRes = await fetch(\`./\${stageId}/\${chapterId}.json\`);
            if (!chapterRes.ok) throw new Error(\`\${stageId}/\${chapterId}.json not found\`);
            const chapter = await chapterRes.json();
            chapters.push(chapter);
          }

          stages.push({
            id: stageMeta.id,
            title: stageMeta.title,
            description: stageMeta.description,
            partyCharacters: stageMeta.partyCharacters,
            chapters,
          });
        }

        this.project = {
          name: projectMeta.name,
          version: projectMeta.version,
          stages,
          gameSettings: projectMeta.gameSettings,
        };

        // 기본 테마 설정
        if (projectMeta.gameSettings?.defaultThemeId) {
          this.currentTheme = THEMES[projectMeta.gameSettings.defaultThemeId] || THEMES.dark;
        }
        if (projectMeta.gameSettings?.defaultGameMode) {
          this.gameMode = projectMeta.gameSettings.defaultGameMode;
        }
      }

      applyTheme() {
        const root = document.documentElement;
        const colors = this.currentTheme.colors;

        root.style.setProperty('--bg-color', colors.background);
        root.style.setProperty('--text-color', colors.dialogueText);
        root.style.setProperty('--dialogue-bg', colors.dialogueBox);
        root.style.setProperty('--dialogue-border', colors.dialogueBoxBorder);
        root.style.setProperty('--speaker-color', colors.speakerName);
        root.style.setProperty('--speaker-bg', colors.speakerNameBg);
        root.style.setProperty('--choice-bg', colors.choiceButton);
        root.style.setProperty('--choice-hover', colors.choiceButtonHover);
        root.style.setProperty('--choice-text', colors.choiceButtonText);
        root.style.setProperty('--choice-border', colors.choiceButtonBorder);
        root.style.setProperty('--accent-color', colors.accent);
      }

      startGame(stageId, chapterId) {
        this.engine = new GameEngine(this.project, {
          onStateChange: (state) => {
            this.gameState = state;
            this.render();
          },
          onNodeChange: (node) => {
            this.currentNode = node;
            this.startTypewriter();
            this.render();
          },
          onGameEnd: () => {
            this.status = 'ended';
            this.render();
          },
        });

        this.engine.start(stageId, chapterId);
        this.status = 'playing';
        this.render();
      }

      startTypewriter() {
        if (this.typewriterTimer) {
          clearInterval(this.typewriterTimer);
        }

        if (!this.currentNode?.text) {
          this.typewriterText = '';
          return;
        }

        const fullText = this.currentNode.text;
        let index = 0;
        this.typewriterText = '';

        this.typewriterTimer = setInterval(() => {
          if (index < fullText.length) {
            this.typewriterText += fullText[index];
            index++;
            this.updateDialogueText();
          } else {
            clearInterval(this.typewriterTimer);
            this.typewriterTimer = null;
          }
        }, this.currentTheme.typewriterSpeed || 30);
      }

      skipTypewriter() {
        if (this.typewriterTimer) {
          clearInterval(this.typewriterTimer);
          this.typewriterTimer = null;
          this.typewriterText = this.currentNode?.text || '';
          this.updateDialogueText();
        }
      }

      updateDialogueText() {
        const textEl = document.querySelector('.dialogue-text');
        if (textEl) {
          textEl.textContent = this.typewriterText;
        }
      }

      handleClick() {
        if (this.typewriterTimer) {
          this.skipTypewriter();
          return;
        }

        if (this.engine && this.currentNode?.type !== 'choice') {
          this.engine.advance();
        }
      }

      handleChoice(index) {
        if (this.engine) {
          this.engine.selectChoice(index);
        }
      }

      getImagePath(resourcePath) {
        if (!resourcePath) return '';

        // data: URL이면 그대로 반환
        if (resourcePath.startsWith('data:')) {
          return resourcePath;
        }

        // 상대 경로면 resources/images/ 경로로 변환
        if (resourcePath.startsWith('/') || resourcePath.includes('://')) {
          return resourcePath;
        }

        return './resources/images/' + resourcePath;
      }

      render() {
        this.applyTheme();
        const app = document.getElementById('app');

        if (this.status === 'select') {
          app.innerHTML = this.renderStageSelect();
          this.attachStageSelectEvents();
        } else if (this.status === 'playing') {
          if (this.gameMode === 'visualNovel') {
            app.innerHTML = this.renderVisualNovel();
          } else {
            app.innerHTML = this.renderTextAdventure();
          }
          this.attachGameEvents();
        } else if (this.status === 'ended') {
          app.innerHTML = this.renderChapterEnd();
          this.attachEndEvents();
        }
      }

      renderStageSelect() {
        if (this.selectedStage) {
          const stage = this.project.stages.find(s => s.id === this.selectedStage);
          return \`
            <div class="stage-select">
              <h1>\${stage.title}</h1>
              <p>\${stage.description || ''}</p>
              <div class="chapter-list">
                \${stage.chapters.map(chapter => \`
                  <div class="chapter-item" data-stage="\${stage.id}" data-chapter="\${chapter.id}">
                    <h3>\${chapter.title}</h3>
                    <p>\${chapter.description || ''}</p>
                  </div>
                \`).join('')}
              </div>
              <button class="back-button" data-action="back">Back</button>
            </div>
          \`;
        }

        return \`
          <div class="stage-select">
            <h1>\${this.project.name}</h1>
            <div class="stage-list">
              \${this.project.stages.map(stage => \`
                <div class="stage-item" data-stage="\${stage.id}">
                  <h3>\${stage.title}</h3>
                  <p>\${stage.description || ''}</p>
                </div>
              \`).join('')}
            </div>
          </div>
        \`;
      }

      getEffectClasses(img) {
        // 다중 효과 지원: effects 배열 우선, 없으면 기존 effect 사용
        if (img.effects && img.effects.length > 0) {
          return img.effects.map(e => 'effect-' + e).join(' ');
        }
        if (img.effect && img.effect !== 'none') {
          return 'effect-' + img.effect;
        }
        return '';
      }

      getEffectStyle(img) {
        const styles = [];
        if (img.effectDuration) {
          styles.push('--effect-duration: ' + img.effectDuration + 'ms');
        }
        // 다중 효과일 경우 animation-name을 직접 설정
        if (img.effects && img.effects.length > 0) {
          styles.push('animation-name: ' + img.effects.join(', '));
        }
        return styles.join('; ');
      }

      renderVisualNovel() {
        const activeImages = this.gameState?.activeImages || [];
        const bgImages = activeImages.filter(img => img.layer === 'background');
        const charImages = activeImages.filter(img => img.layer === 'character');

        return \`
          <div class="game-header">
            <h1>\${this.project.name}</h1>
            <div class="game-controls">
              <select id="theme-select">
                \${Object.values(THEMES).map(t => \`
                  <option value="\${t.id}" \${t.id === this.currentTheme.id ? 'selected' : ''}>\${t.name}</option>
                \`).join('')}
              </select>
              <select id="mode-select">
                <option value="visualNovel" \${this.gameMode === 'visualNovel' ? 'selected' : ''}>Visual Novel</option>
                <option value="textAdventure" \${this.gameMode === 'textAdventure' ? 'selected' : ''}>Text Adventure</option>
              </select>
              <button id="restart-btn">Restart</button>
            </div>
          </div>
          <div class="game-screen" id="game-screen">
            <div class="image-layers">
              \${bgImages.map(img => \`
                <div class="image-layer background \${img.effects?.length > 0 ? 'multi-effect' : ''} \${this.getEffectClasses(img)}"
                     style="\${this.getEffectStyle(img)}"
                     data-instance="\${img.instanceId}">
                  <img src="\${this.getImagePath(img.resourcePath)}" alt="">
                </div>
              \`).join('')}
              \${charImages.map(img => \`
                <div class="image-layer character \${img.effects?.length > 0 ? 'multi-effect' : ''} \${this.getEffectClasses(img)}"
                     style="\${this.getEffectStyle(img)}"
                     data-instance="\${img.instanceId}">
                  <img src="\${this.getImagePath(img.resourcePath)}" alt=""
                       style="\${img.flipHorizontal ? 'transform: scaleX(-1)' : ''}">
                </div>
              \`).join('')}
            </div>
            <div class="dialogue-box">
              \${this.currentNode?.speaker ? \`<span class="speaker-name">\${this.currentNode.speaker}</span>\` : ''}
              <div class="dialogue-text">\${this.typewriterText}</div>
              \${this.currentNode?.type === 'choice' ? this.renderChoices() : \`
                <span class="continue-indicator">Click or Press Space ▼</span>
              \`}
            </div>
          </div>
        \`;
      }

      renderTextAdventure() {
        const history = this.gameState?.history || [];
        const vars = this.gameState?.variables || {};
        const flagCount = Object.keys(vars.flags || {}).length;

        return \`
          <div class="game-header">
            <h1>\${this.project.name}</h1>
            <div class="game-controls">
              <select id="theme-select">
                \${Object.values(THEMES).map(t => \`
                  <option value="\${t.id}" \${t.id === this.currentTheme.id ? 'selected' : ''}>\${t.name}</option>
                \`).join('')}
              </select>
              <select id="mode-select">
                <option value="visualNovel" \${this.gameMode === 'visualNovel' ? 'selected' : ''}>Visual Novel</option>
                <option value="textAdventure" \${this.gameMode === 'textAdventure' ? 'selected' : ''}>Text Adventure</option>
              </select>
              <button id="restart-btn">Restart</button>
            </div>
          </div>
          <div class="text-adventure">
            <div class="stats-bar">
              <div class="stat-item">HP: \${vars.hp || 0}</div>
              <div class="stat-item">Gold: \${vars.gold || 0}</div>
              <div class="stat-item">Flags: \${flagCount}</div>
            </div>
            <div class="history-log" id="history-log">
              \${history.map(entry => this.renderHistoryEntry(entry)).join('')}
            </div>
            <div class="current-section" id="game-screen">
              \${this.currentNode?.type === 'choice' ? \`
                <div class="dialogue-text">\${this.currentNode.text || ''}</div>
                \${this.renderChoices()}
              \` : \`
                <div class="dialogue-text">\${this.typewriterText}</div>
                <span class="continue-indicator">Click or Press Space to continue ▼</span>
              \`}
            </div>
          </div>
        \`;
      }

      renderHistoryEntry(entry) {
        if (entry.type === 'choice') {
          return \`
            <div class="history-entry choice">
              <div class="content">\${entry.content}</div>
              <div class="choice-text">➤ \${entry.choiceText}</div>
            </div>
          \`;
        }

        if (entry.type === 'image' && entry.imageData && !entry.imageData.isRemoval) {
          return \`
            <div class="history-entry image">
              <img src="\${this.getImagePath(entry.imageData.resourcePath)}" alt="">
            </div>
          \`;
        }

        if (entry.type === 'dialogue' || entry.type === 'start') {
          return \`
            <div class="history-entry dialogue">
              \${entry.speaker ? \`<div class="speaker">\${entry.speaker}</div>\` : ''}
              <div class="content">\${entry.content}</div>
            </div>
          \`;
        }

        return '';
      }

      renderChoices() {
        if (!this.currentNode?.choices) return '';

        const vars = this.gameState?.variables || {};

        return \`
          <div class="choices-container">
            \${this.currentNode.choices.map((choice, index) => {
              let disabled = false;
              if (choice.condition) {
                disabled = !this.checkCondition(choice.condition, vars);
              }
              return \`
                <button class="choice-button" data-choice="\${index}" \${disabled ? 'disabled' : ''}>
                  \${choice.text}
                </button>
              \`;
            }).join('')}
          </div>
        \`;
      }

      checkCondition(condition, vars) {
        // 간단한 조건 체크 (엔진과 동일한 로직)
        switch (condition.type) {
          case 'gold':
            return this.checkRange(vars.gold || 0, condition.min, condition.max, condition.value);
          case 'hp':
            return this.checkRange(vars.hp || 0, condition.min, condition.max, condition.value);
          case 'flag':
            if (condition.flagKey) {
              const val = vars.flags?.[condition.flagKey];
              if (condition.flagValue !== undefined) return val === condition.flagValue;
              return Boolean(val);
            }
            return false;
          default:
            return true;
        }
      }

      checkRange(value, min, max, exact) {
        if (exact !== undefined) return value === exact;
        if (min !== undefined && value < min) return false;
        if (max !== undefined && value > max) return false;
        return true;
      }

      renderChapterEnd() {
        return \`
          <div class="chapter-end">
            <h2>Chapter Complete!</h2>
            <p>You have completed this chapter.</p>
            <div class="chapter-end-buttons">
              <button class="primary" data-action="restart">Restart Chapter</button>
              <button class="secondary" data-action="menu">Back to Menu</button>
            </div>
          </div>
        \`;
      }

      attachStageSelectEvents() {
        document.querySelectorAll('.stage-item').forEach(el => {
          el.addEventListener('click', () => {
            this.selectedStage = el.dataset.stage;
            this.render();
          });
        });

        document.querySelectorAll('.chapter-item').forEach(el => {
          el.addEventListener('click', () => {
            this.startGame(el.dataset.stage, el.dataset.chapter);
          });
        });

        document.querySelector('.back-button')?.addEventListener('click', () => {
          this.selectedStage = null;
          this.render();
        });
      }

      attachGameEvents() {
        // 테마 변경
        document.getElementById('theme-select')?.addEventListener('change', (e) => {
          this.currentTheme = THEMES[e.target.value] || THEMES.dark;
          this.render();
        });

        // 모드 변경
        document.getElementById('mode-select')?.addEventListener('change', (e) => {
          this.gameMode = e.target.value;
          this.render();
        });

        // 재시작
        document.getElementById('restart-btn')?.addEventListener('click', () => {
          if (this.engine) {
            this.engine.restart();
          }
        });

        // 게임 화면 클릭
        document.getElementById('game-screen')?.addEventListener('click', (e) => {
          if (!e.target.closest('.choice-button')) {
            this.handleClick();
          }
        });

        // 선택지 클릭
        document.querySelectorAll('.choice-button').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.choice);
            this.handleChoice(index);
          });
        });

        // 키보드 이벤트
        document.onkeydown = (e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            this.handleClick();
          }
        };

        // 히스토리 스크롤
        const historyLog = document.getElementById('history-log');
        if (historyLog) {
          historyLog.scrollTop = historyLog.scrollHeight;
        }
      }

      attachEndEvents() {
        document.querySelector('[data-action="restart"]')?.addEventListener('click', () => {
          if (this.engine) {
            this.engine.restart();
            this.status = 'playing';
            this.render();
          }
        });

        document.querySelector('[data-action="menu"]')?.addEventListener('click', () => {
          this.status = 'select';
          this.selectedStage = null;
          this.engine = null;
          this.render();
        });
      }
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
      const player = new GamePlayer();
      player.init();
    });
  `
}
