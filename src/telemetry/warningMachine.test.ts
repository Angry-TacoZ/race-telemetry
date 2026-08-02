import { describe, expect, it } from 'vitest'
import { CoolantWarningMachine } from './warningMachine'

describe('CoolantWarningMachine', () => {
  it('requires a two-second dwell before warning', () => {
    const machine = new CoolantWarningMachine()
    for (let index = 0; index < 99; index += 1) machine.update(224, 0.02)
    expect(machine.current).toBe('normal')
    machine.update(224, 0.02)
    expect(machine.current).toBe('warning')
  })

  it('enters critical immediately at 235°F', () => {
    const machine = new CoolantWarningMachine()
    expect(machine.update(235, 0.02)).toBe('critical')
  })

  it('clears only after five seconds below 215°F', () => {
    const machine = new CoolantWarningMachine()
    machine.update(239, 0.02)
    for (let index = 0; index < 249; index += 1) machine.update(210, 0.02)
    expect(machine.current).toBe('critical')
    machine.update(210, 0.02)
    expect(machine.current).toBe('normal')
  })
})

