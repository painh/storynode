import { useEditorStore } from '../../stores/editorStore'
import { NODE_COLORS, NODE_ICONS, NODE_LABELS } from '../../types/editor'
import type { StoryNode, StoryChoice } from '../../types/story'
import styles from './Inspector.module.css'

export function Inspector() {
  const { selectedNodeIds, getNodeById, updateNode } = useEditorStore()

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
      </div>
    </aside>
  )
}
