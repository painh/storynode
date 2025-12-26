import type { StoryNode, VariableOperation, VariableAction, ArrayAction, VariableTarget } from '../../../types/story'
import { useEditorStore } from '../../../stores/editorStore'
import { HelpTooltip } from './HelpTooltip'
import styles from '../Inspector.module.css'

interface VariableNodeInspectorProps {
  node: StoryNode
  onUpdate: (updates: Partial<StoryNode>) => void
}

const VARIABLE_TARGETS: { value: VariableTarget; label: string }[] = [
  { value: 'variable', label: '변수' },
  { value: 'flag', label: '플래그 (레거시)' },
]

const VARIABLE_ACTIONS: { value: VariableAction; label: string }[] = [
  { value: 'set', label: '설정 (=)' },
  { value: 'add', label: '더하기 (+)' },
  { value: 'subtract', label: '빼기 (-)' },
  { value: 'multiply', label: '곱하기 (×)' },
]

const ARRAY_ACTIONS: { value: ArrayAction; label: string }[] = [
  { value: 'push', label: '추가 (push)' },
  { value: 'pop', label: '마지막 제거 (pop)' },
  { value: 'removeAt', label: '인덱스 제거' },
  { value: 'setAt', label: '인덱스 설정' },
  { value: 'clear', label: '전체 삭제 (clear)' },
  { value: 'set', label: '배열 교체 (set)' },
]

const HELP_TEXTS = {
  operations: '변수 연산 목록입니다.\n위에서부터 순서대로 실행됩니다.',
  target: '변경할 대상을 선택합니다.\n- 변수: 사이드바에서 선언한 변수\n- 플래그: 레거시 커스텀 변수',
  action: '연산 종류를 선택합니다.\n- 설정: 값을 직접 설정\n- 더하기: 현재 값에 더함\n- 빼기: 현재 값에서 뺌\n- 곱하기: 현재 값에 곱함',
}

