import { useCallback, useRef } from 'react'
import type { Node } from '@xyflow/react'
import type { EditorNodeData } from '../../../types/editor'

interface DraggedCommentInfo {
  commentId: string
  startPos: { x: number; y: number }
  childNodeIds: string[]
  childStartPositions: Map<string, { x: number; y: number }>
}

export function useCommentNodeDrag(
  nodes: Node<EditorNodeData>[],
  setNodes: React.Dispatch<React.SetStateAction<Node<EditorNodeData>[]>>,
  updateNode: (nodeId: string, updates: { position?: { x: number; y: number } }) => void,
  updateCommentPosition: (commentId: string, position: { x: number; y: number }) => void
) {
  const draggedCommentRef = useRef<DraggedCommentInfo | null>(null)

  // Comment 노드 내부에 있는 노드들 찾기
  const getNodesInsideComment = useCallback((commentNode: Node<EditorNodeData>, allNodes: Node<EditorNodeData>[]) => {
    const commentData = commentNode.data?.commentData
    if (!commentData) return []

    const commentBounds = {
      left: commentNode.position.x,
      top: commentNode.position.y,
      right: commentNode.position.x + (commentData.width || 300),
      bottom: commentNode.position.y + (commentData.height || 200),
    }

    return allNodes.filter(node => {
      if (node.type === 'comment' || node.id === commentNode.id) return false
      const nodeCenter = {
        x: node.position.x + 140,
        y: node.position.y + 90,
      }
      return (
        nodeCenter.x >= commentBounds.left &&
        nodeCenter.x <= commentBounds.right &&
        nodeCenter.y >= commentBounds.top &&
        nodeCenter.y <= commentBounds.bottom
      )
    })
  }, [])

  const onNodeDragStart = useCallback(
    (_: React.MouseEvent, node: Node<EditorNodeData>, draggedNodes: Node<EditorNodeData>[]) => {
      if (node.type === 'comment' && draggedNodes.length === 1) {
        const childNodes = getNodesInsideComment(node, nodes)
        if (childNodes.length > 0) {
          const childStartPositions = new Map<string, { x: number; y: number }>()
          childNodes.forEach(child => {
            childStartPositions.set(child.id, { ...child.position })
          })
          draggedCommentRef.current = {
            commentId: node.id,
            startPos: { ...node.position },
            childNodeIds: childNodes.map(n => n.id),
            childStartPositions,
          }
        }
      } else {
        draggedCommentRef.current = null
      }
    },
    [nodes, getNodesInsideComment]
  )

  const onNodeDrag = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (draggedCommentRef.current && node.id === draggedCommentRef.current.commentId) {
        const delta = {
          x: node.position.x - draggedCommentRef.current.startPos.x,
          y: node.position.y - draggedCommentRef.current.startPos.y,
        }

        setNodes(nds =>
          nds.map(n => {
            if (draggedCommentRef.current?.childNodeIds.includes(n.id)) {
              const startPos = draggedCommentRef.current.childStartPositions.get(n.id)
              if (startPos) {
                return {
                  ...n,
                  position: {
                    x: startPos.x + delta.x,
                    y: startPos.y + delta.y,
                  },
                }
              }
            }
            return n
          })
        )
      }
    },
    [setNodes]
  )

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, _node: Node, draggedNodes: Node[]) => {
      if (draggedCommentRef.current) {
        draggedCommentRef.current.childNodeIds.forEach(childId => {
          const childNode = nodes.find(n => n.id === childId)
          if (childNode) {
            updateNode(childId, { position: childNode.position })
          }
        })
        draggedCommentRef.current = null
      }

      draggedNodes.forEach((draggedNode) => {
        if (draggedNode.type === 'comment') {
          updateCommentPosition(draggedNode.id, draggedNode.position)
        } else {
          updateNode(draggedNode.id, { position: draggedNode.position })
        }
      })
    },
    [updateNode, updateCommentPosition, nodes]
  )

  return {
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
  }
}
