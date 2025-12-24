import type { VariableDefinition } from '../../types/story'
import type { EditorState, ImmerSet } from './types'
import { generateId } from '../utils/editorUtils'

export const createVariableActions = (set: ImmerSet, get: () => EditorState) => ({
  createVariable: (variable?: Partial<VariableDefinition>): VariableDefinition | null => {
    const state = get()
    const stage = state.project.stages.find(s => s.id === state.currentStageId)
    const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)

    if (!chapter) return null

    const type = variable?.type || 'number'
    let defaultValue: boolean | number | string | Array<boolean | number | string> = 0
    if (variable?.defaultValue !== undefined) {
      defaultValue = variable.defaultValue
    } else {
      switch (type) {
        case 'boolean': defaultValue = false; break
        case 'string': defaultValue = ''; break
        case 'array': defaultValue = []; break
        default: defaultValue = 0
      }
    }

    const newVariable: VariableDefinition = {
      id: generateId(),
      name: variable?.name || 'newVariable',
      type,
      defaultValue,
      arrayItemType: variable?.arrayItemType || (type === 'array' ? 'string' : undefined),
      description: variable?.description,
    }

    set((state) => {
      const stage = state.project.stages.find(s => s.id === state.currentStageId)
      const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)
      if (chapter) {
        if (!chapter.variables) {
          chapter.variables = []
        }
        chapter.variables.push(newVariable)
        state.isDirty = true
      }
    })

    return newVariable
  },

  updateVariable: (variableId: string, updates: Partial<VariableDefinition>) => {
    set((state) => {
      const stage = state.project.stages.find(s => s.id === state.currentStageId)
      const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)
      const variable = chapter?.variables?.find(v => v.id === variableId)

      if (variable) {
        // 타입이 변경되면 defaultValue도 해당 타입에 맞게 변환
        if (updates.type && updates.type !== variable.type) {
          switch (updates.type) {
            case 'boolean':
              updates.defaultValue = Boolean(variable.defaultValue)
              break
            case 'number':
              updates.defaultValue = Number(variable.defaultValue) || 0
              break
            case 'string':
              updates.defaultValue = String(variable.defaultValue)
              break
            case 'array':
              updates.defaultValue = []
              updates.arrayItemType = 'string'
              break
          }
        }
        Object.assign(variable, updates)
        state.isDirty = true
      }
    })
  },

  deleteVariable: (variableId: string) => {
    set((state) => {
      const stage = state.project.stages.find(s => s.id === state.currentStageId)
      const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)

      if (chapter?.variables) {
        chapter.variables = chapter.variables.filter(v => v.id !== variableId)
        state.isDirty = true
      }
    })
  },

  getVariables: (): VariableDefinition[] => {
    const state = get()
    const stage = state.project.stages.find(s => s.id === state.currentStageId)
    const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)
    return chapter?.variables || []
  },

  getVariableById: (variableId: string): VariableDefinition | undefined => {
    const state = get()
    const stage = state.project.stages.find(s => s.id === state.currentStageId)
    const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)
    return chapter?.variables?.find(v => v.id === variableId)
  },
})
