import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
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
            </div>
          </div>
        )}

        {/* 데이터 입력 핸들 */}
        <div className={styles.dataInputs}>
          <div className={styles.dataInput}>
            <Handle
              type="target"
              position={Position.Left}
              id="image-path"
              className={styles.dataHandle}
            />
            <span className={styles.inputLabel}>path</span>
          </div>
          <div className={styles.dataInput}>
            <Handle
              type="target"
              position={Position.Left}
              id="image-layer"
              className={styles.dataHandle}
            />
            <span className={styles.inputLabel}>layer</span>
          </div>
          <div className={styles.dataInput}>
            <Handle
              type="target"
              position={Position.Left}
              id="image-order"
              className={styles.dataHandle}
            />
            <span className={styles.inputLabel}>order</span>
          </div>
          <div className={styles.dataInput}>
            <Handle
              type="target"
              position={Position.Left}
              id="image-align"
              className={styles.dataHandle}
            />
            <span className={styles.inputLabel}>align</span>
          </div>
          <div className={styles.dataInput}>
            <Handle
              type="target"
              position={Position.Left}
              id="image-x"
              className={styles.dataHandle}
            />
            <span className={styles.inputLabel}>x</span>
          </div>
          <div className={styles.dataInput}>
            <Handle
              type="target"
              position={Position.Left}
              id="image-y"
              className={styles.dataHandle}
            />
            <span className={styles.inputLabel}>y</span>
          </div>
        </div>
      </div>
    </BaseNode>
  )
})
