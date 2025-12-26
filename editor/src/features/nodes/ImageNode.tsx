import { memo, useState, useCallback } from 'react'
import { type NodeProps, type Node } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import type { EditorNodeData } from '../../types/editor'
import { useEditorStore } from '../../stores/editorStore'
import { useTranslation } from '../../i18n'
import styles from './ImageNode.module.css'

export const ImageNode = memo(function ImageNode({
  id,
  data,
  selected,
}: NodeProps<Node<EditorNodeData>>) {
  const { storyNode } = data
  const { common } = useTranslation()
  const updateNode = useEditorStore((state) => state.updateNode)
  const [isDragOver, setIsDragOver] = useState(false)

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

  // 효과 아이콘
  const getEffectIcon = () => {
    if (!imageData?.effect || imageData.effect === 'none') return null
    switch (imageData.effect) {
      case 'fadeIn': return '✨'
      case 'shake': return '〰️'
      case 'slideLeft': return '⬅️'
      case 'slideRight': return '➡️'
      case 'slideUp': return '⬆️'
      case 'slideDown': return '⬇️'
      case 'zoomIn': return '🔍'
      case 'zoomOut': return '🔎'
      case 'bounce': return '⚡'
      case 'flash': return '💥'
      case 'pulse': return '💓'
      default: return '🎬'
    }
  }

  // 드래그 앤 드롭 핸들러
  const handleDragOver = useCallback((e: React.DragEvent) => {
    const imageType = e.dataTransfer.types.includes('application/storynode-image-path')
    if (imageType) {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const imagePath = e.dataTransfer.getData('application/storynode-image-path')
    if (imagePath && storyNode) {
      updateNode(storyNode.id, {
        imageData: {
          ...storyNode.imageData,
          resourcePath: imagePath,
          layer: storyNode.imageData?.layer || 'character',
          layerOrder: storyNode.imageData?.layerOrder ?? 0,
          alignment: storyNode.imageData?.alignment || 'center',
        }
      })
    }
  }, [storyNode, updateNode])

  return (
    <BaseNode
      nodeId={id}
      nodeType="image"
      selected={selected}
      hasInputExec={true}
      hasOutputExec={true}
      isPlaying={data.isPlaying}
    >
      <div
        className={`${styles.content} ${isDragOver ? styles.dragOver : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
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
            {imageData.effect && imageData.effect !== 'none' && (
              <div className={styles.effect}>
                <span className={styles.label}>Effect:</span>
                <span className={styles.effectIcon}>{getEffectIcon()}</span>
                <span className={styles.value}>{imageData.effect}</span>
              </div>
            )}
          </div>
        )}
        {/* 데이터 핸들은 BaseNode에서 자동 생성됨 */}
      </div>
    </BaseNode>
  )
})
