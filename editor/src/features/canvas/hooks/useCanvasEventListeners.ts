import { useEffect, useRef } from 'react'
import type { Node, Edge } from '@xyflow/react'
import type { StoryChapter } from '../../../types/story'
import type { EditorNodeData } from '../../../types/editor'
import { autoLayoutNodes } from '../../../utils/autoLayout'

export function useCanvasEventListeners(
  chapter: StoryChapter | undefined,
  updateNode: (nodeId: string, updates: { position?: { x: number; y: number } }) => void,
  setNodes: React.Dispatch<React.SetStateAction<Node<EditorNodeData>[]>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
) {
  const setNodesRef = useRef<typeof setNodes | null>(null)

  useEffect(() => {
    setNodesRef.current = setNodes
  }, [setNodes])

  // 자동 정렬 이벤트 리스너
  useEffect(() => {
    const handleAutoLayout = () => {
      if (!chapter || !setNodesRef.current) return

      const autoPositions = autoLayoutNodes(chapter.nodes, chapter.startNodeId)

      setNodesRef.current((nds) =>
        nds.map((node) => {
          const newPos = autoPositions[node.id]
          if (newPos && node.type !== 'comment') {
            updateNode(node.id, { position: newPos })
          }
          return {
            ...node,
            position: newPos || node.position,
          }
        })
      )
    }

    window.addEventListener('storynode:auto-layout', handleAutoLayout)
    return () => {
      window.removeEventListener('storynode:auto-layout', handleAutoLayout)
    }
  }, [chapter, updateNode])

  // 모든 노드/엣지 선택 이벤트 리스너
  useEffect(() => {
    const handleSelectAll = () => {
      if (!setNodesRef.current) return

      setNodesRef.current((nds) =>
        nds.map((node) => ({
          ...node,
          selected: true,
        }))
      )

      setEdges((eds) =>
        eds.map((edge) => ({
          ...edge,
          selected: true,
        }))
      )
    }

    window.addEventListener('storynode:select-all', handleSelectAll)
    return () => {
      window.removeEventListener('storynode:select-all', handleSelectAll)
    }
  }, [setEdges])

  return { setNodesRef }
}
