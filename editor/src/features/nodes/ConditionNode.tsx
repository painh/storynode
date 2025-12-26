import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import type { EditorNodeData } from '../../types/editor'
import type { ConditionBranch, VariableDefinition } from '../../types/story'
import { useEditorStore } from '../../stores/editorStore'
import { useTranslation } from '../../i18n'
import styles from './ConditionNode.module.css'

function formatCondition(branch: ConditionBranch, variables: VariableDefinition[]): string {
  const { condition } = branch
  
  // 변수 ID로 이름 찾기
  const getVarName = (varId?: string) => {
    if (!varId) return '?'
    const found = variables.find(v => v.id === varId)
    return found?.name || varId
  }
  
  switch (condition.type) {
    case 'variable':
      const varName = getVarName(condition.variableId)
      const op = condition.operator || '=='
      return `${varName} ${op} ${condition.value}`
    case 'gold':
      return `Gold ${condition.min !== undefined ? `>= ${condition.min}` : `<= ${condition.max}`}`
    case 'hp':
      return `HP ${condition.min !== undefined ? `>= ${condition.min}` : `<= ${condition.max}`}`
    case 'flag':
      return `${condition.flagKey} = ${condition.flagValue}`
    case 'has_relic':
      return `has ${condition.value}`
    case 'character':
      return `party has ${condition.characterId}`
    case 'affection':
      return `${condition.characterId} >= ${condition.min}`
    case 'reputation':
      return `${condition.factionId} >= ${condition.min}`
    case 'choice_made':
      return `chose ${condition.choiceId}`
    default:
      return condition.type
  }
}

export const ConditionNode = memo(function ConditionNode({
  id,
  data,
  selected,
}: NodeProps<Node<EditorNodeData>>) {
  const { storyNode } = data
  const { common } = useTranslation()
  const variables = useEditorStore((state) => state.project.variables) || []

  if (!storyNode) return null

  const branches = storyNode.conditionBranches || []

  return (
    <BaseNode
      nodeId={id}
      nodeType="condition"
      selected={selected}
      hasInputExec={true}
      hasOutputExec={false}
      isPlaying={data.isPlaying}
    >
      <div className={styles.content}>
        {branches.length === 0 ? (
          <div className={styles.empty}>{common.empty}</div>
        ) : (
          <div className={styles.branches}>
            {branches.map((branch, index) => (
              <div key={branch.id} className={styles.branch}>
                <span className={styles.conditionText}>
                  {formatCondition(branch, variables)}
                </span>
                <div className={styles.handleWrapper}>
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={`condition-${index}`}
                    className={styles.conditionHandle}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Default output */}
        <div className={styles.defaultBranch}>
          <span className={styles.defaultLabel}>{common.default}</span>
          <div className={styles.handleWrapper}>
            <Handle
              type="source"
              position={Position.Right}
              id="default"
              className={styles.defaultHandle}
            />
          </div>
        </div>
      </div>
    </BaseNode>
  )
})
