import type { StoryStage, StoryChapter } from '../../../types/story'
import styles from './StageChapterSelector.module.css'

interface StageChapterSelectorProps {
  stages: StoryStage[]
  currentStageId: string | null
  currentChapterId: string | null
  currentStageChapters: StoryChapter[] | undefined
  onStageChange: (stageId: string) => void
  onChapterChange: (chapterId: string) => void
  onStageAdd: () => void
  onStageDelete: (stageId: string) => void
  onChapterAdd: () => void
  onChapterDelete: (chapterId: string) => void
}

export function StageChapterSelector({
  stages,
  currentStageId,
  currentChapterId,
  currentStageChapters,
  onStageChange,
  onChapterChange,
  onStageAdd,
  onStageDelete,
  onChapterAdd,
  onChapterDelete,
}: StageChapterSelectorProps) {
  const canDeleteStage = stages.length > 1
  const canDeleteChapter = (currentStageChapters?.length ?? 0) > 1

  const handleStageDelete = () => {
    if (!currentStageId || !canDeleteStage) return
    if (confirm('이 스테이지를 삭제하시겠습니까?')) {
      onStageDelete(currentStageId)
    }
  }

  const handleChapterDelete = () => {
    if (!currentChapterId || !canDeleteChapter) return
    if (confirm('이 챕터를 삭제하시겠습니까?')) {
      onChapterDelete(currentChapterId)
    }
  }

  return (
    <div className={styles.container}>
      {/* Stage 선택 */}
      <div className={styles.selectorGroup}>
        <select
          className={styles.select}
          value={currentStageId || ''}
          onChange={(e) => onStageChange(e.target.value)}
        >
          {stages.map((stage) => (
            <option key={stage.id} value={stage.id}>
              {stage.title}
            </option>
          ))}
        </select>
        <button
          className={styles.addButton}
          onClick={onStageAdd}
          title="새 스테이지 추가"
        >
          +
        </button>
        <button
          className={`${styles.deleteButton} ${!canDeleteStage ? styles.disabled : ''}`}
          onClick={handleStageDelete}
          disabled={!canDeleteStage}
          title={canDeleteStage ? '스테이지 삭제' : '최소 1개의 스테이지가 필요합니다'}
        >
          ×
        </button>
      </div>

      {/* Chapter 선택 */}
      <div className={styles.selectorGroup}>
        <select
          className={styles.select}
          value={currentChapterId || ''}
          onChange={(e) => onChapterChange(e.target.value)}
        >
          {currentStageChapters?.map((chapter) => (
            <option key={chapter.id} value={chapter.id}>
              {chapter.title}
            </option>
          ))}
        </select>
        <button
          className={styles.addButton}
          onClick={onChapterAdd}
          title="새 챕터 추가"
        >
          +
        </button>
        <button
          className={`${styles.deleteButton} ${!canDeleteChapter ? styles.disabled : ''}`}
          onClick={handleChapterDelete}
          disabled={!canDeleteChapter}
          title={canDeleteChapter ? '챕터 삭제' : '최소 1개의 챕터가 필요합니다'}
        >
          ×
        </button>
      </div>
    </div>
  )
}
