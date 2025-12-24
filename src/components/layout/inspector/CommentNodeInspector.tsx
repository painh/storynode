import type { CommentNode } from '../../../types/story'
import type { CommentNodeData } from '../../../types/editor'
import { NODE_ICONS, NODE_LABELS } from '../../../types/editor'
import { ColorPickerWithPresets } from './ColorPickerWithPresets'
import styles from '../Inspector.module.css'

interface CommentNodeInspectorProps {
  comment: CommentNode
  onUpdate: (updates: Partial<CommentNodeData>) => void
}

export function CommentNodeInspector({ comment, onUpdate }: CommentNodeInspectorProps) {
  return (
    <aside className={styles.inspector}>
      <div className={styles.header} style={{ borderColor: comment.data.color }}>
        <span className={styles.icon}>{NODE_ICONS.comment}</span>
        <span className={styles.type}>{NODE_LABELS.comment}</span>
      </div>

      <div className={styles.content}>
        <div className={styles.field}>
          <label className={styles.label}>Title</label>
          <input
            type="text"
            className={styles.input}
            value={comment.data.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Comment title..."
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textarea}
            value={comment.data.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Add description..."
            rows={4}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Color</label>
          <ColorPickerWithPresets
            value={comment.data.color}
            onChange={(color) => onUpdate({ color })}
            showPresets={true}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Display Mode</label>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={comment.data.isCollapsed || false}
              onChange={(e) => onUpdate({ isCollapsed: e.target.checked })}
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
              value={comment.data.width}
              onChange={(e) => onUpdate({ width: parseInt(e.target.value) || 200 })}
              min={100}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Height</label>
            <input
              type="number"
              className={styles.input}
              value={comment.data.height}
              onChange={(e) => onUpdate({ height: parseInt(e.target.value) || 100 })}
              min={50}
            />
          </div>
        </div>
      </div>
    </aside>
  )
}
