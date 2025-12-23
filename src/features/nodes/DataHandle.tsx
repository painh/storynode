// 데이터 핸들 컴포넌트 - 언리얼 블루프린트 스타일
import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import {
  type DataHandleDefinition,
  DATA_HANDLE_COLORS,
  getDataHandleId
} from '../../config/dataHandles'
import styles from './DataHandle.module.css'

interface DataHandleProps {
  definition: DataHandleDefinition
  side: 'left' | 'right'  // 왼쪽(input) 또는 오른쪽(output)
}

export const DataHandle = memo(function DataHandle({
  definition,
  side
}: DataHandleProps) {
  const color = DATA_HANDLE_COLORS[definition.type]
  const handleType = side === 'left' ? 'target' : 'source'
  const position = side === 'left' ? Position.Left : Position.Right
  const handleId = getDataHandleId(definition.path, side === 'left' ? 'input' : 'output')

  return (
    <div className={`${styles.row} ${side === 'right' ? styles.rowRight : ''}`}>
      {side === 'left' && (
        <Handle
          type={handleType}
          position={position}
          id={handleId}
          className={styles.handle}
          style={{
            background: color,
            borderColor: color,
          }}
        />
      )}
      <span className={styles.label}>{definition.label}</span>
      {side === 'right' && (
        <Handle
          type={handleType}
          position={position}
          id={handleId}
          className={styles.handle}
          style={{
            background: color,
            borderColor: color,
          }}
        />
      )}
    </div>
  )
})

// 여러 핸들을 한 줄에 나란히 표시 (입력 왼쪽, 출력 오른쪽)
interface DataHandleRowProps {
  definition: DataHandleDefinition
  showInput: boolean
  showOutput: boolean
}

export const DataHandleRow = memo(function DataHandleRow({
  definition,
  showInput,
  showOutput,
}: DataHandleRowProps) {
  const color = DATA_HANDLE_COLORS[definition.type]
  const inputHandleId = getDataHandleId(definition.path, 'input')
  const outputHandleId = getDataHandleId(definition.path, 'output')

  return (
    <div className={styles.fullRow}>
      {/* 입력 핸들 (왼쪽) */}
      {showInput && (
        <Handle
          type="target"
          position={Position.Left}
          id={inputHandleId}
          className={styles.handle}
          style={{
            background: color,
            borderColor: color,
          }}
        />
      )}

      {/* 라벨 (중앙) */}
      <span className={styles.centerLabel}>{definition.label}</span>

      {/* 출력 핸들 (오른쪽) */}
      {showOutput && (
        <Handle
          type="source"
          position={Position.Right}
          id={outputHandleId}
          className={styles.handle}
          style={{
            background: color,
            borderColor: color,
          }}
        />
      )}
    </div>
  )
})
