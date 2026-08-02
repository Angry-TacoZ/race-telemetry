import { useEffect, useState } from 'react'
import type { SimulationControls } from '../hooks'
import type { Scenario, SimulationSnapshot } from '../telemetry/types'

interface DemoControlsProps {
  snapshot: SimulationSnapshot
  controls: SimulationControls
}

const scenarios: Array<{ value: Scenario; label: string }> = [
  { value: 'auto', label: 'AUTO' },
  { value: 'healthy', label: 'HEALTHY' },
  { value: 'warning', label: 'WARNING' },
  { value: 'critical', label: 'CRITICAL' },
]

export function DemoControls({ snapshot, controls }: DemoControlsProps) {
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'd') setExpanded((current) => !current)
      if (event.code === 'Space' && event.target === document.body) {
        event.preventDefault()
        controls.toggleRunning()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [controls])

  return (
    <aside className={`demo-controls ${expanded ? 'is-expanded' : ''}`} aria-label="Demo controls">
      <button className="demo-toggle" type="button" onClick={() => setExpanded((current) => !current)} aria-expanded={expanded}>
        <span>DEMO</span>
        <kbd>D</kbd>
      </button>
      {expanded && (
        <div className="demo-panel">
          <div className="control-row">
            <button type="button" onClick={controls.toggleRunning}>{snapshot.running ? 'PAUSE' : 'RESUME'}</button>
            <button type="button" onClick={controls.restart}>RESTART</button>
          </div>
          <div className="control-group">
            <span>PLAYBACK</span>
            <div className="segmented-control">
              {[0.5, 1, 2].map((rate) => (
                <button type="button" className={snapshot.playbackRate === rate ? 'is-active' : ''} onClick={() => controls.setPlaybackRate(rate)} key={rate}>{rate}×</button>
              ))}
            </div>
          </div>
          <div className="control-group">
            <span>SCENARIO</span>
            <div className="scenario-list">
              {scenarios.map((scenario) => (
                <button type="button" className={snapshot.scenario === scenario.value ? 'is-active' : ''} onClick={() => controls.setScenario(scenario.value)} key={scenario.value}>{scenario.label}</button>
              ))}
            </div>
          </div>
          <label className="link-toggle">
            <input type="checkbox" checked={snapshot.linkState === 'stale'} onChange={(event) => controls.setLinkLost(event.target.checked)} />
            <span>SIMULATE LINK LOSS</span>
          </label>
          <p>Local presentation controls · no vehicle connection</p>
        </div>
      )}
    </aside>
  )
}

