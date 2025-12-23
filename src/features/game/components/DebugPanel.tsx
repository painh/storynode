// 디버그 패널 컴포넌트

import { useMemo } from 'react'
import { useGameStore } from '../../../stores/gameStore'
import styles from '../styles/DebugPanel.module.css'

export function DebugPanel() {
  const { debug, setDebugOption, gameState, currentNode } = useGameStore()

  const recentHistory = useMemo(() => {
    if (!gameState) return []
    return gameState.history.slice(-5).reverse()
  }, [gameState?.history])

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const renderFlags = () => {
    if (!gameState) return null
    const flags = Object.entries(gameState.variables.flags)
    if (flags.length === 0) {
      return <div className={styles.emptyMessage}>No flags set</div>
    }
    return (
      <div className={styles.flagsList}>
        {flags.map(([key, value]) => (
          <span
            key={key}
            className={`${styles.flagItem} ${value === true ? styles.true : value === false ? styles.false : ''}`}
          >
            {key}: {String(value)}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>
          <span>🔧</span>
          Debug
        </span>
        <div className={styles.toggles}>
          <button
            className={`${styles.toggleButton} ${debug.showNodeInfo ? styles.active : ''}`}
            onClick={() => setDebugOption('showNodeInfo', !debug.showNodeInfo)}
          >
            Node
          </button>
          <button
            className={`${styles.toggleButton} ${debug.showVariables ? styles.active : ''}`}
            onClick={() => setDebugOption('showVariables', !debug.showVariables)}
          >
            Vars
          </button>
          <button
            className={`${styles.toggleButton} ${debug.showHistory ? styles.active : ''}`}
            onClick={() => setDebugOption('showHistory', !debug.showHistory)}
          >
            Log
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {/* 현재 노드 정보 */}
        {debug.showNodeInfo && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <span>📍</span>
              Current Node
            </div>
            {currentNode ? (
              <div className={styles.nodeInfo}>
                <div className={styles.nodeRow}>
                  <span className={styles.nodeLabel}>Type</span>
                  <span className={`${styles.nodeType} ${styles[currentNode.type]}`}>
                    {currentNode.type}
                  </span>
                </div>
                <div className={styles.nodeRow}>
                  <span className={styles.nodeLabel}>ID</span>
                  <span className={styles.nodeId}>{currentNode.id}</span>
                </div>
                {currentNode.speaker && (
                  <div className={styles.nodeRow}>
                    <span className={styles.nodeLabel}>Speaker</span>
                    <span className={styles.nodeValue}>{currentNode.speaker}</span>
                  </div>
                )}
                {currentNode.nextNodeId && (
                  <div className={styles.nodeRow}>
                    <span className={styles.nodeLabel}>Next</span>
                    <span className={styles.nodeId}>{currentNode.nextNodeId}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.emptyMessage}>No node selected</div>
            )}
          </div>
        )}

        {/* 변수 상태 */}
        {debug.showVariables && gameState && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <span>📊</span>
              Variables
            </div>
            <div className={styles.variablesList}>
              <div className={styles.variableRow}>
                <span className={styles.variableName}>💰 Gold</span>
                <span className={styles.variableValue}>{gameState.variables.gold}</span>
              </div>
              <div className={styles.variableRow}>
                <span className={styles.variableName}>❤️ HP</span>
                <span className={styles.variableValue}>{gameState.variables.hp}</span>
              </div>
              {Object.entries(gameState.variables.affection).map(([charId, value]) => (
                value !== 0 && (
                  <div key={charId} className={styles.variableRow}>
                    <span className={styles.variableName}>💕 {charId}</span>
                    <span className={`${styles.variableValue} ${value > 0 ? styles.positive : value < 0 ? styles.negative : ''}`}>
                      {value > 0 ? '+' : ''}{value}
                    </span>
                  </div>
                )
              ))}
              {Object.entries(gameState.variables.reputation).map(([factionId, value]) => (
                value !== 0 && (
                  <div key={factionId} className={styles.variableRow}>
                    <span className={styles.variableName}>🏛️ {factionId}</span>
                    <span className={`${styles.variableValue} ${value > 0 ? styles.positive : value < 0 ? styles.negative : ''}`}>
                      {value > 0 ? '+' : ''}{value}
                    </span>
                  </div>
                )
              ))}
            </div>

            {/* 플래그 */}
            <div className={styles.sectionTitle} style={{ marginTop: 12 }}>
              <span>🚩</span>
              Flags
            </div>
            {renderFlags()}
          </div>
        )}

        {/* 히스토리 */}
        {debug.showHistory && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <span>📜</span>
              Recent History
            </div>
            {recentHistory.length > 0 ? (
              <div className={styles.historyList}>
                {recentHistory.map((entry, idx) => (
                  <div
                    key={`${entry.nodeId}-${entry.timestamp}-${idx}`}
                    className={`${styles.historyItem} ${styles[entry.type]}`}
                  >
                    <div className={styles.historyHeader}>
                      <span className={styles.historySpeaker}>
                        {entry.speaker || entry.type}
                      </span>
                      <span className={styles.historyTime}>
                        {formatTime(entry.timestamp)}
                      </span>
                    </div>
                    {entry.content && (
                      <div className={styles.historyText}>{entry.content}</div>
                    )}
                    {entry.choiceText && (
                      <div className={styles.historyChoice}>
                        → {entry.choiceText}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyMessage}>No history yet</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
