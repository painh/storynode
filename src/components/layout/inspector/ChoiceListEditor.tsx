import type { StoryChoice } from '../../../types/story'
import styles from '../Inspector.module.css'

interface ChoiceListEditorProps {
  choices: StoryChoice[]
  onChoiceChange: (index: number, field: keyof StoryChoice, value: unknown) => void
  onAddChoice: () => void
  onRemoveChoice: (index: number) => void
}

export function ChoiceListEditor({ choices, onChoiceChange, onAddChoice, onRemoveChoice }: ChoiceListEditorProps) {
  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label className={styles.label}>Choices</label>
        <button className={styles.addBtn} onClick={onAddChoice}>+ Add</button>
      </div>
      <div className={styles.choiceList}>
        {choices.map((choice, index) => (
          <div key={choice.id} className={styles.choiceItem}>
            <div className={styles.choiceHeader}>
              <span className={styles.choiceIndex}>{index + 1}</span>
              <button
                className={styles.removeBtn}
                onClick={() => onRemoveChoice(index)}
              >
                ✕
              </button>
            </div>
            <input
              type="text"
              className={styles.input}
              value={choice.text}
              onChange={(e) => onChoiceChange(index, 'text', e.target.value)}
              placeholder="Choice text..."
            />
          </div>
        ))}
        {choices.length === 0 && (
          <div className={styles.noChoices}>No choices yet</div>
        )}
      </div>
    </div>
  )
}
