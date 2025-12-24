// 게임 테마 프리셋
import type { GameTheme } from '../../../types/game'

export const darkTheme: GameTheme = {
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
    debugPanelBg: 'rgba(0, 0, 0, 0.85)',
    debugPanelText: '#00ff00',
  },
  fonts: {
    dialogue: "'Noto Sans KR', sans-serif",
    speaker: "'Noto Sans KR', sans-serif",
    ui: "'Noto Sans KR', sans-serif",
  },
  effects: {
    typewriterSpeed: 30,
    fadeTransition: true,
    dialogueAnimation: 'typewriter',
  },
}

export const lightTheme: GameTheme = {
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
    debugPanelBg: 'rgba(255, 255, 255, 0.95)',
    debugPanelText: '#333333',
  },
  fonts: {
    dialogue: "'Noto Sans KR', sans-serif",
    speaker: "'Noto Sans KR', sans-serif",
    ui: "'Noto Sans KR', sans-serif",
  },
  effects: {
    typewriterSpeed: 30,
    fadeTransition: true,
    dialogueAnimation: 'typewriter',
  },
}

export const retroTheme: GameTheme = {
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
    debugPanelBg: 'rgba(0, 0, 0, 0.9)',
    debugPanelText: '#9bbc0f',
  },
  fonts: {
    dialogue: "'Press Start 2P', 'Noto Sans KR', monospace",
    speaker: "'Press Start 2P', 'Noto Sans KR', monospace",
    ui: "'Press Start 2P', 'Noto Sans KR', monospace",
  },
  effects: {
    typewriterSpeed: 50,
    fadeTransition: false,
    dialogueAnimation: 'typewriter',
  },
}

export const novelTheme: GameTheme = {
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
    debugPanelBg: 'rgba(248, 244, 232, 0.95)',
    debugPanelText: '#3d3d3d',
  },
  fonts: {
    dialogue: "'Noto Serif KR', 'Georgia', serif",
    speaker: "'Noto Serif KR', 'Georgia', serif",
    ui: "'Noto Sans KR', sans-serif",
  },
  effects: {
    typewriterSpeed: 40,
    fadeTransition: true,
    dialogueAnimation: 'fade',
  },
}

export const cyberpunkTheme: GameTheme = {
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
    debugPanelBg: 'rgba(10, 10, 25, 0.95)',
    debugPanelText: '#00ff00',
  },
  fonts: {
    dialogue: "'Orbitron', 'Noto Sans KR', sans-serif",
    speaker: "'Orbitron', 'Noto Sans KR', sans-serif",
    ui: "'Orbitron', 'Noto Sans KR', sans-serif",
  },
  effects: {
    typewriterSpeed: 20,
    fadeTransition: true,
    dialogueAnimation: 'typewriter',
  },
}

// 90년대~2000년대 일본 비주얼 노벨 스타일 (Silky's 풍)
export const classicVnTheme: GameTheme = {
  id: 'classic-vn',
  name: 'Classic VN',
  colors: {
    background: '#1a1a2e',
    dialogueBox: 'rgba(20, 20, 45, 0.92)',
    dialogueBoxBorder: '#4a4a7a',
    dialogueText: '#ffffff',
    speakerName: '#ffcc00',
    speakerNameBg: 'rgba(40, 40, 80, 0.95)',
    choiceButton: 'rgba(30, 30, 60, 0.95)',
    choiceButtonHover: 'rgba(60, 60, 100, 0.95)',
    choiceButtonText: '#ffffff',
    choiceButtonBorder: '#6a6aaa',
    accent: '#ffcc00',
    debugPanelBg: 'rgba(20, 20, 45, 0.95)',
    debugPanelText: '#00ff00',
  },
  fonts: {
    dialogue: "'MS Gothic', 'Noto Sans JP', 'Noto Sans KR', monospace",
    speaker: "'MS Gothic', 'Noto Sans JP', 'Noto Sans KR', monospace",
    ui: "'MS Gothic', 'Noto Sans JP', 'Noto Sans KR', monospace",
  },
  effects: {
    typewriterSpeed: 35,
    fadeTransition: false,
    dialogueAnimation: 'typewriter',
  },
}

// DOS 스타일 (80x25 터미널 감성)
export const dosTheme: GameTheme = {
  id: 'dos',
  name: 'DOS',
  colors: {
    background: '#000080',
    dialogueBox: '#000080',
    dialogueBoxBorder: '#ffffff',
    dialogueText: '#ffffff',
    speakerName: '#ffff00',
    speakerNameBg: '#000080',
    choiceButton: '#000080',
    choiceButtonHover: '#0000aa',
    choiceButtonText: '#ffff00',
    choiceButtonBorder: '#ffffff',
    accent: '#ffff00',
    debugPanelBg: '#000000',
    debugPanelText: '#00ff00',
  },
  fonts: {
    dialogue: "'Perfect DOS VGA 437', 'Consolas', 'Courier New', monospace",
    speaker: "'Perfect DOS VGA 437', 'Consolas', 'Courier New', monospace",
    ui: "'Perfect DOS VGA 437', 'Consolas', 'Courier New', monospace",
  },
  effects: {
    typewriterSpeed: 25,
    fadeTransition: false,
    dialogueAnimation: 'typewriter',
  },
  window: {
    style: 'dos',
    titleBarHeight: 20,
    showCloseButton: false,
    showMinMaxButtons: false,
    borderWidth: 2,
    titleBarColor: '#00aaaa',
    titleBarTextColor: '#000000',
    buttonStyle: 'flat',
  },
}

