import type { StoryNode, ChapterEndAction, ChapterEndData } from '../../../types/story'
import { useEditorStore } from '../../../stores/editorStore'
import styles from '../Inspector.module.css'

interface ChapterEndNodeInspectorProps {
  node: StoryNode
  onUpdate: (updates: Partial<StoryNode>) => void
}

const ACTION_OPTIONS: { value: ChapterEndAction; label: string; description: string }[] = [
  { value: 'next', label: '다음 챕터로', description: '순서상 다음 챕터로 자동 진행' },
  { value: 'goto', label: '특정 챕터로 이동', description: '지정한 챕터로 이동' },
  { value: 'select', label: '챕터 선택 화면', description: '플레이어가 챕터를 선택' },
  { value: 'end', label: '게임 종료', description: '게임을 종료하고 엔딩 표시' },
]

export function ChapterEndNodeInspector({ node, onUpdate }: ChapterEndNodeInspectorProps) {
  const { project, currentStageId } = useEditorStore()

  // 현재 데이터 또는 기본값
  const chapterEndData: ChapterEndData = node.chapterEndData || { action: 'next' }

  // 현재 스테이지와 모든 챕터 목록
  const currentStage = project.stages.find(s => s.id === currentStageId)
  const allChapters = project.stages.flatMap(stage => 
    stage.chapters.map(chapter => ({
      stageId: stage.id,
      stageTitle: stage.title,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      isCurrentStage: stage.id === currentStageId,
    }))
  )

  const handleActionChange = (action: ChapterEndAction) => {
    const newData: ChapterEndData = { action }
    
    // goto일 때 기본 챕터 설정
    if (action === 'goto' && allChapters.length > 0) {
      newData.nextChapterId = allChapters[0].chapterId
      newData.nextStageId = allChapters[0].stageId
    }
    
    onUpdate({ chapterEndData: newData })
  }

  const handleChapterSelect = (chapterId: string) => {
    const selected = allChapters.find(c => c.chapterId === chapterId)
    if (selected) {
      onUpdate({
        chapterEndData: {
          ...chapterEndData,
          nextChapterId: chapterId,
          nextStageId: selected.stageId !== currentStageId ? selected.stageId : undefined,
        }
      })
    }
  }

  return (
    <>
      <div className={styles.divider} />
      
      <div className={styles.field}>
        <label className={styles.label}>챕터 종료 후 액션</label>
        <select
          className={styles.select}
          value={chapterEndData.action}
          onChange={(e) => handleActionChange(e.target.value as ChapterEndAction)}
        >
          {ACTION_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className={styles.fieldHint}>
          {ACTION_OPTIONS.find(o => o.value === chapterEndData.action)?.description}
        </div>
      </div>

      {/* goto 액션일 때 챕터 선택 */}
      {chapterEndData.action === 'goto' && (
        <div className={styles.field}>
          <label className={styles.label}>이동할 챕터</label>
          <select
            className={styles.select}
            value={chapterEndData.nextChapterId || ''}
            onChange={(e) => handleChapterSelect(e.target.value)}
          >
            {allChapters.map(chapter => (
              <option key={chapter.chapterId} value={chapter.chapterId}>
                {chapter.isCurrentStage 
                  ? chapter.chapterTitle 
                  : `[${chapter.stageTitle}] ${chapter.chapterTitle}`}
              </option>
            ))}
          </select>
          {chapterEndData.nextStageId && chapterEndData.nextStageId !== currentStageId && (
            <div className={styles.fieldWarning}>
              다른 스테이지의 챕터로 이동합니다
            </div>
          )}
        </div>
      )}

      {/* next 액션일 때 다음 챕터 미리보기 */}
      {chapterEndData.action === 'next' && currentStage && (
        <div className={styles.field}>
          <label className={styles.label}>다음 챕터 (자동)</label>
          <div className={styles.fieldPreview}>
            {(() => {
              const currentChapterIndex = currentStage.chapters.findIndex(
                c => c.nodes.some(n => n.id === node.id)
              )
              const nextChapter = currentStage.chapters[currentChapterIndex + 1]
              
              if (nextChapter) {
                return `→ ${nextChapter.title}`
              }
              
              // 다음 스테이지의 첫 챕터 확인
              const currentStageIndex = project.stages.findIndex(s => s.id === currentStageId)
              const nextStage = project.stages[currentStageIndex + 1]
              
              if (nextStage && nextStage.chapters.length > 0) {
                return `→ [${nextStage.title}] ${nextStage.chapters[0].title}`
              }
              
              return '(마지막 챕터 - 게임 종료)'
            })()}
          </div>
        </div>
      )}
    </>
  )
}
