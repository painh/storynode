import { useMemo } from 'react'
import type { Node } from '@xyflow/react'
import type { StoryChapter, CommentNode } from '../../../types/story'
import type { EditorNodeData } from '../../../types/editor'
import { autoLayoutNodes } from '../../../utils/autoLayout'

export function useNodesInitialization(
  chapter: StoryChapter | undefined,
  commentNodes: CommentNode[],
  playingNodeId: string | null | undefined
): Node<EditorNodeData>[] {
  const commentNodesKey = JSON.stringify(commentNodes.map(c => ({ id: c.id, pos: c.position, data: c.data })))

  return useMemo((): Node<EditorNodeData>[] => {
    if (!chapter) return []

    // 저장된 위치가 없는 노드가 있는지 확인
    const hasUnsavedPositions = chapter.nodes.some(node => !node.position)

    // 저장된 위치가 없으면 자동 레이아웃 계산
    const autoPositions = hasUnsavedPositions
      ? autoLayoutNodes(chapter.nodes, chapter.startNodeId)
      : {}

    // Story 노드들
    const storyNodes: Node<EditorNodeData>[] = chapter.nodes.map((storyNode) => {
      const position = storyNode.position || autoPositions[storyNode.id] || { x: 100, y: 100 }

      return {
        id: storyNode.id,
        type: storyNode.type,
        position,
        data: {
          storyNode,
          label: storyNode.type,
          isPlaying: playingNodeId === storyNode.id,
        },
      }
    })

    // Comment 노드들 (다른 노드 뒤에 표시)
    const commentFlowNodes: Node<EditorNodeData>[] = commentNodes.map((comment) => ({
      id: comment.id,
      type: 'comment',
      position: comment.position,
      data: {
        commentData: comment.data,
        label: 'comment',
      },
      zIndex: -1,
    }))

    return [...commentFlowNodes, ...storyNodes]
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter, commentNodesKey, playingNodeId])
}
