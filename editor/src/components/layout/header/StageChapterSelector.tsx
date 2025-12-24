import { useState, useRef, useEffect } from 'react'
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
  onStageRename: (stageId: string, newTitle: string) => void
  onChapterAdd: () => void
  onChapterDelete: (chapterId: string) => void
  onChapterRename: (chapterId: string, newTitle: string) => void
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
  onStageRename,
  onChapterAdd,
  onChapterDelete,
  onChapterRename,
}: StageChapterSelectorProps) {
  const [editingStage, setEditingStage] = useState(false)
  const [editingChapter, setEditingChapter] = useState(false)
  const [stageTitle, setStageTitle] = useState('')
  const [chapterTitle, setChapterTitle] = useState('')
  const stageInputRef = useRef<HTMLInputElement>(null)
  const chapterInputRef = useRef<HTMLInputElement>(null)

  const canDeleteStage = stages.length > 1
  const canDeleteChapter = (currentStageChapters?.length ?? 0) > 1

  const currentStage = stages.find(s => s.id === currentStageId)
  const currentChapter = currentStageChapters?.find(c => c.id === currentChapterId)

  // 스테이지 편집 시작
  const startEditingStage = () => {
    if (currentStage) {
      setStageTitle(currentStage.title)
      setEditingStage(true)
    }
  }

  // 챕터 편집 시작
  const startEditingChapter = () => {
    if (currentChapter) {
      setChapterTitle(currentChapter.title)
      setEditingChapter(true)
    }
  }

  // 스테이지 편집 완료
  const finishEditingStage = () => {
    if (currentStageId && stageTitle.trim()) {
      onStageRename(currentStageId, stageTitle.trim())
    }
    setEditingStage(false)
  }

  // 챕터 편집 완료
  const finishEditingChapter = () => {
    if (currentChapterId && chapterTitle.trim()) {
      onChapterRename(currentChapterId, chapterTitle.trim())
    }
    setEditingChapter(false)
  }

  // 편집 모드에서 input에 포커스
  useEffect(() => {
    if (editingStage && stageInputRef.current) {
      stageInputRef.current.focus()
      stageInputRef.current.select()
    }
  }, [editingStage])

  useEffect(() => {
    if (editingChapter && chapterInputRef.current) {
      chapterInputRef.current.focus()
      chapterInputRef.current.select()
    }
  }, [editingChapter])

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

  const handleStageKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      finishEditingStage()
    } else if (e.key === 'Escape') {
      setEditingStage(false)
    }
  }

  const handleChapterKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      finishEditingChapter()
    } else if (e.key === 'Escape') {
      setEditingChapter(false)
    }
  }

  return (
    <div className={styles.container}>
      {/* Stage 선택 */}
      <div className={styles.selectorGroup}>
        {editingStage ? (
          <input
            ref={stageInputRef}
            className={styles.editInput}
            value={stageTitle}
            onChange={(e) => setStageTitle(e.target.value)}
            onBlur={finishEditingStage}
            onKeyDown={handleStageKeyDown}
          />
        ) : (
          <select
            className={styles.select}
            value={currentStageId || ''}
            onChange={(e) => onStageChange(e.target.value)}
            onDoubleClick={startEditingStage}
            title="더블클릭하여 이름 변경"
          >
            {stages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.title}
              </option>
            ))}
          </select>
        )}
        <button
          className={styles.editButton}
          onClick={startEditingStage}
          title="스테이지 이름 변경"
        >
          ✎
        </button>
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
        {editingChapter ? (
          <input
            ref={chapterInputRef}
            className={styles.editInput}
            value={chapterTitle}
            onChange={(e) => setChapterTitle(e.target.value)}
            onBlur={finishEditingChapter}
            onKeyDown={handleChapterKeyDown}
          />
        ) : (
          <select
            className={styles.select}
            value={currentChapterId || ''}
            onChange={(e) => onChapterChange(e.target.value)}
            onDoubleClick={startEditingChapter}
            title="더블클릭하여 이름 변경"
          >
            {currentStageChapters?.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                {chapter.title}
              </option>
            ))}
          </select>
        )}
        <button
          className={styles.editButton}
          onClick={startEditingChapter}
          title="챕터 이름 변경"
        >
          ✎
        </button>
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
