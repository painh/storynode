import type { StoryNode, ImageNodeData, ImageAlignment, ImageEffectType, ImageExitEffectType, ImageTransitionTiming, ProjectResource } from '../../../types/story'
import { IMAGE_EFFECT_GROUPS, COMBINABLE_EFFECTS } from '../../../types/story'
import { HelpTooltip } from './HelpTooltip'
import { useTranslation } from '../../../i18n'
import styles from '../Inspector.module.css'

// 효과 표시 이름
const EFFECT_LABELS: Record<ImageEffectType, string> = {
  fadeIn: 'Fade In',
  shake: 'Shake',
  slideLeft: 'Slide Left',
  slideRight: 'Slide Right',
  slideUp: 'Slide Up',
  slideDown: 'Slide Down',
  zoomIn: 'Zoom In',
  zoomOut: 'Zoom Out',
  bounce: 'Bounce',
  flash: 'Flash',
  pulse: 'Pulse',
}

// 퇴장 효과 표시 이름
const EXIT_EFFECT_LABELS: Record<ImageExitEffectType, string> = {
  none: '즉시 제거',
  fadeOut: 'Fade Out',
  slideOutLeft: 'Slide Out Left',
  slideOutRight: 'Slide Out Right',
  slideOutUp: 'Slide Out Up',
  slideOutDown: 'Slide Out Down',
  zoomOut: 'Zoom Out',
  shrink: 'Shrink',
}

// 교체 타이밍 표시 이름
const TRANSITION_TIMING_LABELS: Record<ImageTransitionTiming, string> = {
  sequential: '순차 (퇴장 후 등장)',
  crossfade: '동시 (크로스페이드)',
}

interface ImageNodeInspectorProps {
  node: StoryNode
  imageResources: ProjectResource[]
  onUpdate: (updates: Partial<StoryNode>) => void
}

