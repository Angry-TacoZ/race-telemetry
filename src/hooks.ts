import { useEffect, useState } from 'react'
import { SimulationEngine } from './telemetry/simulationEngine'
import type { Scenario, SimulationSnapshot } from './telemetry/types'

export interface SimulationControls {
  toggleRunning: () => void
  restart: () => void
  setPlaybackRate: (rate: number) => void
  setScenario: (scenario: Scenario) => void
  setLinkLost: (lost: boolean) => void
}

export const useTelemetrySimulation = (): [SimulationSnapshot, SimulationControls] => {
  const [engine] = useState(() => new SimulationEngine())
  const [snapshot, setSnapshot] = useState(() => engine.getSnapshot())

  useEffect(() => {
    let frame = 0
    let previous = performance.now()
    const animate = (now: number) => {
      const delta = (now - previous) / 1000
      previous = now
      setSnapshot(engine.tick(delta))
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [engine])

  const commit = (next: SimulationSnapshot) => setSnapshot(next)
  const controls: SimulationControls = {
    toggleRunning: () => commit(engine.toggleRunning()),
    restart: () => commit(engine.restart()),
    setPlaybackRate: (rate) => commit(engine.setPlaybackRate(rate)),
    setScenario: (scenario) => commit(engine.setScenario(scenario)),
    setLinkLost: (lost) => commit(engine.setLinkLost(lost)),
  }

  return [snapshot, controls]
}
