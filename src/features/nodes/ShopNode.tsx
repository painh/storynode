import { memo } from 'react'
import type { NodeProps, Node } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import type { EditorNodeData } from '../../types/editor'
import styles from './ShopNode.module.css'

export const ShopNode = memo(function ShopNode({
  selected,
}: NodeProps<Node<EditorNodeData>>) {
  return (
    <BaseNode
      nodeType="shop"
      selected={selected}
      hasInputExec={true}
      hasOutputExec={true}
    >
      <div className={styles.content}>
        <div className={styles.icon}>🛒</div>
      </div>
    </BaseNode>
  )
})
