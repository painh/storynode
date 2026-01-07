import { create } from 'zustand'

/**
 * Embed Mode Store
 * iframe으로 다른 앱에 임베드될 때 사용
 * URL 파라미터: ?embed=true&projectId=main&serverUrl=http://localhost:3001
 */

// 외부 변수 정의 (읽기 전용 참조용)
export interface ExternalVariableDefinition {
  path: string        // dot notation 경로 (예: "gold", "party.0.hp")
  type: 'number' | 'string' | 'boolean' | 'array' | 'object'
  description?: string
  example?: string    // 예시 값
}

export interface EmbedConfig {
  // 임베드 모드 활성화 여부
  isEmbedMode: boolean
  // 프로젝트 ID (고정)
  projectId: string | null
  // 서버 API URL
  serverUrl: string | null
  // 외부 변수 정의 (Wizardry gameStore 등)
  externalVariables: ExternalVariableDefinition[]
}

interface EmbedState extends EmbedConfig {
  // 초기화 (URL 파라미터에서 설정 읽기)
  initialize: () => void
  // 외부 변수 설정
  setExternalVariables: (variables: ExternalVariableDefinition[]) => void
}

const defaultConfig: EmbedConfig = {
  isEmbedMode: false,
  projectId: null,
  serverUrl: null,
  externalVariables: [],
}

export const useEmbedStore = create<EmbedState>((set) => ({
  ...defaultConfig,

  initialize: () => {
    const params = new URLSearchParams(window.location.search)

    const isEmbedMode = params.get('embed') === 'true'
    const projectId = params.get('projectId')
    const serverUrl = params.get('serverUrl')

    console.log('[EmbedStore] URL:', window.location.href)
    console.log('[EmbedStore] Search:', window.location.search)
    console.log('[EmbedStore] Params:', { embed: params.get('embed'), projectId, serverUrl })
    console.log('[EmbedStore] isEmbedMode:', isEmbedMode)

    set({
      isEmbedMode,
      projectId,
      serverUrl,
    })

    // 임베드 모드일 때 부모 윈도우로부터 메시지 수신 설정
    if (isEmbedMode && window.parent !== window) {
      console.log('[EmbedStore] Setting up message listener for external variables')

      window.addEventListener('message', (event) => {
        console.log('[EmbedStore] Received message:', event.data?.type)
        if (event.data?.type === 'storynode:setExternalVariables') {
          console.log('[EmbedStore] Received external variables:', event.data.variables?.length, 'items')
          set({ externalVariables: event.data.variables || [] })
        }
      })

      // 부모에게 준비 완료 알림
      console.log('[EmbedStore] Sending storynode:ready to parent')
      window.parent.postMessage({ type: 'storynode:ready' }, '*')
    }
  },

  setExternalVariables: (variables) => {
    set({ externalVariables: variables })
  },
}))
