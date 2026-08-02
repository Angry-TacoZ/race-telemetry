import type { AlertLevel, TelemetrySample } from '../telemetry/types'

interface SignalRailProps {
  sample: TelemetrySample
  alertLevel: AlertLevel
  stale: boolean
}

interface SignalDefinition {
  label: string
  unit: string
  decimals: number
  value: (sample: TelemetrySample) => number
  status?: (level: AlertLevel) => AlertLevel
}

const signals: SignalDefinition[] = [
  { label: 'COOLANT', unit: '°F', decimals: 0, value: (sample) => sample.coolantTemp, status: (level) => level },
  { label: 'OIL TEMP', unit: '°F', decimals: 0, value: (sample) => sample.oilTemp },
  { label: 'OIL PRESS', unit: 'PSI', decimals: 1, value: (sample) => sample.oilPressure },
  { label: 'FUEL PRESS', unit: 'PSI', decimals: 1, value: (sample) => sample.fuelPressure },
  { label: 'BATTERY', unit: 'V', decimals: 1, value: (sample) => sample.batteryVoltage },
  { label: 'LATERAL', unit: 'G', decimals: 2, value: (sample) => sample.lateralG },
  { label: 'LONGITUDINAL', unit: 'G', decimals: 2, value: (sample) => sample.longitudinalG },
  { label: 'GPS QUALITY', unit: '%', decimals: 0, value: (sample) => sample.gpsQuality },
]

export function SignalRail({ sample, alertLevel, stale }: SignalRailProps) {
  return (
    <section className={`signal-rail ${stale ? 'is-stale' : ''}`} aria-label="Current telemetry signals">
      {signals.map((signal) => {
        const status = signal.status?.(alertLevel) ?? 'normal'
        return (
          <div className={`signal-value signal-${status}`} key={signal.label}>
            <span>{signal.label}</span>
            <div><strong>{signal.value(sample).toFixed(signal.decimals)}</strong><small>{signal.unit}</small></div>
            {status !== 'normal' && <em>{status === 'critical' ? 'CRITICAL' : 'HIGH'}</em>}
          </div>
        )
      })}
    </section>
  )
}

