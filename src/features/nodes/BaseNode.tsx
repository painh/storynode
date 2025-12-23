import { memo, type ReactNode } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { StoryNodeType } from '../../types/story'
import { NODE_COLORS, NODE_ICONS } from '../../types/editor'
import { useTranslation } from '../../i18n'
import {
  type DataHandleDefinition,
  getInputHandles,
  getOutputHandles,
} from '../../config/dataHandles'
import { DataHandleRow } from './DataHandle'
import styles from './BaseNode.module.css'

interface BaseNodeProps {
  nodeType: StoryNodeType
  selected: boolean
  children: ReactNode
  hasInputExec?: boolean
  hasOutputExec?: boolean
  isPlaying?: boolean
  showDataHandles?: boolean
  customDataHandles?: DataHandleDefinition[]
}

export const BaseNode = memo(function BaseNode({
  nodeType,
  selected,
  children,
  hasInputExec = true,
  hasOutputExec = true,
  isPlaying = false,
  showDataHandles = true,
  customDataHandles,
}: BaseNodeProps) {
  const { nodes } = useTranslation()
  const headerColor = NODE_COLORS[nodeType]
  const icon = NODE_ICONS[nodeType]
  const label = nodes[nodeType]

  // 데이터 핸들 정의 가져오기
  const inputHandles = customDataHandles
    ? customDataHandles.filter(h => h.direction === 'input' || h.direction === 'both')
    : getInputHandles(nodeType)
  const outputHandles = customDataHandles
    ? customDataHandles.filter(h => h.direction === 'output' || h.direction === 'both')
    : getOutputHandles(nodeType)

  // 모든 핸들 (입력과 출력을 병합)
  const allHandles = customDataHandles || [...new Map([...inputHandles, ...outputHandles].map(h => [h.id, h])).values()]
  const hasDataHandles = showDataHandles && allHandles.length > 0

  return (
    <div
      className={`${styles.node} ${selected ? styles.selected : ''} ${isPlaying ? styles.playing : ''}`}
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

      {/* Data Handles Section */}
      {hasDataHandles && (
        <div className={styles.dataHandles}>
          {allHandles.map((handle) => (
            <DataHandleRow
              key={handle.id}
              definition={handle}
              showInput={inputHandles.some(h => h.id === handle.id)}
              showOutput={outputHandles.some(h => h.id === handle.id)}
            />
          ))}
        </div>
      )}

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