export function VariableNodeInspector({ node, onUpdate }: VariableNodeInspectorProps) {
  const operations = node.variableOperations || []
  const variables = useEditorStore(state => state.getVariables())

  const handleAddOperation = () => {
    // 선언된 변수가 있으면 variable 타입으로 시작, 없으면 flag로 시작
    const hasVariables = variables.length > 0
    const firstVar = variables[0]
    const isArray = firstVar?.type === 'array'

    const newOp: VariableOperation = hasVariables
      ? {
          target: 'variable',
          action: isArray ? 'push' : 'set',
          variableId: firstVar?.id,
          value: isArray ? '' : (Array.isArray(firstVar?.defaultValue) ? 0 : (firstVar?.defaultValue ?? 0)),
        }
      : {
          target: 'flag',
          action: 'set',
          key: '',
          value: '',
        }
    onUpdate({ variableOperations: [...operations, newOp] })
  }

  const handleRemoveOperation = (index: number) => {
    const newOps = [...operations]
    newOps.splice(index, 1)
    onUpdate({ variableOperations: newOps })
  }

  const handleOperationChange = (index: number, updates: Partial<VariableOperation>) => {
    const newOps = [...operations]
    newOps[index] = { ...newOps[index], ...updates }
    onUpdate({ variableOperations: newOps })
  }

  const handleTargetChange = (index: number, target: VariableTarget) => {
    let newOp: VariableOperation

    switch (target) {
      case 'variable':
        const firstVar = variables[0]
        const isArray = firstVar?.type === 'array'
        newOp = {
          target,
          action: isArray ? 'push' : 'set',
          variableId: firstVar?.id,
          value: isArray ? '' : (Array.isArray(firstVar?.defaultValue) ? 0 : (firstVar?.defaultValue ?? 0)),
        }
        break
      case 'flag':
      default:
        newOp = { target: 'flag', action: 'set', key: '', value: '' }
        break
    }

    handleOperationChange(index, newOp)
  }

  const renderOperationEditor = (index: number, op: VariableOperation) => {
    switch (op.target) {
      case 'variable': {
        const selectedVar = variables.find(v => v.id === op.variableId)
        const varType = selectedVar?.type || 'number'

        if (variables.length === 0) {
          return (
            <div className={styles.field}>
              <div className={styles.noChoices}>
                선언된 변수가 없습니다.<br />
                사이드바의 Variables 섹션에서 변수를 먼저 선언해주세요.
              </div>
            </div>
          )
        }

        // 배열 타입 처리
        if (varType === 'array') {
          const arrayItemType = selectedVar?.arrayItemType || 'string'
          const needsValue = ['push', 'setAt'].includes(op.action)
          const needsIndex = ['removeAt', 'setAt'].includes(op.action)

          return (
            <>
              <div className={styles.field}>
                <label className={styles.label}>변수</label>
                <select
                  className={styles.select}
                  value={op.variableId || ''}
                  onChange={(e) => {
                    const newVar = variables.find(v => v.id === e.target.value)
                    const isArr = newVar?.type === 'array'
                    handleOperationChange(index, {
                      variableId: e.target.value,
                      action: isArr ? 'push' : 'set',
                      value: isArr ? '' : (Array.isArray(newVar?.defaultValue) ? 0 : (newVar?.defaultValue ?? 0)),
                    })
                  }}
                >
                  {variables.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.type}{v.type === 'array' ? `<${v.arrayItemType}>` : ''})
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>배열 연산</label>
                <select
                  className={styles.select}
                  value={op.action}
                  onChange={(e) => handleOperationChange(index, { action: e.target.value as ArrayAction })}
                >
                  {ARRAY_ACTIONS.map(aa => (
                    <option key={aa.value} value={aa.value}>{aa.label}</option>
                  ))}
                </select>
              </div>
              {needsIndex && (
                <div className={styles.field}>
                  <label className={styles.label}>인덱스</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={op.index ?? 0}
                    min={0}
                    onChange={(e) => handleOperationChange(index, { index: Number(e.target.value) })}
                  />
                </div>
              )}
              {needsValue && (
                <div className={styles.field}>
                  <label className={styles.label}>값</label>
                  {arrayItemType === 'boolean' ? (
                    <select
                      className={styles.select}
                      value={String(op.value)}
                      onChange={(e) => handleOperationChange(index, { value: e.target.value === 'true' })}
                    >
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  ) : arrayItemType === 'number' ? (
                    <input
                      type="number"
                      className={styles.input}
                      value={typeof op.value === 'number' ? op.value : 0}
                      onChange={(e) => handleOperationChange(index, { value: Number(e.target.value) })}
                    />
                  ) : (
                    <input
                      type="text"
                      className={styles.input}
                      value={String(op.value)}
                      onChange={(e) => handleOperationChange(index, { value: e.target.value })}
                      placeholder="값 입력"
                    />
                  )}
                </div>
              )}
            </>
          )
        }

        return (
          <>
            <div className={styles.field}>
              <label className={styles.label}>변수</label>
              <select
                className={styles.select}
                value={op.variableId || ''}
                onChange={(e) => {
                  const newVar = variables.find(v => v.id === e.target.value)
                  const isArr = newVar?.type === 'array'
                  handleOperationChange(index, {
                    variableId: e.target.value,
                    action: isArr ? 'push' : 'set',
                    value: isArr ? '' : (Array.isArray(newVar?.defaultValue) ? 0 : (newVar?.defaultValue ?? 0)),
                  })
                }}
              >
                {variables.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.type}{v.type === 'array' ? `<${v.arrayItemType}>` : ''})
                  </option>
                ))}
              </select>
            </div>
            {varType !== 'boolean' && (
              <div className={styles.field}>
                <div className={styles.labelWithHelp}>
                  <label className={styles.label}>연산</label>
                  <HelpTooltip content={HELP_TEXTS.action} />
                </div>
                <select
                  className={styles.select}
                  value={op.action}
                  onChange={(e) => handleOperationChange(index, { action: e.target.value as VariableAction })}
                >
                  {VARIABLE_ACTIONS.map(va => (
                    <option key={va.value} value={va.value}>{va.label}</option>
                  ))}
                </select>
              </div>
            )}
            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label className={styles.label}>값</label>
                {varType !== 'boolean' && (
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={op.useVariableValue || false}
                      onChange={(e) => handleOperationChange(index, { 
                        useVariableValue: e.target.checked,
                        sourceVariableId: e.target.checked ? variables.find(v => v.id !== op.variableId)?.id : undefined
                      })}
                    />
                    변수에서
                  </label>
                )}
              </div>
              {op.useVariableValue ? (
                <select
                  className={styles.select}
                  value={op.sourceVariableId || ''}
                  onChange={(e) => handleOperationChange(index, { sourceVariableId: e.target.value })}
                >
                  <option value="">변수 선택...</option>
                  {variables.filter(v => v.type === varType || (v.type === 'number' && varType === 'number')).map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.type})
                    </option>
                  ))}
                </select>
              ) : varType === 'boolean' ? (
                <select
                  className={styles.select}
                  value={String(op.value)}
                  onChange={(e) => handleOperationChange(index, { value: e.target.value === 'true' })}
                >
                  <option value="true">true (참)</option>
                  <option value="false">false (거짓)</option>
                </select>
              ) : varType === 'number' ? (
                <input
                  type="number"
                  className={styles.input}
                  value={typeof op.value === 'number' ? op.value : 0}
                  onChange={(e) => handleOperationChange(index, { value: Number(e.target.value) })}
                />
              ) : (
                <input
                  type="text"
                  className={styles.input}
                  value={String(op.value)}
                  onChange={(e) => handleOperationChange(index, { value: e.target.value })}
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
                value={op.key || ''}
                onChange={(e) => handleOperationChange(index, { key: e.target.value })}
                placeholder="예: has_sword"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>값</label>
              <select
                className={styles.select}
                value={typeof op.value === 'boolean' ? String(op.value) : (typeof op.value === 'number' ? 'number' : 'string')}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === 'true') handleOperationChange(index, { value: true })
                  else if (val === 'false') handleOperationChange(index, { value: false })
                  else if (val === 'number') handleOperationChange(index, { value: 0 })
                  else handleOperationChange(index, { value: '' })
                }}
              >
                <option value="true">true (참)</option>
                <option value="false">false (거짓)</option>
                <option value="number">숫자</option>
                <option value="string">문자열</option>
              </select>
            </div>
            {typeof op.value === 'number' && (
              <div className={styles.field}>
                <label className={styles.label}>숫자 값</label>
                <input
                  type="number"
                  className={styles.input}
                  value={op.value}
                  onChange={(e) => handleOperationChange(index, { value: Number(e.target.value) })}
                />
              </div>
            )}
            {typeof op.value === 'string' && (
              <div className={styles.field}>
                <label className={styles.label}>문자열 값</label>
                <input
                  type="text"
                  className={styles.input}
                  value={op.value}
                  onChange={(e) => handleOperationChange(index, { value: e.target.value })}
                  placeholder="값 입력"
                />
              </div>
            )}
          </>
        )

      default:
        return null
    }
  }

  return (
    <>
      <div className={styles.field}>
        <div className={styles.labelRow}>
          <div className={styles.labelWithHelp}>
            <label className={styles.label}>변수 연산</label>
            <HelpTooltip content={HELP_TEXTS.operations} />
          </div>
          <button className={styles.addBtn} onClick={handleAddOperation}>
            + 연산 추가
          </button>
        </div>
        <div className={styles.choiceList}>
          {operations.length === 0 ? (
            <div className={styles.noChoices}>변수 연산이 없습니다.</div>
          ) : (
            operations.map((op, index) => (
              <div key={index} className={styles.choiceItem}>
                <div className={styles.choiceHeader}>
                  <span className={styles.choiceIndex}>연산 {index + 1}</span>
                  <button
                    className={styles.removeBtn}
                    onClick={() => handleRemoveOperation(index)}
                    title="연산 삭제"
                  >
                    ✕
                  </button>
                </div>

                {/* 대상 선택 */}
                <div className={styles.field}>
                  <div className={styles.labelWithHelp}>
                    <label className={styles.label}>대상</label>
                    <HelpTooltip content={HELP_TEXTS.target} />
                  </div>
                  <select
                    className={styles.select}
                    value={op.target}
                    onChange={(e) => handleTargetChange(index, e.target.value as VariableTarget)}
                  >
                    {VARIABLE_TARGETS.map(vt => (
                      <option key={vt.value} value={vt.value}>{vt.label}</option>
                    ))}
                  </select>
                </div>

                {/* 대상별 에디터 */}
                {renderOperationEditor(index, op)}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
