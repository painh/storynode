import { memo, useMemo } from 'react'
import type { NodeProps, Node } from '@xyflow/react'
import { Handle, Position, NodeToolbar } from '@xyflow/react'
import { useSearchStore } from '../../stores/searchStore'
import { useEditorStore } from '../../stores/editorStore'
import { highlightText } from '../../utils/highlight'
import type { EditorNodeData } from '../../types/editor'
import styles from './CustomNode.module.css'

export const CustomNode = memo(function CustomNode({
  id,
  data,
  selected,
}: NodeProps<Node<EditorNodeData>>) {
  const { storyNode } = data
  const customData = storyNode?.customData
  const { highlightedNodeId, highlightQuery } = useSearchStore()
  const { deleteNode } = useEditorStore()

  const handleDelete = () => {
    if (id) {
      deleteNode(id)
    }
  }

  const shouldHighlight = highlightedNodeId === id && highlightQuery

  const displayTitle = useMemo(() => {
    const title = customData?.title || 'Custom Node'
    if (shouldHighlight) {
      return highlightText(title, highlightQuery, styles.highlight)
    }
    return title
  }, [customData?.title, shouldHighlight, highlightQuery])

  const displayDescription = useMemo(() => {
    const desc = customData?.description || ''
    const truncated = desc.substring(0, 80)
    const suffix = desc.length > 80 ? '...' : ''

    if (shouldHighlight) {
      return <>{highlightText(truncated, highlightQuery, styles.highlight)}{suffix}</>
    }
    return truncated + suffix
  }, [customData?.description, shouldHighlight, highlightQuery])

  if (!storyNode) return null

  const nodeColor = customData?.color || '#9C27B0'
  const fields = customData?.fields || []
  const values = customData?.values || {}

  return (
    <div
      className={`${styles.node} ${selected ? styles.selected : ''} ${data.isPlaying ? styles.playing : ''}`}
      style={{ '--header-color': nodeColor } as React.CSSProperties}
    >
      {/* Delete Button */}
      {selected && (
        <NodeToolbar isVisible={selected} position={Position.Top}>
          <button
            className={styles.deleteBtn}
            onClick={handleDelete}
            title="노드 삭제 (Delete)"
          >
            🗑️
          </button>
        </NodeToolbar>
      )}

      {/* Input Execution Pin */}
      <Handle
        type="target"
        position={Position.Left}
        id="exec-in"
        className={styles.execHandle}
      />

      {/* Header */}
      <div className={styles.header}>
        <span className={styles.icon}>🔧</span>
        <span className={styles.label}>{displayTitle}</span>
      </div>

      {/* Body */}
      <div className={styles.body}>
        {customData?.description && (
          <div className={styles.description}>{displayDescription}</div>
        )}

        {fields.length > 0 && (
          <div className={styles.fields}>
            {fields.slice(0, 3).map((field) => (
              <div key={field.id} className={styles.fieldRow}>
                <span className={styles.fieldName}>{field.name}:</span>
                <span className={styles.fieldValue}>
                  {String(values[field.id] ?? field.defaultValue ?? '')}
                </span>
              </div>
            ))}
            {fields.length > 3 && (
              <div className={styles.moreFields}>+{fields.length - 3} more</div>
            )}
          </div>
        )}

        {fields.length === 0 && !customData?.description && (
          <div className={styles.empty}>No fields defined</div>
        )}
      </div>

      {/* Output Execution Pin */}
      <Handle
        type="source"
        position={Position.Right}
        id="exec-out"
        className={styles.execHandle}
      />
    </div>
  )
})
