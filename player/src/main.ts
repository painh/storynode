// StoryNode Player - Main Entry Point
// Standalone game player that reads embedded or local game data

import { GamePlayer, PLAYER_STYLES } from '@storynode/game-engine';

// Check if running in Tauri
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

// Inject styles
const styleElement = document.createElement('style');
styleElement.textContent = PLAYER_STYLES;
document.head.appendChild(styleElement);

async function getGameDataPath(): Promise<string> {
  if (isTauri) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const path = await invoke<string>('get_game_data_path');
      return path;
    } catch (error) {
      console.warn('Failed to get game data path from Tauri:', error);
    }
  }
  // Default to current directory for web
  return '.';
}

// Initialize player when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const basePath = await getGameDataPath();

  const player = new GamePlayer({
    containerId: 'app',
    basePath: basePath,
    onReady: () => {
      console.log('StoryNode Player ready');
    },
    onError: (error) => {
      console.error('Failed to initialize player:', error);
    },
  });

  await player.init();
});
