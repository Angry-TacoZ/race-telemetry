export type AlertLevel = 'normal' | 'warning' | 'critical'
export type LinkState = 'online' | 'stale'
export type Scenario = 'auto' | 'healthy' | 'warning' | 'critical'

export interface TelemetrySample {
  timestamp: number
  sessionTime: number
  speed: number
  rpm: number
  throttle: number
  brake: number
  coolantTemp: number
  oilTemp: number
  oilPressure: number
  fuelPressure: number
  batteryVoltage: number
  lateralG: number
  longitudinalG: number
  gear: number
  gpsQuality: number
  trackProgress: number
}

export interface SimulationSnapshot {
  sample: TelemetrySample
  history: readonly TelemetrySample[]
  alertLevel: AlertLevel
  linkState: LinkState
  sampleAge: number
  running: boolean
  playbackRate: number
  scenario: Scenario
  lap: number
  currentLapTime: number
  bestLapTime: number
}

