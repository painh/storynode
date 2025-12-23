import { memo } from 'react'
import type { NodeProps, Node } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import type { EditorNodeData } from '../../types/editor'
import { useTranslation } from '../../i18n'
import styles from './EventNode.module.css'

export const EventNode = memo(function EventNode({
  data,
  selected,
}: NodeProps<Node<EditorNodeData>>) {
  const { storyNode } = data
  const { common } = useTranslation()

  if (!storyNode) return null

  return (
    <BaseNode
      nodeType="event"
      selected={selected}
      hasInputExec={true}
      hasOutputExec={true}
    >
      <div className={styles.content}>
        <div className={styles.eventId}>
          {storyNode.eventId || common.empty}
        </div>
      </div>
    </BaseNode>
  )
})
