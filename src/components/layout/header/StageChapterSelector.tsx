import type { StoryStage, StoryChapter } from '../../../types/story'
import styles from '../Header.module.css'

interface StageChapterSelectorProps {
  stages: StoryStage[]
  currentStageId: string | null
  currentChapterId: string | null
  currentStageChapters: StoryChapter[] | undefined
  onStageChange: (stageId: string) => void
  onChapterChange: (chapterId: string) => void
}

export function StageChapterSelector({
  stages,
  currentStageId,
  currentChapterId,
  currentStageChapters,
  onStageChange,
  onChapterChange,
}: StageChapterSelectorProps) {
  return (
    <>
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
    </>
  )
}
