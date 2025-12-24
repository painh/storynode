// 데이터 핸들 설정 시스템 - 언리얼 블루프린트 스타일
import type { StoryNodeType } from '../types/story'

// 데이터 타입
export type DataHandleValueType = 'string' | 'number' | 'boolean' | 'array' | 'object'

// 핸들 방향 (input: 왼쪽, output: 오른쪽, both: 양쪽)
export type DataHandleDirection = 'input' | 'output' | 'both'

// 핸들 정의
export interface DataHandleDefinition {
  id: string                    // 핸들 ID (예: 'speaker', 'imageData.layer')
  label: string                 // 표시 라벨
  type: DataHandleValueType     // 데이터 타입
  path: string                  // 프로퍼티 경로 (점 표기법 지원)
  direction: DataHandleDirection // 입력/출력/양방향
}

// 타입별 색상 정의
export const DATA_HANDLE_COLORS: Record<DataHandleValueType, string> = {
  string: '#E91E63',   // 핑크
  number: '#00BCD4',   // 시안
  boolean: '#FF5722',  // 오렌지
  array: '#FF9800',    // 주황
  object: '#9C27B0',   // 보라
}

// 노드 타입별 데이터 핸들 설정
export const dataHandleConfigs: Partial<Record<StoryNodeType, DataHandleDefinition[]>> = {
  dialogue: [
    { id: 'speaker', label: 'Speaker', type: 'string', path: 'speaker', direction: 'both' },
    { id: 'text', label: 'Text', type: 'string', path: 'text', direction: 'both' },
  ],

  choice: [
    { id: 'text', label: 'Prompt', type: 'string', path: 'text', direction: 'both' },
    { id: 'choices', label: 'Choices', type: 'array', path: 'choices', direction: 'both' },
  ],

  battle: [
    { id: 'battleGroupId', label: 'Battle Group', type: 'string', path: 'battleGroupId', direction: 'both' },
    { id: 'battleRewards', label: 'Rewards', type: 'object', path: 'battleRewards', direction: 'both' },
  ],

  shop: [],

  event: [
    { id: 'eventId', label: 'Event ID', type: 'string', path: 'eventId', direction: 'both' },
  ],

  chapter_end: [
    { id: 'text', label: 'Text', type: 'string', path: 'text', direction: 'both' },
  ],

  variable: [
    { id: 'variableOperations', label: 'Operations', type: 'array', path: 'variableOperations', direction: 'both' },
  ],

  condition: [
    { id: 'conditionBranches', label: 'Branches', type: 'array', path: 'conditionBranches', direction: 'both' },
  ],

  image: [
    { id: 'imageData.resourcePath', label: 'Path', type: 'string', path: 'imageData.resourcePath', direction: 'both' },
    { id: 'imageData.layer', label: 'Layer', type: 'string', path: 'imageData.layer', direction: 'both' },
    { id: 'imageData.layerOrder', label: 'Order', type: 'number', path: 'imageData.layerOrder', direction: 'both' },
    { id: 'imageData.alignment', label: 'Align', type: 'string', path: 'imageData.alignment', direction: 'both' },
    { id: 'imageData.x', label: 'X', type: 'number', path: 'imageData.x', direction: 'both' },
    { id: 'imageData.y', label: 'Y', type: 'number', path: 'imageData.y', direction: 'both' },
  ],

  javascript: [
    { id: 'javascriptCode', label: 'Code', type: 'string', path: 'javascriptCode', direction: 'both' },
  ],

  custom: [
    { id: 'customData.title', label: 'Title', type: 'string', path: 'customData.title', direction: 'both' },
    { id: 'customData.description', label: 'Desc', type: 'string', path: 'customData.description', direction: 'both' },
  ],

  start: [],
}

// 핸들 ID 생성 유틸리티
export function getDataHandleId(path: string, direction: 'input' | 'output'): string {
  return `data-${direction === 'input' ? 'in' : 'out'}-${path}`
}

// 핸들 ID 파싱 유틸리티
export function parseDataHandleId(handleId: string): { path: string; direction: 'input' | 'output' } | null {
  const match = handleId.match(/^data-(in|out)-(.+)$/)
  if (!match) return null
  return {
    direction: match[1] === 'in' ? 'input' : 'output',
    path: match[2],
  }
}

// 노드 타입에 대한 핸들 정의 가져오기
export function getDataHandles(nodeType: StoryNodeType): DataHandleDefinition[] {
  return dataHandleConfigs[nodeType] || []
}

// 입력 핸들만 필터링
export function getInputHandles(nodeType: StoryNodeType): DataHandleDefinition[] {
  return getDataHandles(nodeType).filter(h => h.direction === 'input' || h.direction === 'both')
}

// 출력 핸들만 필터링
export function getOutputHandles(nodeType: StoryNodeType): DataHandleDefinition[] {
  return getDataHandles(nodeType).filter(h => h.direction === 'output' || h.direction === 'both')
}
