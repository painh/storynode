import styles from '../Inspector.module.css'

// 색상 프리셋
export const COLOR_PRESETS = [
  '#5C6BC0', // 인디고
  '#42A5F5', // 블루
  '#26A69A', // 틸
  '#66BB6A', // 그린
  '#FFCA28', // 앰버
  '#FF7043', // 딥오렌지
  '#EC407A', // 핑크
  '#AB47BC', // 퍼플
]

interface ColorPickerWithPresetsProps {
  value: string
  onChange: (color: string) => void
  showPresets?: boolean
}

export function ColorPickerWithPresets({ value, onChange, showPresets = true }: ColorPickerWithPresetsProps) {
  return (
    <>
      {showPresets && (
        <div className={styles.colorPresets}>
          {COLOR_PRESETS.map(color => (
            <button
              key={color}
              className={`${styles.colorPreset} ${value === color ? styles.colorPresetActive : ''}`}
              style={{ background: color }}
              onClick={() => onChange(color)}
            />
          ))}
        </div>
      )}
      <div className={styles.colorRow}>
        <input
          type="color"
          className={styles.colorPicker}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          type="text"
          className={styles.input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>
    </>
  )
}
