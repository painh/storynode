import { useCallback, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import type { StoryNode } from '../../../types/story'
import { HelpTooltip } from './HelpTooltip'
import { CodeEditorModal } from '../../common/CodeEditorModal'
import styles from '../Inspector.module.css'

interface JavaScriptNodeInspectorProps {
  node: StoryNode
  onUpdate: (updates: Partial<StoryNode>) => void
}

const HELP_TEXT = `JavaScript 코드를 작성합니다.

사용 가능한 변수:
• variables - 프로젝트 변수 객체
  예: variables.Gold, variables.HP
  예: variables['Player Name']

• flags - 플래그 객체 (레거시)
  예: flags.met_merchant

사용 가능한 함수:
• console.log() - 디버그 출력

예시:
// 복잡한 계산
variables.Gold = (variables.HP * 2) + 100;

// 조건부 처리
if (variables.Gold > 50) {
  variables.Gold -= 50;
  flags.bought_item = true;
}`

export function JavaScriptNodeInspector({ node, onUpdate }: JavaScriptNodeInspectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleChange = useCallback((value: string) => {
    onUpdate({ javascriptCode: value })
  }, [onUpdate])

  return (
    <>
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
            onChange={handleChange}
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
        onChange={handleChange}
        title="JavaScript Code"
      />
    </>
  )
}
