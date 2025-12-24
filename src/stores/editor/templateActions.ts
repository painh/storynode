import type { CustomNodeTemplate, StoryNode } from '../../types/story'
import type { EditorState, ImmerSet } from './types'
import { generateId } from '../utils/editorUtils'

export const createTemplateActions = (set: ImmerSet, get: () => EditorState) => ({
  createTemplate: (template?: Partial<CustomNodeTemplate>): CustomNodeTemplate => {
    const now = Date.now()
    const newTemplate: CustomNodeTemplate = {
      id: generateId(),
      name: template?.name || 'New Template',
      description: template?.description || '',
      color: template?.color || '#9C27B0',
      icon: template?.icon || '🧩',
      fields: template?.fields || [],
      defaultValues: template?.defaultValues || {},
      createdAt: now,
      updatedAt: now,
    }

    set((state) => {
      if (!state.project.customNodeTemplates) {
        state.project.customNodeTemplates = []
      }
      state.project.customNodeTemplates.push(newTemplate)
      state.isDirty = true
    })

    return newTemplate
  },

  updateTemplate: (templateId: string, updates: Partial<CustomNodeTemplate>) => {
    set((state) => {
      const templates = state.project.customNodeTemplates || []
      const template = templates.find(t => t.id === templateId)
      if (template) {
        Object.assign(template, updates, { updatedAt: Date.now() })
        state.isDirty = true
      }
    })
  },

  deleteTemplate: (templateId: string) => {
    set((state) => {
      if (state.project.customNodeTemplates) {
        state.project.customNodeTemplates = state.project.customNodeTemplates.filter(
          t => t.id !== templateId
        )
        state.isDirty = true
      }
    })
  },

  getTemplateById: (templateId: string): CustomNodeTemplate | undefined => {
    const state = get()
    return state.project.customNodeTemplates?.find(t => t.id === templateId)
  },

  getTemplates: (): CustomNodeTemplate[] => {
    const state = get()
    return state.project.customNodeTemplates || []
  },

  createNodeFromTemplate: (templateId: string, _position?: { x: number; y: number }): StoryNode | null => {
    const state = get()
    const template = state.project.customNodeTemplates?.find(t => t.id === templateId)

    if (!template) return null

    const stage = state.project.stages.find(s => s.id === state.currentStageId)
    const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)

    if (!chapter) return null

    const newNode: StoryNode = {
      id: generateId(),
      type: 'custom',
      customData: {
        title: template.name,
        description: template.description,
        color: template.color,
        fields: JSON.parse(JSON.stringify(template.fields)), // Deep copy
        values: { ...template.defaultValues },
        templateId: template.id,
      },
    }

    set((state) => {
      const stage = state.project.stages.find(s => s.id === state.currentStageId)
      const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)
      if (chapter) {
        chapter.nodes.push(newNode)
        state.isDirty = true
      }
    })

    return newNode
  },

  syncNodeWithTemplate: (nodeId: string) => {
    const state = get()
    const stage = state.project.stages.find(s => s.id === state.currentStageId)
    const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)
    const node = chapter?.nodes.find(n => n.id === nodeId)

    if (!node || !node.customData?.templateId) return

    const template = state.project.customNodeTemplates?.find(
      t => t.id === node.customData!.templateId
    )

    if (!template) return

    set((state) => {
      const stage = state.project.stages.find(s => s.id === state.currentStageId)
      const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)
      const node = chapter?.nodes.find(n => n.id === nodeId)

      if (node && node.customData) {
        const oldValues = { ...node.customData.values }

        // Update fields from template
        node.customData.fields = JSON.parse(JSON.stringify(template.fields))
        node.customData.title = template.name
        node.customData.description = template.description
        node.customData.color = template.color

        // Merge values: keep existing values for matching fields, add defaults for new fields
        const newValues: Record<string, string | number | boolean> = {}
        template.fields.forEach(field => {
          if (field.id in oldValues) {
            newValues[field.id] = oldValues[field.id]
          } else if (field.id in template.defaultValues) {
            newValues[field.id] = template.defaultValues[field.id]
          } else if (field.defaultValue !== undefined) {
            newValues[field.id] = field.defaultValue
          }
        })
        node.customData.values = newValues

        state.isDirty = true
      }
    })
  },

  detachNodeFromTemplate: (nodeId: string) => {
    set((state) => {
      const stage = state.project.stages.find(s => s.id === state.currentStageId)
      const chapter = stage?.chapters.find(c => c.id === state.currentChapterId)
      const node = chapter?.nodes.find(n => n.id === nodeId)

      if (node && node.customData) {
        delete node.customData.templateId
        state.isDirty = true
      }
    })
  },
})
