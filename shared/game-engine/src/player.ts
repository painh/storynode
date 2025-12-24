// StoryNode Game Player
// UI layer for playing story games

import { GameEngine } from './engine';
import { THEMES, getTheme, type Theme } from './themes';
import type { StoryProject, StoryNode, GameState, ActiveImage, Condition, HistoryEntry } from './types';

declare global {
  interface Window {
    EMBEDDED_PROJECT?: StoryProject;
  }
}

export type GameMode = 'visualNovel' | 'textAdventure';
export type PlayerStatus = 'select' | 'playing' | 'ended';

export interface GamePlayerOptions {
  containerId?: string;
  basePath?: string;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

export class GamePlayer {
  private project: StoryProject | null = null;
  private engine: GameEngine | null = null;
  private currentTheme: Theme = THEMES.dark;
  private gameMode: GameMode = 'visualNovel';
  private status: PlayerStatus = 'select';
  private currentNode: StoryNode | null = null;
  private gameState: GameState | null = null;
  private typewriterText: string = '';
  private typewriterTimer: ReturnType<typeof setInterval> | null = null;
  private selectedStage: string | null = null;
  private options: GamePlayerOptions;

  constructor(options: GamePlayerOptions = {}) {
    this.options = {
      containerId: 'app',
      basePath: '.',
      ...options,
    };
  }

