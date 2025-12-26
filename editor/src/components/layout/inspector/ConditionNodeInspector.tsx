import type { StoryNode, ConditionBranch, StoryCondition, CharacterId, FactionId, ComparisonOperator } from '../../../types/story'
import { useEditorStore } from '../../../stores/editorStore'
import { HelpTooltip } from './HelpTooltip'
import styles from '../Inspector.module.css'

interface ConditionNodeInspectorProps {
  node: StoryNode
  onUpdate: (updates: Partial<StoryNode>) => void
}

const CONDITION_TYPES: { value: StoryCondition['type']; label: string }[] = [
  { value: 'variable', label: '변수' },
  { value: 'flag', label: '플래그 (레거시)' },
  { value: 'gold', label: '골드 (레거시)' },
  { value: 'hp', label: 'HP (레거시)' },
  { value: 'has_relic', label: '유물 보유' },
  { value: 'character', label: '캐릭터' },
  { value: 'choice_made', label: '선택 여부' },
  { value: 'affection', label: '호감도' },
  { value: 'reputation', label: '평판' },
]

const COMPARISON_OPERATORS: { value: ComparisonOperator; label: string }[] = [
  { value: '==', label: '같음 (==)' },
  { value: '!=', label: '다름 (!=)' },
  { value: '>', label: '초과 (>)' },
  { value: '>=', label: '이상 (>=)' },
  { value: '<', label: '미만 (<)' },
  { value: '<=', label: '이하 (<=)' },
]

const CHARACTER_IDS: { value: CharacterId; label: string }[] = [
  { value: 'kairen', label: 'Kairen' },
  { value: 'zed', label: 'Zed' },
  { value: 'lyra', label: 'Lyra' },
  { value: 'elise', label: 'Elise' },
]

const FACTION_IDS: { value: FactionId; label: string }[] = [
  { value: 'kingdom', label: '왕국' },
  { value: 'elves', label: '엘프' },
  { value: 'dwarves', label: '드워프' },
  { value: 'free_cities', label: '자유도시' },
  { value: 'mage_tower', label: '마법사 탑' },
  { value: 'dark_lands', label: '암흑 대륙' },
]

const HELP_TEXTS = {
  branches: '조건 분기 목록입니다.\n위에서부터 순서대로 조건을 검사하여 첫 번째로 만족하는 분기로 진행합니다.',
  default: '어떤 조건도 만족하지 않을 때 진행할 기본 분기입니다.',
  conditionType: '조건의 종류를 선택합니다.',
  flag: '플래그 이름과 값을 비교합니다.',
  gold: '보유 골드 범위를 확인합니다.',
  hp: 'HP 범위를 확인합니다.',
  affection: '특정 캐릭터에 대한 호감도를 확인합니다.',
  reputation: '특정 세력에 대한 평판을 확인합니다.',
}

