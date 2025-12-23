import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { Inspector } from './components/layout/Inspector'
import { Canvas } from './features/canvas/Canvas'
import styles from './App.module.css'

function App() {
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
