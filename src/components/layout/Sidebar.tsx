import { useState } from 'react'
import { useEditorStore } from '../../stores/editorStore'
import { NODE_COLORS, NODE_ICONS, type AllNodeType } from '../../types/editor'
import type { StoryNodeType } from '../../types/story'
import { useTranslation } from '../../i18n'
import styles from './Sidebar.module.css'

// 노드 카테고리
const NODE_CATEGORIES = {
  flow: ['start', 'chapter_end'] as StoryNodeType[],
  content: ['dialogue', 'choice', 'battle', 'shop', 'event'] as StoryNodeType[],
  logic: ['variable', 'condition'] as StoryNodeType[],
  editor: ['comment'] as AllNodeType[],
}

export function Sidebar() {
  const {
    project,
    currentStageId,
    currentChapterId,
    createNode,
    createStage,
    updateStage,
    deleteStage,
    setCurrentStage,
    createChapter,
    updateChapter,
    deleteChapter,
    setCurrentChapter,
    getCurrentStage,
  } = useEditorStore()

  const { nodes, sidebar } = useTranslation()

  const [editingStageId, setEditingStageId] = useState<string | null>(null)
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  const currentStage = getCurrentStage()

  const handleDragStart = (e: React.DragEvent, nodeType: AllNodeType) => {
    e.dataTransfer.setData('application/storynode-type', nodeType)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleClick = (nodeType: AllNodeType) => {
    // Comment 노드는 클릭으로 생성 불가 (드래그로만 생성)
    if (nodeType === 'comment') return
    createNode(nodeType as StoryNodeType)
  }

  // Stage 관리
  const handleAddStage = () => {
    createStage({ title: `Stage ${project.stages.length + 1}` })
  }

  const handleStageDoubleClick = (stageId: string, title: string) => {
    setEditingStageId(stageId)
    setEditingTitle(title)
  }

  const handleStageRename = (stageId: string) => {
    if (editingTitle.trim()) {
      updateStage(stageId, { title: editingTitle.trim() })
    }
    setEditingStageId(null)
    setEditingTitle('')
  }

  const handleDeleteStage = (e: React.MouseEvent, stageId: string) => {
    e.stopPropagation()
    if (project.stages.length > 1 && confirm('Delete this stage?')) {
      deleteStage(stageId)
    }
  }

  // Chapter 관리
  const handleAddChapter = () => {
    if (currentStageId) {
      createChapter(currentStageId, { title: `Chapter ${(currentStage?.chapters.length || 0) + 1}` })
    }
  }

  const handleChapterDoubleClick = (chapterId: string, title: string) => {
    setEditingChapterId(chapterId)
    setEditingTitle(title)
  }

  const handleChapterRename = (chapterId: string) => {
    if (editingTitle.trim() && currentStageId) {
      updateChapter(currentStageId, chapterId, { title: editingTitle.trim() })
    }
    setEditingChapterId(null)
    setEditingTitle('')
  }

  const handleDeleteChapter = (e: React.MouseEvent, chapterId: string) => {
    e.stopPropagation()
    if (currentStageId && (currentStage?.chapters.length || 0) > 1 && confirm('Delete this chapter?')) {
      deleteChapter(currentStageId, chapterId)
    }
  }

  const renderNodeCategory = (title: string, nodeTypes: AllNodeType[]) => (
    <div className={styles.nodeCategory}>
      <div className={styles.categoryTitle}>{title}</div>
      <div className={styles.nodeList}>
        {nodeTypes.map((type) => (
          <div
            key={type}
            className={styles.nodeItem}
            style={{ '--node-color': NODE_COLORS[type] } as React.CSSProperties}
            draggable
            onDragStart={(e) => handleDragStart(e, type)}
            onClick={() => handleClick(type)}
          >
            <span className={styles.nodeIcon}>{NODE_ICONS[type]}</span>
            <span className={styles.nodeLabel}>{nodes[type as keyof typeof nodes] || type}</span>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <aside className={styles.sidebar}>
      {/* Stages 섹션 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Stages</span>
          <button className={styles.addButton} onClick={handleAddStage} title="Add Stage">+</button>
        </div>
        <div className={styles.itemList}>
          {project.stages.map((stage) => (
            <div
              key={stage.id}
              className={`${styles.listItem} ${stage.id === currentStageId ? styles.active : ''}`}
              onClick={() => setCurrentStage(stage.id)}
              onDoubleClick={() => handleStageDoubleClick(stage.id, stage.title)}
            >
              {editingStageId === stage.id ? (
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={() => handleStageRename(stage.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleStageRename(stage.id)
                    if (e.key === 'Escape') setEditingStageId(null)
                  }}
                  className={styles.editInput}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <span className={styles.itemIcon}>📁</span>
                  <span className={styles.itemTitle}>{stage.title}</span>
                  {project.stages.length > 1 && (
                    <button
                      className={styles.deleteButton}
                      onClick={(e) => handleDeleteStage(e, stage.id)}
                      title="Delete Stage"
                    >
                      ×
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chapters 섹션 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Chapters</span>
          <button className={styles.addButton} onClick={handleAddChapter} title="Add Chapter">+</button>
        </div>
        <div className={styles.itemList}>
          {currentStage?.chapters.map((chapter) => (
            <div
              key={chapter.id}
              className={`${styles.listItem} ${chapter.id === currentChapterId ? styles.active : ''}`}
              onClick={() => setCurrentChapter(chapter.id)}
              onDoubleClick={() => handleChapterDoubleClick(chapter.id, chapter.title)}
            >
              {editingChapterId === chapter.id ? (
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={() => handleChapterRename(chapter.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleChapterRename(chapter.id)
                    if (e.key === 'Escape') setEditingChapterId(null)
                  }}
                  className={styles.editInput}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <span className={styles.itemIcon}>📄</span>
                  <span className={styles.itemTitle}>{chapter.title}</span>
                  <span className={styles.itemBadge}>{chapter.nodes.length}</span>
                  {(currentStage?.chapters.length || 0) > 1 && (
                    <button
                      className={styles.deleteButton}
                      onClick={(e) => handleDeleteChapter(e, chapter.id)}
                      title="Delete Chapter"
                    >
                      ×
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Nodes 섹션 */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>{sidebar.nodeLibrary}</div>
        {renderNodeCategory(sidebar.flow, NODE_CATEGORIES.flow)}
        {renderNodeCategory(sidebar.content, NODE_CATEGORIES.content)}
        {renderNodeCategory(sidebar.logic, NODE_CATEGORIES.logic)}
        {renderNodeCategory(sidebar.editor || 'Editor', NODE_CATEGORIES.editor)}
      </div>
    </aside>
  )
}
