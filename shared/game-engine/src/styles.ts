// StoryNode Game Player Styles
// CSS styles for the game player UI

export const PLAYER_STYLES = `
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

/* Multiple effect combination (for effects array) */
.multi-effect {
  animation-duration: var(--effect-duration, 500ms);
  animation-timing-function: ease-out;
  animation-fill-mode: both;
}
`;

export function getPlayerStylesHtml(): string {
  return `<style>\n${PLAYER_STYLES}\n</style>`;
}
