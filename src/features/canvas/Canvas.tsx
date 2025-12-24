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
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useEditorStore } from '../../stores/editorStore'
import { useCanvasStore } from '../../stores/canvasStore'
import { useSearchStore } from '../../stores/searchStore'
import { useGameStore } from '../../stores/gameStore'
import { nodeTypes } from '../nodes/nodeRegistry'
import { SmartEdge } from '../edges/SmartEdge'
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
  smart: SmartEdge,
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
  } = useEditorStore()

  const { snapGrid, showGrid, setSnapGrid, setShowGrid, setNodes: setCanvasNodes } = useCanvasStore()
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

  // 챕터/노드 변경 시 노드 업데이트
  const commentNodesKey = JSON.stringify(commentNodes.map(c => ({ id: c.id, pos: c.position, data: c.data })))
  useEffect(() => {
    setNodes(initialNodes)
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

  // 노드 선택
  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: Node[]; edges: Edge[] }) => {
      const nodeIds = selectedNodes.map(n => n.id)
      setSelectedNodes(nodeIds)

      const hasNonCommentNode = selectedNodes.some(n => n.type !== 'comment')
      if (hasNonCommentNode) {
        setSelectedComment(null)
      }
    },
    [setSelectedNodes, setSelectedComment]
  )

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
