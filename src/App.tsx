import { useEffect, useRef, useState } from 'react'
import { DemoControls } from './components/DemoControls'
import { SignalRail } from './components/SignalRail'
import { TelemetryChart, type ChartSeries } from './components/TelemetryChart'
import { TrackMap } from './components/TrackMap'
import { useTelemetrySimulation } from './hooks'
import type { AlertLevel } from './telemetry/types'

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds - minutes * 60
  return `${minutes}:${remainder.toFixed(3).padStart(6, '0')}`
}

const powerSeries: ChartSeries[] = [
  { label: 'SPEED', color: '#f3f4f6', min: 0, max: 190, unit: 'MPH', value: (sample) => sample.speed },
  { label: 'RPM', color: '#747981', min: 0, max: 9000, unit: 'RPM', value: (sample) => sample.rpm },
]

const pedalSeries: ChartSeries[] = [
  { label: 'THROTTLE', color: '#f3f4f6', min: 0, max: 100, unit: '%', value: (sample) => sample.throttle },
  { label: 'BRAKE', color: '#747981', min: 0, max: 100, unit: '%', value: (sample) => sample.brake },
]

const temperatureSeries: ChartSeries[] = [
  { label: 'COOLANT', color: '#f3f4f6', min: 180, max: 250, unit: '°F', value: (sample) => sample.coolantTemp, warning: 220 },
  { label: 'OIL', color: '#747981', min: 180, max: 250, unit: '°F', value: (sample) => sample.oilTemp },
]

const pressureSeries: ChartSeries[] = [
  { label: 'OIL PRESS', color: '#f3f4f6', min: 0, max: 100, unit: 'PSI', value: (sample) => sample.oilPressure, decimals: 1 },
  { label: 'FUEL PRESS', color: '#747981', min: 0, max: 100, unit: 'PSI', value: (sample) => sample.fuelPressure, decimals: 1 },
]

const alertCopy: Record<AlertLevel, { title: string; detail: string }> = {
  normal: { title: 'POWERTRAIN NOMINAL', detail: 'All monitored channels inside configured limits.' },
  warning: { title: 'COOLANT TEMPERATURE HIGH', detail: 'Temperature above 220°F for 2 seconds. Monitor trend and prepare pit instruction.' },
  critical: { title: 'COOLANT TEMPERATURE CRITICAL', detail: 'Temperature above 235°F. Recommend immediate cool-down and pit intervention.' },
}

function App() {
  const [snapshot, controls] = useTelemetrySimulation()
  const [audioArmed, setAudioArmed] = useState(false)
  const previousAlert = useRef(snapshot.alertLevel)
  const stale = snapshot.linkState === 'stale'
  const clock = new Date().toLocaleTimeString('en-US', { hour12: false })

  useEffect(() => {
    if (audioArmed && previousAlert.current === 'normal' && snapshot.alertLevel !== 'normal') {
      const AudioContextClass = window.AudioContext
      const context = new AudioContextClass()
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.frequency.value = snapshot.alertLevel === 'critical' ? 880 : 660
      gain.gain.setValueAtTime(0.0001, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.22)
      oscillator.connect(gain).connect(context.destination)
      oscillator.start()
      oscillator.stop(context.currentTime + 0.24)
      oscillator.addEventListener('ended', () => void context.close())
    }
    previousAlert.current = snapshot.alertLevel
  }, [audioArmed, snapshot.alertLevel])

  return (
    <main className={`dashboard alert-${snapshot.alertLevel} ${stale ? 'link-stale' : ''}`}>
      <header className="top-bar">
        <div className="product-lockup">
          <span className="wordmark">TELEMETRY</span>
          <span className="simulation-badge">SIMULATED DATA</span>
        </div>
        <div className="top-stat"><span>CAR</span><strong>01</strong></div>
        <div className="top-stat"><span>LAP</span><strong>{snapshot.lap}</strong></div>
        <div className="top-stat wide"><span>CURRENT</span><strong>{formatDuration(snapshot.currentLapTime)}</strong></div>
        <div className="top-stat wide"><span>BEST</span><strong>{formatDuration(snapshot.bestLapTime)}</strong></div>
        <div className={`link-status ${stale ? 'is-stale' : ''}`} role="status" aria-live="polite">
          <i aria-hidden="true" />
          <div><span>SAT LINK</span><strong>{stale ? 'STALE' : 'ONLINE'}</strong></div>
          <small>{stale ? `${snapshot.sampleAge.toFixed(1)}s OLD` : '42ms'}</small>
        </div>
        <div className="clock"><span>LOCAL</span><strong>{clock}</strong></div>
      </header>

      <div className="workspace">
        <div className="charts-column">
          <TelemetryChart title="VEHICLE SPEED / ENGINE" history={snapshot.history} series={powerSeries} stale={stale} />
          <TelemetryChart title="DRIVER INPUT" history={snapshot.history} series={pedalSeries} stale={stale} />
          <TelemetryChart title="THERMAL" history={snapshot.history} series={temperatureSeries} stale={stale} />
          <TelemetryChart title="PRESSURE" history={snapshot.history} series={pressureSeries} stale={stale} />
        </div>
        <TrackMap sample={snapshot.sample} alertLevel={snapshot.alertLevel} stale={stale} lap={snapshot.lap} />
      </div>

      <section className={`engineer-alert alert-${snapshot.alertLevel}`} role="status" aria-live="polite">
        <div className="alert-symbol" aria-hidden="true">{stale || snapshot.alertLevel !== 'normal' ? '!' : '✓'}</div>
        <div><strong>{stale ? 'TELEMETRY LINK LOST' : alertCopy[snapshot.alertLevel].title}</strong><span>{stale ? `Last valid sample ${snapshot.sampleAge.toFixed(1)} seconds ago. Values frozen pending link recovery.` : alertCopy[snapshot.alertLevel].detail}</span></div>
        <button type="button" className={audioArmed ? 'audio-active' : ''} onClick={() => setAudioArmed((current) => !current)} aria-pressed={audioArmed}>{audioArmed ? 'AUDIO ARMED' : 'AUDIO MUTED'}</button>
      </section>

      <SignalRail sample={snapshot.sample} alertLevel={snapshot.alertLevel} stale={stale} />
      <DemoControls snapshot={snapshot} controls={controls} />
    </main>
  )
}

export default App
