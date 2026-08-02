import type { AlertLevel } from './types'

export class CoolantWarningMachine {
  private level: AlertLevel = 'normal'
  private hotDuration = 0
  private coolDuration = 0

  get current(): AlertLevel {
    return this.level
  }

  reset(): void {
    this.level = 'normal'
    this.hotDuration = 0
    this.coolDuration = 0
  }

  update(temperature: number, deltaSeconds: number): AlertLevel {
    if (temperature >= 235) {
      this.level = 'critical'
      this.hotDuration = 0
      this.coolDuration = 0
      return this.level
    }

    if (this.level === 'normal') {
      this.hotDuration = temperature >= 220 ? this.hotDuration + deltaSeconds : 0
      if (this.hotDuration >= 2) {
        this.level = 'warning'
        this.hotDuration = 0
      }
      return this.level
    }

    if (temperature < 215) {
      this.coolDuration += deltaSeconds
      if (this.coolDuration + 1e-9 >= 5) {
        this.level = 'normal'
        this.coolDuration = 0
      }
    } else {
      this.coolDuration = 0
    }

    return this.level
  }
}
