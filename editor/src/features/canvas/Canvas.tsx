import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow,
  SelectionMode,
  type Edge,
  type Node,
  type EdgeMouseHandler,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useEditorStore } from '../../stores/editorStore'
import { useCanvasStore } from '../../stores/canvasStore'
import { useSearchStore } from '../../stores/searchStore'
import { useGameStore } from '../../stores/gameStore'
import { nodeTypes } from '../nodes/nodeRegistry'
import { WaypointEdge } from '../edges/WaypointEdge'
import { DataEdge } from '../edges/DataEdge'
import type { StoryNodeType } from '../../types/story'

import { useNodesInitialization } from './hooks/useNodesInitialization'
import { useEdgesInitialization } from './hooks/useEdgesInitialization'
import { useCommentNodeDrag } from './hooks/useCommentNodeDrag'
import { useCanvasEventListeners } from './hooks/useCanvasEventListeners'
import { useConnectionHandler } from './hooks/useConnectionHandler'
import { useEdgeHandlers } from './hooks/useEdgeHandlers'
import { GridToolbar } from './components/GridToolbar'
import { CanvasMiniMap } from './components/CanvasMiniMap'
import styles from './Canvas.module.css'

const edgeTypes = {
  smart: WaypointEdge,
  data: DataEdge,
}

