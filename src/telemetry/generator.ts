import type { TelemetrySample } from './types'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const smoothstep = (edge0: number, edge1: number, value: number) => {
  const x = clamp((value - edge0) / (edge1 - edge0), 0, 1)
  return x * x * (3 - 2 * x)
}

const deterministicNoise = (time: number, seed: number) => {
  return (
    Math.sin(time * 2.73 + seed * 11.17) * 0.55 +
    Math.sin(time * 7.11 + seed * 3.91) * 0.3 +
    Math.sin(time * 13.37 + seed) * 0.15
  )
}

export const generateTelemetrySample = (sessionTime: number, timestamp = Date.now()): TelemetrySample => {
  const t = ((sessionTime % 75) + 75) % 75
  const progress = t / 75
  const cornerWave = (Math.sin(progress * Math.PI * 8.0 - 0.7) + 1) / 2
  const secondaryCorners = (Math.sin(progress * Math.PI * 14 + 1.2) + 1) / 2
  const brakingZone = Math.pow(cornerWave, 4)
  const speed = clamp(168 - brakingZone * 91 - secondaryCorners * 25 + deterministicNoise(t, 1) * 2.5, 48, 178)
  const brake = clamp(brakingZone * 105 + deterministicNoise(t, 2) * 4 - 4, 0, 100)
  const throttle = clamp(96 - brake * 1.05 - secondaryCorners * 18 + deterministicNoise(t, 3) * 5, 0, 100)
  const gear = speed > 151 ? 6 : speed > 124 ? 5 : speed > 96 ? 4 : speed > 69 ? 3 : 2
  const rpmBase = 4300 + ((speed * (7 - gear) * 8.4) % 3900)
  const rpm = clamp(rpmBase + deterministicNoise(t, 4) * 110, 3900, 8350)

  const warningRise = smoothstep(45, 60, t)
  const criticalRise = smoothstep(61, 70, t)
  const coolantTemp = 207 + Math.sin(t * 0.24) * 1.7 + warningRise * 23 + criticalRise * 9 + deterministicNoise(t, 5) * 0.45
  const oilTemp = 224 + Math.sin(t * 0.11 + 0.8) * 2.2 + warningRise * 7 + deterministicNoise(t, 6) * 0.6
  const oilPressure = clamp(36 + rpm * 0.0063 - oilTemp * 0.03 + deterministicNoise(t, 7) * 1.1, 42, 88)
  const fuelPressure = clamp(55.5 + throttle * 0.018 + deterministicNoise(t, 8) * 0.5, 54, 59)
  const lateralG = clamp(Math.sin(progress * Math.PI * 8 - 0.2) * 1.92 + Math.sin(progress * Math.PI * 14) * 0.28, -2.15, 2.15)
  const longitudinalG = clamp(throttle * 0.009 - brake * 0.021 + deterministicNoise(t, 9) * 0.035, -2.25, 0.95)

  return {
    timestamp,
    sessionTime,
    speed,
    rpm,
    throttle,
    brake,
    coolantTemp,
    oilTemp,
    oilPressure,
    fuelPressure,
    batteryVoltage: 13.8 + deterministicNoise(t, 10) * 0.08,
    lateralG,
    longitudinalG,
    gear,
    gpsQuality: clamp(98 + deterministicNoise(t, 11) * 1.2, 94, 100),
    trackProgress: progress,
  }
}

