import { generateTelemetrySample } from './generator'
import { RingBuffer } from './ringBuffer'
import type { Scenario, SimulationSnapshot, TelemetrySample } from './types'
import { CoolantWarningMachine } from './warningMachine'

const FIXED_STEP = 1 / 50
const SESSION_LENGTH = 75
const HISTORY_CAPACITY = 50 * 60

const scenarioTimes: Record<Exclude<Scenario, 'auto'>, number> = {
  healthy: 16,
  warning: 59,
  critical: 69,
}

export class SimulationEngine {
  private readonly history = new RingBuffer<TelemetrySample>(HISTORY_CAPACITY)
  private readonly warningMachine = new CoolantWarningMachine()
  private simulationTime = 0
  private accumulator = 0
  private age = 0
  private isRunning = true
  private speed = 1
  private selectedScenario: Scenario = 'auto'
  private linkLost = false
  private latest = generateTelemetrySample(0)
  private completedLaps = 0

  constructor() {
    this.history.push(this.latest)
  }

  tick(realDeltaSeconds: number): SimulationSnapshot {
    const boundedDelta = Math.min(Math.max(realDeltaSeconds, 0), 0.25)
    if (this.linkLost) {
      this.age += boundedDelta
      return this.snapshot()
    }

    if (!this.isRunning) {
      return this.snapshot()
    }

    this.accumulator += boundedDelta * this.speed
    while (this.accumulator >= FIXED_STEP) {
      this.step(FIXED_STEP)
      this.accumulator -= FIXED_STEP
    }
    return this.snapshot()
  }

  toggleRunning(): SimulationSnapshot {
    this.isRunning = !this.isRunning
    return this.snapshot()
  }

  setPlaybackRate(rate: number): SimulationSnapshot {
    this.speed = [0.5, 1, 2].includes(rate) ? rate : 1
    return this.snapshot()
  }

  setLinkLost(lost: boolean): SimulationSnapshot {
    this.linkLost = lost
    if (!lost) this.age = 0
    return this.snapshot()
  }

  setScenario(scenario: Scenario): SimulationSnapshot {
    this.selectedScenario = scenario
    if (scenario === 'auto') {
      return this.restart()
    }
    this.seek(scenarioTimes[scenario])
    return this.snapshot()
  }

  restart(): SimulationSnapshot {
    this.simulationTime = 0
    this.completedLaps = 0
    this.accumulator = 0
    this.age = 0
    this.linkLost = false
    this.isRunning = true
    this.history.clear()
    this.warningMachine.reset()
    this.latest = generateTelemetrySample(0)
    this.history.push(this.latest)
    return this.snapshot()
  }

  getSnapshot(): SimulationSnapshot {
    return this.snapshot()
  }

  private seek(targetTime: number): void {
    this.simulationTime = Math.max(0, targetTime - 6)
    this.accumulator = 0
    this.age = 0
    this.linkLost = false
    this.isRunning = true
    this.history.clear()
    this.warningMachine.reset()
    this.latest = generateTelemetrySample(this.simulationTime)
    this.history.push(this.latest)
    while (this.simulationTime < targetTime) {
      this.step(FIXED_STEP)
    }
  }

  private step(deltaSeconds: number): void {
    this.simulationTime += deltaSeconds
    if (this.simulationTime >= SESSION_LENGTH) {
      this.simulationTime -= SESSION_LENGTH
      this.completedLaps += 1
      this.history.clear()
      this.warningMachine.reset()
    }
    this.latest = generateTelemetrySample(this.simulationTime)
    this.history.push(this.latest)
    this.warningMachine.update(this.latest.coolantTemp, deltaSeconds)
    this.age = 0
  }

  private snapshot(): SimulationSnapshot {
    return {
      sample: this.latest,
      history: this.history.toArray(),
      alertLevel: this.warningMachine.current,
      linkState: this.linkLost ? 'stale' : 'online',
      sampleAge: this.age,
      running: this.isRunning,
      playbackRate: this.speed,
      scenario: this.selectedScenario,
      lap: this.completedLaps + 12,
      currentLapTime: this.simulationTime,
      bestLapTime: 72.418,
    }
  }
}
