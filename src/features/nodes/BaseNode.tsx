import { memo, type ReactNode } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { StoryNodeType } from '../../types/story'
import { NODE_COLORS, NODE_ICONS } from '../../types/editor'
import { useTranslation } from '../../i18n'
import styles from './BaseNode.module.css'

interface BaseNodeProps {
  nodeType: StoryNodeType
  selected: boolean
  children: ReactNode
  hasInputExec?: boolean
  hasOutputExec?: boolean
}

export const BaseNode = memo(function BaseNode({
  nodeType,
  selected,
  children,
  hasInputExec = true,
  hasOutputExec = true,
}: BaseNodeProps) {
  const { nodes } = useTranslation()
  const headerColor = NODE_COLORS[nodeType]
  const icon = NODE_ICONS[nodeType]
  const label = nodes[nodeType]

  return (
    <div
      className={`${styles.node} ${selected ? styles.selected : ''}`}
      style={{ '--header-color': headerColor } as React.CSSProperties}
    >
      {/* Input Execution Pin */}
      {hasInputExec && (
        <Handle
          type="target"
          position={Position.Left}
          id="exec-in"
          className={styles.execHandle}
        />
      )}

      {/* Header */}
      <div className={styles.header}>
        <span className={styles.icon}>{icon}</span>
        <span className={styles.label}>{label}</span>
      </div>

      {/* Body */}
      <div className={styles.body}>
        {children}
      </div>

      {/* Output Execution Pin */}
      {hasOutputExec && (
        <Handle
          type="source"
          position={Position.Right}
          id="exec-out"
          className={styles.execHandle}
        />
      )}
    </div>
  )
})
