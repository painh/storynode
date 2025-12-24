import type { StoryNode, ImageNodeData, ImageAlignment, ImageEffect, ProjectResource } from '../../../types/story'
import styles from '../Inspector.module.css'

interface ImageNodeInspectorProps {
  node: StoryNode
  imageResources: ProjectResource[]
  onUpdate: (updates: Partial<StoryNode>) => void
}

export function ImageNodeInspector({ node, imageResources, onUpdate }: ImageNodeInspectorProps) {
  const handleImageDataChange = (field: keyof ImageNodeData, value: unknown) => {
    const currentImageData = node.imageData || {
      resourcePath: '',
      layer: 'character',
      layerOrder: 0,
      alignment: 'center' as ImageAlignment,
    }
    onUpdate({
      imageData: { ...currentImageData, [field]: value }
    })
  }

  return (
    <>
      {/* 이미지 리소스 선택 */}
      <div className={styles.field}>
        <label className={styles.label}>Image Resource</label>
        <select
          className={styles.select}
          value={node.imageData?.resourcePath || ''}
          onChange={(e) => handleImageDataChange('resourcePath', e.target.value)}
        >
          <option value="">Select image...</option>
          {imageResources.map(resource => (
            <option key={resource.id} value={resource.path}>
              {resource.name}
            </option>
          ))}
        </select>
      </div>

      {/* 이미지 미리보기 */}
      {node.imageData?.resourcePath && (
        <div className={styles.field}>
          <label className={styles.label}>Preview</label>
          <div className={styles.imagePreview}>
            <img
              src={node.imageData.resourcePath}
              alt="preview"
              className={styles.previewImg}
            />
          </div>
        </div>
      )}

      {/* 레이어 */}
      <div className={styles.field}>
        <label className={styles.label}>Layer</label>
        <select
          className={styles.select}
          value={node.imageData?.layer || 'character'}
          onChange={(e) => handleImageDataChange('layer', e.target.value)}
        >
          <option value="background">background</option>
          <option value="character">character</option>
        </select>
      </div>

      {/* 레이어 순서 */}
      <div className={styles.field}>
        <label className={styles.label}>Layer Order</label>
        <input
          type="number"
          className={styles.input}
          value={node.imageData?.layerOrder ?? 0}
          onChange={(e) => handleImageDataChange('layerOrder', parseInt(e.target.value) || 0)}
        />
      </div>

      {/* 정렬 */}
      <div className={styles.field}>
        <label className={styles.label}>Alignment</label>
        <select
          className={styles.select}
          value={node.imageData?.alignment || 'center'}
          onChange={(e) => handleImageDataChange('alignment', e.target.value as ImageAlignment)}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="custom">Custom (x, y)</option>
        </select>
      </div>

      {/* Custom 위치 */}
      {node.imageData?.alignment === 'custom' && (
        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label}>X</label>
            <input
              type="number"
              className={styles.input}
              value={node.imageData?.x ?? 0}
              onChange={(e) => handleImageDataChange('x', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Y</label>
            <input
              type="number"
              className={styles.input}
              value={node.imageData?.y ?? 0}
              onChange={(e) => handleImageDataChange('y', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      )}

      {/* 좌우 반전 */}
      <div className={styles.field}>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={node.imageData?.flipHorizontal || false}
            onChange={(e) => handleImageDataChange('flipHorizontal', e.target.checked)}
          />
          <span>Flip Horizontal</span>
        </label>
      </div>

      {/* 효과 */}
      <div className={styles.field}>
        <label className={styles.label}>Effect</label>
        <select
          className={styles.select}
          value={node.imageData?.effect || 'none'}
          onChange={(e) => handleImageDataChange('effect', e.target.value as ImageEffect)}
        >
          <option value="none">None</option>
          <optgroup label="Fade">
            <option value="fadeIn">Fade In</option>
          </optgroup>
          <optgroup label="Slide">
            <option value="slideLeft">Slide Left</option>
            <option value="slideRight">Slide Right</option>
            <option value="slideUp">Slide Up</option>
            <option value="slideDown">Slide Down</option>
          </optgroup>
          <optgroup label="Zoom">
            <option value="zoomIn">Zoom In</option>
            <option value="zoomOut">Zoom Out</option>
          </optgroup>
          <optgroup label="Motion">
            <option value="shake">Shake</option>
            <option value="bounce">Bounce</option>
            <option value="pulse">Pulse</option>
            <option value="flash">Flash</option>
          </optgroup>
        </select>
      </div>

      {/* 효과 지속 시간 */}
      {node.imageData?.effect && node.imageData.effect !== 'none' && (
        <div className={styles.field}>
          <label className={styles.label}>Duration (ms)</label>
          <input
            type="number"
            className={styles.input}
            value={node.imageData?.effectDuration ?? 500}
            onChange={(e) => handleImageDataChange('effectDuration', parseInt(e.target.value) || 500)}
            min={100}
            step={100}
          />
        </div>
      )}
    </>
  )
}
