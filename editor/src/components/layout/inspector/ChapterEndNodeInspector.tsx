import type { StoryNode, ChapterEndAction, ChapterEndData } from '../../../types/story'
import { useEditorStore } from '../../../stores/editorStore'
import { useTranslation } from '../../../i18n/useTranslation'
import { HelpTooltip } from './HelpTooltip'
import styles from '../Inspector.module.css'

interface ChapterEndNodeInspectorProps {
  node: StoryNode
  onUpdate: (updates: Partial<StoryNode>) => void
}

export function ChapterEndNodeInspector({ node, onUpdate }: ChapterEndNodeInspectorProps) {
  const { project, currentStageId } = useEditorStore()
  const { chapterEnd, help } = useTranslation()

  // 액션 옵션 (로컬라이징 적용)
  const ACTION_OPTIONS: { value: ChapterEndAction; label: string; description: string }[] = [
    { value: 'next', label: chapterEnd.actionNext, description: chapterEnd.actionNextDesc },
    { value: 'goto', label: chapterEnd.actionGoto, description: chapterEnd.actionGotoDesc },
    { value: 'select', label: chapterEnd.actionSelect, description: chapterEnd.actionSelectDesc },
    { value: 'end', label: chapterEnd.actionEnd, description: chapterEnd.actionEndDesc },
  ]

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
        <div className={styles.labelWithHelp}>
          <label className={styles.label}>{chapterEnd.actionLabel}</label>
          <HelpTooltip content={help.chapterEndAction} />
        </div>
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
          <label className={styles.label}>{chapterEnd.nextChapterLabel}</label>
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
              {chapterEnd.differentStageWarning}
            </div>
          )}
        </div>
      )}

      {/* next 액션일 때 다음 챕터 미리보기 */}
      {chapterEndData.action === 'next' && currentStage && (
        <div className={styles.field}>
          <label className={styles.label}>{chapterEnd.nextChapterAuto}</label>
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
              
              return chapterEnd.lastChapter
            })()}
          </div>
        </div>
      )}
    </>
  )
}
