import type { StoryProject, ProjectResource } from '../../types/story'

// ID 생성 함수
export const generateId = () => `node_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
export const generateResourceId = () => `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
export const generateCommentId = () => `comment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

// 기본 템플릿 리소스
export const defaultTemplateResources: ProjectResource[] = [
  {
    id: 'img_char1',
    name: 'char1',
    type: 'image',
    path: '/templates/default/resources/images/char1.png',
  },
  {
    id: 'img_char2',
    name: 'char2',
    type: 'image',
    path: '/templates/default/resources/images/char2.png',
  },
  {
    id: 'img_background',
    name: 'background',
    type: 'image',
    path: '/templates/default/resources/images/background.png',
  },
]

// 기본 프로젝트 생성
export const createDefaultProject = (): StoryProject => ({
  name: 'New Story Project',
  version: '1.0.0',
  stages: [
    {
      id: 'stage_1',
      title: 'Stage 1',
      description: 'First stage',
      partyCharacters: ['kairen'],
      chapters: [
        {
          id: 'chapter_1',
          title: 'Chapter 1',
          description: 'First chapter',
          nodes: [],
          startNodeId: '',
        }
      ]
    }
  ],
  gameSettings: {
    defaultGameMode: 'visualNovel',
    defaultThemeId: 'dark',
    customThemes: [],
  },
  resources: [...defaultTemplateResources],
})

// 기본 gameSettings 생성
export const createDefaultGameSettings = () => ({
  defaultGameMode: 'visualNovel' as const,
  defaultThemeId: 'dark',
  customThemes: [],
})
