import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import type { EditorNodeData } from '../../types/editor'
import type { ConditionBranch } from '../../types/story'
import { useTranslation } from '../../i18n'
import styles from './ConditionNode.module.css'

function formatCondition(branch: ConditionBranch): string {
  const { condition } = branch
  switch (condition.type) {
    case 'gold':
      return `gold ${condition.min !== undefined ? `>= ${condition.min}` : `<= ${condition.max}`}`
    case 'hp':
      return `hp ${condition.min !== undefined ? `>= ${condition.min}` : `<= ${condition.max}`}`
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
  data,
  selected,
}: NodeProps<Node<EditorNodeData>>) {
  const { storyNode } = data
  const { common } = useTranslation()

  if (!storyNode) return null

  const branches = storyNode.conditionBranches || []

  return (
    <BaseNode
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
                  {formatCondition(branch)}
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
