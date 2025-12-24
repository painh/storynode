import { memo } from 'react'
import type { NodeProps, Node } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import type { EditorNodeData } from '../../types/editor'
import styles from './ShopNode.module.css'

export const ShopNode = memo(function ShopNode({
  id,
  data,
  selected,
}: NodeProps<Node<EditorNodeData>>) {
  return (
    <BaseNode
      nodeId={id}
      nodeType="shop"
      selected={selected}
      hasInputExec={true}
      hasOutputExec={true}
      isPlaying={data.isPlaying}
    >
      <div className={styles.content}>
        <div className={styles.icon}>🛒</div>
      </div>
    </BaseNode>
  )
})
