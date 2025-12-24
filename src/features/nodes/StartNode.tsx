import { memo } from 'react'
import type { NodeProps, Node } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import type { EditorNodeData } from '../../types/editor'
import styles from './StartNode.module.css'

export const StartNode = memo(function StartNode({
  id,
  data,
  selected,
}: NodeProps<Node<EditorNodeData>>) {
  return (
    <BaseNode
      nodeId={id}
      nodeType="start"
      selected={selected}
      hasInputExec={false}
      hasOutputExec={true}
      isPlaying={data.isPlaying}
      showDeleteButton={false}
    >
      <div className={styles.content}>
        <div className={styles.label}>Chapter Start</div>
      </div>
    </BaseNode>
  )
})