// Windows 3.1 스타일
export const win31Theme: GameTheme = {
  id: 'win31',
  name: 'Windows 3.1',
  colors: {
    background: '#c0c0c0',
    dialogueBox: '#ffffff',
    dialogueBoxBorder: '#000000',
    dialogueText: '#000000',
    speakerName: '#000000',
    speakerNameBg: '#c0c0c0',
    choiceButton: '#c0c0c0',
    choiceButtonHover: '#dfdfdf',
    choiceButtonText: '#000000',
    choiceButtonBorder: '#000000',
    accent: '#000080',
    debugPanelBg: '#ffffff',
    debugPanelText: '#000000',
  },
  fonts: {
    dialogue: "'MS Sans Serif', 'Segoe UI', 'Arial', sans-serif",
    speaker: "'MS Sans Serif', 'Segoe UI', 'Arial', sans-serif",
    ui: "'MS Sans Serif', 'Segoe UI', 'Arial', sans-serif",
  },
  effects: {
    typewriterSpeed: 30,
    fadeTransition: false,
    dialogueAnimation: 'typewriter',
  },
  window: {
    style: 'win31',
    titleBarHeight: 20,
    showCloseButton: true,
    showMinMaxButtons: true,
    borderWidth: 3,
    titleBarColor: '#000080',
    titleBarTextColor: '#ffffff',
    buttonStyle: '3d',
  },
}

// Windows 95 스타일
export const win95Theme: GameTheme = {
  id: 'win95',
  name: 'Windows 95',
  colors: {
    background: '#008080',
    dialogueBox: '#c0c0c0',
    dialogueBoxBorder: '#000000',
    dialogueText: '#000000',
    speakerName: '#000000',
    speakerNameBg: '#c0c0c0',
    choiceButton: '#c0c0c0',
    choiceButtonHover: '#dfdfdf',
    choiceButtonText: '#000000',
    choiceButtonBorder: '#000000',
    accent: '#000080',
    debugPanelBg: '#c0c0c0',
    debugPanelText: '#000000',
  },
  fonts: {
    dialogue: "'MS Sans Serif', 'Tahoma', 'Segoe UI', sans-serif",
    speaker: "'MS Sans Serif', 'Tahoma', 'Segoe UI', sans-serif",
    ui: "'MS Sans Serif', 'Tahoma', 'Segoe UI', sans-serif",
  },
  effects: {
    typewriterSpeed: 25,
    fadeTransition: false,
    dialogueAnimation: 'typewriter',
  },
  window: {
    style: 'win95',
    titleBarHeight: 22,
    showCloseButton: true,
    showMinMaxButtons: true,
    borderWidth: 2,
    titleBarGradient: 'linear-gradient(90deg, #000080 0%, #1084d0 100%)',
    titleBarTextColor: '#ffffff',
    buttonStyle: '3d',
  },
}

// Mac System 7 스타일
export const system7Theme: GameTheme = {
  id: 'system7',
  name: 'System 7',
  colors: {
    background: '#6699cc',
    dialogueBox: '#ffffff',
    dialogueBoxBorder: '#000000',
    dialogueText: '#000000',
    speakerName: '#000000',
    speakerNameBg: '#ffffff',
    choiceButton: '#ffffff',
    choiceButtonHover: '#dddddd',
    choiceButtonText: '#000000',
    choiceButtonBorder: '#000000',
    accent: '#000000',
    debugPanelBg: '#ffffff',
    debugPanelText: '#000000',
  },
  fonts: {
    dialogue: "'Chicago', 'Geneva', 'Helvetica Neue', sans-serif",
    speaker: "'Chicago', 'Geneva', 'Helvetica Neue', sans-serif",
    ui: "'Chicago', 'Geneva', 'Helvetica Neue', sans-serif",
  },
  effects: {
    typewriterSpeed: 30,
    fadeTransition: false,
    dialogueAnimation: 'typewriter',
  },
  window: {
    style: 'system7',
    titleBarHeight: 20,
    showCloseButton: true,
    showMinMaxButtons: false,
    borderWidth: 1,
    titleBarColor: '#ffffff',
    titleBarTextColor: '#000000',
    buttonStyle: 'pixel',
  },
}

export const themePresets: GameTheme[] = [
  darkTheme,
  lightTheme,
  retroTheme,
  novelTheme,
  cyberpunkTheme,
  classicVnTheme,
  dosTheme,
  win31Theme,
  win95Theme,
  system7Theme,
]

export const getThemeById = (id: string): GameTheme => {
  return themePresets.find((t) => t.id === id) || darkTheme
}
