import { memo, useMemo } from 'react'
import type { NodeProps, Node } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import { useSearchStore } from '../../stores/searchStore'
import { highlightText } from '../../utils/highlight'
import type { EditorNodeData } from '../../types/editor'
import styles from './DialogueNode.module.css'

export const DialogueNode = memo(function DialogueNode({
  id,
  data,
  selected,
}: NodeProps<Node<EditorNodeData>>) {
  const { storyNode } = data
  const { highlightedNodeId, highlightQuery } = useSearchStore()

  const shouldHighlight = highlightedNodeId === id && highlightQuery

  const displayText = useMemo(() => {
    const text = storyNode?.text || ''
    const truncated = text.substring(0, 60)
    const suffix = text.length > 60 ? '...' : ''

    if (shouldHighlight) {
      return <>{highlightText(truncated, highlightQuery, styles.highlight)}{suffix}</>
    }
    return truncated + suffix || '(empty)'
  }, [storyNode?.text, shouldHighlight, highlightQuery])

  const displaySpeaker = useMemo(() => {
    if (!storyNode?.speaker) return null
    if (shouldHighlight) {
      return highlightText(storyNode.speaker, highlightQuery, styles.highlight)
    }
    return storyNode.speaker
  }, [storyNode?.speaker, shouldHighlight, highlightQuery])

  if (!storyNode) return null

  return (
    <BaseNode
      nodeId={id}
      nodeType="dialogue"
      selected={selected}
      hasInputExec={true}
      hasOutputExec={true}
      isPlaying={data.isPlaying}
    >
      <div className={styles.content}>
        {displaySpeaker && (
          <div className={styles.speaker}>{displaySpeaker}</div>
        )}
        <div className={styles.text}>{displayText}</div>
      </div>
    </BaseNode>
  )
})
