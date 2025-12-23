import { useEffect, useRef, useCallback } from 'react'
import { useSearchStore, extractSearchableText, type SearchResult, type SearchScope } from '../../stores/searchStore'
import { useEditorStore } from '../../stores/editorStore'
import { useCanvasStore } from '../../stores/canvasStore'
import { useTranslation } from '../../i18n'
import styles from './SearchModal.module.css'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const {
    searchQuery,
    searchScope,
    results,
    selectedResultIndex,
    setSearchQuery,
    setSearchScope,
    setResults,
    selectResult,
    selectNextResult,
    selectPrevResult,
    setHighlightedNode,
  } = useSearchStore()

  const { project, setCurrentStage, setCurrentChapter, setSelectedNodes, currentStageId, currentChapterId } = useEditorStore()
  const { setViewport } = useCanvasStore()
  const { search: searchT, nodes: nodesT } = useTranslation()

  // 검색 실행
  const performSearch = useCallback((query: string, scope: SearchScope) => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const searchResults: SearchResult[] = []
    const lowerQuery = query.toLowerCase()

    if (scope === 'canvas') {
      // 현재 캔버스(챕터)에서만 검색
      const stage = project.stages.find(s => s.id === currentStageId)
      const chapter = stage?.chapters.find(c => c.id === currentChapterId)

      if (chapter && stage) {
        chapter.nodes.forEach(node => {
          const searchableTexts = extractSearchableText(node)
          searchableTexts.forEach(({ field, text }) => {
            const lowerText = text.toLowerCase()
            const matchIndex = lowerText.indexOf(lowerQuery)
            if (matchIndex !== -1) {
              searchResults.push({
                nodeId: node.id,
                nodeType: node.type,
                stageId: stage.id,
                stageName: stage.title,
                chapterId: chapter.id,
                chapterName: chapter.title,
                matchedField: field,
                matchedText: text,
                matchIndex,
              })
            }
          })
        })
      }
    } else {
      // 전체 프로젝트에서 검색
      project.stages.forEach(stage => {
        stage.chapters.forEach(chapter => {
          chapter.nodes.forEach(node => {
            const searchableTexts = extractSearchableText(node)
            searchableTexts.forEach(({ field, text }) => {
              const lowerText = text.toLowerCase()
              const matchIndex = lowerText.indexOf(lowerQuery)
              if (matchIndex !== -1) {
                searchResults.push({
                  nodeId: node.id,
                  nodeType: node.type,
                  stageId: stage.id,
                  stageName: stage.title,
                  chapterId: chapter.id,
                  chapterName: chapter.title,
                  matchedField: field,
                  matchedText: text,
                  matchIndex,
                })
              }
            })
          })
        })
      })
    }

    setResults(searchResults)
  }, [project, currentStageId, currentChapterId, setResults])

  // 검색어 변경 시 검색 실행
  useEffect(() => {
    performSearch(searchQuery, searchScope)
  }, [searchQuery, searchScope, performSearch])

  // 결과 항목으로 이동
  const navigateToResult = useCallback((result: SearchResult) => {
    // 다른 스테이지/챕터면 이동
    if (result.stageId !== currentStageId) {
      setCurrentStage(result.stageId)
    }
    if (result.chapterId !== currentChapterId) {
      setCurrentChapter(result.chapterId)
    }

    // 노드 선택 및 하이라이트
    setSelectedNodes([result.nodeId])
    setHighlightedNode(result.nodeId, searchQuery)

    // 노드 위치로 뷰포트 이동 (약간의 딜레이 후)
    setTimeout(() => {
      const nodePosition = useCanvasStore.getState().getNodePosition(result.chapterId, result.nodeId)
      if (nodePosition) {
        // 화면 중앙에 노드 배치
        setViewport({
          x: -nodePosition.x + window.innerWidth / 2 - 130,
          y: -nodePosition.y + window.innerHeight / 2 - 50,
          zoom: 1,
        })
      }
    }, 50)

    onClose()
  }, [currentStageId, currentChapterId, setCurrentStage, setCurrentChapter, setSelectedNodes, setHighlightedNode, searchQuery, setViewport, onClose])

  // 선택된 결과 스크롤
  useEffect(() => {
    if (resultsRef.current && selectedResultIndex >= 0) {
      const selectedElement = resultsRef.current.children[selectedResultIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedResultIndex])

  // 키보드 네비게이션
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      selectNextResult()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      selectPrevResult()
    } else if (e.key === 'Enter' && selectedResultIndex >= 0) {
      e.preventDefault()
      navigateToResult(results[selectedResultIndex])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }, [selectNextResult, selectPrevResult, selectedResultIndex, results, navigateToResult, onClose])

  // 모달 열릴 때 포커스
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isOpen])

  // 텍스트 하이라이트 렌더링
  const renderHighlightedText = useCallback((text: string, query: string) => {
    if (!query) return text

    const lowerText = text.toLowerCase()
    const lowerQuery = query.toLowerCase()
    const index = lowerText.indexOf(lowerQuery)

    if (index === -1) return text

    const before = text.slice(0, index)
    const match = text.slice(index, index + query.length)
    const after = text.slice(index + query.length)

    // 텍스트가 너무 길면 매칭 부분 주변만 표시
    const maxLength = 80
    if (text.length > maxLength) {
      const start = Math.max(0, index - 20)
      const end = Math.min(text.length, index + query.length + 40)
      const truncatedBefore = start > 0 ? '...' + text.slice(start, index) : text.slice(0, index)
      const truncatedAfter = end < text.length ? text.slice(index + query.length, end) + '...' : text.slice(index + query.length)

      return (
        <>
          {truncatedBefore}
          <span className={styles.highlight}>{match}</span>
          {truncatedAfter}
        </>
      )
    }

    return (
      <>
        {before}
        <span className={styles.highlight}>{match}</span>
        {after}
      </>
    )
  }, [])

  // 노드 타입 스타일 클래스
  const getNodeTypeClass = useCallback((nodeType: string) => {
    const typeMap: Record<string, string> = {
      start: styles.nodeTypeStart,
      dialogue: styles.nodeTypeDialogue,
      choice: styles.nodeTypeChoice,
      battle: styles.nodeTypeBattle,
      shop: styles.nodeTypeShop,
      event: styles.nodeTypeEvent,
      chapter_end: styles.nodeTypeChapterEnd,
      variable: styles.nodeTypeVariable,
      condition: styles.nodeTypeCondition,
      comment: styles.nodeTypeComment,
    }
    return typeMap[nodeType] || ''
  }, [])

  // 노드 타입 라벨
  const getNodeTypeLabel = useCallback((nodeType: string) => {
    const key = nodeType as keyof typeof nodesT
    return nodesT[key] || nodeType
  }, [nodesT])

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <div className={styles.header}>
          <div className={styles.searchInputWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              ref={inputRef}
              type="text"
              className={styles.searchInput}
              placeholder={searchT.placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${searchScope === 'canvas' ? styles.tabActive : ''}`}
              onClick={() => setSearchScope('canvas')}
            >
              {searchT.currentCanvas}
            </button>
            <button
              className={`${styles.tab} ${searchScope === 'global' ? styles.tabActive : ''}`}
              onClick={() => setSearchScope('global')}
            >
              {searchT.allFiles}
            </button>
            {results.length > 0 && (
              <span className={styles.resultCount}>
                {searchT.resultCount.replace('{count}', String(results.length))}
              </span>
            )}
          </div>
        </div>

        <div className={styles.results} ref={resultsRef}>
          {searchQuery && results.length === 0 ? (
            <div className={styles.noResults}>{searchT.noResults}</div>
          ) : (
            results.map((result, index) => (
              <div
                key={`${result.nodeId}-${result.matchedField}-${index}`}
                className={`${styles.resultItem} ${index === selectedResultIndex ? styles.resultItemSelected : ''}`}
                onClick={() => {
                  selectResult(index)
                  navigateToResult(result)
                }}
              >
                <div className={styles.resultPath}>
                  <span className={`${styles.resultNodeType} ${getNodeTypeClass(result.nodeType)}`}>
                    {getNodeTypeLabel(result.nodeType)}
                  </span>
                  {searchScope === 'global' && (
                    <>
                      <span className={styles.resultPathSeparator}>›</span>
                      <span>{result.stageName}</span>
                      <span className={styles.resultPathSeparator}>›</span>
                      <span>{result.chapterName}</span>
                    </>
                  )}
                </div>
                <div className={styles.resultContent}>
                  {renderHighlightedText(result.matchedText, searchQuery)}
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.shortcutHint}>
            <kbd className={styles.kbd}>↑↓</kbd>
            <span>{searchT.navigate}</span>
          </div>
          <div className={styles.shortcutHint}>
            <kbd className={styles.kbd}>Enter</kbd>
            <span>{searchT.goTo}</span>
          </div>
          <div className={styles.shortcutHint}>
            <kbd className={styles.kbd}>Esc</kbd>
            <span>{searchT.close}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
