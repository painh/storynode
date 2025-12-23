import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  SelectionMode,
  type Connection,
  type Edge,
  type Node,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useEditorStore } from '../../stores/editorStore'
import { useCanvasStore } from '../../stores/canvasStore'
import { nodeTypes } from '../nodes/nodeRegistry'
import { SmartEdge } from '../edges/SmartEdge'
import { autoLayoutNodes } from '../../utils/autoLayout'
import type { EditorNodeData } from '../../types/editor'
import type { StoryNodeType } from '../../types/story'
import styles from './Canvas.module.css'

const edgeTypes = {
  smart: SmartEdge,
}

export function Canvas() {
  const {
    currentChapterId,
    getCurrentChapter,
    createNode,
    updateNode,
    selectedNodeIds,
    setSelectedNodes,
  } = useEditorStore()

  const { getNodePosition, updateNodePosition } = useCanvasStore()

  const chapter = getCurrentChapter()
  const setNodesRef = useRef<typeof setNodes | null>(null)

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

    return chapter.nodes.map((storyNode) => {
      const savedPosition = getNodePosition(chapter.id, storyNode.id)
      const position = savedPosition || autoPositions[storyNode.id] || { x: 100, y: 100 }

      return {
        id: storyNode.id,
        type: storyNode.type,
        position,
        data: {
          storyNode,
          label: storyNode.type,
        },
        selected: selectedNodeIds.includes(storyNode.id),
      }
    })
  }, [chapter, selectedNodeIds, getNodePosition])

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

  // 챕터 변경 시 노드/엣지 업데이트
  useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [currentChapterId, chapter?.nodes, setNodes, setEdges, initialNodes, initialEdges])

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

  // 노드 드래그 종료 시 위치 저장
  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (currentChapterId) {
        updateNodePosition(currentChapterId, node.id, node.position)
      }
    },
    [currentChapterId, updateNodePosition]
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

      const nodeType = e.dataTransfer.getData('application/storynode-type') as StoryNodeType
      if (!nodeType) return

      // React Flow 캔버스 내 좌표 계산
      const reactFlowBounds = e.currentTarget.getBoundingClientRect()
      const position = {
        x: e.clientX - reactFlowBounds.left,
        y: e.clientY - reactFlowBounds.top,
      }

      const newNode = createNode(nodeType, position)
      if (newNode && currentChapterId) {
        updateNodePosition(currentChapterId, newNode.id, position)
      }
    },
    [createNode, currentChapterId, updateNodePosition]
  )

  return (
    <div className={styles.canvas} tabIndex={0}>
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
        snapToGrid
        snapGrid={[20, 20]}
        panOnDrag={[1, 2]}
        selectionOnDrag
        selectionMode={SelectionMode.Partial}
        defaultEdgeOptions={{
          type: 'smart',
          style: { stroke: '#fff', strokeWidth: 2 },
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#333"
        />
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
            }
            return colors[node.type || 'dialogue'] || '#666'
          }}
          maskColor="rgba(0, 0, 0, 0.8)"
        />
      </ReactFlow>
    </div>
  )
}
