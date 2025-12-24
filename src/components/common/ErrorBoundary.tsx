import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  private handleClose = async () => {
    // Tauri 앱 강제 종료
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window')
      const window = getCurrentWindow()
      await window.destroy()
    } catch {
      // 웹 환경이거나 Tauri가 아닌 경우 그냥 새로고침
      window.location.reload()
    }
  }

  private handleReload = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#1e1e1e',
          color: '#fff',
          padding: '40px',
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
        }}>
          <h1 style={{ color: '#f44336', marginBottom: '20px' }}>
            앱에서 오류가 발생했습니다
          </h1>

          <p style={{ color: '#aaa', marginBottom: '30px' }}>
            예기치 않은 오류로 앱이 중단되었습니다. 아래 정보를 개발자에게 전달해주세요.
          </p>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
            <button
              onClick={this.handleReload}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4caf50',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              새로고침
            </button>
            <button
              onClick={this.handleClose}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f44336',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              앱 종료
            </button>
          </div>

          <div style={{
            backgroundColor: '#2d2d2d',
            padding: '20px',
            borderRadius: '8px',
            flex: 1,
            overflow: 'auto',
          }}>
            <h3 style={{ color: '#ff9800', marginBottom: '10px' }}>오류 메시지:</h3>
            <pre style={{
              color: '#f44336',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              marginBottom: '20px',
            }}>
              {this.state.error?.toString()}
            </pre>

            <h3 style={{ color: '#ff9800', marginBottom: '10px' }}>스택 트레이스:</h3>
            <pre style={{
              color: '#888',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontSize: '12px',
            }}>
              {this.state.error?.stack}
            </pre>

            {this.state.errorInfo && (
              <>
                <h3 style={{ color: '#ff9800', marginTop: '20px', marginBottom: '10px' }}>
                  컴포넌트 스택:
                </h3>
                <pre style={{
                  color: '#888',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: '12px',
                }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
