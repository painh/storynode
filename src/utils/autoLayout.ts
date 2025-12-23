import type { StoryNode, StoryNodeType } from '../types/story'

interface LayoutResult {
  [nodeId: string]: { x: number; y: number }
}

interface PlacedNode {
  id: string
  x: number
  y: number
  width: number
  height: number
}

// 노드 타입별 너비 (실제 렌더링되는 CSS 기준)
const NODE_WIDTHS: Record<StoryNodeType, number> = {
  start: 200,
  dialogue: 260,
  choice: 260,
  battle: 220,
  shop: 220,
  event: 220,
  chapter_end: 200,
  variable: 260,
  condition: 280,
}

const DEFAULT_NODE_WIDTH = 260
const NODE_HEIGHT = 120
const VERTICAL_GAP = 40
const SNAP_GRID = 1
const MIN_NODE_GAP = 120 // 노드 사이 최소 간격 (연결선 표시용)

const snap = (value: number) => Math.round(value / SNAP_GRID) * SNAP_GRID

function getNodeWidth(node: StoryNode): number {
  const baseWidth = NODE_WIDTHS[node.type] || DEFAULT_NODE_WIDTH

  // 텍스트 길이에 따라 너비 추정 (글자당 약 7px, 최대 500px)
  let textWidth = 0
  if (node.text) {
    textWidth = Math.min(node.text.length * 7, 500)
  }

  // 선택지가 있으면 선택지 텍스트도 고려
  if (node.choices) {
    for (const choice of node.choices) {
      if (choice.text) {
        textWidth = Math.max(textWidth, choice.text.length * 7)
      }
    }
  }

  const estimatedWidth = Math.max(baseWidth, textWidth + 50) // 패딩 포함
  console.log(`[AutoLayout] Node ${node.id} (${node.type}): baseWidth=${baseWidth}, textWidth=${textWidth}, estimatedWidth=${estimatedWidth}`)
  return estimatedWidth
}

/**
 * 두 사각형이 겹치는지 확인
 */
function rectsOverlap(
  x1: number, y1: number, w1: number, h1: number,
  x2: number, y2: number, w2: number, h2: number,
  margin: number = 20
): boolean {
  return !(
    x1 + w1 + margin <= x2 ||
    x2 + w2 + margin <= x1 ||
    y1 + h1 + margin <= y2 ||
    y2 + h2 + margin <= y1
  )
}

/**
 * 스토리 노드들을 연결 관계에 따라 자동 배치
 */
