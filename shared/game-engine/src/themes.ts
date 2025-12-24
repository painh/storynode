// Theme definitions for StoryNode game player

export interface ThemeColors {
  background: string;
  dialogueBox: string;
  dialogueBoxBorder: string;
  dialogueText: string;
  speakerName: string;
  speakerNameBg: string;
  choiceButton: string;
  choiceButtonHover: string;
  choiceButtonText: string;
  choiceButtonBorder: string;
  accent: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
  typewriterSpeed: number;
}

export const THEMES: Record<string, Theme> = {
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

export function getTheme(themeId: string): Theme {
  return THEMES[themeId] || THEMES.dark;
}
