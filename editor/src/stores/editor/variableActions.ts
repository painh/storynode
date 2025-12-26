import type { VariableDefinition } from '../../types/story'
import type { EditorState, ImmerSet } from './types'
import { generateId } from '../utils/editorUtils'

export const createVariableActions = (set: ImmerSet, get: () => EditorState) => ({
  createVariable: (variable?: Partial<VariableDefinition>): VariableDefinition | null => {
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
      if (!state.project.variables) {
        state.project.variables = []
      }
      state.project.variables.push(newVariable)
      state.isDirty = true
    })

    return newVariable
  },

  updateVariable: (variableId: string, updates: Partial<VariableDefinition>) => {
    set((state) => {
      const variable = state.project.variables?.find(v => v.id === variableId)

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
      if (state.project.variables) {
        state.project.variables = state.project.variables.filter(v => v.id !== variableId)
        state.isDirty = true
      }
    })
  },

  getVariables: (): VariableDefinition[] => {
    const state = get()
    return state.project.variables || []
  },

  getVariableById: (variableId: string): VariableDefinition | undefined => {
    const state = get()
    // 전역 변수에서 먼저 찾기
    const globalVar = state.project.variables?.find(v => v.id === variableId)
    if (globalVar) return globalVar
    
    // 현재 챕터 변수에서 찾기
    const chapter = state.project.stages
      .find(s => s.id === state.currentStageId)
      ?.chapters.find(c => c.id === state.currentChapterId)
    return chapter?.variables?.find(v => v.id === variableId)
  },

  // 챕터 로컬 변수 생성
  createChapterVariable: (variable?: Partial<VariableDefinition>): VariableDefinition | null => {
    const state = get()
    const { currentStageId, currentChapterId } = state
    if (!currentStageId || !currentChapterId) return null

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
      name: variable?.name || 'localVar',
      type,
      defaultValue,
      arrayItemType: variable?.arrayItemType || (type === 'array' ? 'string' : undefined),
      description: variable?.description,
    }

    set((state) => {
      const chapter = state.project.stages
        .find(s => s.id === currentStageId)
        ?.chapters.find(c => c.id === currentChapterId)
      if (chapter) {
        if (!chapter.variables) chapter.variables = []
        chapter.variables.push(newVariable)
        state.isDirty = true
      }
    })

    return newVariable
  },

  // 챕터 로컬 변수 업데이트
  updateChapterVariable: (variableId: string, updates: Partial<VariableDefinition>) => {
    const state = get()
    const { currentStageId, currentChapterId } = state

    set((state) => {
      const chapter = state.project.stages
        .find(s => s.id === currentStageId)
        ?.chapters.find(c => c.id === currentChapterId)
      const variable = chapter?.variables?.find(v => v.id === variableId)

      if (variable) {
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

  // 챕터 로컬 변수 삭제
  deleteChapterVariable: (variableId: string) => {
    const state = get()
    const { currentStageId, currentChapterId } = state

    set((state) => {
      const chapter = state.project.stages
        .find(s => s.id === currentStageId)
        ?.chapters.find(c => c.id === currentChapterId)
      if (chapter?.variables) {
        chapter.variables = chapter.variables.filter(v => v.id !== variableId)
        state.isDirty = true
      }
    })
  },

  // 현재 챕터의 로컬 변수 가져오기
  getChapterVariables: (): VariableDefinition[] => {
    const state = get()
    const chapter = state.project.stages
      .find(s => s.id === state.currentStageId)
      ?.chapters.find(c => c.id === state.currentChapterId)
    return chapter?.variables || []
  },

  // 전역 + 챕터 변수 모두 가져오기
  getAllVariables: (): VariableDefinition[] => {
    const state = get()
    const globalVars = state.project.variables || []
    const chapter = state.project.stages
      .find(s => s.id === state.currentStageId)
      ?.chapters.find(c => c.id === state.currentChapterId)
    const chapterVars = chapter?.variables || []
    return [...globalVars, ...chapterVars]
  },
})
