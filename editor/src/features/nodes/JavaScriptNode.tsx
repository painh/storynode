import { memo, useMemo } from 'react'
import type { NodeProps, Node } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import type { EditorNodeData } from '../../types/editor'
import type { DataHandleDefinition, DataHandleValueType } from '../../config/dataHandles'
import type { JavaScriptArgType } from '../../types/story'
import { useTranslation } from '../../i18n'
import styles from './JavaScriptNode.module.css'

// JavaScriptArgType을 DataHandleValueType으로 매핑
function mapArgTypeToHandleType(argType: JavaScriptArgType): DataHandleValueType {
  switch (argType) {
    case 'string': return 'string'
    case 'number': return 'number'
    case 'boolean': return 'boolean'
    case 'any':
    default: return 'object'
  }
}

export const JavaScriptNode = memo(function JavaScriptNode({
  id,
  data,
  selected,
}: NodeProps<Node<EditorNodeData>>) {
  const { storyNode } = data
  const t = useTranslation()

  // 동적 데이터 핸들 생성 (인자 기반)
  const customDataHandles: DataHandleDefinition[] = useMemo(() => {
    const fn = storyNode?.javascriptFunction
    if (!fn?.arguments?.length) return []

    return fn.arguments.map(arg => ({
      id: `arg-${arg.id}`,
      label: arg.name,
      type: mapArgTypeToHandleType(arg.type),
      path: `javascriptFunction.argumentValues.${arg.id}`,
      direction: 'input' as const,
    }))
  }, [storyNode?.javascriptFunction])

  if (!storyNode) return null

  const fn = storyNode.javascriptFunction
  const isLegacyMode = !fn && !!storyNode.javascriptCode

  // 코드 미리보기
  const code = fn?.body || storyNode.javascriptCode || ''
  const preview = code.trim().split('\n').slice(0, 3).join('\n')
  const hasMore = code.trim().split('\n').length > 3

  // 함수 시그니처
  const signature = fn
    ? `${fn.name || 'fn'}(${fn.arguments.map(a => a.name).join(', ')})`
    : null

  return (
    <BaseNode
      nodeId={id}
      nodeType="javascript"
      selected={selected}
      hasInputExec={true}
      hasOutputExec={true}
      isPlaying={data.isPlaying}
      customDataHandles={customDataHandles.length > 0 ? customDataHandles : undefined}
    >
      <div className={styles.content}>
        {/* 함수 시그니처 */}
        {signature && (
          <div className={styles.signature}>
            {signature}
          </div>
        )}

        {/* 레거시 모드 표시 */}
        {isLegacyMode && (
          <div className={styles.legacyBadge}>Legacy</div>
        )}

        {/* 코드 미리보기 */}
        {code.trim() ? (
          <div className={styles.codePreview}>
            <pre className={styles.code}>{preview}</pre>
            {hasMore && <div className={styles.more}>...</div>}
          </div>
        ) : (
          <div className={styles.empty}>{t.common.empty}</div>
        )}
      </div>
    </BaseNode>
  )
})
