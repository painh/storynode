import { useMemo } from 'react'
import type { Edge } from '@xyflow/react'
import type { StoryChapter } from '../../../types/story'

export function useEdgesInitialization(chapter: StoryChapter | undefined): Edge[] {
  return useMemo((): Edge[] => {
    if (!chapter) return []

    const edges: Edge[] = []

    chapter.nodes.forEach((node) => {
      // nextNodeId 연결
      if (node.nextNodeId) {
        edges.push({
          id: `${node.id}-${node.nextNodeId}`,
          source: node.id,
          target: node.nextNodeId,
          sourceHandle: 'exec-out',
          targetHandle: 'exec-in',
        })
      }

      // choice 연결
      if (node.choices) {
        node.choices.forEach((choice, index) => {
          if (choice.nextNodeId) {
            edges.push({
              id: `${node.id}-choice-${index}-${choice.nextNodeId}`,
              source: node.id,
              target: choice.nextNodeId,
              sourceHandle: `choice-${index}`,
              targetHandle: 'exec-in',
            })
          }
        })
      }

      // condition 분기 연결
      if (node.conditionBranches) {
        node.conditionBranches.forEach((branch, index) => {
          if (branch.nextNodeId) {
            edges.push({
              id: `${node.id}-condition-${index}-${branch.nextNodeId}`,
              source: node.id,
              target: branch.nextNodeId,
              sourceHandle: `condition-${index}`,
              targetHandle: 'exec-in',
            })
          }
        })
      }

      // condition default 연결
      if (node.defaultNextNodeId) {
        edges.push({
          id: `${node.id}-default-${node.defaultNextNodeId}`,
          source: node.id,
          target: node.defaultNextNodeId,
          sourceHandle: 'default',
          targetHandle: 'exec-in',
        })
      }

      // 데이터 바인딩 엣지
      if (node.dataBindings) {
        node.dataBindings.forEach((binding, index) => {
          edges.push({
            id: `${binding.sourceNodeId}-data-${index}-${node.id}`,
            source: binding.sourceNodeId,
            target: node.id,
            sourceHandle: `data-out-${binding.sourcePath}`,
            targetHandle: `data-in-${binding.targetPath}`,
            type: 'data',
          })
        })
      }
    })

    return edges
  }, [chapter])
}
