import { memo } from 'react'
import type { NodeProps, Node } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import type { EditorNodeData } from '../../types/editor'
import styles from './StartNode.module.css'

export const StartNode = memo(function StartNode({
  selected,
}: NodeProps<Node<EditorNodeData>>) {
  return (
    <BaseNode
      nodeType="start"
      selected={selected}
      hasInputExec={false}
      hasOutputExec={true}
    >
      <div className={styles.content}>
        <div className={styles.label}>Chapter Start</div>
      </div>
    </BaseNode>
  )
})
