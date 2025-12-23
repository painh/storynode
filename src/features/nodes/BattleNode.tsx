import { memo } from 'react'
import type { NodeProps, Node } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import type { EditorNodeData } from '../../types/editor'
import { useTranslation } from '../../i18n'
import styles from './BattleNode.module.css'

export const BattleNode = memo(function BattleNode({
  data,
  selected,
}: NodeProps<Node<EditorNodeData>>) {
  const { storyNode } = data
  const { common } = useTranslation()

  if (!storyNode) return null

  return (
    <BaseNode
      nodeType="battle"
      selected={selected}
      hasInputExec={true}
      hasOutputExec={true}
      isPlaying={data.isPlaying}
    >
      <div className={styles.content}>
        <div className={styles.battleId}>
          {storyNode.battleGroupId || common.empty}
        </div>
        {storyNode.battleRewards && (
          <div className={styles.rewards}>
            {storyNode.battleRewards.gold && (
              <span className={styles.reward}>💰 {storyNode.battleRewards.gold}</span>
            )}
          </div>
        )}
      </div>
    </BaseNode>
  )
})
