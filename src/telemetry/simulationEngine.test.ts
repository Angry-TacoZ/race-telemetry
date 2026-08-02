import { describe, expect, it } from 'vitest'
import { SimulationEngine } from './simulationEngine'

describe('SimulationEngine', () => {
  it('generates fifty samples per simulated second', () => {
    const engine = new SimulationEngine()
    engine.tick(0.25)
    engine.tick(0.25)
    engine.tick(0.25)
    const snapshot = engine.tick(0.25)
    expect(snapshot.history.length).toBe(51)
  })

  it('freezes values and increments age during link loss', () => {
    const engine = new SimulationEngine()
    engine.tick(0.2)
    const before = engine.getSnapshot().sample
    engine.setLinkLost(true)
    engine.tick(0.25)
    engine.tick(0.25)
    const stale = engine.getSnapshot()

    expect(stale.sample).toEqual(before)
    expect(stale.sampleAge).toBeCloseTo(0.5)
    expect(stale.linkState).toBe('stale')

    engine.setLinkLost(false)
    const recovered = engine.tick(0.02)
    expect(recovered.linkState).toBe('online')
    expect(recovered.sampleAge).toBe(0)
  })

  it('seeks to deterministic presenter scenarios', () => {
    const engine = new SimulationEngine()
    const warning = engine.setScenario('warning')
    const critical = engine.setScenario('critical')

    expect(warning.alertLevel).toBe('warning')
    expect(critical.alertLevel).toBe('critical')
  })

  it('supports pause, restart, and allowlisted playback rates', () => {
    const engine = new SimulationEngine()
    const paused = engine.toggleRunning()
    expect(paused.running).toBe(false)
    expect(engine.tick(0.25).sample.sessionTime).toBe(0)
    expect(engine.setPlaybackRate(9).playbackRate).toBe(1)
    expect(engine.setPlaybackRate(2).playbackRate).toBe(2)
    expect(engine.restart().sample.sessionTime).toBe(0)
  })

  it('keeps history bounded through five simulated minutes', () => {
    const engine = new SimulationEngine()
    for (let quarterSecond = 0; quarterSecond < 5 * 60 * 4; quarterSecond += 1) {
      engine.tick(0.25)
    }

    expect(engine.getSnapshot().history.length).toBeLessThanOrEqual(50 * 60)
  })
})