export function ConditionNodeInspector({ node, onUpdate }: ConditionNodeInspectorProps) {
  const branches = node.conditionBranches || []
  const variables = useEditorStore((state) => state.project.variables) || []

  const handleAddBranch = () => {
    const newBranch: ConditionBranch = {
      id: `branch_${Date.now()}`,
      condition: { type: 'flag', flagKey: '', flagValue: true },
    }
    onUpdate({ conditionBranches: [...branches, newBranch] })
  }

  const handleRemoveBranch = (index: number) => {
    const newBranches = [...branches]
    newBranches.splice(index, 1)
    onUpdate({ conditionBranches: newBranches })
  }

  const handleBranchConditionChange = (index: number, condition: StoryCondition) => {
    const newBranches = [...branches]
    newBranches[index] = { ...newBranches[index], condition }
    onUpdate({ conditionBranches: newBranches })
  }

  const handleConditionTypeChange = (index: number, type: StoryCondition['type']) => {
    let newCondition: StoryCondition
    switch (type) {
      case 'variable':
        newCondition = { type: 'variable', variableId: variables[0]?.id || '', operator: '==', value: 0 }
        break
      case 'flag':
        newCondition = { type: 'flag', flagKey: '', flagValue: true }
        break
      case 'gold':
      case 'hp':
        newCondition = { type, min: 0 }
        break
      case 'has_relic':
        newCondition = { type: 'has_relic', value: '' }
        break
      case 'character':
        newCondition = { type: 'character', characterId: 'kairen' }
        break
      case 'choice_made':
        newCondition = { type: 'choice_made', eventId: '', choiceId: '' }
        break
      case 'affection':
        newCondition = { type: 'affection', characterId: 'kairen', min: 0 }
        break
      case 'reputation':
        newCondition = { type: 'reputation', factionId: 'kingdom', min: 0 }
        break
      default:
        newCondition = { type: 'flag', flagKey: '', flagValue: true }
    }
    handleBranchConditionChange(index, newCondition)
  }

  const renderConditionEditor = (index: number, condition: StoryCondition) => {
    switch (condition.type) {
      case 'variable': {
        const selectedVar = variables.find(v => v.id === condition.variableId)
        const varType = selectedVar?.type || 'number'
        
        return (
          <>
            <div className={styles.field}>
              <label className={styles.label}>변수</label>
              <select
                className={styles.select}
                value={condition.variableId || ''}
                onChange={(e) => {
                  const newVar = variables.find(v => v.id === e.target.value)
                  let defaultValue: number | string | boolean = 0
                  if (newVar?.type === 'boolean') defaultValue = true
                  else if (newVar?.type === 'string') defaultValue = ''
                  handleBranchConditionChange(index, { ...condition, variableId: e.target.value, value: defaultValue })
                }}
              >
                {variables.length === 0 && <option value="">변수 없음</option>}
                {variables.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.type})</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>연산자</label>
              <select
                className={styles.select}
                value={condition.operator || '=='}
                onChange={(e) => handleBranchConditionChange(index, { ...condition, operator: e.target.value as ComparisonOperator })}
              >
                {COMPARISON_OPERATORS.map(op => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>값</label>
              {varType === 'boolean' ? (
                <select
                  className={styles.select}
                  value={String(condition.value)}
                  onChange={(e) => handleBranchConditionChange(index, { ...condition, value: e.target.value === 'true' })}
                >
                  <option value="true">true (참)</option>
                  <option value="false">false (거짓)</option>
                </select>
              ) : varType === 'number' ? (
                <input
                  type="number"
                  className={styles.input}
                  value={typeof condition.value === 'number' ? condition.value : 0}
                  onChange={(e) => handleBranchConditionChange(index, { ...condition, value: Number(e.target.value) })}
                />
              ) : (
                <input
                  type="text"
                  className={styles.input}
                  value={String(condition.value || '')}
                  onChange={(e) => handleBranchConditionChange(index, { ...condition, value: e.target.value })}
                  placeholder="값 입력"
                />
              )}
            </div>
          </>
        )
      }

      case 'flag':
        return (
          <>
            <div className={styles.field}>
              <label className={styles.label}>플래그 키</label>
              <input
                type="text"
                className={styles.input}
                value={condition.flagKey || ''}
                onChange={(e) => handleBranchConditionChange(index, { ...condition, flagKey: e.target.value })}
                placeholder="예: met_merchant"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>플래그 값</label>
              <select
                className={styles.select}
                value={String(condition.flagValue)}
                onChange={(e) => {
                  const val = e.target.value
                  let flagValue: boolean | number | string = val
                  if (val === 'true') flagValue = true
                  else if (val === 'false') flagValue = false
                  else if (!isNaN(Number(val))) flagValue = Number(val)
                  handleBranchConditionChange(index, { ...condition, flagValue })
                }}
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            </div>
          </>
        )

      case 'gold':
      case 'hp':
        return (
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>최소값</label>
              <input
                type="number"
                className={styles.input}
                value={condition.min ?? ''}
                onChange={(e) => handleBranchConditionChange(index, { ...condition, min: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="최소"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>최대값</label>
              <input
                type="number"
                className={styles.input}
                value={condition.max ?? ''}
                onChange={(e) => handleBranchConditionChange(index, { ...condition, max: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="최대 (선택)"
              />
            </div>
          </div>
        )

      case 'has_relic':
        return (
          <div className={styles.field}>
            <label className={styles.label}>유물 ID</label>
            <input
              type="text"
              className={styles.input}
              value={String(condition.value || '')}
              onChange={(e) => handleBranchConditionChange(index, { ...condition, value: e.target.value })}
              placeholder="예: magic_sword"
            />
          </div>
        )

      case 'character':
        return (
          <div className={styles.field}>
            <label className={styles.label}>캐릭터</label>
            <select
              className={styles.select}
              value={condition.characterId || 'kairen'}
              onChange={(e) => handleBranchConditionChange(index, { ...condition, characterId: e.target.value as CharacterId })}
            >
              {CHARACTER_IDS.map(char => (
                <option key={char.value} value={char.value}>{char.label}</option>
              ))}
            </select>
          </div>
        )

      case 'choice_made':
        return (
          <>
            <div className={styles.field}>
              <label className={styles.label}>이벤트 ID</label>
              <input
                type="text"
                className={styles.input}
                value={condition.eventId || ''}
                onChange={(e) => handleBranchConditionChange(index, { ...condition, eventId: e.target.value })}
                placeholder="예: merchant_event"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>선택지 ID</label>
              <input
                type="text"
                className={styles.input}
                value={condition.choiceId || ''}
                onChange={(e) => handleBranchConditionChange(index, { ...condition, choiceId: e.target.value })}
                placeholder="예: choice_buy"
              />
            </div>
          </>
        )

      case 'affection':
        return (
          <>
            <div className={styles.field}>
              <label className={styles.label}>캐릭터</label>
              <select
                className={styles.select}
                value={condition.characterId || 'kairen'}
                onChange={(e) => handleBranchConditionChange(index, { ...condition, characterId: e.target.value as CharacterId })}
              >
                {CHARACTER_IDS.map(char => (
                  <option key={char.value} value={char.value}>{char.label}</option>
                ))}
              </select>
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>최소 호감도</label>
                <input
                  type="number"
                  className={styles.input}
                  value={condition.min ?? ''}
                  onChange={(e) => handleBranchConditionChange(index, { ...condition, min: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="최소"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>최대 호감도</label>
                <input
                  type="number"
                  className={styles.input}
                  value={condition.max ?? ''}
                  onChange={(e) => handleBranchConditionChange(index, { ...condition, max: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="최대 (선택)"
                />
              </div>
            </div>
          </>
        )

      case 'reputation':
        return (
          <>
            <div className={styles.field}>
              <label className={styles.label}>세력</label>
              <select
                className={styles.select}
                value={condition.factionId || 'kingdom'}
                onChange={(e) => handleBranchConditionChange(index, { ...condition, factionId: e.target.value as FactionId })}
              >
                {FACTION_IDS.map(faction => (
                  <option key={faction.value} value={faction.value}>{faction.label}</option>
                ))}
              </select>
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>최소 평판</label>
                <input
                  type="number"
                  className={styles.input}
                  value={condition.min ?? ''}
                  onChange={(e) => handleBranchConditionChange(index, { ...condition, min: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="최소"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>최대 평판</label>
                <input
                  type="number"
                  className={styles.input}
                  value={condition.max ?? ''}
                  onChange={(e) => handleBranchConditionChange(index, { ...condition, max: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="최대 (선택)"
                />
              </div>
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <>
      {/* 조건 분기 목록 */}
      <div className={styles.field}>
        <div className={styles.labelRow}>
          <div className={styles.labelWithHelp}>
            <label className={styles.label}>조건 분기</label>
            <HelpTooltip content={HELP_TEXTS.branches} />
          </div>
          <button className={styles.addBtn} onClick={handleAddBranch}>
            + 분기 추가
          </button>
        </div>
        <div className={styles.choiceList}>
          {branches.length === 0 ? (
            <div className={styles.noChoices}>조건 분기가 없습니다.</div>
          ) : (
            branches.map((branch, index) => (
              <div key={branch.id} className={styles.choiceItem}>
                <div className={styles.choiceHeader}>
                  <span className={styles.choiceIndex}>분기 {index + 1}</span>
                  <button
                    className={styles.removeBtn}
                    onClick={() => handleRemoveBranch(index)}
                    title="분기 삭제"
                  >
                    ✕
                  </button>
                </div>

                {/* 조건 타입 선택 */}
                <div className={styles.field}>
                  <div className={styles.labelWithHelp}>
                    <label className={styles.label}>조건 타입</label>
                    <HelpTooltip content={HELP_TEXTS.conditionType} />
                  </div>
                  <select
                    className={styles.select}
                    value={branch.condition.type}
                    onChange={(e) => handleConditionTypeChange(index, e.target.value as StoryCondition['type'])}
                  >
                    {CONDITION_TYPES.map(ct => (
                      <option key={ct.value} value={ct.value}>{ct.label}</option>
                    ))}
                  </select>
                </div>

                {/* 조건별 에디터 */}
                {renderConditionEditor(index, branch.condition)}
              </div>
            ))
          )}
        </div>
      </div>

      <div className={styles.divider} />

      {/* 기본 분기 안내 */}
      <div className={styles.field}>
        <div className={styles.labelWithHelp}>
          <label className={styles.label}>기본 분기</label>
          <HelpTooltip content={HELP_TEXTS.default} />
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '8px 0' }}>
          기본 분기는 노드 캔버스에서 연결하세요.
          <br />
          어떤 조건도 만족하지 않으면 기본 분기로 진행합니다.
        </div>
      </div>
    </>
  )
}
