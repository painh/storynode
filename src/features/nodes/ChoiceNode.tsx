import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import type { EditorNodeData } from '../../types/editor'
import styles from './ChoiceNode.module.css'

export const ChoiceNode = memo(function ChoiceNode({
  data,
  selected,
}: NodeProps<Node<EditorNodeData>>) {
  const { storyNode } = data

  if (!storyNode) return null

  const choices = storyNode.choices || []

  return (
    <BaseNode
      nodeType="choice"
      selected={selected}
      hasInputExec={true}
      hasOutputExec={false}
    >
      <div className={styles.content}>
        {storyNode.text && (
          <div className={styles.prompt}>
            {storyNode.text.substring(0, 40)}
            {storyNode.text.length > 40 && '...'}
          </div>
        )}

        <div className={styles.choices}>
          {choices.map((choice, index) => (
            <div key={choice.id} className={styles.choice}>
              <span className={styles.choiceText}>
                {choice.text.substring(0, 25) || `Choice ${index + 1}`}
                {choice.text.length > 25 && '...'}
              </span>
              <div className={styles.handleWrapper}>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`choice-${index}`}
                  className={styles.choiceHandle}
                />
              </div>
            </div>
          ))}

          {choices.length === 0 && (
            <div className={styles.empty}>Add choices in inspector</div>
          )}
        </div>
      </div>
    </BaseNode>
  )
})
