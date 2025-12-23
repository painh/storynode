import type { StoryNode } from '../types/story'

interface LayoutResult {
  [nodeId: string]: { x: number; y: number }
}

const NODE_WIDTH = 260
const NODE_HEIGHT = 100
const HORIZONTAL_GAP = 80
const VERTICAL_GAP = 40
const SNAP_GRID = 20

// snap grid에 맞추기
const snap = (value: number) => Math.round(value / SNAP_GRID) * SNAP_GRID

/**
 * 스토리 노드들을 연결 관계에 따라 자동 배치
 * - DFS 기반으로 메인 흐름을 따라가며 배치
 * - choice 분기는 세로로 분산
 * - 합류점은 가장 깊은 레벨에 배치
 */
export function autoLayoutNodes(
  nodes: StoryNode[],
  startNodeId?: string
): LayoutResult {
  if (nodes.length === 0) return {}

  const result: LayoutResult = {}
  const visited = new Set<string>()
  const nodeMap = new Map(nodes.map(n => [n.id, n]))

  // 각 노드가 몇 번 참조되는지 카운트 (합류점 찾기)
  const incomingCount = new Map<string, number>()
  nodes.forEach(node => {
    if (node.nextNodeId) {
      incomingCount.set(node.nextNodeId, (incomingCount.get(node.nextNodeId) || 0) + 1)
    }
    node.choices?.forEach(choice => {
      if (choice.nextNodeId) {
        incomingCount.set(choice.nextNodeId, (incomingCount.get(choice.nextNodeId) || 0) + 1)
      }
    })
  })

  // startNodeId 또는 첫 번째 노드에서 시작
  let startId = startNodeId && nodeMap.has(startNodeId) ? startNodeId : null

  // startNodeId가 없으면 incoming이 0인 노드(루트) 찾기
  if (!startId) {
    for (const node of nodes) {
      if (!incomingCount.has(node.id) || incomingCount.get(node.id) === 0) {
        startId = node.id
        break
      }
    }
  }
  if (!startId) startId = nodes[0].id

  // Y 위치 트래커
  let currentY = 100

  // DFS로 노드 배치
  function layoutNode(nodeId: string, x: number, baseY: number): number {
    if (visited.has(nodeId)) return baseY

    const node = nodeMap.get(nodeId)
    if (!node) return baseY

    visited.add(nodeId)

    // 현재 노드 배치 (snap grid에 맞춤)
    result[nodeId] = { x: snap(x), y: snap(baseY) }

    let nextY = baseY

    // choice 노드: 각 선택지를 세로로 분기
    if (node.choices && node.choices.length > 0) {
      const validChoices = node.choices.filter(c => c.nextNodeId && nodeMap.has(c.nextNodeId))

      if (validChoices.length > 0) {
        let branchY = baseY

        for (let i = 0; i < validChoices.length; i++) {
          const choice = validChoices[i]
          if (choice.nextNodeId && !visited.has(choice.nextNodeId)) {
            const endY = layoutNode(choice.nextNodeId, x + NODE_WIDTH + HORIZONTAL_GAP, branchY)
            branchY = endY + NODE_HEIGHT + VERTICAL_GAP
          }
        }
        nextY = Math.max(nextY, branchY - NODE_HEIGHT - VERTICAL_GAP)
      }
    }
    // 일반 노드: 다음 노드로 진행
    else if (node.nextNodeId && nodeMap.has(node.nextNodeId)) {
      if (!visited.has(node.nextNodeId)) {
        nextY = layoutNode(node.nextNodeId, x + NODE_WIDTH + HORIZONTAL_GAP, baseY)
      }
    }

    return nextY
  }

  // 시작 노드부터 레이아웃
  layoutNode(startId, 100, currentY)

  // 방문하지 않은 노드들 (연결되지 않은 노드) 처리
  // 메인 흐름 아래에 별도 행으로 배치
  const unvisitedNodes = nodes.filter(n => !visited.has(n.id))
  if (unvisitedNodes.length > 0) {
    // 기존 배치된 노드들의 최대 Y 찾기
    const maxY = Math.max(...Object.values(result).map(p => p.y), 0)
    let unvisitedY = maxY + NODE_HEIGHT + VERTICAL_GAP * 3  // 메인 흐름과 간격 두기

    for (const node of unvisitedNodes) {
      if (!visited.has(node.id)) {
        // 이 노드에서 시작하는 서브트리 배치
        const subtreeEndY = layoutNode(node.id, 100, unvisitedY)
        unvisitedY = subtreeEndY + NODE_HEIGHT + VERTICAL_GAP * 2
      }
    }
  }

  return result
}

/**
 * 기존 위치가 없는 노드들만 자동 배치
 * 기존 위치가 있는 노드는 유지
 */
export function autoLayoutNewNodes(
  nodes: StoryNode[],
  existingPositions: LayoutResult,
  startNodeId?: string
): LayoutResult {
  const fullLayout = autoLayoutNodes(nodes, startNodeId)
  const result: LayoutResult = { ...existingPositions }

  for (const nodeId of Object.keys(fullLayout)) {
    if (!existingPositions[nodeId]) {
      result[nodeId] = fullLayout[nodeId]
    }
  }

  return result
}