function CanvasInner() {
  const {
    currentChapterId,
    getCurrentChapter,
    createNode,
    updateNode,
    setSelectedNodes,
    setSelectedComment,
    getCommentNodes,
    createCommentNode,
    updateCommentPosition,
    createNodeFromTemplate,
    getVariableById,
  } = useEditorStore()

  const { snapGrid, showGrid, setSnapGrid, setShowGrid, setNodes: setCanvasNodes, setEdges: setCanvasEdges, setSelectedEdgeId, pendingEdgeDelete, clearPendingEdgeDelete, pendingEdgeUpdate, clearPendingEdgeUpdate } = useCanvasStore()
  const [isShiftPressed, setIsShiftPressed] = useState(false)
  const { highlightedNodeId, navigateTimestamp } = useSearchStore()
  const { status: gameStatus, gameState } = useGameStore()

  const playingNodeId = gameStatus === 'playing' || gameStatus === 'paused' ? gameState?.currentNodeId : null
  const { screenToFlowPosition, setViewport } = useReactFlow()

  const chapter = getCurrentChapter()
  const commentNodes = getCommentNodes()

  // 노드 및 엣지 초기화
  const initialNodes = useNodesInitialization(chapter, commentNodes, playingNodeId)
  const initialEdges = useEdgesInitialization(chapter)

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges] = useEdgesState(initialEdges)

  // 커스텀 훅들
  const onEdgesChange = useEdgeHandlers(edges, chapter, updateNode, setEdges)
  const onConnect = useConnectionHandler(chapter, updateNode, setEdges)
  const { onNodeDragStart, onNodeDrag, onNodeDragStop } = useCommentNodeDrag(
    nodes,
    setNodes,
    updateNode,
    updateCommentPosition
  )
  useCanvasEventListeners(chapter, updateNode, setNodes, setEdges)

  // 챕터/노드 변경 시 노드 업데이트 (선택 상태 유지)
  const commentNodesKey = JSON.stringify(commentNodes.map(c => ({ id: c.id, pos: c.position, data: c.data })))
  useEffect(() => {
    setNodes(currentNodes => {
      // 현재 선택된 노드 ID 목록
      const selectedIds = new Set(currentNodes.filter(n => n.selected).map(n => n.id))
      // 새 노드에 선택 상태 복원
      return initialNodes.map(node => ({
        ...node,
        selected: selectedIds.has(node.id),
      }))
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChapterId, commentNodesKey, initialNodes])

  // 엣지 업데이트
  const initialEdgesKey = useMemo(() => JSON.stringify(initialEdges.map(e => e.id)), [initialEdges])
  useEffect(() => {
    setEdges(initialEdges)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChapterId, initialEdgesKey])

  // React Flow nodes를 canvasStore에 동기화
  useEffect(() => {
    setCanvasNodes(nodes)
  }, [nodes, setCanvasNodes])

  // 인스펙터에서 요청한 엣지 삭제 처리
  useEffect(() => {
    if (pendingEdgeDelete) {
      setEdges((edges) => edges.filter((e) => e.id !== pendingEdgeDelete))
      clearPendingEdgeDelete()
    }
  }, [pendingEdgeDelete, clearPendingEdgeDelete, setEdges])

  // 인스펙터에서 요청한 엣지 업데이트 처리
  useEffect(() => {
    if (pendingEdgeUpdate) {
      setEdges((edges) => edges.map((e) => {
        if (e.id !== pendingEdgeUpdate.edgeId) return e
        return { ...e, data: { ...e.data, ...pendingEdgeUpdate.data } }
      }))
      clearPendingEdgeUpdate()
    }
  }, [pendingEdgeUpdate, clearPendingEdgeUpdate, setEdges])

  // React Flow edges를 canvasStore에 동기화
  useEffect(() => {
    setCanvasEdges(edges)
  }, [edges, setCanvasEdges])

  // 검색 결과로 이동
  useEffect(() => {
    if (!highlightedNodeId || !chapter || !navigateTimestamp) return

    const targetNode = chapter.nodes.find(n => n.id === highlightedNodeId)
    const nodePosition = targetNode?.position

    if (nodePosition) {
      const targetViewport = {
        x: -nodePosition.x + 400,
        y: -nodePosition.y + 300,
        zoom: 1,
      }
      setTimeout(() => {
        setViewport(targetViewport, { duration: 300 })
      }, 100)
    }
  }, [highlightedNodeId, navigateTimestamp, chapter, setViewport])

  // Shift 키 감지
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftPressed(true)
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftPressed(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // 노드/엣지 선택
  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }: { nodes: Node[]; edges: Edge[] }) => {
      const nodeIds = selectedNodes.map(n => n.id)
      setSelectedNodes(nodeIds)

      const hasNonCommentNode = selectedNodes.some(n => n.type !== 'comment')
      if (hasNonCommentNode) {
        setSelectedComment(null)
      }

      // 엣지 선택 처리
      if (selectedEdges.length === 1) {
        setSelectedEdgeId(selectedEdges[0].id)
      } else {
        setSelectedEdgeId(null)
      }
    },
    [setSelectedNodes, setSelectedComment, setSelectedEdgeId]
  )

  // 엣지 더블클릭으로 웨이포인트 추가
  const onEdgeDoubleClick: EdgeMouseHandler = useCallback((event, edge) => {
    const svg = (event.target as Element).closest('svg')
    if (!svg) return

    const point = svg.createSVGPoint()
    point.x = event.clientX
    point.y = event.clientY

    const ctm = svg.getScreenCTM()
    if (!ctm) return

    const svgPoint = point.matrixTransform(ctm.inverse())

    // 새 웨이포인트 생성
    const newWaypoint = {
      id: `wp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      x: svgPoint.x,
      y: svgPoint.y,
    }

    setEdges((edges) =>
      edges.map((e) => {
        if (e.id !== edge.id) return e
        const currentWaypoints = (e.data as { waypoints?: typeof newWaypoint[] })?.waypoints || []
        return {
          ...e,
          data: { ...e.data, waypoints: [...currentWaypoints, newWaypoint] },
        }
      })
    )
  }, [setEdges])

  // 드래그 앤 드롭
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()

      const nodeType = e.dataTransfer.getData('application/storynode-type')
      if (!nodeType || !currentChapterId) return

      const position = screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      })

      if (nodeType === 'comment') {
        createCommentNode(position)
        return
      }

      // 템플릿에서 노드 생성
      const templateId = e.dataTransfer.getData('application/storynode-template-id')
      if (nodeType === 'custom' && templateId) {
        const newNode = createNodeFromTemplate(templateId, position)
        if (newNode) {
          updateNode(newNode.id, { position })
        }
        return
      }

      const newNode = createNode(nodeType as StoryNodeType, position)
      if (newNode) {
        updateNode(newNode.id, { position })

        if (nodeType === 'image') {
          const imagePath = e.dataTransfer.getData('application/storynode-image-path')
          if (imagePath) {
            updateNode(newNode.id, {
              imageData: {
                resourcePath: imagePath,
                layer: 'character',
                layerOrder: 0,
                alignment: 'center',
              }
            })
          }
        }

        // 변수 드래그로 노드 생성 시 해당 변수 연산 자동 추가
        if (nodeType === 'variable') {
          const variableId = e.dataTransfer.getData('application/storynode-variable-id')
          if (variableId) {
            const variable = getVariableById(variableId)
            // 변수의 defaultValue 사용 (array는 push용 빈 문자열)
            const value = variable?.type === 'array' 
              ? '' 
              : (variable?.defaultValue ?? 0)
            updateNode(newNode.id, {
              variableOperations: [{
                target: 'variable',
                action: variable?.type === 'array' ? 'push' : 'set',
                variableId: variableId,
                value: value as number | string | boolean,
              }]
            })
          }
        }
      }
    },
    [createNode, currentChapterId, updateNode, screenToFlowPosition, createCommentNode, createNodeFromTemplate]
  )

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onSelectionChange={onSelectionChange}
      onNodeDragStart={onNodeDragStart}
      onNodeDrag={onNodeDrag}
      onNodeDragStop={onNodeDragStop}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onEdgeDoubleClick={onEdgeDoubleClick}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      snapToGrid={isShiftPressed}
      snapGrid={[snapGrid, snapGrid]}
      panOnDrag={[1, 2]}
      selectionOnDrag
      selectionMode={SelectionMode.Partial}
      minZoom={0.1}
      maxZoom={2}
      deleteKeyCode={null}
      defaultEdgeOptions={{
        type: 'smart',
        style: { stroke: '#fff', strokeWidth: 2 },
        selectable: true,
        focusable: true,
      }}
      proOptions={{ hideAttribution: true }}
    >
      {showGrid && (
        <Background
          variant={BackgroundVariant.Dots}
          gap={snapGrid}
          size={1}
          color="#444"
        />
      )}
      <GridToolbar
        showGrid={showGrid}
        snapGrid={snapGrid}
        onShowGridChange={setShowGrid}
        onSnapGridChange={setSnapGrid}
      />
      <Controls />
      <CanvasMiniMap />
    </ReactFlow>
  )
}

export function Canvas() {
  return (
    <div className={styles.canvas} tabIndex={0}>
      <ReactFlowProvider>
        <CanvasInner />
      </ReactFlowProvider>
    </div>
  )
}
