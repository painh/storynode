import { memo, useMemo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import { useSearchStore } from '../../stores/searchStore'
import { highlightText } from '../../utils/highlight'
import type { EditorNodeData } from '../../types/editor'
import styles from './ChoiceNode.module.css'

export const ChoiceNode = memo(function ChoiceNode({
  id,
  data,
  selected,
}: NodeProps<Node<EditorNodeData>>) {
  const { storyNode } = data
  const { highlightedNodeId, highlightQuery } = useSearchStore()

  const shouldHighlight = highlightedNodeId === id && highlightQuery

  const displayPrompt = useMemo(() => {
    if (!storyNode?.text) return null
    const truncated = storyNode.text.substring(0, 40)
    const suffix = storyNode.text.length > 40 ? '...' : ''

    if (shouldHighlight) {
      return <>{highlightText(truncated, highlightQuery, styles.highlight)}{suffix}</>
    }
    return truncated + suffix
  }, [storyNode?.text, shouldHighlight, highlightQuery])

  if (!storyNode) return null

  const choices = storyNode.choices || []

  return (
    <BaseNode
      nodeId={id}
      nodeType="choice"
      selected={selected}
      hasInputExec={true}
      hasOutputExec={false}
      isPlaying={data.isPlaying}
    >
      <div className={styles.content}>
        {displayPrompt && (
          <div className={styles.prompt}>{displayPrompt}</div>
        )}

        <div className={styles.choices}>
          {choices.map((choice, index) => {
            const truncatedChoice = choice.text.substring(0, 25)
            const choiceSuffix = choice.text.length > 25 ? '...' : ''
            const displayChoice = shouldHighlight
              ? <>{highlightText(truncatedChoice, highlightQuery, styles.highlight)}{choiceSuffix}</>
              : truncatedChoice + choiceSuffix || `Choice ${index + 1}`

            return (
              <div key={choice.id} className={styles.choice}>
                <span className={styles.choiceText}>{displayChoice}</span>
                <div className={styles.handleWrapper}>
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={`choice-${index}`}
                    className={styles.choiceHandle}
                  />
                </div>
              </div>
            )
          })}

          {choices.length === 0 && (
            <div className={styles.empty}>Add choices in inspector</div>
          )}
        </div>
      </div>
    </BaseNode>
  )
})
