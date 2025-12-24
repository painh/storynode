import { useEditorStore } from '../../stores/editorStore'
import { NODE_COLORS, NODE_ICONS, NODE_LABELS } from '../../types/editor'
import type { StoryNode, StoryChoice } from '../../types/story'
import { CommentNodeInspector } from './inspector/CommentNodeInspector'
import { ImageNodeInspector } from './inspector/ImageNodeInspector'
import { ChoiceListEditor } from './inspector/ChoiceListEditor'
import { CustomNodeInspector } from './inspector/CustomNodeInspector'
import { ConditionNodeInspector } from './inspector/ConditionNodeInspector'
import { VariableNodeInspector } from './inspector/VariableNodeInspector'
import { HelpTooltip } from './inspector/HelpTooltip'
import { useTranslation } from '../../i18n'
import styles from './Inspector.module.css'

export function Inspector() {
  const { selectedNodeIds, selectedCommentId, getNodeById, getCommentById, updateNode, updateCommentNode, project } = useEditorStore()
  const t = useTranslation()

  // 프로젝트 리소스에서 이미지 목록 가져오기
  const imageResources = (project.resources || []).filter(r => r.type === 'image')

  // 단일 선택만 편집 가능
  const selectedNode = selectedNodeIds.length === 1 ? getNodeById(selectedNodeIds[0]) : undefined
  const selectedComment = selectedCommentId ? getCommentById(selectedCommentId) : undefined

  // 코멘트 노드가 선택된 경우
  if (selectedComment) {
    return (
      <CommentNodeInspector
        comment={selectedComment}
        onUpdate={(updates) => updateCommentNode(selectedCommentId!, updates)}
      />
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

  return (
    <aside className={styles.inspector}>
      <div className={styles.header} style={{ borderColor: NODE_COLORS[selectedNode.type] }}>
        <span className={styles.icon}>{NODE_ICONS[selectedNode.type]}</span>
        <span className={styles.type}>{NODE_LABELS[selectedNode.type]}</span>
      </div>

      <div className={styles.content}>
        <div className={styles.field}>
          <div className={styles.labelWithHelp}>
            <label className={styles.label}>ID</label>
            <HelpTooltip content={t.help.id} />
          </div>
          <input
            type="text"
            className={styles.input}
            value={selectedNode.id}
            readOnly
          />
        </div>

        {/* Dialogue: speaker */}
        {selectedNode.type === 'dialogue' && (
          <div className={styles.field}>
            <div className={styles.labelWithHelp}>
              <label className={styles.label}>Speaker</label>
              <HelpTooltip content={t.help.speaker} />
            </div>
            <input
              type="text"
              className={styles.input}
              value={selectedNode.speaker || ''}
              onChange={(e) => handleChange('speaker', e.target.value)}
              placeholder="Narrator (if empty)"
            />
          </div>
        )}

        {/* Dialogue & Choice & Chapter End: text */}
        {(selectedNode.type === 'dialogue' || selectedNode.type === 'choice' || selectedNode.type === 'chapter_end') && (
          <div className={styles.field}>
            <div className={styles.labelWithHelp}>
              <label className={styles.label}>Text</label>
              <HelpTooltip content={t.help.text} />
            </div>
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
          <ChoiceListEditor
            choices={selectedNode.choices || []}
            onChoiceChange={handleChoiceChange}
            onAddChoice={handleAddChoice}
            onRemoveChoice={handleRemoveChoice}
          />
        )}

        {/* Image: imageData */}
        {selectedNode.type === 'image' && (
          <ImageNodeInspector
            node={selectedNode}
            imageResources={imageResources}
            onUpdate={(updates) => updateNode(selectedNode.id, updates)}
          />
        )}

        {/* JavaScript: code */}
        {selectedNode.type === 'javascript' && (
          <div className={styles.field}>
            <div className={styles.labelWithHelp}>
              <label className={styles.label}>JavaScript Code</label>
              <HelpTooltip content={t.help.javascript} />
            </div>
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
          <CustomNodeInspector
            node={selectedNode}
            onUpdate={(updates) => updateNode(selectedNode.id, updates)}
          />
        )}

        {/* Condition: conditionBranches */}
        {selectedNode.type === 'condition' && (
          <ConditionNodeInspector
            node={selectedNode}
            onUpdate={(updates) => updateNode(selectedNode.id, updates)}
          />
        )}

        {/* Variable: variableOperations */}
        {selectedNode.type === 'variable' && (
          <VariableNodeInspector
            node={selectedNode}
            onUpdate={(updates) => updateNode(selectedNode.id, updates)}
          />
        )}
      </div>
    </aside>
  )
}
