import { useCallback, useEffect, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useEditorStore } from '../../stores/editorStore'
import { useCanvasStore } from '../../stores/canvasStore'
import { nodeTypes } from '../nodes/nodeRegistry'
import type { EditorNodeData } from '../../types/editor'
import type { StoryNodeType } from '../../types/story'
import styles from './Canvas.module.css'

export function Canvas() {
  const {
    currentChapterId,
    getCurrentChapter,
    createNode,
    updateNode,
    deleteNode,
    selectedNodeIds,
    setSelectedNodes,
  } = useEditorStore()

  const { getNodePosition, updateNodePosition } = useCanvasStore()

  const chapter = getCurrentChapter()

  // StoryNode를 React Flow Node로 변환
  const initialNodes = useMemo((): Node<EditorNodeData>[] => {
    if (!chapter) return []

    return chapter.nodes.map((storyNode, index) => {
      const position = getNodePosition(chapter.id, storyNode.id) || {
        x: 100 + (index % 4) * 280,
        y: 100 + Math.floor(index / 4) * 200,
      }

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
    })

    return edges
  }, [chapter])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // 챕터 변경 시 노드/엣지 업데이트
  useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [currentChapterId, chapter?.nodes, setNodes, setEdges, initialNodes, initialEdges])

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
      } else {
        // 일반 exec-out 연결
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

  // 키보드 이벤트 (삭제)
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        selectedNodeIds.forEach(deleteNode)
      }
    },
    [selectedNodeIds, deleteNode]
  )

  return (
    <div className={styles.canvas} onKeyDown={onKeyDown} tabIndex={0}>
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
        fitView
        snapToGrid
        snapGrid={[20, 20]}
        defaultEdgeOptions={{
          type: 'smoothstep',
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
              dialogue: '#4A6FA5',
              choice: '#8B4A6B',
              battle: '#C62828',
              shop: '#2E7D32',
              event: '#F9A825',
              chapter_end: '#37474F',
            }
            return colors[node.type || 'dialogue'] || '#666'
          }}
          maskColor="rgba(0, 0, 0, 0.8)"
        />
      </ReactFlow>
    </div>
  )
}
