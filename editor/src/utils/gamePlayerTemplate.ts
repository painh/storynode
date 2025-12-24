// 게임 플레이어 HTML 템플릿 생성
// shared 패키지의 게임 엔진을 사용하는 standalone HTML 플레이어

import { PLAYER_STYLES, THEMES } from '@storynode/game-engine';

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
${PLAYER_STYLES}
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
</html>`;
}

function getGameEngineScript(): string {
  // 런타임에서 사용될 순수 JavaScript 게임 엔진
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
          effects,
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
            effects,
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
  `;
}

function getPlayerScript(): string {
  // 테마 프리셋을 JSON으로 인라인
  const themesJson = JSON.stringify(THEMES);

  return `
    // ============================================
    // Theme Presets
    // ============================================

    const THEMES = ${themesJson};

    // ============================================
    // Game Player
    // ============================================

    class GamePlayer {
      constructor() {
        this.project = null;
        this.engine = null;
        this.currentTheme = THEMES.dark;
        this.gameMode = 'visualNovel';
        this.status = 'select';
        this.currentNode = null;
        this.gameState = null;
        this.typewriterText = '';
        this.typewriterTimer = null;
        this.selectedStage = null;
      }

      async init() {
        if (window.EMBEDDED_PROJECT) {
          this.project = window.EMBEDDED_PROJECT;
          this.render();
          return;
        }

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
        const projectRes = await fetch('./project.json');
        if (!projectRes.ok) throw new Error('project.json not found');
        const projectMeta = await projectRes.json();

        const stages = [];
        for (const stageId of projectMeta.stages) {
          const stageRes = await fetch(\`./\${stageId}/stage.json\`);
          if (!stageRes.ok) throw new Error(\`\${stageId}/stage.json not found\`);
          const stageMeta = await stageRes.json();

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
          variables: projectMeta.variables,
        };

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

        if (resourcePath.startsWith('data:')) {
          return resourcePath;
        }

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
        document.getElementById('theme-select')?.addEventListener('change', (e) => {
          this.currentTheme = THEMES[e.target.value] || THEMES.dark;
          this.render();
        });

        document.getElementById('mode-select')?.addEventListener('change', (e) => {
          this.gameMode = e.target.value;
          this.render();
        });

        document.getElementById('restart-btn')?.addEventListener('click', () => {
          if (this.engine) {
            this.engine.restart();
          }
        });

        document.getElementById('game-screen')?.addEventListener('click', (e) => {
          if (!e.target.closest('.choice-button')) {
            this.handleClick();
          }
        });

        document.querySelectorAll('.choice-button').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.choice);
            this.handleChoice(index);
          });
        });

        document.onkeydown = (e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            this.handleClick();
          }
        };

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
  `;
}
