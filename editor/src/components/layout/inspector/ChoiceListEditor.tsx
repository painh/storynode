import { useState } from 'react'
import type { StoryChoice, StoryCondition, ComparisonOperator, VariableDefinition } from '../../../types/story'
import { useEditorStore } from '../../../stores/editorStore'
import styles from '../Inspector.module.css'

interface ChoiceListEditorProps {
  choices: StoryChoice[]
  onChoiceChange: (index: number, field: keyof StoryChoice, value: unknown) => void
  onAddChoice: () => void
  onRemoveChoice: (index: number) => void
}

const OPERATORS: { value: ComparisonOperator; label: string }[] = [
  { value: '>=', label: '>=' },
  { value: '>', label: '>' },
  { value: '==', label: '==' },
  { value: '!=', label: '!=' },
  { value: '<=', label: '<=' },
  { value: '<', label: '<' },
]

export function ChoiceListEditor({ choices, onChoiceChange, onAddChoice, onRemoveChoice }: ChoiceListEditorProps) {
  const variables = useEditorStore((state) => state.project.variables) || []
  const [expandedChoices, setExpandedChoices] = useState<Set<number>>(new Set())

  const toggleExpand = (index: number) => {
    // 조건이 이미 있으면 토글 무시 (항상 열림)
    if (choices[index]?.condition) return
    
    setExpandedChoices(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const handleConditionChange = (
    index: number, 
    field: keyof StoryCondition, 
    value: string | number | boolean
  ) => {
    const choice = choices[index]
    const currentCondition = choice.condition || { type: 'variable' as const }
    
    const newCondition: StoryCondition = {
      ...currentCondition,
      type: 'variable',
      [field]: value,
    }
    
    onChoiceChange(index, 'condition', newCondition)
  }

  const removeCondition = (index: number) => {
    onChoiceChange(index, 'condition', undefined)
    onChoiceChange(index, 'disabledText', undefined)
  }

  const getVariableType = (variableId: string): VariableDefinition['type'] | undefined => {
    return variables.find(v => v.id === variableId)?.type
  }

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label className={styles.label}>Choices</label>
        <button className={styles.addBtn} onClick={onAddChoice}>+ Add</button>
      </div>
      <div className={styles.choiceList}>
        {choices.map((choice, index) => {
          const hasCondition = !!choice.condition
          // 조건이 있으면 항상 펼침, 없으면 토글 상태 따름
          const isExpanded = hasCondition || expandedChoices.has(index)
          
          return (
            <div key={choice.id} className={styles.choiceItem}>
              <div className={styles.choiceHeader}>
                <span className={styles.choiceIndex}>{index + 1}</span>
                <button
                  className={`${styles.expandBtn} ${hasCondition ? styles.hasCondition : ''}`}
                  onClick={() => toggleExpand(index)}
                  title={isExpanded ? 'Collapse' : 'Expand condition settings'}
                >
                  {hasCondition ? '⚡' : '⚙️'}
                </button>
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
              
              {/* 조건 설정 패널 */}
              {isExpanded && (
                <div className={styles.conditionPanel}>
                  <div className={styles.conditionHeader}>
                    <span className={styles.conditionLabel}>Condition</span>
                    {hasCondition && (
                      <button 
                        className={styles.removeConditionBtn}
                        onClick={() => removeCondition(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className={styles.conditionRow}>
                    <select
                      className={styles.conditionSelect}
                      value={choice.condition?.variableId || ''}
                      onChange={(e) => handleConditionChange(index, 'variableId', e.target.value)}
                    >
                      <option value="">Select variable...</option>
                      {variables.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.type})
                        </option>
                      ))}
                    </select>
                    
                    <select
                      className={styles.operatorSelect}
                      value={choice.condition?.operator || '>='}
                      onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
                    >
                      {OPERATORS.map(op => (
                        <option key={op.value} value={op.value}>{op.label}</option>
                      ))}
                    </select>
                    
                    {/* 변수 타입에 따라 다른 입력 */}
                    {getVariableType(choice.condition?.variableId || '') === 'boolean' ? (
                      <select
                        className={styles.conditionValueSelect}
                        value={String(choice.condition?.value ?? 'true')}
                        onChange={(e) => handleConditionChange(index, 'value', e.target.value === 'true')}
                      >
                        <option value="true">true</option>
                        <option value="false">false</option>
                      </select>
                    ) : (
                      <input
                        type={getVariableType(choice.condition?.variableId || '') === 'number' ? 'number' : 'text'}
                        className={styles.conditionValueInput}
                        value={typeof choice.condition?.value === 'boolean' ? '' : (choice.condition?.value ?? '')}
                        onChange={(e) => {
                          const varType = getVariableType(choice.condition?.variableId || '')
                          const value = varType === 'number' ? Number(e.target.value) : e.target.value
                          handleConditionChange(index, 'value', value)
                        }}
                        placeholder="Value"
                      />
                    )}
                  </div>
                  
                  {/* 비활성화 메시지 */}
                  <div className={styles.disabledTextRow}>
                    <label className={styles.smallLabel}>Disabled message</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={choice.disabledText || ''}
                      onChange={(e) => onChoiceChange(index, 'disabledText', e.target.value)}
                      placeholder="e.g. Requires 100 gold"
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
        {choices.length === 0 && (
          <div className={styles.noChoices}>No choices yet</div>
        )}
      </div>
    </div>
  )
}
