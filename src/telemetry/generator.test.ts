import { describe, expect, it } from 'vitest'
import { generateTelemetrySample } from './generator'

describe('generateTelemetrySample', () => {
  it('is deterministic for a given session time', () => {
    const first = generateTelemetrySample(27.5, 1000)
    const second = generateTelemetrySample(27.5, 1000)
    expect(second).toEqual(first)
  })

  it('keeps all generated values inside plausible display ranges', () => {
    for (let frame = 0; frame < 75 * 50; frame += 1) {
      const sample = generateTelemetrySample(frame / 50)
      expect(sample.speed).toBeGreaterThanOrEqual(48)
      expect(sample.speed).toBeLessThanOrEqual(178)
      expect(sample.rpm).toBeGreaterThanOrEqual(3900)
      expect(sample.rpm).toBeLessThanOrEqual(8350)
      expect(sample.throttle).toBeGreaterThanOrEqual(0)
      expect(sample.throttle).toBeLessThanOrEqual(100)
      expect(sample.brake).toBeGreaterThanOrEqual(0)
      expect(sample.brake).toBeLessThanOrEqual(100)
      expect(sample.gear).toBeGreaterThanOrEqual(2)
      expect(sample.gear).toBeLessThanOrEqual(6)
      expect(sample.trackProgress).toBeGreaterThanOrEqual(0)
      expect(sample.trackProgress).toBeLessThan(1)
    }
  })
})

