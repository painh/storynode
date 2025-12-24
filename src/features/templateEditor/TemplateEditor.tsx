import { useState, useCallback } from 'react'
import { useEditorStore } from '../../stores/editorStore'
import type { CustomNodeTemplate, CustomFieldDefinition, CustomFieldType } from '../../types/story'
import styles from './TemplateEditor.module.css'

interface TemplateEditorProps {
  onClose: () => void
}

const ICON_OPTIONS = ['🧩', '⚡', '🎯', '🔧', '💎', '🎲', '🎮', '📦', '🔮', '⚔️', '🛡️', '💫', '🌟', '🔥', '❄️', '🌊']

export function TemplateEditor({ onClose }: TemplateEditorProps) {
  const {
    getTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  } = useEditorStore()

  const templates = getTemplates()
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    templates[0]?.id || null
  )

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId)

  const handleCreateTemplate = useCallback(() => {
    const newTemplate = createTemplate()
    setSelectedTemplateId(newTemplate.id)
  }, [createTemplate])

  const handleDeleteTemplate = useCallback((templateId: string) => {
    deleteTemplate(templateId)
    if (selectedTemplateId === templateId) {
      const remaining = templates.filter(t => t.id !== templateId)
      setSelectedTemplateId(remaining[0]?.id || null)
    }
  }, [deleteTemplate, selectedTemplateId, templates])

  const handleUpdateTemplate = useCallback((updates: Partial<CustomNodeTemplate>) => {
    if (selectedTemplateId) {
      updateTemplate(selectedTemplateId, updates)
    }
  }, [selectedTemplateId, updateTemplate])

  const handleAddField = useCallback(() => {
    if (!selectedTemplate) return
    const newField: CustomFieldDefinition = {
      id: `field_${Date.now()}`,
      name: 'New Field',
      type: 'text',
      defaultValue: '',
    }
    handleUpdateTemplate({
      fields: [...selectedTemplate.fields, newField],
    })
  }, [selectedTemplate, handleUpdateTemplate])

  const handleUpdateField = useCallback((index: number, updates: Partial<CustomFieldDefinition>) => {
    if (!selectedTemplate) return
    const fields = [...selectedTemplate.fields]
    fields[index] = { ...fields[index], ...updates }
    handleUpdateTemplate({ fields })
  }, [selectedTemplate, handleUpdateTemplate])

  const handleRemoveField = useCallback((index: number) => {
    if (!selectedTemplate) return
    const fields = [...selectedTemplate.fields]
    const removedField = fields[index]
    fields.splice(index, 1)

    // Also remove from defaultValues
    const defaultValues = { ...selectedTemplate.defaultValues }
    delete defaultValues[removedField.id]

    handleUpdateTemplate({ fields, defaultValues })
  }, [selectedTemplate, handleUpdateTemplate])

  const handleUpdateDefaultValue = useCallback((fieldId: string, value: string | number | boolean) => {
    if (!selectedTemplate) return
    handleUpdateTemplate({
      defaultValues: { ...selectedTemplate.defaultValues, [fieldId]: value },
    })
  }, [selectedTemplate, handleUpdateTemplate])

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={onClose}>
            ← Back to Editor
          </button>
          <h1 className={styles.title}>
            🧩 Custom Node Templates
          </h1>
        </div>
      </div>

      {/* Workspace */}
      <div className={styles.workspace}>
        {/* Template List */}
        <div className={styles.listPanel}>
          <div className={styles.listHeader}>
            <span className={styles.listTitle}>Templates</span>
            <button className={styles.addTemplateBtn} onClick={handleCreateTemplate}>
              + New
            </button>
          </div>
          <div className={styles.templateList}>
            {templates.length === 0 ? (
              <div className={styles.emptyList}>
                <div className={styles.emptyIcon}>📭</div>
                <div className={styles.emptyText}>No templates yet</div>
                <button className={styles.addTemplateBtn} onClick={handleCreateTemplate}>
                  + Create Template
                </button>
              </div>
            ) : (
              templates.map((template) => (
                <div
                  key={template.id}
                  className={`${styles.templateItem} ${selectedTemplateId === template.id ? styles.templateItemActive : ''}`}
                  onClick={() => setSelectedTemplateId(template.id)}
                >
                  <div
                    className={styles.templateIcon}
                    style={{ backgroundColor: template.color + '30' }}
                  >
                    {template.icon || '🧩'}
                  </div>
                  <div className={styles.templateInfo}>
                    <div className={styles.templateName}>{template.name}</div>
                    <div className={styles.templateMeta}>
                      {template.fields.length} field{template.fields.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <button
                    className={styles.deleteTemplateBtn}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteTemplate(template.id)
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Form Panel */}
        <div className={styles.formPanel}>
          {!selectedTemplate ? (
            <div className={styles.formEmpty}>
              <div className={styles.formEmptyIcon}>👈</div>
              <div className={styles.formEmptyText}>Select a template to edit</div>
            </div>
          ) : (
            <>
              {/* Basic Info */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Basic Information</div>

                <div className={styles.field}>
                  <label className={styles.label}>Template Name</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={selectedTemplate.name}
                    onChange={(e) => handleUpdateTemplate({ name: e.target.value })}
                    placeholder="Template name..."
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Description</label>
                  <textarea
                    className={styles.textarea}
                    value={selectedTemplate.description || ''}
                    onChange={(e) => handleUpdateTemplate({ description: e.target.value })}
                    placeholder="Template description..."
                    rows={2}
                  />
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Color</label>
                    <div className={styles.colorRow}>
                      <input
                        type="color"
                        className={styles.colorPicker}
                        value={selectedTemplate.color}
                        onChange={(e) => handleUpdateTemplate({ color: e.target.value })}
                      />
                      <input
                        type="text"
                        className={`${styles.input} ${styles.colorInput}`}
                        value={selectedTemplate.color}
                        onChange={(e) => handleUpdateTemplate({ color: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Icon</label>
                  <div className={styles.iconSelector}>
                    {ICON_OPTIONS.map((icon) => (
                      <button
                        key={icon}
                        className={`${styles.iconOption} ${selectedTemplate.icon === icon ? styles.iconOptionActive : ''}`}
                        onClick={() => handleUpdateTemplate({ icon })}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div className={styles.section}>
                <div className={styles.fieldsHeader}>
                  <div className={styles.sectionTitle}>Fields</div>
                  <button className={styles.addFieldBtn} onClick={handleAddField}>
                    + Add Field
                  </button>
                </div>

                {selectedTemplate.fields.length === 0 ? (
                  <div className={styles.noFields}>
                    No fields defined. Click "Add Field" to create one.
                  </div>
                ) : (
                  <div className={styles.fieldsList}>
                    {selectedTemplate.fields.map((field, index) => (
                      <div key={field.id} className={styles.fieldItem}>
                        <div className={styles.fieldItemHeader}>
                          <div className={styles.fieldDragHandle}>
                            <span className={styles.dragIcon}>☰</span>
                            <span className={styles.fieldIndex}>Field {index + 1}</span>
                          </div>
                          <button
                            className={styles.removeFieldBtn}
                            onClick={() => handleRemoveField(index)}
                          >
                            ✕
                          </button>
                        </div>
                        <div className={styles.fieldItemBody}>
                          <div className={styles.fieldItemRow}>
                            <div className={styles.field}>
                              <label className={styles.label}>Field Name</label>
                              <input
                                type="text"
                                className={styles.input}
                                value={field.name}
                                onChange={(e) => handleUpdateField(index, { name: e.target.value })}
                                placeholder="Field name..."
                              />
                            </div>
                            <div className={styles.field}>
                              <label className={styles.label}>Type</label>
                              <select
                                className={styles.select}
                                value={field.type}
                                onChange={(e) => handleUpdateField(index, { type: e.target.value as CustomFieldType })}
                              >
                                <option value="text">Text</option>
                                <option value="textarea">Textarea</option>
                                <option value="number">Number</option>
                                <option value="boolean">Boolean</option>
                                <option value="select">Select</option>
                              </select>
                            </div>
                          </div>

                          {field.type === 'select' && (
                            <div className={styles.field}>
                              <label className={styles.label}>Options (comma-separated)</label>
                              <input
                                type="text"
                                className={styles.input}
                                value={(field.options || []).join(', ')}
                                onChange={(e) => handleUpdateField(index, {
                                  options: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                })}
                                placeholder="Option1, Option2, Option3..."
                              />
                            </div>
                          )}

                          <div className={styles.field}>
                            <label className={styles.label}>Default Value</label>
                            {field.type === 'text' && (
                              <input
                                type="text"
                                className={styles.input}
                                value={String(selectedTemplate.defaultValues[field.id] ?? '')}
                                onChange={(e) => handleUpdateDefaultValue(field.id, e.target.value)}
                                placeholder="Default value..."
                              />
                            )}
                            {field.type === 'textarea' && (
                              <textarea
                                className={styles.textarea}
                                value={String(selectedTemplate.defaultValues[field.id] ?? '')}
                                onChange={(e) => handleUpdateDefaultValue(field.id, e.target.value)}
                                placeholder="Default value..."
                                rows={2}
                              />
                            )}
                            {field.type === 'number' && (
                              <input
                                type="number"
                                className={styles.input}
                                value={Number(selectedTemplate.defaultValues[field.id] ?? 0)}
                                onChange={(e) => handleUpdateDefaultValue(field.id, parseFloat(e.target.value) || 0)}
                              />
                            )}
                            {field.type === 'boolean' && (
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                  type="checkbox"
                                  checked={Boolean(selectedTemplate.defaultValues[field.id] ?? false)}
                                  onChange={(e) => handleUpdateDefaultValue(field.id, e.target.checked)}
                                />
                                <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                                  Default: {selectedTemplate.defaultValues[field.id] ? 'Enabled' : 'Disabled'}
                                </span>
                              </label>
                            )}
                            {field.type === 'select' && (
                              <select
                                className={styles.select}
                                value={String(selectedTemplate.defaultValues[field.id] ?? '')}
                                onChange={(e) => handleUpdateDefaultValue(field.id, e.target.value)}
                              >
                                <option value="">Select default...</option>
                                {(field.options || []).map((opt) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Preview Panel */}
        <div className={styles.previewPanel}>
          <div className={styles.previewHeader}>
            <span className={styles.previewTitle}>Preview</span>
          </div>
          <div className={styles.previewContent}>
            {selectedTemplate ? (
              <div className={styles.previewNode}>
                <div
                  className={styles.previewNodeHeader}
                  style={{ backgroundColor: selectedTemplate.color }}
                >
                  <span className={styles.previewNodeIcon}>{selectedTemplate.icon || '🧩'}</span>
                  <span className={styles.previewNodeTitle}>{selectedTemplate.name}</span>
                </div>
                <div className={styles.previewNodeBody}>
                  {selectedTemplate.description && (
                    <div className={styles.previewNodeDesc}>
                      {selectedTemplate.description.length > 50
                        ? selectedTemplate.description.slice(0, 50) + '...'
                        : selectedTemplate.description}
                    </div>
                  )}
                  {selectedTemplate.fields.length === 0 ? (
                    <div className={styles.previewEmpty}>No fields</div>
                  ) : (
                    <>
                      {selectedTemplate.fields.slice(0, 3).map((field) => (
                        <div key={field.id} className={styles.previewNodeField}>
                          <span className={styles.previewFieldName}>{field.name}</span>
                          <span className={styles.previewFieldType}>{field.type}</span>
                        </div>
                      ))}
                      {selectedTemplate.fields.length > 3 && (
                        <div className={styles.previewMore}>
                          +{selectedTemplate.fields.length - 3} more field{selectedTemplate.fields.length - 3 !== 1 ? 's' : ''}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className={styles.formEmpty}>
                <div className={styles.formEmptyIcon}>🖼️</div>
                <div className={styles.formEmptyText}>Select a template to preview</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