export function ImageNodeInspector({ node, imageResources, onUpdate }: ImageNodeInspectorProps) {
  const t = useTranslation()

  const handleImageDataChange = (field: keyof ImageNodeData, value: unknown) => {
    const currentImageData = node.imageData || {
      resourcePath: '',
      layer: 'character',
      layerOrder: 0,
      alignment: 'center' as ImageAlignment,
    }
    onUpdate({
      imageData: { ...currentImageData, [field]: value }
    })
  }

  // 현재 선택된 효과들 (하위 호환: effect가 있으면 effects로 변환)
  const currentEffects: ImageEffectType[] = node.imageData?.effects ||
    (node.imageData?.effect && node.imageData.effect !== 'none' ? [node.imageData.effect as ImageEffectType] : [])

  // 현재 선택된 그룹 효과들
  const selectedGroupEffects: Record<string, ImageEffectType | null> = {}
  for (const groupName of Object.keys(IMAGE_EFFECT_GROUPS)) {
    selectedGroupEffects[groupName] = currentEffects.find(e => IMAGE_EFFECT_GROUPS[groupName].includes(e)) || null
  }

  // 조합 가능한 효과 토글
  const handleCombinableEffectToggle = (effect: ImageEffectType) => {
    const newEffects = currentEffects.includes(effect)
      ? currentEffects.filter(e => e !== effect)
      : [...currentEffects, effect]
    handleImageDataChange('effects', newEffects)
  }

  // 그룹 효과 선택 (라디오 버튼처럼 동작)
  const handleGroupEffectSelect = (groupName: string, effect: ImageEffectType | null) => {
    const groupEffects = IMAGE_EFFECT_GROUPS[groupName]
    // 기존 그룹 효과 제거
    let newEffects = currentEffects.filter(e => !groupEffects.includes(e))
    // 새 효과 추가 (null이 아니면)
    if (effect) {
      newEffects = [...newEffects, effect]
    }
    handleImageDataChange('effects', newEffects)
  }

  return (
    <>
      {/* 이미지 리소스 선택 */}
      <div className={styles.field}>
        <div className={styles.labelWithHelp}>
          <label className={styles.label}>Image Resource</label>
          <HelpTooltip content={t.help.imageResource} />
        </div>
        <select
          className={styles.select}
          value={node.imageData?.resourcePath || ''}
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
      {node.imageData?.resourcePath && (
        <div className={styles.field}>
          <label className={styles.label}>Preview</label>
          <div className={styles.imagePreview}>
            <img
              src={node.imageData.resourcePath}
              alt="preview"
              className={styles.previewImg}
            />
          </div>
        </div>
      )}

      {/* 레이어 */}
      <div className={styles.field}>
        <div className={styles.labelWithHelp}>
          <label className={styles.label}>Layer</label>
          <HelpTooltip content={t.help.layer} />
        </div>
        <select
          className={styles.select}
          value={node.imageData?.layer || 'character'}
          onChange={(e) => handleImageDataChange('layer', e.target.value)}
        >
          <option value="background">background</option>
          <option value="character">character</option>
        </select>
      </div>

      {/* 레이어 순서 */}
      <div className={styles.field}>
        <div className={styles.labelWithHelp}>
          <label className={styles.label}>Layer Order</label>
          <HelpTooltip content={t.help.layerOrder} />
        </div>
        <input
          type="number"
          className={styles.input}
          value={node.imageData?.layerOrder ?? 0}
          onChange={(e) => handleImageDataChange('layerOrder', parseInt(e.target.value) || 0)}
        />
      </div>

      {/* 정렬 */}
      <div className={styles.field}>
        <div className={styles.labelWithHelp}>
          <label className={styles.label}>Alignment</label>
          <HelpTooltip content={t.help.alignment} />
        </div>
        <select
          className={styles.select}
          value={node.imageData?.alignment || 'center'}
          onChange={(e) => handleImageDataChange('alignment', e.target.value as ImageAlignment)}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="custom">Custom (x, y)</option>
        </select>
      </div>

      {/* Custom 위치 */}
      {node.imageData?.alignment === 'custom' && (
        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label}>X</label>
            <input
              type="number"
              className={styles.input}
              value={node.imageData?.x ?? 0}
              onChange={(e) => handleImageDataChange('x', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Y</label>
            <input
              type="number"
              className={styles.input}
              value={node.imageData?.y ?? 0}
              onChange={(e) => handleImageDataChange('y', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      )}

      {/* 좌우 반전 */}
      <div className={styles.field}>
        <div className={styles.labelWithHelp}>
          <label className={styles.label}>Flip</label>
          <HelpTooltip content={t.help.flipHorizontal} />
        </div>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={node.imageData?.flipHorizontal || false}
            onChange={(e) => handleImageDataChange('flipHorizontal', e.target.checked)}
          />
          <span>Flip Horizontal</span>
        </label>
      </div>

      {/* 효과 - 조합 가능한 효과들 */}
      <div className={styles.field}>
        <div className={styles.labelWithHelp}>
          <label className={styles.label}>Effects (조합 가능)</label>
          <HelpTooltip content={t.help.effects} />
        </div>
        <div className={styles.effectGroup}>
          {COMBINABLE_EFFECTS.map(effect => (
            <label
              key={effect}
              className={`${styles.effectCheckbox} ${currentEffects.includes(effect) ? styles.active : ''}`}
            >
              <input
                type="checkbox"
                checked={currentEffects.includes(effect)}
                onChange={() => handleCombinableEffectToggle(effect)}
              />
              <span>{EFFECT_LABELS[effect]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 효과 - Slide 그룹 (1개만 선택 가능) */}
      <div className={styles.field}>
        <div className={styles.labelWithHelp}>
          <label className={styles.label}>Slide (1개만 선택)</label>
          <HelpTooltip content={t.help.slide} />
        </div>
        <div className={styles.effectRadioGroup}>
          <label
            className={`${styles.effectRadio} ${!selectedGroupEffects.slide ? styles.active : ''}`}
          >
            <input
              type="radio"
              name="slideEffect"
              checked={!selectedGroupEffects.slide}
              onChange={() => handleGroupEffectSelect('slide', null)}
            />
            <span>None</span>
          </label>
          {IMAGE_EFFECT_GROUPS.slide.map(effect => (
            <label
              key={effect}
              className={`${styles.effectRadio} ${selectedGroupEffects.slide === effect ? styles.active : ''}`}
            >
              <input
                type="radio"
                name="slideEffect"
                checked={selectedGroupEffects.slide === effect}
                onChange={() => handleGroupEffectSelect('slide', effect)}
              />
              <span>{EFFECT_LABELS[effect]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 효과 - Zoom 그룹 (1개만 선택 가능) */}
      <div className={styles.field}>
        <div className={styles.labelWithHelp}>
          <label className={styles.label}>Zoom (1개만 선택)</label>
          <HelpTooltip content={t.help.zoom} />
        </div>
        <div className={styles.effectRadioGroup}>
          <label
            className={`${styles.effectRadio} ${!selectedGroupEffects.zoom ? styles.active : ''}`}
          >
            <input
              type="radio"
              name="zoomEffect"
              checked={!selectedGroupEffects.zoom}
              onChange={() => handleGroupEffectSelect('zoom', null)}
            />
            <span>None</span>
          </label>
          {IMAGE_EFFECT_GROUPS.zoom.map(effect => (
            <label
              key={effect}
              className={`${styles.effectRadio} ${selectedGroupEffects.zoom === effect ? styles.active : ''}`}
            >
              <input
                type="radio"
                name="zoomEffect"
                checked={selectedGroupEffects.zoom === effect}
                onChange={() => handleGroupEffectSelect('zoom', effect)}
              />
              <span>{EFFECT_LABELS[effect]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 효과 지속 시간 */}
      {currentEffects.length > 0 && (
        <div className={styles.field}>
          <div className={styles.labelWithHelp}>
            <label className={styles.label}>Duration (ms)</label>
            <HelpTooltip content={t.help.duration} />
          </div>
          <input
            type="number"
            className={styles.input}
            value={node.imageData?.effectDuration ?? 500}
            onChange={(e) => handleImageDataChange('effectDuration', parseInt(e.target.value) || 500)}
            min={100}
            step={100}
          />
        </div>
      )}

      {/* 구분선 */}
      <div className={styles.divider} />

      {/* 퇴장 이펙트 (기존 이미지) */}
      <div className={styles.field}>
        <div className={styles.labelWithHelp}>
          <label className={styles.label}>Exit Effect (기존 이미지)</label>
          <HelpTooltip content={t.help.exitEffect} />
        </div>
        <select
          className={styles.select}
          value={node.imageData?.exitEffect || 'none'}
          onChange={(e) => handleImageDataChange('exitEffect', e.target.value as ImageExitEffectType)}
        >
          {(Object.keys(EXIT_EFFECT_LABELS) as ImageExitEffectType[]).map(effect => (
            <option key={effect} value={effect}>
              {EXIT_EFFECT_LABELS[effect]}
            </option>
          ))}
        </select>
      </div>

      {/* 퇴장 이펙트 지속 시간 및 타이밍 */}
      {node.imageData?.exitEffect && node.imageData.exitEffect !== 'none' && (
        <>
          <div className={styles.field}>
            <label className={styles.label}>Exit Duration (ms)</label>
            <input
              type="number"
              className={styles.input}
              value={node.imageData?.exitEffectDuration ?? 500}
              onChange={(e) => handleImageDataChange('exitEffectDuration', parseInt(e.target.value) || 500)}
              min={100}
              step={100}
            />
          </div>

          <div className={styles.field}>
            <div className={styles.labelWithHelp}>
              <label className={styles.label}>Transition Timing</label>
              <HelpTooltip content={t.help.transitionTiming} />
            </div>
            <select
              className={styles.select}
              value={node.imageData?.transitionTiming || 'sequential'}
              onChange={(e) => handleImageDataChange('transitionTiming', e.target.value as ImageTransitionTiming)}
            >
              {(Object.keys(TRANSITION_TIMING_LABELS) as ImageTransitionTiming[]).map(timing => (
                <option key={timing} value={timing}>
                  {TRANSITION_TIMING_LABELS[timing]}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </>
  )
}
