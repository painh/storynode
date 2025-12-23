import { memo, useCallback, useRef, useState, useEffect, useMemo } from 'react'
import { type NodeProps, type Node, NodeResizer, useViewport } from '@xyflow/react'
import type { EditorNodeData, CommentNodeData } from '../../types/editor'
import { useEditorStore } from '../../stores/editorStore'
import styles from './CommentNode.module.css'

const DEFAULT_COMMENT_DATA: CommentNodeData = {
  title: 'Comment',
  description: '',
  color: '#5C6BC0',
  width: 300,
  height: 200,
  isCollapsed: false,
}

export const CommentNode = memo(function CommentNode({
  id,
  data,
  selected,
}: NodeProps<Node<EditorNodeData>>) {
  const commentData = data.commentData || DEFAULT_COMMENT_DATA
  const updateCommentNode = useEditorStore((s) => s.updateCommentNode)
  const setSelectedComment = useEditorStore((s) => s.setSelectedComment)
  const [isEditing, setIsEditing] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)
  const { zoom } = useViewport()

  // 줌아웃 시 타이틀 폰트 크기를 키워서 가독성 향상
  // 줌 1.0 기준 1x, 줌 0.5일 때 약 1.4x, 줌 0.25일 때 2x, 줌 0.1일 때 약 3.16x
  const titleScale = useMemo(() => {
    console.log('[CommentNode] zoom:', zoom)
    if (zoom >= 1) return 1
    return 1 / Math.sqrt(zoom)
  }, [zoom])

  // 노드가 선택되면 인스펙터에도 반영
  // selectedCommentId를 의존성에서 제거하여 무한 루프 방지
  useEffect(() => {
    if (selected) {
      setSelectedComment(id)
    }
    // selected가 false일 때는 Canvas의 onSelectionChange에서 처리
  }, [selected, id, setSelectedComment])

  const handleUpdate = useCallback((updates: Partial<CommentNodeData>) => {
    updateCommentNode(id, updates)
  }, [id, updateCommentNode])

  const handleToggleCollapse = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    handleUpdate({ isCollapsed: !commentData.isCollapsed })
  }, [commentData.isCollapsed, handleUpdate])

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

  const isCollapsed = commentData.isCollapsed

  return (
    <div
      className={`${styles.comment} ${selected ? styles.selected : ''} ${isCollapsed ? styles.collapsed : ''}`}
      style={{
        '--comment-color': commentData.color,
        width: isCollapsed ? 'auto' : commentData.width,
        height: isCollapsed ? 'auto' : commentData.height,
      } as React.CSSProperties}
    >
      <NodeResizer
        minWidth={150}
        minHeight={100}
        isVisible={selected && !isCollapsed}
        lineClassName={styles.resizerLine}
        handleClassName={styles.resizerHandle}
        onResize={handleResize}
      />

      <div className={styles.header}>
        <button
          className={styles.collapseBtn}
          onClick={handleToggleCollapse}
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? '▶' : '▼'}
        </button>
        {isEditing ? (
          <input
            ref={titleRef}
            type="text"
            className={styles.titleInput}
            value={commentData.title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            style={{
              fontSize: `${13 * titleScale}px`,
              transformOrigin: 'left center',
            }}
          />
        ) : (
          <span
            className={styles.title}
            onDoubleClick={handleTitleDoubleClick}
            style={{
              fontSize: `${13 * titleScale}px`,
              transformOrigin: 'left center',
            }}
          >
            {commentData.title}
          </span>
        )}
      </div>

      {!isCollapsed && (
        <div className={styles.body}>
          <textarea
            className={styles.description}
            placeholder="Add description..."
            value={commentData.description}
            onChange={(e) => handleUpdate({ description: e.target.value })}
          />
        </div>
      )}
    </div>
  )
})
