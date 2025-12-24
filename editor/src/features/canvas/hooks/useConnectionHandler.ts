import { useCallback } from 'react'
import type { Connection, Edge } from '@xyflow/react'
import { addEdge } from '@xyflow/react'
import type { StoryChapter, DataBinding } from '../../../types/story'
import { parseDataHandleId } from '../../../config/dataHandles'
import { getNestedValue, setNestedValue } from '../../../utils/nestedProperty'

export function useConnectionHandler(
  chapter: StoryChapter | undefined,
  updateNode: (nodeId: string, updates: Record<string, unknown>) => void,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
) {
  return useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return

      const sourceHandle = connection.sourceHandle || 'exec-out'
      const targetHandle = connection.targetHandle || 'exec-in'

      // 데이터 핸들 연결인 경우
      if (sourceHandle.startsWith('data-out-') && targetHandle.startsWith('data-in-')) {
        const sourceInfo = parseDataHandleId(sourceHandle)
        const targetInfo = parseDataHandleId(targetHandle)

        if (sourceInfo && targetInfo) {
          const sourceNode = chapter?.nodes.find(n => n.id === connection.source)
          const targetNode = chapter?.nodes.find(n => n.id === connection.target)
          if (sourceNode && targetNode) {
            const bindings: DataBinding[] = [...(targetNode.dataBindings || [])]

            const existingIndex = bindings.findIndex(b => b.targetPath === targetInfo.path)
            const newBinding: DataBinding = {
              targetPath: targetInfo.path,
              sourceNodeId: connection.source,
              sourcePath: sourceInfo.path,
            }

            if (existingIndex >= 0) {
              bindings[existingIndex] = newBinding
            } else {
              bindings.push(newBinding)
            }

            const sourceValue = getNestedValue(
              sourceNode as unknown as Record<string, unknown>,
              sourceInfo.path
            )

            const updates: Record<string, unknown> = { dataBindings: bindings }

            if (sourceValue !== undefined) {
              if (!targetInfo.path.includes('.')) {
                updates[targetInfo.path] = sourceValue
              } else {
                const [topKey] = targetInfo.path.split('.')
                const currentTop = (targetNode as unknown as Record<string, unknown>)[topKey]
                const updatedTop = setNestedValue(
                  (currentTop as Record<string, unknown>) || {},
                  targetInfo.path.substring(topKey.length + 1),
                  sourceValue
                )
                updates[topKey] = updatedTop
              }
            }

            updateNode(connection.target, updates)
          }
        }

        setEdges((eds) => addEdge({ ...connection, type: 'data' }, eds))
        return
      }

      // choice 핸들인 경우
      if (sourceHandle.startsWith('choice-')) {
        const choiceIndex = parseInt(sourceHandle.split('-')[1])
        const sourceNode = chapter?.nodes.find(n => n.id === connection.source)
        if (sourceNode?.choices?.[choiceIndex]) {
          const choices = [...sourceNode.choices]
          choices[choiceIndex] = {
            ...choices[choiceIndex],
            nextNodeId: connection.target,
          }
          updateNode(connection.source, { choices })
        }
      }
      // condition 핸들인 경우
      else if (sourceHandle.startsWith('condition-')) {
        const conditionIndex = parseInt(sourceHandle.split('-')[1])
        const sourceNode = chapter?.nodes.find(n => n.id === connection.source)
        if (sourceNode?.conditionBranches?.[conditionIndex]) {
          const branches = [...sourceNode.conditionBranches]
          branches[conditionIndex] = {
            ...branches[conditionIndex],
            nextNodeId: connection.target,
          }
          updateNode(connection.source, { conditionBranches: branches })
        }
      }
      // condition default 핸들인 경우
      else if (sourceHandle === 'default') {
        updateNode(connection.source, { defaultNextNodeId: connection.target })
      }
      // 일반 exec-out 연결
      else {
        updateNode(connection.source, { nextNodeId: connection.target })
      }

      setEdges((eds) => addEdge(connection, eds))
    },
    [chapter, updateNode, setEdges]
  )
}
