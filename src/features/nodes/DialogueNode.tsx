import { memo } from 'react'
import type { NodeProps } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import type { EditorNodeData } from '../../types/editor'
import styles from './DialogueNode.module.css'

export const DialogueNode = memo(function DialogueNode({
  data,
  selected,
}: NodeProps<EditorNodeData>) {
  const { storyNode } = data

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