export function autoLayoutNodes(
  nodes: StoryNode[],
  startNodeId?: string
): LayoutResult {
  console.log('[AutoLayout] Starting auto-layout for', nodes.length, 'nodes')
  if (nodes.length === 0) return {}

  const result: LayoutResult = {}
  const nodeMap = new Map(nodes.map(n => [n.id, n]))
  const placed = new Set<string>()
  const placedNodes: PlacedNode[] = []

  // 각 레벨별 X 시작 위치를 추적 (이전 레벨의 최대 너비 기반)
  const levelXPositions: Map<number, number> = new Map()

  // 노드에서 연결된 다음 노드 ID들 가져오기
  function getNextNodeIds(node: StoryNode): string[] {
    const ids: string[] = []

    if (node.nextNodeId && nodeMap.has(node.nextNodeId)) {
      ids.push(node.nextNodeId)
    }

    node.choices?.forEach(choice => {
      if (choice.nextNodeId && nodeMap.has(choice.nextNodeId)) {
        ids.push(choice.nextNodeId)
      }
    })

    node.conditionBranches?.forEach(branch => {
      if (branch.nextNodeId && nodeMap.has(branch.nextNodeId)) {
        ids.push(branch.nextNodeId)
      }
    })

    if (node.defaultNextNodeId && nodeMap.has(node.defaultNextNodeId)) {
      ids.push(node.defaultNextNodeId)
    }

    return ids
  }

  // 각 노드가 몇 번 참조되는지 카운트
  const incomingCount = new Map<string, number>()
  nodes.forEach(node => {
    const nextIds = getNextNodeIds(node)
    nextIds.forEach(nextId => {
      incomingCount.set(nextId, (incomingCount.get(nextId) || 0) + 1)
    })
  })

  // startNodeId 또는 incoming이 0인 노드 찾기
  let startId = startNodeId && nodeMap.has(startNodeId) ? startNodeId : null
  if (!startId) {
    for (const node of nodes) {
      if (!incomingCount.has(node.id) || incomingCount.get(node.id) === 0) {
        startId = node.id
        break
      }
    }
  }
  if (!startId) startId = nodes[0].id

  // 주어진 위치에 노드를 배치할 수 있는지 확인, 불가능하면 Y를 조정
  function findFreePosition(x: number, y: number, width: number, height: number): number {
    let newY = y
    let maxAttempts = 50

    while (maxAttempts > 0) {
      let hasOverlap = false

      for (const p of placedNodes) {
        if (rectsOverlap(x, newY, width, height, p.x, p.y, p.width, p.height)) {
          // 겹치면 해당 노드 바로 아래로 이동
          newY = p.y + p.height + VERTICAL_GAP
          hasOverlap = true
          break
        }
      }

      if (!hasOverlap) break
      maxAttempts--
    }

    return snap(newY)
  }

  // BFS로 레벨별 배치
  interface QueueItem {
    nodeId: string
    level: number
    preferredY: number
  }

  const queue: QueueItem[] = [{ nodeId: startId, level: 0, preferredY: 100 }]
  const levelNodes: Map<number, string[]> = new Map()

  // 첫 번째 패스: 레벨 할당
  while (queue.length > 0) {
    const { nodeId, level, preferredY } = queue.shift()!

    if (placed.has(nodeId)) continue
    placed.add(nodeId)

    if (!levelNodes.has(level)) {
      levelNodes.set(level, [])
    }
    levelNodes.get(level)!.push(nodeId)

    const node = nodeMap.get(nodeId)
    if (!node) continue

    const nextIds = getNextNodeIds(node)
    let nextY = preferredY

    for (let i = 0; i < nextIds.length; i++) {
      const nextId = nextIds[i]
      if (!placed.has(nextId)) {
        queue.push({
          nodeId: nextId,
          level: level + 1,
          preferredY: i === 0 ? preferredY : nextY
        })
        if (i > 0) {
          nextY += NODE_HEIGHT + VERTICAL_GAP
        }
      }
    }
  }

  // 두 번째 패스: 실제 배치
  placed.clear()
  const nodePreferredY = new Map<string, number>()
  nodePreferredY.set(startId, 100)

  // 레벨별 최대 X+width 추적 (다음 레벨 X 위치 계산용)
  const levelMaxRight: Map<number, number> = new Map()
  levelXPositions.set(0, 100) // 첫 레벨은 X=100에서 시작

  // 다시 BFS로 배치
  const placeQueue: QueueItem[] = [{ nodeId: startId, level: 0, preferredY: 100 }]

  while (placeQueue.length > 0) {
    const { nodeId, level, preferredY } = placeQueue.shift()!

    if (placed.has(nodeId)) continue

    const node = nodeMap.get(nodeId)
    if (!node) continue

    placed.add(nodeId)

    const nodeWidth = getNodeWidth(node)

    // 레벨별 X 위치 계산 (이전 레벨의 최대 오른쪽 + 최소 간격)
    if (!levelXPositions.has(level)) {
      const prevLevelMaxRight = levelMaxRight.get(level - 1) || 100
      levelXPositions.set(level, snap(prevLevelMaxRight + MIN_NODE_GAP))
    }
    const x = levelXPositions.get(level)!
    const y = findFreePosition(x, preferredY, nodeWidth, NODE_HEIGHT)

    // 현재 레벨의 최대 오른쪽 업데이트
    const currentRight = x + nodeWidth
    levelMaxRight.set(level, Math.max(levelMaxRight.get(level) || 0, currentRight))

    console.log(`[AutoLayout] Placing node ${nodeId} at (${x}, ${y}), width=${nodeWidth}, level=${level}, maxRight=${currentRight}`)

    result[nodeId] = { x, y }
    placedNodes.push({ id: nodeId, x, y, width: nodeWidth, height: NODE_HEIGHT })

    // 자식 노드들 큐에 추가
    const nextIds = getNextNodeIds(node)
    let childY = y

    for (let i = 0; i < nextIds.length; i++) {
      const nextId = nextIds[i]
      if (!placed.has(nextId)) {
        placeQueue.push({
          nodeId: nextId,
          level: level + 1,
          preferredY: childY
        })
        // 분기일 경우 다음 분기는 현재 노드 아래에 배치 시도
        if (nextIds.length > 1) {
          childY += NODE_HEIGHT + VERTICAL_GAP
        }
      }
    }
  }

  // 아직 배치되지 않은 노드들 (연결되지 않은 노드들)
  const unplacedNodes = nodes.filter(n => !placed.has(n.id))

  if (unplacedNodes.length > 0) {
    let globalMaxY = 100
    for (const p of placedNodes) {
      globalMaxY = Math.max(globalMaxY, p.y + p.height)
    }

    for (const node of unplacedNodes) {
      if (!placed.has(node.id)) {
        placed.add(node.id)
        const nodeWidth = getNodeWidth(node)
        const x = snap(100)
        const y = findFreePosition(x, globalMaxY + VERTICAL_GAP * 2, nodeWidth, NODE_HEIGHT)

        result[node.id] = { x, y }
        placedNodes.push({ id: node.id, x, y, width: nodeWidth, height: NODE_HEIGHT })
        globalMaxY = Math.max(globalMaxY, y + NODE_HEIGHT)
      }
    }
  }

  console.log('[AutoLayout] Layout complete. Level X positions:', Object.fromEntries(levelXPositions))
  console.log('[AutoLayout] Level max right edges:', Object.fromEntries(levelMaxRight))

  return result
}

/**
 * 기존 위치가 없는 노드들만 자동 배치
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
