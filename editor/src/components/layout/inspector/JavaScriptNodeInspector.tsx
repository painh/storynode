import { useCallback, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import type { StoryNode, JavaScriptFunction, JavaScriptFunctionArg, JavaScriptArgType } from '../../../types/story'
import { HelpTooltip } from './HelpTooltip'
import { CodeEditorModal } from '../../common/CodeEditorModal'
import styles from '../Inspector.module.css'

interface JavaScriptNodeInspectorProps {
  node: StoryNode
  onUpdate: (updates: Partial<StoryNode>) => void
}

const ARG_TYPES: { value: JavaScriptArgType; label: string }[] = [
  { value: 'any', label: 'any' },
  { value: 'string', label: 'string' },
  { value: 'number', label: 'number' },
  { value: 'boolean', label: 'boolean' },
]

const HELP_TEXT = `JavaScript 함수를 작성합니다.

인자(Arguments):
• 인자를 추가하면 노드에 데이터 포트가 생성됩니다
• 다른 노드에서 값을 연결할 수 있습니다
• 연결이 없으면 기본값이 사용됩니다

사용 가능한 변수:
• variables - 프로젝트 변수 객체
  예: variables.Gold, variables.HP
• chapters - 챕터 로컬 변수
  예: chapters.PROLOGUE.playerLevel
• Game - 게임 상태 정보
  예: Game.lastChoiceIndex

예시:
// 인자 사용 (인자로 damage, multiplier 추가 시)
const result = damage * multiplier;
variables.HP -= result;`

export function JavaScriptNodeInspector({ node, onUpdate }: JavaScriptNodeInspectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // javascriptFunction이 있으면 새 방식, 없으면 레거시
  const fn = node.javascriptFunction || { name: '', arguments: [], body: node.javascriptCode || '' }
  const isLegacyMode = !node.javascriptFunction && !!node.javascriptCode

  // 함수 업데이트 헬퍼
  const updateFunction = useCallback((updates: Partial<JavaScriptFunction>) => {
    onUpdate({
      javascriptFunction: { ...fn, ...updates }
    })
  }, [fn, onUpdate])

  // 레거시 모드에서 새 모드로 마이그레이션
  const handleMigrate = useCallback(() => {
    onUpdate({
      javascriptFunction: {
        name: '',
        arguments: [],
        body: node.javascriptCode || ''
      }
    })
  }, [node.javascriptCode, onUpdate])

  // 인자 추가
  const handleAddArg = useCallback(() => {
    const newArg: JavaScriptFunctionArg = {
      id: `arg_${Date.now()}`,
      name: `arg${fn.arguments.length + 1}`,
      type: 'any',
    }
    updateFunction({ arguments: [...fn.arguments, newArg] })
  }, [fn.arguments, updateFunction])

  // 인자 삭제
  const handleRemoveArg = useCallback((index: number) => {
    const newArgs = [...fn.arguments]
    newArgs.splice(index, 1)
    updateFunction({ arguments: newArgs })
  }, [fn.arguments, updateFunction])

  // 인자 수정
  const handleArgChange = useCallback((index: number, updates: Partial<JavaScriptFunctionArg>) => {
    const newArgs = [...fn.arguments]
    newArgs[index] = { ...newArgs[index], ...updates }
    updateFunction({ arguments: newArgs })
  }, [fn.arguments, updateFunction])

  // 본문 변경
  const handleBodyChange = useCallback((value: string) => {
    if (isLegacyMode) {
      // 레거시 모드에서는 javascriptCode만 업데이트
      onUpdate({ javascriptCode: value })
    } else {
      updateFunction({ body: value })
    }
  }, [isLegacyMode, onUpdate, updateFunction])

  // 레거시 모드 UI
  if (isLegacyMode) {
    return (
      <>
        <div className={styles.field}>
          <div className={styles.templateInfo}>
            <div className={styles.templateInfoHeader}>
              <span className={styles.templateInfoIcon}>📜</span>
              <span className={styles.templateInfoName}>레거시 코드 모드</span>
            </div>
            <div className={styles.templateInfoActions}>
              <button className={styles.templateSyncBtn} onClick={handleMigrate}>
                함수 모드로 변환
              </button>
            </div>
          </div>
        </div>

        <div className={styles.field}>
          <div className={styles.labelWithHelp}>
            <label className={styles.label}>JavaScript Code</label>
            <button
              className={styles.expandBtn}
              onClick={() => setIsModalOpen(true)}
              title="전체 화면으로 열기"
            >
              ⛶
            </button>
            <HelpTooltip content={HELP_TEXT} />
          </div>
          <div className={styles.codeEditorWrapper}>
            <CodeMirror
              value={node.javascriptCode || ''}
              height="250px"
              theme={oneDark}
              extensions={[javascript()]}
              onChange={handleBodyChange}
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                highlightActiveLine: true,
                indentOnInput: true,
              }}
            />
          </div>
        </div>

        <CodeEditorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          value={node.javascriptCode || ''}
          onChange={handleBodyChange}
          title="JavaScript Code"
        />
      </>
    )
  }

  // 새 함수 모드 UI
  return (
    <>
      {/* 함수 이름 */}
      <div className={styles.field}>
        <label className={styles.label}>Function Name (optional)</label>
        <input
          type="text"
          className={styles.input}
          value={fn.name}
          onChange={(e) => updateFunction({ name: e.target.value })}
          placeholder="myFunction"
        />
      </div>

      {/* 인자 목록 */}
      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label className={styles.label}>Arguments</label>
          <button className={styles.addBtn} onClick={handleAddArg}>+ Add</button>
        </div>
        <div className={styles.choiceList}>
          {fn.arguments.map((arg, index) => (
            <div key={arg.id} className={styles.choiceItem}>
              <div className={styles.choiceHeader}>
                <span className={styles.choiceIndex}>{index + 1}</span>
                <button
                  className={styles.removeBtn}
                  onClick={() => handleRemoveArg(index)}
                >
                  ✕
                </button>
              </div>

              {/* 이름 & 타입 */}
              <div className={styles.conditionRow}>
                <input
                  type="text"
                  className={styles.conditionSelect}
                  value={arg.name}
                  onChange={(e) => handleArgChange(index, { name: e.target.value })}
                  placeholder="Argument name"
                  style={{ flex: 2 }}
                />
                <select
                  className={styles.operatorSelect}
                  value={arg.type}
                  onChange={(e) => handleArgChange(index, { type: e.target.value as JavaScriptArgType })}
                  style={{ width: 80 }}
                >
                  {ARG_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* 기본값 */}
              <div className={styles.disabledTextRow}>
                <label className={styles.smallLabel}>Default Value</label>
                {arg.type === 'boolean' ? (
                  <select
                    className={styles.select}
                    value={String(arg.defaultValue ?? '')}
                    onChange={(e) => handleArgChange(index, {
                      defaultValue: e.target.value === '' ? undefined : e.target.value === 'true'
                    })}
                  >
                    <option value="">-</option>
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                ) : (
                  <input
                    type={arg.type === 'number' ? 'number' : 'text'}
                    className={styles.input}
                    value={arg.defaultValue !== undefined ? String(arg.defaultValue) : ''}
                    onChange={(e) => handleArgChange(index, {
                      defaultValue: arg.type === 'number'
                        ? (e.target.value === '' ? undefined : Number(e.target.value))
                        : (e.target.value === '' ? undefined : e.target.value)
                    })}
                    placeholder="(no default)"
                  />
                )}
              </div>
            </div>
          ))}
          {fn.arguments.length === 0 && (
            <div className={styles.noChoices}>No arguments yet</div>
          )}
        </div>
      </div>

      {/* 함수 본문 */}
      <div className={styles.field}>
        <div className={styles.labelWithHelp}>
          <label className={styles.label}>Function Body</label>
          <button
            className={styles.expandBtn}
            onClick={() => setIsModalOpen(true)}
            title="전체 화면으로 열기"
          >
            ⛶
          </button>
          <HelpTooltip content={HELP_TEXT} />
        </div>
        <div className={styles.codeEditorWrapper}>
          <CodeMirror
            value={fn.body}
            height="200px"
            theme={oneDark}
            extensions={[javascript()]}
            onChange={handleBodyChange}
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              bracketMatching: true,
              closeBrackets: true,
              autocompletion: true,
              highlightActiveLine: true,
              indentOnInput: true,
            }}
          />
        </div>
        {fn.arguments.length > 0 && (
          <div className={styles.fieldHint}>
            Available args: {fn.arguments.map(a => a.name).join(', ')}
          </div>
        )}
      </div>

      <CodeEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        value={fn.body}
        onChange={handleBodyChange}
        title="Function Body"
      />
    </>
  )
}
