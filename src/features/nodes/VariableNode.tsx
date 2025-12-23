import { memo } from 'react'
import type { NodeProps, Node } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import type { EditorNodeData } from '../../types/editor'
import type { VariableOperation } from '../../types/story'
import { useTranslation } from '../../i18n'
import styles from './VariableNode.module.css'

function formatOperation(op: VariableOperation, t: ReturnType<typeof useTranslation>): string {
  const actionLabels = {
    set: t.inspector.set,
    add: t.inspector.add,
    subtract: t.inspector.subtract,
    multiply: t.inspector.multiply,
  }
  const action = actionLabels[op.action]

  switch (op.target) {
    case 'flag':
      return `${action} ${op.key} = ${op.value}`
    case 'gold':
      return `${action} ${t.inspector.gold} ${op.action === 'set' ? '=' : op.action === 'add' ? '+' : op.action === 'subtract' ? '-' : '×'} ${op.value}`
    case 'hp':
      return `${action} ${t.inspector.hp} ${op.action === 'set' ? '=' : op.action === 'add' ? '+' : op.action === 'subtract' ? '-' : '×'} ${op.value}`
    case 'affection':
      return `${action} ${op.characterId} ${op.action === 'set' ? '=' : '+'} ${op.value}`
    case 'reputation':
      return `${action} ${op.factionId} ${op.action === 'set' ? '=' : '+'} ${op.value}`
    default:
      return `${action} ${op.value}`
  }
}

export const VariableNode = memo(function VariableNode({
  data,
  selected,
}: NodeProps<Node<EditorNodeData>>) {
  const { storyNode } = data
  const t = useTranslation()

  if (!storyNode) return null

  const operations = storyNode.variableOperations || []

  return (
    <BaseNode
      nodeType="variable"
      selected={selected}
      hasInputExec={true}
      hasOutputExec={true}
    >
      <div className={styles.content}>
        {operations.length === 0 ? (
          <div className={styles.empty}>{t.common.empty}</div>
        ) : (
          <div className={styles.operations}>
            {operations.slice(0, 3).map((op, index) => (
              <div key={index} className={styles.operation}>
                {formatOperation(op, t)}
              </div>
            ))}
            {operations.length > 3 && (
              <div className={styles.more}>+{operations.length - 3} more</div>
            )}
          </div>
        )}
      </div>
    </BaseNode>
  )
})
