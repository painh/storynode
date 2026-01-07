import { create } from 'zustand'

/**
 * Embed Mode Store
 * iframe으로 다른 앱에 임베드될 때 사용
 * URL 파라미터: ?embed=true&projectId=main&serverUrl=http://localhost:3001
 */

export interface EmbedConfig {
  // 임베드 모드 활성화 여부
  isEmbedMode: boolean
  // 프로젝트 ID (고정)
  projectId: string | null
  // 서버 API URL
  serverUrl: string | null
}

interface EmbedState extends EmbedConfig {
  // 초기화 (URL 파라미터에서 설정 읽기)
  initialize: () => void
}

const defaultConfig: EmbedConfig = {
  isEmbedMode: false,
  projectId: null,
  serverUrl: null,
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
  },
}))
