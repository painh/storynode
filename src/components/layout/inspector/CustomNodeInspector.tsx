import type { StoryNode, CustomNodeData, CustomFieldDefinition, CustomFieldType } from '../../../types/story'
import { useEditorStore } from '../../../stores/editorStore'
import { ColorPickerWithPresets } from './ColorPickerWithPresets'
import styles from '../Inspector.module.css'

interface CustomNodeInspectorProps {
  node: StoryNode
  onUpdate: (updates: Partial<StoryNode>) => void
}

export function CustomNodeInspector({ node, onUpdate }: CustomNodeInspectorProps) {
  const { getTemplateById, syncNodeWithTemplate, detachNodeFromTemplate } = useEditorStore()

  const getCustomData = (): CustomNodeData => node.customData || {
    title: 'Custom Node',
    description: '',
    color: '#9C27B0',
    fields: [],
    values: {},
  }

  const customData = getCustomData()
  const templateId = customData.templateId
  const template = templateId ? getTemplateById(templateId) : null

  const handleCustomDataChange = (field: keyof CustomNodeData, value: unknown) => {
    onUpdate({
      customData: { ...getCustomData(), [field]: value }
    })
  }

  const handleAddCustomField = () => {
    const currentCustomData = getCustomData()
    const newField: CustomFieldDefinition = {
      id: `field_${Date.now()}`,
      name: 'New Field',
      type: 'text',
      defaultValue: '',
    }
    onUpdate({
      customData: {
        ...currentCustomData,
        fields: [...currentCustomData.fields, newField],
      }
    })
  }

  const handleCustomFieldChange = (index: number, field: keyof CustomFieldDefinition, value: unknown) => {
    const currentCustomData = node.customData
    if (!currentCustomData) return
    const fields = [...currentCustomData.fields]
    fields[index] = { ...fields[index], [field]: value }
    onUpdate({
      customData: { ...currentCustomData, fields }
    })
  }

  const handleRemoveCustomField = (index: number) => {
    const currentCustomData = node.customData
    if (!currentCustomData) return
    const fields = [...currentCustomData.fields]
    const removedField = fields[index]
    fields.splice(index, 1)
    const values = { ...currentCustomData.values }
    delete values[removedField.id]
    onUpdate({
      customData: { ...currentCustomData, fields, values }
    })
  }

  const handleCustomValueChange = (fieldId: string, value: string | number | boolean) => {
    const currentCustomData = node.customData
    if (!currentCustomData) return
    onUpdate({
      customData: {
        ...currentCustomData,
        values: { ...currentCustomData.values, [fieldId]: value }
      }
    })
  }

  const handleSyncWithTemplate = () => {
    syncNodeWithTemplate(node.id)
  }

  const handleDetachFromTemplate = () => {
    detachNodeFromTemplate(node.id)
  }

  return (
    <>
      {/* 템플릿 연결 정보 */}
      {templateId && (
        <div className={styles.field}>
          <div className={styles.templateInfo}>
            <div className={styles.templateInfoHeader}>
              <span className={styles.templateInfoIcon}>{template?.icon || '🧩'}</span>
              <span className={styles.templateInfoName}>
                {template ? template.name : 'Unknown Template'}
              </span>
            </div>
            <div className={styles.templateInfoActions}>
              <button
                className={styles.templateSyncBtn}
                onClick={handleSyncWithTemplate}
                title="Sync fields with template"
              >
                🔄 Sync
              </button>
              <button
                className={styles.templateDetachBtn}
                onClick={handleDetachFromTemplate}
                title="Detach from template"
              >
                🔗 Detach
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 노드 제목 */}
      <div className={styles.field}>
        <label className={styles.label}>Title</label>
        <input
          type="text"
          className={styles.input}
          value={customData.title || ''}
          onChange={(e) => handleCustomDataChange('title', e.target.value)}
          placeholder="Custom Node"
        />
      </div>

      {/* 노드 설명 */}
      <div className={styles.field}>
        <label className={styles.label}>Description</label>
        <textarea
          className={styles.textarea}
          value={customData.description || ''}
          onChange={(e) => handleCustomDataChange('description', e.target.value)}
          placeholder="Node description..."
          rows={2}
        />
      </div>

      {/* 노드 색상 */}
      <div className={styles.field}>
        <label className={styles.label}>Color</label>
        <ColorPickerWithPresets
          value={customData.color || '#9C27B0'}
          onChange={(color) => handleCustomDataChange('color', color)}
          showPresets={false}
        />
      </div>

      {/* 필드 정의 */}
      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label className={styles.label}>Fields</label>
          <button className={styles.addBtn} onClick={handleAddCustomField}>+ Add Field</button>
        </div>
        <div className={styles.choiceList}>
          {customData.fields.map((field, index) => (
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
          {customData.fields.length === 0 && (
            <div className={styles.noChoices}>No fields defined</div>
          )}
        </div>
      </div>

      {/* 필드 값 입력 */}
      {customData.fields.length > 0 && (
        <div className={styles.field}>
          <label className={styles.label}>Field Values</label>
          <div className={styles.customValues}>
            {customData.fields.map((field) => (
              <div key={field.id} className={styles.customValueItem}>
                <label className={styles.customValueLabel}>{field.name}</label>
                {field.type === 'text' && (
                  <input
                    type="text"
                    className={styles.input}
                    value={String(customData.values[field.id] ?? field.defaultValue ?? '')}
                    onChange={(e) => handleCustomValueChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                  />
                )}
                {field.type === 'textarea' && (
                  <textarea
                    className={styles.textarea}
                    value={String(customData.values[field.id] ?? field.defaultValue ?? '')}
                    onChange={(e) => handleCustomValueChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                  />
                )}
                {field.type === 'number' && (
                  <input
                    type="number"
                    className={styles.input}
                    value={Number(customData.values[field.id] ?? field.defaultValue ?? 0)}
                    onChange={(e) => handleCustomValueChange(field.id, parseFloat(e.target.value) || 0)}
                  />
                )}
                {field.type === 'boolean' && (
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={Boolean(customData.values[field.id] ?? field.defaultValue ?? false)}
                      onChange={(e) => handleCustomValueChange(field.id, e.target.checked)}
                    />
                    <span>Enabled</span>
                  </label>
                )}
                {field.type === 'select' && (
                  <select
                    className={styles.select}
                    value={String(customData.values[field.id] ?? field.defaultValue ?? '')}
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
  )
}
