import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import './index.css'

// 웹뷰 기본 컨텍스트 메뉴 비활성화
document.addEventListener('contextmenu', (e) => {
  e.preventDefault()
})

// --dev 옵션으로 실행 시 개발자 도구 열기
async function checkDevMode() {
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    const isDevMode = await invoke<boolean>('check_dev_mode')
    if (isDevMode) {
      console.log('[DevMode] Opening DevTools...')
      invoke('toggle_devtools')
    }
  } catch {
    // 웹 환경이거나 Tauri가 아닌 경우 무시
  }
}

checkDevMode()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
