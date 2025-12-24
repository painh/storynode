import type { ProjectResource, ResourceType } from '../../types/story'
import type { EditorState, ImmerSet } from './types'
import { generateResourceId, defaultTemplateResources } from '../utils/editorUtils'

export const createResourceActions = (set: ImmerSet, get: () => EditorState) => ({
  addResource: (resource: ProjectResource) => set((state) => {
    if (!state.project.resources) {
      state.project.resources = []
    }
    if (!resource.id) {
      resource.id = generateResourceId()
    }
    state.project.resources.push(resource)
    state.isDirty = true
  }),

  updateResource: (resourceId: string, updates: Partial<ProjectResource>) => set((state) => {
    const resources = state.project.resources
    if (resources) {
      const index = resources.findIndex(r => r.id === resourceId)
      if (index !== -1) {
        Object.assign(resources[index], updates)
        state.isDirty = true
      }
    }
  }),

  deleteResource: (resourceId: string) => set((state) => {
    if (state.project.resources) {
      const index = state.project.resources.findIndex(r => r.id === resourceId)
      if (index !== -1) {
        state.project.resources.splice(index, 1)
        state.isDirty = true
      }
    }
  }),

  getResourcesByType: (type: ResourceType) => {
    const state = get()
    return (state.project.resources || []).filter(r => r.type === type)
  },

  loadTemplateResources: async () => {
    set((state) => {
      if (!state.project.resources) {
        state.project.resources = []
      }
      defaultTemplateResources.forEach(template => {
        const exists = state.project.resources!.some(r => r.path === template.path)
        if (!exists) {
          state.project.resources!.push({ ...template })
        }
      })
    })
  },
})
