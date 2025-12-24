import { useState } from 'react'
import { useEditorStore } from '../../stores/editorStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { NODE_COLORS, NODE_ICONS, type AllNodeType } from '../../types/editor'
import type { StoryNodeType } from '../../types/story'
import { useTranslation } from '../../i18n'
import { isTauri, createDirectory } from '../../utils/fileUtils'
import styles from './Sidebar.module.css'

// 노드 카테고리
const NODE_CATEGORIES = {
  flow: ['start', 'chapter_end'] as StoryNodeType[],
  content: ['dialogue', 'choice', 'image', 'battle', 'shop', 'event'] as StoryNodeType[],
  logic: ['variable', 'condition', 'javascript', 'custom'] as StoryNodeType[],
  editor: ['comment'] as AllNodeType[],
}

type SidebarTab = 'story' | 'nodes' | 'resources'

// 간단한 fuzzy 매칭 함수
function fuzzyMatch(text: string, pattern: string): boolean {
  if (!pattern) return true
  const lowerText = text.toLowerCase()
  const lowerPattern = pattern.toLowerCase()
  let patternIdx = 0
  for (let i = 0; i < lowerText.length && patternIdx < lowerPattern.length; i++) {
    if (lowerText[i] === lowerPattern[patternIdx]) {
      patternIdx++
    }
  }
  return patternIdx === lowerPattern.length
}

interface SidebarProps {
  onOpenTemplateEditor?: () => void
}

