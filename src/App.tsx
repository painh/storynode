import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { Inspector } from './components/layout/Inspector'
import { Canvas } from './features/canvas/Canvas'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import styles from './App.module.css'

function App() {
  // 전역 단축키 활성화
  useKeyboardShortcuts()

  return (
    <div className={styles.app}>
      <Header />
      <div className={styles.workspace}>
        <Sidebar />
        <Canvas />
        <Inspector />
      </div>
    </div>
  )
}

export default App
