import { memo } from 'react'
import type { NodeProps, Node } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import type { EditorNodeData } from '../../types/editor'
import type { VariableOperation, VariableDefinition } from '../../types/story'
import { useEditorStore } from '../../stores/editorStore'
import styles from './VariableNode.module.css'

function formatOperation(op: VariableOperation, variables: VariableDefinition[]): string {
  const getOperatorSymbol = (action: string) => {
    switch (action) {
      case 'set': return '='
      case 'add': return '+='
      case 'subtract': return '-='
      case 'multiply': return '*='
      default: return '='
    }
  }

  const getVariableName = (varId: string) => {
    const found = variables.find(v => v.id === varId)
    return found?.name || varId
  }

  // 값 또는 변수 참조 표시
  const getValueDisplay = () => {
    if (op.useVariableValue && op.sourceVariableId) {
      return getVariableName(op.sourceVariableId)
    }
    return String(op.value)
  }

  switch (op.target) {
    case 'variable':
      const varName = op.variableId ? getVariableName(op.variableId) : '?'
      const valueDisplay = getValueDisplay()
      // 배열 연산
      if (['push', 'pop', 'removeAt', 'setAt', 'clear'].includes(op.action)) {
        if (op.action === 'push') return `${varName}.push(${valueDisplay})`
        if (op.action === 'pop') return `${varName}.pop()`
        if (op.action === 'removeAt') return `${varName}.removeAt(${op.index})`
        if (op.action === 'setAt') return `${varName}[${op.index}] = ${valueDisplay}`
        if (op.action === 'clear') return `${varName} = []`
      }
      return `${varName} ${getOperatorSymbol(op.action)} ${valueDisplay}`
    case 'flag':
      return `flag.${op.key} = ${op.value}`
    case 'gold':
      return `Gold ${getOperatorSymbol(op.action)} ${op.value}`
    case 'hp':
      return `HP ${getOperatorSymbol(op.action)} ${op.value}`
    case 'affection':
      return `${op.characterId}_affection ${getOperatorSymbol(op.action)} ${op.value}`
    case 'reputation':
      return `${op.factionId}_rep ${getOperatorSymbol(op.action)} ${op.value}`
    default:
      return `? = ${op.value}`
  }
}

export const VariableNode = memo(function VariableNode({
  id,
  data,
  selected,
}: NodeProps<Node<EditorNodeData>>) {
  const { storyNode } = data
  const variables = useEditorStore((state) => state.project.variables) || []

  if (!storyNode) return null

  const operations = storyNode.variableOperations || []

  return (
    <BaseNode
      nodeId={id}
      nodeType="variable"
      selected={selected}
      hasInputExec={true}
      hasOutputExec={true}
      isPlaying={data.isPlaying}
    >
      <div className={styles.content}>
        {operations.length === 0 ? (
          <div className={styles.empty}>No operations</div>
        ) : (
          <div className={styles.operations}>
            {operations.slice(0, 3).map((op, index) => (
              <div key={index} className={styles.operation}>
                {formatOperation(op, variables)}
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
