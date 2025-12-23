import { memo } from 'react'
import type { NodeProps, Node } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import type { EditorNodeData } from '../../types/editor'
import styles from './ChapterEndNode.module.css'

export const ChapterEndNode = memo(function ChapterEndNode({
  data,
  selected,
}: NodeProps<Node<EditorNodeData>>) {
  const { storyNode } = data

  return (
    <BaseNode
      nodeType="chapter_end"
      selected={selected}
      hasInputExec={true}
      hasOutputExec={false}
    >
      <div className={styles.content}>
        <div className={styles.text}>
          {storyNode.text?.substring(0, 50) || 'End'}
          {(storyNode.text?.length || 0) > 50 && '...'}
        </div>
      </div>
    </BaseNode>
  )
})
