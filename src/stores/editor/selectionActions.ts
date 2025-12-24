import type { ImmerSet } from './types'

export const createSelectionActions = (set: ImmerSet) => ({
  setSelectedNodes: (nodeIds: string[]) => set((state) => {
    state.selectedNodeIds = nodeIds
  }),

  clearSelection: () => set((state) => {
    state.selectedNodeIds = []
  }),
})
