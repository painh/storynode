import { useEditorStore } from '../../stores/editorStore'
import { NODE_COLORS, NODE_ICONS, NODE_LABELS } from '../../types/editor'
import type { StoryNode, StoryChoice, ImageNodeData, ImageAlignment } from '../../types/story'
import styles from './Inspector.module.css'

export function Inspector() {
  const { selectedNodeIds, getNodeById, updateNode, project } = useEditorStore()

  // 프로젝트 리소스에서 이미지 목록 가져오기
  const imageResources = (project.resources || []).filter(r => r.type === 'image')

  // 단일 선택만 편집 가능
  const selectedNode = selectedNodeIds.length === 1 ? getNodeById(selectedNodeIds[0]) : undefined

  if (!selectedNode) {
    return (
      <aside className={styles.inspector}>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🎯</div>
          <div className={styles.emptyText}>Select a node to edit</div>
        </div>
      </aside>
    )
  }

  const handleChange = (field: keyof StoryNode, value: unknown) => {
    updateNode(selectedNode.id, { [field]: value })
  }

  const handleChoiceChange = (index: number, field: keyof StoryChoice, value: unknown) => {
    const choices = [...(selectedNode.choices || [])]
    choices[index] = { ...choices[index], [field]: value }
    updateNode(selectedNode.id, { choices })
  }

  const handleAddChoice = () => {
    const choices = [...(selectedNode.choices || [])]
    choices.push({
      id: `choice_${Date.now()}`,
      text: '',
      nextNodeId: '',
    })
    updateNode(selectedNode.id, { choices })
  }

  const handleRemoveChoice = (index: number) => {
    const choices = [...(selectedNode.choices || [])]
    choices.splice(index, 1)
    updateNode(selectedNode.id, { choices })
  }

  // 이미지 노드 데이터 변경 핸들러
  const handleImageDataChange = (field: keyof ImageNodeData, value: unknown) => {
    const currentImageData = selectedNode?.imageData || {
      resourcePath: '',
      layer: 'character',
      layerOrder: 0,
      alignment: 'center' as ImageAlignment,
    }
    updateNode(selectedNode!.id, {
      imageData: { ...currentImageData, [field]: value }
    })
  }

  return (
    <aside className={styles.inspector}>
      <div className={styles.header} style={{ borderColor: NODE_COLORS[selectedNode.type] }}>
        <span className={styles.icon}>{NODE_ICONS[selectedNode.type]}</span>
        <span className={styles.type}>{NODE_LABELS[selectedNode.type]}</span>
      </div>

      <div className={styles.content}>
        <div className={styles.field}>
          <label className={styles.label}>ID</label>
          <input
            type="text"
            className={styles.input}
            value={selectedNode.id}
            readOnly
          />
        </div>

        {/* Dialogue & Choice: speaker */}
        {(selectedNode.type === 'dialogue') && (
          <div className={styles.field}>
            <label className={styles.label}>Speaker</label>
            <input
              type="text"
              className={styles.input}
              value={selectedNode.speaker || ''}
              onChange={(e) => handleChange('speaker', e.target.value)}
              placeholder="Narrator (if empty)"
            />
          </div>
        )}

        {/* Dialogue & Choice: text */}
        {(selectedNode.type === 'dialogue' || selectedNode.type === 'choice' || selectedNode.type === 'chapter_end') && (
          <div className={styles.field}>
            <label className={styles.label}>Text</label>
            <textarea
              className={styles.textarea}
              value={selectedNode.text || ''}
              onChange={(e) => handleChange('text', e.target.value)}
              placeholder="Enter text..."
              rows={4}
            />
          </div>
        )}

        {/* Choice: choices array */}
        {selectedNode.type === 'choice' && (
          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label}>Choices</label>
              <button className={styles.addBtn} onClick={handleAddChoice}>+ Add</button>
            </div>
            <div className={styles.choiceList}>
              {(selectedNode.choices || []).map((choice, index) => (
                <div key={choice.id} className={styles.choiceItem}>
                  <div className={styles.choiceHeader}>
                    <span className={styles.choiceIndex}>{index + 1}</span>
                    <button
                      className={styles.removeBtn}
                      onClick={() => handleRemoveChoice(index)}
                    >
                      ✕
                    </button>
                  </div>
                  <input
                    type="text"
                    className={styles.input}
                    value={choice.text}
                    onChange={(e) => handleChoiceChange(index, 'text', e.target.value)}
                    placeholder="Choice text..."
                  />
                </div>
              ))}
              {(selectedNode.choices || []).length === 0 && (
                <div className={styles.noChoices}>No choices yet</div>
              )}
            </div>
          </div>
        )}

        {/* Image: imageData */}
        {selectedNode.type === 'image' && (
          <>
            {/* 이미지 리소스 선택 */}
            <div className={styles.field}>
              <label className={styles.label}>Image Resource</label>
              <select
                className={styles.select}
                value={selectedNode.imageData?.resourcePath || ''}
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
            {selectedNode.imageData?.resourcePath && (
              <div className={styles.field}>
                <label className={styles.label}>Preview</label>
                <div className={styles.imagePreview}>
                  <img
                    src={selectedNode.imageData.resourcePath}
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
                value={selectedNode.imageData?.layer || 'character'}
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
                value={selectedNode.imageData?.layerOrder ?? 0}
                onChange={(e) => handleImageDataChange('layerOrder', parseInt(e.target.value) || 0)}
              />
            </div>

            {/* 정렬 */}
            <div className={styles.field}>
              <label className={styles.label}>Alignment</label>
              <select
                className={styles.select}
                value={selectedNode.imageData?.alignment || 'center'}
                onChange={(e) => handleImageDataChange('alignment', e.target.value as ImageAlignment)}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="custom">Custom (x, y)</option>
              </select>
            </div>

            {/* Custom 위치 */}
            {selectedNode.imageData?.alignment === 'custom' && (
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>X</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={selectedNode.imageData?.x ?? 0}
                    onChange={(e) => handleImageDataChange('x', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Y</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={selectedNode.imageData?.y ?? 0}
                    onChange={(e) => handleImageDataChange('y', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  )
}
