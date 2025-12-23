import { memo } from 'react'
import type { NodeProps, Node } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import type { EditorNodeData } from '../../types/editor'
import { useTranslation } from '../../i18n'
import styles from './JavaScriptNode.module.css'

export const JavaScriptNode = memo(function JavaScriptNode({
  data,
  selected,
}: NodeProps<Node<EditorNodeData>>) {
  const { storyNode } = data
  const t = useTranslation()

  if (!storyNode) return null

  const code = storyNode.javascriptCode || ''
  const preview = code.trim().split('\n').slice(0, 4).join('\n')
  const hasMore = code.trim().split('\n').length > 4

  return (
    <BaseNode
      nodeType="javascript"
      selected={selected}
      hasInputExec={true}
      hasOutputExec={true}
      isPlaying={data.isPlaying}
    >
      <div className={styles.content}>
        {code.trim() ? (
          <div className={styles.codePreview}>
            <pre className={styles.code}>{preview}</pre>
            {hasMore && <div className={styles.more}>...</div>}
          </div>
        ) : (
          <div className={styles.empty}>{t.common.empty}</div>
        )}
      </div>
    </BaseNode>
  )
})