  async init(): Promise<void> {
    // Use embedded data if available
    if (window.EMBEDDED_PROJECT) {
      this.project = window.EMBEDDED_PROJECT;
      this.render();
      this.options.onReady?.();
      return;
    }

    // Load from folder structure
    try {
      await this.loadFromFolder();
      this.render();
      this.options.onReady?.();
    } catch (error) {
      console.error('Failed to load project:', error);
      const container = document.getElementById(this.options.containerId!);
      if (container) {
        container.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; color: #ff6b6b;">
            <h2>Failed to load game data</h2>
            <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
            <p style="margin-top: 20px; opacity: 0.7;">Make sure to run this file from a local server (e.g., npx serve)</p>
          </div>
        `;
      }
      this.options.onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private async loadFromFolder(): Promise<void> {
    const basePath = this.options.basePath;

    // Load project.json
    const projectRes = await fetch(`${basePath}/project.json`);
    if (!projectRes.ok) throw new Error('project.json not found');
    const projectMeta = await projectRes.json();

    // Load each stage
    const stages = [];
    for (const stageId of projectMeta.stages) {
      const stageRes = await fetch(`${basePath}/${stageId}/stage.json`);
      if (!stageRes.ok) throw new Error(`${stageId}/stage.json not found`);
      const stageMeta = await stageRes.json();

      // Load each chapter
      const chapters = [];
      for (const chapterId of stageMeta.chapters) {
        const chapterRes = await fetch(`${basePath}/${stageId}/${chapterId}.json`);
        if (!chapterRes.ok) throw new Error(`${stageId}/${chapterId}.json not found`);
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

    // Apply default theme
    if (projectMeta.gameSettings?.defaultThemeId) {
      this.currentTheme = getTheme(projectMeta.gameSettings.defaultThemeId);
    }
    if (projectMeta.gameSettings?.defaultGameMode) {
      this.gameMode = projectMeta.gameSettings.defaultGameMode;
    }
  }

  private applyTheme(): void {
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

  startGame(stageId?: string, chapterId?: string): void {
    if (!this.project) return;

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

  private startTypewriter(): void {
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
        if (this.typewriterTimer) {
          clearInterval(this.typewriterTimer);
          this.typewriterTimer = null;
        }
      }
    }, this.currentTheme.typewriterSpeed || 30);
  }

  private skipTypewriter(): void {
    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
      this.typewriterText = this.currentNode?.text || '';
      this.updateDialogueText();
    }
  }

  private updateDialogueText(): void {
    const textEl = document.querySelector('.dialogue-text');
    if (textEl) {
      textEl.textContent = this.typewriterText;
    }
  }

  handleClick(): void {
    if (this.typewriterTimer) {
      this.skipTypewriter();
      return;
    }

    if (this.engine && this.currentNode?.type !== 'choice') {
      this.engine.advance();
    }
  }

  handleChoice(index: number): void {
    if (this.engine) {
      this.engine.selectChoice(index);
    }
  }

  getImagePath(resourcePath: string): string {
    if (!resourcePath) return '';

    // Return data: URLs as-is
    if (resourcePath.startsWith('data:')) {
      return resourcePath;
    }

    // Return absolute URLs as-is
    if (resourcePath.startsWith('/') || resourcePath.includes('://')) {
      return resourcePath;
    }

    // Convert relative path to resources/images/ path
    return `${this.options.basePath}/resources/images/${resourcePath}`;
  }

  private render(): void {
    this.applyTheme();
    const app = document.getElementById(this.options.containerId!);
    if (!app) return;

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

  private renderStageSelect(): string {
    if (!this.project) return '';

    if (this.selectedStage) {
      const stage = this.project.stages.find((s) => s.id === this.selectedStage);
      if (!stage) return '';
      return `
        <div class="stage-select">
          <h1>${stage.title}</h1>
          <p>${stage.description || ''}</p>
          <div class="chapter-list">
            ${stage.chapters
              .map(
                (chapter) => `
              <div class="chapter-item" data-stage="${stage.id}" data-chapter="${chapter.id}">
                <h3>${chapter.title}</h3>
                <p>${chapter.description || ''}</p>
              </div>
            `
              )
              .join('')}
          </div>
          <button class="back-button" data-action="back">Back</button>
        </div>
      `;
    }

    return `
      <div class="stage-select">
        <h1>${this.project.name}</h1>
        <div class="stage-list">
          ${this.project.stages
            .map(
              (stage) => `
            <div class="stage-item" data-stage="${stage.id}">
              <h3>${stage.title}</h3>
              <p>${stage.description || ''}</p>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  private getEffectClasses(img: ActiveImage): string {
    // Support multiple effects: effects array first, fallback to legacy effect
    if (img.effects && img.effects.length > 0) {
      return img.effects.map((e) => 'effect-' + e).join(' ');
    }
    if (img.effect && img.effect !== 'none') {
      return 'effect-' + img.effect;
    }
    return '';
  }

  private getEffectStyle(img: ActiveImage): string {
    const styles: string[] = [];
    if (img.effectDuration) {
      styles.push('--effect-duration: ' + img.effectDuration + 'ms');
    }
    // Set animation-name directly for multiple effects
    if (img.effects && img.effects.length > 0) {
      styles.push('animation-name: ' + img.effects.join(', '));
    }
    return styles.join('; ');
  }

  private renderVisualNovel(): string {
    if (!this.project) return '';

    const activeImages = this.gameState?.activeImages || [];
    const bgImages = activeImages.filter((img) => img.layer === 'background');
    const charImages = activeImages.filter((img) => img.layer === 'character');

    return `
      <div class="game-header">
        <h1>${this.project.name}</h1>
        <div class="game-controls">
          <select id="theme-select">
            ${Object.values(THEMES)
              .map(
                (t) => `
              <option value="${t.id}" ${t.id === this.currentTheme.id ? 'selected' : ''}>${t.name}</option>
            `
              )
              .join('')}
          </select>
          <select id="mode-select">
            <option value="visualNovel" ${this.gameMode === 'visualNovel' ? 'selected' : ''}>Visual Novel</option>
            <option value="textAdventure" ${this.gameMode === 'textAdventure' ? 'selected' : ''}>Text Adventure</option>
          </select>
          <button id="restart-btn">Restart</button>
        </div>
      </div>
      <div class="game-screen" id="game-screen">
        <div class="image-layers">
          ${bgImages
            .map(
              (img) => `
            <div class="image-layer background ${img.effects && img.effects.length > 0 ? 'multi-effect' : ''} ${this.getEffectClasses(img)}"
                 style="${this.getEffectStyle(img)}"
                 data-instance="${img.instanceId}">
              <img src="${this.getImagePath(img.resourcePath)}" alt="">
            </div>
          `
            )
            .join('')}
          ${charImages
            .map(
              (img) => `
            <div class="image-layer character ${img.effects && img.effects.length > 0 ? 'multi-effect' : ''} ${this.getEffectClasses(img)}"
                 style="${this.getEffectStyle(img)}"
                 data-instance="${img.instanceId}">
              <img src="${this.getImagePath(img.resourcePath)}" alt=""
                   style="${img.flipHorizontal ? 'transform: scaleX(-1)' : ''}">
            </div>
          `
            )
            .join('')}
        </div>
        <div class="dialogue-box">
          ${'speaker' in (this.currentNode || {}) && (this.currentNode as { speaker?: string })?.speaker ? `<span class="speaker-name">${(this.currentNode as { speaker: string }).speaker}</span>` : ''}
          <div class="dialogue-text">${this.typewriterText}</div>
          ${
            this.currentNode?.type === 'choice'
              ? this.renderChoices()
              : `
            <span class="continue-indicator">Click or Press Space ▼</span>
          `
          }
        </div>
      </div>
    `;
  }

  private renderTextAdventure(): string {
    if (!this.project) return '';

    const history = this.gameState?.history || [];
    const vars = this.gameState?.variables || { gold: 0, hp: 0, flags: {} };
    const flagCount = Object.keys(vars.flags || {}).length;

    return `
      <div class="game-header">
        <h1>${this.project.name}</h1>
        <div class="game-controls">
          <select id="theme-select">
            ${Object.values(THEMES)
              .map(
                (t) => `
              <option value="${t.id}" ${t.id === this.currentTheme.id ? 'selected' : ''}>${t.name}</option>
            `
              )
              .join('')}
          </select>
          <select id="mode-select">
            <option value="visualNovel" ${this.gameMode === 'visualNovel' ? 'selected' : ''}>Visual Novel</option>
            <option value="textAdventure" ${this.gameMode === 'textAdventure' ? 'selected' : ''}>Text Adventure</option>
          </select>
          <button id="restart-btn">Restart</button>
        </div>
      </div>
      <div class="text-adventure">
        <div class="stats-bar">
          <div class="stat-item">HP: ${vars.hp || 0}</div>
          <div class="stat-item">Gold: ${vars.gold || 0}</div>
          <div class="stat-item">Flags: ${flagCount}</div>
        </div>
        <div class="history-log" id="history-log">
          ${history.map((entry) => this.renderHistoryEntry(entry)).join('')}
        </div>
        <div class="current-section" id="game-screen">
          ${
            this.currentNode?.type === 'choice'
              ? `
            <div class="dialogue-text">${this.currentNode.text || ''}</div>
            ${this.renderChoices()}
          `
              : `
            <div class="dialogue-text">${this.typewriterText}</div>
            <span class="continue-indicator">Click or Press Space to continue ▼</span>
          `
          }
        </div>
      </div>
    `;
  }

  private renderHistoryEntry(entry: HistoryEntry): string {
    if (entry.type === 'choice') {
      return `
        <div class="history-entry choice">
          <div class="content">${entry.content}</div>
          <div class="choice-text">➤ ${entry.choiceText}</div>
        </div>
      `;
    }

    if (entry.type === 'image' && entry.imageData && !entry.imageData.isRemoval) {
      return `
        <div class="history-entry image">
          <img src="${this.getImagePath(entry.imageData.resourcePath)}" alt="">
        </div>
      `;
    }

    if (entry.type === 'dialogue' || entry.type === 'start') {
      return `
        <div class="history-entry dialogue">
          ${entry.speaker ? `<div class="speaker">${entry.speaker}</div>` : ''}
          <div class="content">${entry.content}</div>
        </div>
      `;
    }

    return '';
  }

  private renderChoices(): string {
    if (!this.currentNode || this.currentNode.type !== 'choice') return '';

    const choiceNode = this.currentNode as { choices?: Array<{ text: string; condition?: Condition }> };
    if (!choiceNode.choices) return '';

    const vars = this.gameState?.variables || { gold: 0, hp: 0, flags: {} };

    return `
      <div class="choices-container">
        ${choiceNode.choices
          .map((choice, index) => {
            let disabled = false;
            if (choice.condition) {
              disabled = !this.checkCondition(choice.condition, vars);
            }
            return `
            <button class="choice-button" data-choice="${index}" ${disabled ? 'disabled' : ''}>
              ${choice.text}
            </button>
          `;
          })
          .join('')}
      </div>
    `;
  }

  private checkCondition(
    condition: Condition,
    vars: { gold: number; hp: number; flags: Record<string, unknown> }
  ): boolean {
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

  private checkRange(value: number, min?: number, max?: number, exact?: number): boolean {
    if (exact !== undefined) return value === exact;
    if (min !== undefined && value < min) return false;
    if (max !== undefined && value > max) return false;
    return true;
  }

  private renderChapterEnd(): string {
    return `
      <div class="chapter-end">
        <h2>Chapter Complete!</h2>
        <p>You have completed this chapter.</p>
        <div class="chapter-end-buttons">
          <button class="primary" data-action="restart">Restart Chapter</button>
          <button class="secondary" data-action="menu">Back to Menu</button>
        </div>
      </div>
    `;
  }

  private attachStageSelectEvents(): void {
    document.querySelectorAll('.stage-item').forEach((el) => {
      el.addEventListener('click', () => {
        this.selectedStage = (el as HTMLElement).dataset.stage || null;
        this.render();
      });
    });

    document.querySelectorAll('.chapter-item').forEach((el) => {
      el.addEventListener('click', () => {
        const dataset = (el as HTMLElement).dataset;
        this.startGame(dataset.stage, dataset.chapter);
      });
    });

    document.querySelector('.back-button')?.addEventListener('click', () => {
      this.selectedStage = null;
      this.render();
    });
  }

  private attachGameEvents(): void {
    // Theme change
    document.getElementById('theme-select')?.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      this.currentTheme = getTheme(target.value);
      this.render();
    });

    // Mode change
    document.getElementById('mode-select')?.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      this.gameMode = target.value as GameMode;
      this.render();
    });

    // Restart
    document.getElementById('restart-btn')?.addEventListener('click', () => {
      if (this.engine) {
        this.engine.restart();
      }
    });

    // Game screen click
    document.getElementById('game-screen')?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.choice-button')) {
        this.handleClick();
      }
    });

    // Choice click
    document.querySelectorAll('.choice-button').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const index = parseInt(target.dataset.choice || '0');
        this.handleChoice(index);
      });
    });

    // Keyboard events
    document.onkeydown = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this.handleClick();
      }
    };

    // Scroll history
    const historyLog = document.getElementById('history-log');
    if (historyLog) {
      historyLog.scrollTop = historyLog.scrollHeight;
    }
  }

  private attachEndEvents(): void {
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

  // Public getters
  getProject(): StoryProject | null {
    return this.project;
  }

  getEngine(): GameEngine | null {
    return this.engine;
  }

  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  setTheme(themeId: string): void {
    this.currentTheme = getTheme(themeId);
    this.render();
  }

  getGameMode(): GameMode {
    return this.gameMode;
  }

  setGameMode(mode: GameMode): void {
    this.gameMode = mode;
    this.render();
  }

  getStatus(): PlayerStatus {
    return this.status;
  }
}
