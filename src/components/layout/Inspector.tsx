import { useEditorStore } from '../../stores/editorStore'
import { NODE_COLORS, NODE_ICONS, NODE_LABELS, type CommentNodeData } from '../../types/editor'
import type { StoryNode, StoryChoice, ImageNodeData, ImageAlignment, CustomNodeData, CustomFieldDefinition, CustomFieldType } from '../../types/story'
import styles from './Inspector.module.css'

// 색상 프리셋
const COLOR_PRESETS = [
  '#5C6BC0', // 인디고
  '#42A5F5', // 블루
  '#26A69A', // 틸
  '#66BB6A', // 그린
  '#FFCA28', // 앰버
  '#FF7043', // 딥오렌지
  '#EC407A', // 핑크
  '#AB47BC', // 퍼플
]

export function Inspector() {
  const { selectedNodeIds, selectedCommentId, getNodeById, getCommentById, updateNode, updateCommentNode, project } = useEditorStore()

  // 프로젝트 리소스에서 이미지 목록 가져오기
  const imageResources = (project.resources || []).filter(r => r.type === 'image')

  // 단일 선택만 편집 가능
  const selectedNode = selectedNodeIds.length === 1 ? getNodeById(selectedNodeIds[0]) : undefined
  const selectedComment = selectedCommentId ? getCommentById(selectedCommentId) : undefined

  // 코멘트 노드 데이터 변경 핸들러
  const handleCommentChange = (field: keyof CommentNodeData, value: unknown) => {
    if (selectedCommentId) {
      updateCommentNode(selectedCommentId, { [field]: value })
    }
  }

  // 코멘트 노드가 선택된 경우
  if (selectedComment) {
    return (
      <aside className={styles.inspector}>
        <div className={styles.header} style={{ borderColor: selectedComment.data.color }}>
          <span className={styles.icon}>{NODE_ICONS.comment}</span>
          <span className={styles.type}>{NODE_LABELS.comment}</span>
        </div>

        <div className={styles.content}>
          <div className={styles.field}>
            <label className={styles.label}>Title</label>
            <input
              type="text"
              className={styles.input}
              value={selectedComment.data.title}
              onChange={(e) => handleCommentChange('title', e.target.value)}
              placeholder="Comment title..."
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              value={selectedComment.data.description}
              onChange={(e) => handleCommentChange('description', e.target.value)}
              placeholder="Add description..."
              rows={4}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Color</label>
            <div className={styles.colorPresets}>
              {COLOR_PRESETS.map(color => (
                <button
                  key={color}
                  className={`${styles.colorPreset} ${selectedComment.data.color === color ? styles.colorPresetActive : ''}`}
                  style={{ background: color }}
                  onClick={() => handleCommentChange('color', color)}
                />
              ))}
            </div>
            <div className={styles.colorRow}>
              <input
                type="color"
                className={styles.colorPicker}
                value={selectedComment.data.color}
                onChange={(e) => handleCommentChange('color', e.target.value)}
              />
              <input
                type="text"
                className={styles.input}
                value={selectedComment.data.color}
                onChange={(e) => handleCommentChange('color', e.target.value)}
                style={{ flex: 1 }}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Display Mode</label>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={selectedComment.data.isCollapsed || false}
                onChange={(e) => handleCommentChange('isCollapsed', e.target.checked)}
              />
              <span>Collapsed (Post-it style)</span>
            </label>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>Width</label>
              <input
                type="number"
                className={styles.input}
                value={selectedComment.data.width}
                onChange={(e) => handleCommentChange('width', parseInt(e.target.value) || 200)}
                min={100}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Height</label>
              <input
                type="number"
                className={styles.input}
                value={selectedComment.data.height}
                onChange={(e) => handleCommentChange('height', parseInt(e.target.value) || 100)}
                min={50}
              />
            </div>
          </div>
        </div>
      </aside>
    )
  }

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

  // 커스텀 노드 데이터 변경 핸들러
  const handleCustomDataChange = (field: keyof CustomNodeData, value: unknown) => {
    const currentCustomData = selectedNode?.customData || {
      title: 'Custom Node',
      description: '',
      color: '#9C27B0',
      fields: [],
      values: {},
    }
    updateNode(selectedNode!.id, {
      customData: { ...currentCustomData, [field]: value }
    })
  }

  // 커스텀 필드 추가
  const handleAddCustomField = () => {
    const currentCustomData = selectedNode?.customData || {
      title: 'Custom Node',
      description: '',
      color: '#9C27B0',
      fields: [],
      values: {},
    }
    const newField: CustomFieldDefinition = {
      id: `field_${Date.now()}`,
      name: 'New Field',
      type: 'text',
      defaultValue: '',
    }
    updateNode(selectedNode!.id, {
      customData: {
        ...currentCustomData,
        fields: [...currentCustomData.fields, newField],
      }
    })
  }

  // 커스텀 필드 변경
  const handleCustomFieldChange = (index: number, field: keyof CustomFieldDefinition, value: unknown) => {
    const currentCustomData = selectedNode?.customData
    if (!currentCustomData) return
    const fields = [...currentCustomData.fields]
    fields[index] = { ...fields[index], [field]: value }
    updateNode(selectedNode!.id, {
      customData: { ...currentCustomData, fields }
    })
  }

  // 커스텀 필드 삭제
  const handleRemoveCustomField = (index: number) => {
    const currentCustomData = selectedNode?.customData
    if (!currentCustomData) return
    const fields = [...currentCustomData.fields]
    const removedField = fields[index]
    fields.splice(index, 1)
    // 해당 필드의 값도 삭제
    const values = { ...currentCustomData.values }
    delete values[removedField.id]
    updateNode(selectedNode!.id, {
      customData: { ...currentCustomData, fields, values }
    })
  }

  // 커스텀 필드 값 변경
  const handleCustomValueChange = (fieldId: string, value: string | number | boolean) => {
    const currentCustomData = selectedNode?.customData
    if (!currentCustomData) return
    updateNode(selectedNode!.id, {
      customData: {
        ...currentCustomData,
        values: { ...currentCustomData.values, [fieldId]: value }
      }
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

            {/* 좌우 반전 */}
            <div className={styles.field}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={selectedNode.imageData?.flipHorizontal || false}
                  onChange={(e) => handleImageDataChange('flipHorizontal', e.target.checked)}
                />
                <span>Flip Horizontal</span>
              </label>
            </div>
          </>
        )}

        {/* JavaScript: code */}
        {selectedNode.type === 'javascript' && (
          <div className={styles.field}>
            <label className={styles.label}>JavaScript Code</label>
            <textarea
              className={`${styles.textarea} ${styles.codeEditor}`}
              value={selectedNode.javascriptCode || ''}
              onChange={(e) => handleChange('javascriptCode', e.target.value)}
              placeholder="// Enter JavaScript code here...&#10;// Available: gameState, setFlag, getFlag, etc."
              rows={10}
              spellCheck={false}
            />
          </div>
        )}

        {/* Custom: customData */}
        {selectedNode.type === 'custom' && (
          <>
            {/* 노드 제목 */}
            <div className={styles.field}>
              <label className={styles.label}>Title</label>
              <input
                type="text"
                className={styles.input}
                value={selectedNode.customData?.title || ''}
                onChange={(e) => handleCustomDataChange('title', e.target.value)}
                placeholder="Custom Node"
              />
            </div>

            {/* 노드 설명 */}
            <div className={styles.field}>
              <label className={styles.label}>Description</label>
              <textarea
                className={styles.textarea}
                value={selectedNode.customData?.description || ''}
                onChange={(e) => handleCustomDataChange('description', e.target.value)}
                placeholder="Node description..."
                rows={2}
              />
            </div>

            {/* 노드 색상 */}
            <div className={styles.field}>
              <label className={styles.label}>Color</label>
              <div className={styles.colorRow}>
                <input
                  type="color"
                  className={styles.colorPicker}
                  value={selectedNode.customData?.color || '#9C27B0'}
                  onChange={(e) => handleCustomDataChange('color', e.target.value)}
                />
                <input
                  type="text"
                  className={styles.input}
                  value={selectedNode.customData?.color || '#9C27B0'}
                  onChange={(e) => handleCustomDataChange('color', e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            {/* 필드 정의 */}
            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label className={styles.label}>Fields</label>
                <button className={styles.addBtn} onClick={handleAddCustomField}>+ Add Field</button>
              </div>
              <div className={styles.choiceList}>
                {(selectedNode.customData?.fields || []).map((field, index) => (
                  <div key={field.id} className={styles.customFieldItem}>
                    <div className={styles.choiceHeader}>
                      <span className={styles.choiceIndex}>{index + 1}</span>
                      <button
                        className={styles.removeBtn}
                        onClick={() => handleRemoveCustomField(index)}
                      >
                        ✕
                      </button>
                    </div>
                    <input
                      type="text"
                      className={styles.input}
                      value={field.name}
                      onChange={(e) => handleCustomFieldChange(index, 'name', e.target.value)}
                      placeholder="Field name..."
                    />
                    <select
                      className={styles.select}
                      value={field.type}
                      onChange={(e) => handleCustomFieldChange(index, 'type', e.target.value as CustomFieldType)}
                    >
                      <option value="text">Text</option>
                      <option value="textarea">Textarea</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="select">Select</option>
                    </select>
                    {field.type === 'select' && (
                      <input
                        type="text"
                        className={styles.input}
                        value={(field.options || []).join(', ')}
                        onChange={(e) => handleCustomFieldChange(index, 'options', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        placeholder="Options (comma-separated)..."
                      />
                    )}
                  </div>
                ))}
                {(selectedNode.customData?.fields || []).length === 0 && (
                  <div className={styles.noChoices}>No fields defined</div>
                )}
              </div>
            </div>

            {/* 필드 값 입력 */}
            {(selectedNode.customData?.fields || []).length > 0 && (
              <div className={styles.field}>
                <label className={styles.label}>Field Values</label>
                <div className={styles.customValues}>
                  {(selectedNode.customData?.fields || []).map((field) => (
                    <div key={field.id} className={styles.customValueItem}>
                      <label className={styles.customValueLabel}>{field.name}</label>
                      {field.type === 'text' && (
                        <input
                          type="text"
                          className={styles.input}
                          value={String(selectedNode.customData?.values[field.id] ?? field.defaultValue ?? '')}
                          onChange={(e) => handleCustomValueChange(field.id, e.target.value)}
                          placeholder={field.placeholder}
                        />
                      )}
                      {field.type === 'textarea' && (
                        <textarea
                          className={styles.textarea}
                          value={String(selectedNode.customData?.values[field.id] ?? field.defaultValue ?? '')}
                          onChange={(e) => handleCustomValueChange(field.id, e.target.value)}
                          placeholder={field.placeholder}
                          rows={3}
                        />
                      )}
                      {field.type === 'number' && (
                        <input
                          type="number"
                          className={styles.input}
                          value={Number(selectedNode.customData?.values[field.id] ?? field.defaultValue ?? 0)}
                          onChange={(e) => handleCustomValueChange(field.id, parseFloat(e.target.value) || 0)}
                        />
                      )}
                      {field.type === 'boolean' && (
                        <label className={styles.checkbox}>
                          <input
                            type="checkbox"
                            checked={Boolean(selectedNode.customData?.values[field.id] ?? field.defaultValue ?? false)}
                            onChange={(e) => handleCustomValueChange(field.id, e.target.checked)}
                          />
                          <span>Enabled</span>
                        </label>
                      )}
                      {field.type === 'select' && (
                        <select
                          className={styles.select}
                          value={String(selectedNode.customData?.values[field.id] ?? field.defaultValue ?? '')}
                          onChange={(e) => handleCustomValueChange(field.id, e.target.value)}
                        >
                          <option value="">Select...</option>
                          {(field.options || []).map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  )
}
