import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { temporal } from 'zundo'
import type { EditorState } from './editor/types'
import { createDefaultProject, defaultTemplateResources } from './utils/editorUtils'
import { createStageActions } from './editor/stageActions'
import { createChapterActions } from './editor/chapterActions'
import { createNodeActions } from './editor/nodeActions'
import { createSelectionActions } from './editor/selectionActions'
import { createSettingsActions } from './editor/settingsActions'
import { createResourceActions } from './editor/resourceActions'
import { createCommentActions } from './editor/commentActions'
import { createTemplateActions } from './editor/templateActions'
import { createVariableActions } from './editor/variableActions'

export const useEditorStore = create<EditorState>()(
  temporal(
    immer((set, get) => ({
      project: createDefaultProject(),
      currentStageId: 'stage_1',
      currentChapterId: 'chapter_1',
      selectedNodeIds: [],
      selectedCommentId: null,
      isDirty: false,

      setDirty: (dirty) => set({ isDirty: dirty }),
      markClean: () => set({ isDirty: false }),

      setProject: (project) => {
        // 마이그레이션: 챕터 레벨 variables를 프로젝트 레벨로 이동
        let migratedVariables = project.variables || []
        const existingIds = new Set(migratedVariables.map(v => v.id))

        for (const stage of project.stages) {
          for (const chapter of stage.chapters) {
            // 챕터에 variables가 있으면 프로젝트 레벨로 병합
            if ((chapter as { variables?: typeof migratedVariables }).variables) {
              for (const v of (chapter as { variables?: typeof migratedVariables }).variables!) {
                if (!existingIds.has(v.id)) {
                  migratedVariables.push(v)
                  existingIds.add(v.id)
                }
              }
              // 챕터에서 variables 제거
              delete (chapter as { variables?: typeof migratedVariables }).variables
            }
          }
        }

        set({
          project: {
            ...project,
            variables: migratedVariables,
            resources: project.resources || [...defaultTemplateResources],
            gameSettings: project.gameSettings || {
              defaultGameMode: 'visualNovel',
              defaultThemeId: 'dark',
              customThemes: [],
            },
          },
          currentStageId: project.stages[0]?.id || null,
          currentChapterId: project.stages[0]?.chapters[0]?.id || null,
          selectedNodeIds: [],
          selectedCommentId: null,
          isDirty: false,
        })
      },

      // Stage actions
      ...createStageActions(set, get),

      // Chapter actions
      ...createChapterActions(set, get),

      // Node actions
      ...createNodeActions(set, get),

      // Selection actions
      ...createSelectionActions(set),

      // Settings actions
      ...createSettingsActions(set),

      // Resource actions
      ...createResourceActions(set, get),

      // Comment actions
      ...createCommentActions(set, get),

      // Template actions
      ...createTemplateActions(set, get),

      // Variable actions
      ...createVariableActions(set, get),
    })),
    {
      limit: 50,
      partialize: (state) => {
        const { project } = state
        return { project }
      },
      equality: (pastState, currentState) => {
        return JSON.stringify(pastState) === JSON.stringify(currentState)
      },
    }
  )
)

// Undo/Redo 훅 export
export const useTemporalStore = <T>(
  _selector: (state: {
    pastStates: EditorState[]
    futureStates: EditorState[]
    undo: () => void
    redo: () => void
    clear: () => void
  }) => T
) => useEditorStore.temporal.getState() as T

// EditorState 타입 re-export
export type { EditorState } from './editor/types'