export function Sidebar({ onOpenTemplateEditor }: SidebarProps) {
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
    getTemplates,
    createNodeFromTemplate,
  } = useEditorStore()

  const { settings } = useSettingsStore()
  const { nodes, sidebar } = useTranslation()

  const [activeTab, setActiveTab] = useState<SidebarTab>('story')
  const [editingStageId, setEditingStageId] = useState<string | null>(null)
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [nodeFilter, setNodeFilter] = useState('')
  const [resourceFilter, setResourceFilter] = useState('')

  const currentStage = getCurrentStage()

  // 리소스 분류 (새로운 구조: 모든 이미지는 'image' 타입)
  const images = (project.resources || []).filter(r => r.type === 'image')

  const templates = getTemplates()

  const handleDragStart = (e: React.DragEvent, nodeType: AllNodeType) => {
    e.dataTransfer.setData('application/storynode-type', nodeType)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleTemplateDragStart = (e: React.DragEvent, templateId: string) => {
    e.dataTransfer.setData('application/storynode-type', 'custom')
    e.dataTransfer.setData('application/storynode-template-id', templateId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleTemplateClick = (templateId: string) => {
    createNodeFromTemplate(templateId)
  }

  // 리소스 이미지 드래그 시작
  const handleResourceDragStart = (e: React.DragEvent, resourcePath: string) => {
    e.dataTransfer.setData('application/storynode-type', 'image')
    e.dataTransfer.setData('application/storynode-image-path', resourcePath)
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


  const renderNodeCategory = (title: string, nodeTypes: AllNodeType[]) => {
    const filteredTypes = nodeTypes.filter(type => {
      const label = nodes[type as keyof typeof nodes] || type
      return fuzzyMatch(label, nodeFilter) || fuzzyMatch(type, nodeFilter)
    })
    if (filteredTypes.length === 0) return null
    return (
      <div className={styles.nodeCategory}>
        <div className={styles.categoryTitle}>{title}</div>
        <div className={styles.nodeList}>
          {filteredTypes.map((type) => (
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
  }

  // Story 탭 컨텐츠
  const renderStoryTab = () => (
    <>
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
    </>
  )

  // 템플릿 카테고리 렌더링
  const renderTemplateCategory = () => {
    const filteredTemplates = templates.filter(t =>
      fuzzyMatch(t.name, nodeFilter)
    )

    return (
      <div className={styles.nodeCategory}>
        <div className={styles.categoryTitleRow}>
          <span className={styles.categoryTitle}>Templates</span>
          <button
            className={styles.editTemplatesBtn}
            onClick={onOpenTemplateEditor}
            title="Edit Templates"
          >
            ✏️
          </button>
        </div>
        <div className={styles.nodeList}>
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={styles.nodeItem}
              style={{ '--node-color': template.color } as React.CSSProperties}
              draggable
              onDragStart={(e) => handleTemplateDragStart(e, template.id)}
              onClick={() => handleTemplateClick(template.id)}
            >
              <span className={styles.nodeIcon}>{template.icon || '🧩'}</span>
              <span className={styles.nodeLabel}>{template.name}</span>
            </div>
          ))}
          {filteredTemplates.length === 0 && templates.length === 0 && (
            <div className={styles.emptyTemplates}>
              <button
                className={styles.createTemplateBtn}
                onClick={onOpenTemplateEditor}
              >
                + Create Template
              </button>
            </div>
          )}
          {filteredTemplates.length === 0 && templates.length > 0 && (
            <div className={styles.noMatches}>No matches</div>
          )}
        </div>
      </div>
    )
  }

  // Nodes 탭 컨텐츠
  const renderNodesTab = () => (
    <div className={styles.section}>
      <input
        type="text"
        className={styles.filterInput}
        placeholder="Filter nodes..."
        value={nodeFilter}
        onChange={(e) => setNodeFilter(e.target.value)}
      />
      {renderNodeCategory(sidebar.flow, NODE_CATEGORIES.flow)}
      {renderNodeCategory(sidebar.content, NODE_CATEGORIES.content)}
      {renderNodeCategory(sidebar.logic, NODE_CATEGORIES.logic)}
      {renderTemplateCategory()}
      {renderNodeCategory(sidebar.editor || 'Editor', NODE_CATEGORIES.editor)}
    </div>
  )

  // 리소스 폴더 생성
  const handleCreateResourceFolder = async () => {
    const projectPath = settings.lastProjectPath
    if (!projectPath || !isTauri()) return

    try {
      await createDirectory(`${projectPath}/resources`)
      await createDirectory(`${projectPath}/resources/images`)
      alert('Created resources/images/ folder. Add images and reload the project.')
    } catch (error) {
      alert(`Failed to create folder: ${(error as Error).message}`)
    }
  }

  // 리소스 새로고침
  const handleRefreshResources = () => {
    // 프로젝트 다시 로드하기 위해 이벤트 발생
    window.dispatchEvent(new CustomEvent('storynode:reload-project'))
  }

  // Resources 탭 컨텐츠
  const renderResourcesTab = () => {
    const filteredImages = images.filter(r => fuzzyMatch(r.name, resourceFilter))
    const projectPath = settings.lastProjectPath

    return (
      <div className={styles.section}>
        <div className={styles.filterRow}>
          <input
            type="text"
            className={styles.filterInput}
            placeholder="Filter resources..."
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
          />
          {projectPath && (
            <button
              className={styles.refreshButton}
              onClick={handleRefreshResources}
              title="Refresh resources"
            >
              ↻
            </button>
          )}
        </div>

        {/* Images */}
        <div className={styles.nodeCategory}>
          <div className={styles.categoryTitle}>Images</div>
          <div className={styles.resourceList}>
            {filteredImages.map((resource) => (
              <div
                key={resource.id}
                className={styles.resourceItem}
                draggable
                onDragStart={(e) => handleResourceDragStart(e, resource.path)}
                title="Drag to canvas to create Image node"
              >
                <img
                  src={resource.path}
                  alt={resource.name}
                  className={styles.resourceThumbnail}
                />
                <span className={styles.resourceName}>{resource.name}</span>
              </div>
            ))}
            {filteredImages.length === 0 && (
              <div className={styles.emptyState}>
                {images.length === 0 ? (
                  projectPath ? (
                    <>
                      <div className={styles.emptyText}>Add images to resources/images/ folder</div>
                      <button
                        className={styles.createFolderButton}
                        onClick={handleCreateResourceFolder}
                      >
                        Create resources/images/ folder
                      </button>
                    </>
                  ) : (
                    <div className={styles.emptyText}>Save project first</div>
                  )
                ) : (
                  <div className={styles.emptyText}>No matches</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <aside className={styles.sidebar}>
      {/* 탭 헤더 */}
      <div className={styles.tabHeader}>
        <button
          className={`${styles.tab} ${activeTab === 'story' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('story')}
          title="Story Structure"
        >
          📚
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'nodes' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('nodes')}
          title="Node Library"
        >
          🧩
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'resources' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('resources')}
          title="Resources"
        >
          🖼️
        </button>
      </div>

      {/* 탭 컨텐츠 */}
      <div className={styles.tabContent}>
        {activeTab === 'story' && renderStoryTab()}
        {activeTab === 'nodes' && renderNodesTab()}
        {activeTab === 'resources' && renderResourcesTab()}
      </div>
    </aside>
  )
}
