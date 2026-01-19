import type { StoryNode, TextEffectSettings, TextDisplayEffect, TextEmphasisEffect } from '../../../types/story'
import { TEXT_EFFECT_GROUPS } from '../../../types/story'
import { HelpTooltip } from './HelpTooltip'
import styles from '../Inspector.module.css'

interface TextEffectInspectorProps {
  node: StoryNode
  onUpdate: (updates: Partial<StoryNode>) => void
}

export function TextEffectInspector({ node, onUpdate }: TextEffectInspectorProps) {
  const currentEffects: TextEffectSettings = node.textEffects || {}

  const handleTextEffectChange = (field: keyof TextEffectSettings, value: unknown) => {
    onUpdate({
      textEffects: { ...currentEffects, [field]: value }
    })
  }

  // 연출 효과 토글
  const handleDisplayEffectToggle = (effect: TextDisplayEffect) => {
    const current = currentEffects.displayEffects || []
    const newEffects = current.includes(effect)
      ? current.filter(e => e !== effect)
      : [...current, effect]
    handleTextEffectChange('displayEffects', newEffects.length > 0 ? newEffects : undefined)
  }

  // 강조 효과 토글
  const handleEmphasisEffectToggle = (effect: TextEmphasisEffect) => {
    const current = currentEffects.emphasisEffects || []
    const newEffects = current.includes(effect)
      ? current.filter(e => e !== effect)
      : [...current, effect]
    handleTextEffectChange('emphasisEffects', newEffects.length > 0 ? newEffects : undefined)
  }

  // 출력 방식이 기본값(typewriter)인지 확인
  const hasAnyEffect = currentEffects.outputMode ||
    (currentEffects.displayEffects && currentEffects.displayEffects.length > 0) ||
    (currentEffects.emphasisEffects && currentEffects.emphasisEffects.length > 0)

  return (
    <>
      {/* 구분선 */}
      <div className={styles.divider} />

      <div className={styles.sectionTitle}>Text Effects</div>

      {/* 출력 방식 (라디오) */}
      <div className={styles.field}>
        <div className={styles.labelWithHelp}>
          <label className={styles.label}>{TEXT_EFFECT_GROUPS.outputMode.label}</label>
          <HelpTooltip content="텍스트가 화면에 나타나는 방식을 선택합니다" />
        </div>
        <div className={styles.effectRadioGroup}>
          {TEXT_EFFECT_GROUPS.outputMode.options.map(option => (
            <label
              key={option.value}
              className={`${styles.effectRadio} ${(currentEffects.outputMode || 'typewriter') === option.value ? styles.active : ''}`}
              title={option.description}
            >
              <input
                type="radio"
                name="outputMode"
                checked={(currentEffects.outputMode || 'typewriter') === option.value}
                onChange={() => handleTextEffectChange('outputMode', option.value === 'typewriter' ? undefined : option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 출력 속도 (타자기 모드일 때만) */}
      {(!currentEffects.outputMode || currentEffects.outputMode === 'typewriter') && (
        <div className={styles.field}>
          <div className={styles.labelWithHelp}>
            <label className={styles.label}>출력 속도 (ms/글자)</label>
            <HelpTooltip content="한 글자가 출력되는 간격 (밀리초). 값이 작을수록 빠릅니다." />
          </div>
          <input
            type="number"
            className={styles.input}
            value={currentEffects.outputSpeed ?? 30}
            onChange={(e) => handleTextEffectChange('outputSpeed', parseInt(e.target.value) || 30)}
            min={10}
            max={200}
            step={10}
          />
        </div>
      )}

      {/* 연출 효과 (체크박스) */}
      <div className={styles.field}>
        <div className={styles.labelWithHelp}>
          <label className={styles.label}>{TEXT_EFFECT_GROUPS.displayEffects.label}</label>
          <HelpTooltip content="텍스트에 적용할 시각적 연출 효과입니다. 여러 개를 동시에 선택할 수 있습니다." />
        </div>
        <div className={styles.effectGroup}>
          {TEXT_EFFECT_GROUPS.displayEffects.options.map(option => (
            <label
              key={option.value}
              className={`${styles.effectCheckbox} ${currentEffects.displayEffects?.includes(option.value) ? styles.active : ''}`}
              title={option.description}
            >
              <input
                type="checkbox"
                checked={currentEffects.displayEffects?.includes(option.value) || false}
                onChange={() => handleDisplayEffectToggle(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 강조 효과 (체크박스) */}
      <div className={styles.field}>
        <div className={styles.labelWithHelp}>
          <label className={styles.label}>{TEXT_EFFECT_GROUPS.emphasisEffects.label}</label>
          <HelpTooltip content="텍스트를 강조하는 효과입니다. 여러 개를 동시에 선택할 수 있습니다." />
        </div>
        <div className={styles.effectGroup}>
          {TEXT_EFFECT_GROUPS.emphasisEffects.options.map(option => (
            <label
              key={option.value}
              className={`${styles.effectCheckbox} ${currentEffects.emphasisEffects?.includes(option.value) ? styles.active : ''}`}
              title={option.description}
            >
              <input
                type="checkbox"
                checked={currentEffects.emphasisEffects?.includes(option.value) || false}
                onChange={() => handleEmphasisEffectToggle(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 효과 지속 시간 */}
      {hasAnyEffect && (
        <div className={styles.field}>
          <div className={styles.labelWithHelp}>
            <label className={styles.label}>효과 지속 시간 (ms)</label>
            <HelpTooltip content="효과가 재생되는 시간 (밀리초). fadeIn, zoom, blur 등 일회성 효과에 적용됩니다." />
          </div>
          <input
            type="number"
            className={styles.input}
            value={currentEffects.effectDuration ?? 500}
            onChange={(e) => handleTextEffectChange('effectDuration', parseInt(e.target.value) || 500)}
            min={100}
            max={3000}
            step={100}
          />
        </div>
      )}
    </>
  )
}
