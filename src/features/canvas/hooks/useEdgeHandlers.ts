import { useCallback } from 'react'
import type { Edge, EdgeChange } from '@xyflow/react'
import { applyEdgeChanges } from '@xyflow/react'
import type { StoryChapter } from '../../../types/story'

export function useEdgeHandlers(
  edges: Edge[],
  chapter: StoryChapter | undefined,
  updateNode: (nodeId: string, updates: Record<string, unknown>) => void,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
) {
  return useCallback(
    (changes: EdgeChange<Edge>[]) => {
      const removeChanges = changes.filter((c) => c.type === 'remove')
      removeChanges.forEach((change) => {
        if (change.type === 'remove') {
          const edge = edges.find((e) => e.id === change.id)
          if (edge && chapter) {
            const sourceNode = chapter.nodes.find((n) => n.id === edge.source)
            if (sourceNode) {
              const sourceHandle = edge.sourceHandle || 'exec-out'

              // 데이터 바인딩 엣지 삭제
              if (sourceHandle.startsWith('data-out-')) {
                const targetNode = chapter.nodes.find((n) => n.id === edge.target)
                if (targetNode?.dataBindings) {
                  const targetHandle = edge.targetHandle || ''
                  const targetPath = targetHandle.replace('data-in-', '')
                  const newBindings = targetNode.dataBindings.filter(
                    (b) => !(b.sourceNodeId === edge.source && b.targetPath === targetPath)
                  )
                  updateNode(edge.target, { dataBindings: newBindings })
                }
              }
              // choice 연결 삭제
              else if (sourceHandle.startsWith('choice-')) {
                const choiceIndex = parseInt(sourceHandle.split('-')[1])
                if (sourceNode.choices?.[choiceIndex]) {
                  const choices = [...sourceNode.choices]
                  choices[choiceIndex] = { ...choices[choiceIndex], nextNodeId: '' }
                  updateNode(edge.source, { choices })
                }
              }
              // condition 분기 삭제
              else if (sourceHandle.startsWith('condition-')) {
                const conditionIndex = parseInt(sourceHandle.split('-')[1])
                if (sourceNode.conditionBranches?.[conditionIndex]) {
                  const branches = [...sourceNode.conditionBranches]
                  branches[conditionIndex] = { ...branches[conditionIndex], nextNodeId: undefined }
                  updateNode(edge.source, { conditionBranches: branches })
                }
              }
              // default 연결 삭제
              else if (sourceHandle === 'default') {
                updateNode(edge.source, { defaultNextNodeId: undefined })
              }
              // 일반 nextNodeId 삭제
              else {
                updateNode(edge.source, { nextNodeId: undefined })
              }
            }
          }
        }
      })

      setEdges((eds) => applyEdgeChanges(changes, eds))
    },
    [edges, chapter, updateNode, setEdges]
  )
}
