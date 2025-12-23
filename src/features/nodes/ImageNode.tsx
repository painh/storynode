import { memo } from 'react'
import { type NodeProps, type Node } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import type { EditorNodeData } from '../../types/editor'
import { useTranslation } from '../../i18n'
import styles from './ImageNode.module.css'

export const ImageNode = memo(function ImageNode({
  data,
  selected,
}: NodeProps<Node<EditorNodeData>>) {
  const { storyNode } = data
  const { common } = useTranslation()

  if (!storyNode) return null

  const imageData = storyNode.imageData
  const hasImage = imageData?.resourcePath

  // 정렬 표시 텍스트
  const getAlignmentText = () => {
    if (!imageData) return ''
    if (imageData.alignment === 'custom') {
      return `(${imageData.x ?? 0}, ${imageData.y ?? 0})`
    }
    return imageData.alignment
  }

  return (
    <BaseNode
      nodeType="image"
      selected={selected}
      hasInputExec={true}
      hasOutputExec={true}
      isPlaying={data.isPlaying}
    >
      <div className={styles.content}>
        {hasImage ? (
          <div className={styles.preview}>
            <img
              src={imageData.resourcePath}
              alt="preview"
              className={styles.thumbnail}
              style={imageData.flipHorizontal ? { transform: 'scaleX(-1)' } : undefined}
            />
          </div>
        ) : (
          <div className={styles.empty}>{common.empty}</div>
        )}
        {imageData && (
          <div className={styles.info}>
            <div className={styles.layer}>
              <span className={styles.label}>Layer:</span>
              <span className={styles.value}>{imageData.layer}</span>
              <span className={styles.order}>#{imageData.layerOrder}</span>
            </div>
            <div className={styles.alignment}>
              <span className={styles.label}>Align:</span>
              <span className={styles.value}>{getAlignmentText()}</span>
              {imageData.flipHorizontal && <span className={styles.flipIcon}>↔</span>}
            </div>
          </div>
        )}
        {/* 데이터 핸들은 BaseNode에서 자동 생성됨 */}
      </div>
    </BaseNode>
  )
})
