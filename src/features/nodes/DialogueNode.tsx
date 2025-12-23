import { memo } from 'react'
import type { NodeProps, Node } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import type { EditorNodeData } from '../../types/editor'
import styles from './DialogueNode.module.css'

export const DialogueNode = memo(function DialogueNode({
  data,
  selected,
}: NodeProps<Node<EditorNodeData>>) {
  const { storyNode } = data

  if (!storyNode) return null

  return (
    <BaseNode
      nodeType="dialogue"
      selected={selected}
      hasInputExec={true}
      hasOutputExec={true}
    >
      <div className={styles.content}>
        {storyNode.speaker && (
          <div className={styles.speaker}>{storyNode.speaker}</div>
        )}
        <div className={styles.text}>
          {storyNode.text?.substring(0, 60) || '(empty)'}
          {(storyNode.text?.length || 0) > 60 && '...'}
        </div>
      </div>
    </BaseNode>
  )
})
