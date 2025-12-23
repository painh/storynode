import { memo, useCallback, useRef, useState } from 'react'
import { type NodeProps, type Node, NodeResizer } from '@xyflow/react'
import type { EditorNodeData, CommentNodeData } from '../../types/editor'
import { useEditorStore } from '../../stores/editorStore'
import { useCanvasStore } from '../../stores/canvasStore'
import styles from './CommentNode.module.css'

const DEFAULT_COMMENT_DATA: CommentNodeData = {
  title: 'Comment',
  description: '',
  color: '#5C6BC0',
  width: 300,
  height: 200,
}

export const CommentNode = memo(function CommentNode({
  id,
  data,
  selected,
}: NodeProps<Node<EditorNodeData>>) {
  const commentData = data.commentData || DEFAULT_COMMENT_DATA
  const currentChapterId = useEditorStore((s) => s.currentChapterId)
  const updateCommentNode = useCanvasStore((s) => s.updateCommentNode)
  const [isEditing, setIsEditing] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  const handleUpdate = useCallback((updates: Partial<CommentNodeData>) => {
    if (currentChapterId) {
      updateCommentNode(currentChapterId, id, updates)
    }
  }, [id, currentChapterId, updateCommentNode])

  const handleTitleDoubleClick = useCallback(() => {
    setIsEditing(true)
    setTimeout(() => titleRef.current?.focus(), 0)
  }, [])

  const handleTitleBlur = useCallback(() => {
    setIsEditing(false)
  }, [])

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleUpdate({ title: e.target.value })
  }, [handleUpdate])

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      setIsEditing(false)
    }
  }, [])

  const handleResize = useCallback((_: unknown, params: { width: number; height: number }) => {
    handleUpdate({ width: params.width, height: params.height })
  }, [handleUpdate])

  return (
    <div
      className={`${styles.comment} ${selected ? styles.selected : ''}`}
      style={{
        '--comment-color': commentData.color,
        width: commentData.width,
        height: commentData.height,
      } as React.CSSProperties}
    >
      <NodeResizer
        minWidth={150}
        minHeight={100}
        isVisible={selected}
        lineClassName={styles.resizerLine}
        handleClassName={styles.resizerHandle}
        onResize={handleResize}
      />

      <div className={styles.header}>
        {isEditing ? (
          <input
            ref={titleRef}
            type="text"
            className={styles.titleInput}
            value={commentData.title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
          />
        ) : (
          <span className={styles.title} onDoubleClick={handleTitleDoubleClick}>
            {commentData.title}
          </span>
        )}
      </div>

      <div className={styles.body}>
        <textarea
          className={styles.description}
          placeholder="Add description..."
          value={commentData.description}
          onChange={(e) => handleUpdate({ description: e.target.value })}
        />
      </div>
    </div>
  )
})
