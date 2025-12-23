import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  SelectionMode,
  type Connection,
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
import { autoLayoutNodes } from '../../utils/autoLayout'
import type { EditorNodeData } from '../../types/editor'
import type { StoryNodeType } from '../../types/story'
import styles from './Canvas.module.css'

const edgeTypes = {
  smart: SmartEdge,
}

function CanvasInner() {
  const {
    currentChapterId,
    getCurrentChapter,
    createNode,
    updateNode,
    selectedNodeIds,
    setSelectedNodes,
  } = useEditorStore()

  const { getNodePosition, updateNodePosition, getCommentNodes, createCommentNode, updateCommentPosition, snapGrid, showGrid, setSnapGrid, setShowGrid } = useCanvasStore()
  const [isShiftPressed, setIsShiftPressed] = useState(false)
  const { highlightedNodeId, navigateTimestamp } = useSearchStore()
  const { status: gameStatus, gameState } = useGameStore()

  // 게임에서 현재 실행 중인 노드 ID
  const playingNodeId = gameStatus === 'playing' || gameStatus === 'paused' ? gameState?.currentNodeId : null
  const { screenToFlowPosition, setViewport } = useReactFlow()

  const chapter = getCurrentChapter()
  const setNodesRef = useRef<typeof setNodes | null>(null)

  // Comment 노드들을 안정적으로 가져오기 (무한 루프 방지)
  const commentNodes = currentChapterId ? getCommentNodes(currentChapterId) : []
  const commentNodesKey = JSON.stringify(commentNodes.map(c => ({ id: c.id, pos: c.position, data: c.data })))

  // StoryNode를 React Flow Node로 변환
  const initialNodes = useMemo((): Node<EditorNodeData>[] => {
    if (!chapter) return []

    // 저장된 위치가 없는 노드가 있는지 확인
    const hasUnsavedPositions = chapter.nodes.some(
      node => !getNodePosition(chapter.id, node.id)
    )

    // 저장된 위치가 없으면 자동 레이아웃 계산
    const autoPositions = hasUnsavedPositions
      ? autoLayoutNodes(chapter.nodes, chapter.startNodeId)
      : {}

    // Story 노드들
    const storyNodes: Node<EditorNodeData>[] = chapter.nodes.map((storyNode) => {
      const savedPosition = getNodePosition(chapter.id, storyNode.id)
      const position = savedPosition || autoPositions[storyNode.id] || { x: 100, y: 100 }

      return {
        id: storyNode.id,
        type: storyNode.type,
        position,
        data: {
          storyNode,
          label: storyNode.type,
          isPlaying: playingNodeId === storyNode.id,
        },
        selected: selectedNodeIds.includes(storyNode.id),
      }
    })

    // Comment 노드들 (다른 노드 뒤에 표시)
    const commentFlowNodes: Node<EditorNodeData>[] = commentNodes.map((comment) => ({
      id: comment.id,
      type: 'comment',
      position: comment.position,
      data: {
        commentData: comment.data,
        label: 'comment',
      },
      selected: selectedNodeIds.includes(comment.id),
      zIndex: -1, // 다른 노드 뒤에 표시
    }))

    return [...commentFlowNodes, ...storyNodes]
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter, selectedNodeIds, getNodePosition, commentNodesKey, playingNodeId])

  // 연결 정보를 Edge로 변환
  const initialEdges = useMemo((): Edge[] => {
    if (!chapter) return []

    const edges: Edge[] = []

    chapter.nodes.forEach((node) => {
      // nextNodeId 연결
      if (node.nextNodeId) {
        edges.push({
          id: `${node.id}-${node.nextNodeId}`,
          source: node.id,
          target: node.nextNodeId,
          sourceHandle: 'exec-out',
          targetHandle: 'exec-in',
        })
      }

      // choice 연결
      if (node.choices) {
        node.choices.forEach((choice, index) => {
          if (choice.nextNodeId) {
            edges.push({
              id: `${node.id}-choice-${index}-${choice.nextNodeId}`,
              source: node.id,
              target: choice.nextNodeId,
              sourceHandle: `choice-${index}`,
              targetHandle: 'exec-in',
            })
          }
        })
      }

      // condition 분기 연결
      if (node.conditionBranches) {
        node.conditionBranches.forEach((branch, index) => {
          if (branch.nextNodeId) {
            edges.push({
              id: `${node.id}-condition-${index}-${branch.nextNodeId}`,
              source: node.id,
              target: branch.nextNodeId,
              sourceHandle: `condition-${index}`,
              targetHandle: 'exec-in',
            })
          }
        })
      }

      // condition default 연결
      if (node.defaultNextNodeId) {
        edges.push({
          id: `${node.id}-default-${node.defaultNextNodeId}`,
          source: node.id,
          target: node.defaultNextNodeId,
          sourceHandle: 'default',
          targetHandle: 'exec-in',
        })
      }
    })

    return edges
  }, [chapter])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // setNodes ref 저장
  useEffect(() => {
    setNodesRef.current = setNodes
  }, [setNodes])

  // 챕터/노드 변경 시 노드/엣지 업데이트
  useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChapterId, commentNodesKey, initialNodes, initialEdges])

  // 자동 정렬 이벤트 리스너
  useEffect(() => {
    const handleAutoLayout = () => {
      if (!chapter || !setNodesRef.current) return

      const autoPositions = autoLayoutNodes(chapter.nodes, chapter.startNodeId)

      // 모든 노드 위치 업데이트
      setNodesRef.current((nds) =>
        nds.map((node) => {
          const newPos = autoPositions[node.id]
          if (newPos && currentChapterId) {
            updateNodePosition(currentChapterId, node.id, newPos)
          }
          return {
            ...node,
            position: newPos || node.position,
          }
        })
      )
    }

    window.addEventListener('storynode:auto-layout', handleAutoLayout)
    return () => {
      window.removeEventListener('storynode:auto-layout', handleAutoLayout)
    }
  }, [chapter, currentChapterId, updateNodePosition])

  // 검색 결과로 이동 (highlightedNodeId 또는 navigateTimestamp 변경 시)
  useEffect(() => {
    console.log('[Search Navigate] Effect triggered:', {
      highlightedNodeId,
      navigateTimestamp,
      currentChapterId,
    })

    if (!highlightedNodeId || !currentChapterId || !navigateTimestamp) {
      console.log('[Search Navigate] Early return - missing values')
      return
    }

    const nodePosition = getNodePosition(currentChapterId, highlightedNodeId)
    console.log('[Search Navigate] Node position:', nodePosition)

    if (nodePosition) {
      const targetViewport = {
        x: -nodePosition.x + 400,
        y: -nodePosition.y + 300,
        zoom: 1,
      }
      console.log('[Search Navigate] Setting viewport to:', targetViewport)

      // 약간의 딜레이 후 뷰포트 이동 (챕터 전환 시 렌더링 대기)
      setTimeout(() => {
        console.log('[Search Navigate] Calling setViewport now')
        setViewport(targetViewport, { duration: 300 })
      }, 100)
    } else {
      console.log('[Search Navigate] No position found for node')
    }
  }, [highlightedNodeId, navigateTimestamp, currentChapterId, getNodePosition, setViewport])

  // Shift 키 감지 (스냅 그리드 활성화용)
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

  // 노드 드래그 종료 시 위치 저장
  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, _node: Node, draggedNodes: Node[]) => {
      if (currentChapterId) {
        // 드래그된 모든 노드의 위치 저장
        draggedNodes.forEach((draggedNode) => {
          if (draggedNode.type === 'comment') {
            updateCommentPosition(currentChapterId, draggedNode.id, draggedNode.position)
          } else {
            updateNodePosition(currentChapterId, draggedNode.id, draggedNode.position)
          }
        })
      }
    },
    [currentChapterId, updateNodePosition, updateCommentPosition]
  )

  // 연결 생성
  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return

      const sourceHandle = connection.sourceHandle || 'exec-out'

      // choice 핸들인 경우
      if (sourceHandle.startsWith('choice-')) {
        const choiceIndex = parseInt(sourceHandle.split('-')[1])
        const sourceNode = chapter?.nodes.find(n => n.id === connection.source)
        if (sourceNode?.choices?.[choiceIndex]) {
          const choices = [...sourceNode.choices]
          choices[choiceIndex] = {
            ...choices[choiceIndex],
            nextNodeId: connection.target,
          }
          updateNode(connection.source, { choices })
        }
      }
      // condition 핸들인 경우
      else if (sourceHandle.startsWith('condition-')) {
        const conditionIndex = parseInt(sourceHandle.split('-')[1])
        const sourceNode = chapter?.nodes.find(n => n.id === connection.source)
        if (sourceNode?.conditionBranches?.[conditionIndex]) {
          const branches = [...sourceNode.conditionBranches]
          branches[conditionIndex] = {
            ...branches[conditionIndex],
            nextNodeId: connection.target,
          }
          updateNode(connection.source, { conditionBranches: branches })
        }
      }
      // condition default 핸들인 경우
      else if (sourceHandle === 'default') {
        updateNode(connection.source, { defaultNextNodeId: connection.target })
      }
      // 일반 exec-out 연결
      else {
        updateNode(connection.source, { nextNodeId: connection.target })
      }

      setEdges((eds) => addEdge(connection, eds))
    },
    [chapter, updateNode, setEdges]
  )

  // 노드 선택
  const onSelectionChange = useCallback(
    ({ nodes }: { nodes: Node[] }) => {
      setSelectedNodes(nodes.map(n => n.id))
    },
    [setSelectedNodes]
  )

  // 드래그 앤 드롭으로 노드 생성
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()

      const nodeType = e.dataTransfer.getData('application/storynode-type')
      if (!nodeType || !currentChapterId) return

      // 화면 좌표를 Flow 좌표로 변환 (줌/팬 고려)
      const position = screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      })

      // Comment 노드 처리
      if (nodeType === 'comment') {
        createCommentNode(currentChapterId, position)
        return
      }

      // Story 노드 처리
      const newNode = createNode(nodeType as StoryNodeType, position)
      if (newNode) {
        updateNodePosition(currentChapterId, newNode.id, position)
      }
    },
    [createNode, currentChapterId, updateNodePosition, screenToFlowPosition, createCommentNode]
  )

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onSelectionChange={onSelectionChange}
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
      defaultEdgeOptions={{
        type: 'smart',
        style: { stroke: '#fff', strokeWidth: 2 },
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
      {/* 그리드 설정 툴바 */}
      <div className={styles.gridToolbar}>
        <label>
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
          />
          Grid
        </label>
        <input
          type="number"
          value={snapGrid}
          onChange={(e) => setSnapGrid(Math.max(1, parseInt(e.target.value) || 1))}
          min={1}
          max={100}
          style={{ width: 50 }}
        />
        <span style={{ fontSize: 11, color: '#888' }}>Shift+Drag to snap</span>
      </div>
      <Controls />
      <MiniMap
        nodeColor={(node) => {
          const colors: Record<string, string> = {
            start: '#4CAF50',
            dialogue: '#4A6FA5',
            choice: '#8B4A6B',
            battle: '#C62828',
            shop: '#2E7D32',
            event: '#F9A825',
            chapter_end: '#37474F',
            variable: '#7B1FA2',
            condition: '#00796B',
            comment: '#5C6BC0',
          }
          return colors[node.type || 'dialogue'] || '#666'
        }}
        maskColor="rgba(0, 0, 0, 0.8)"
        pannable
        zoomable
      />
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
