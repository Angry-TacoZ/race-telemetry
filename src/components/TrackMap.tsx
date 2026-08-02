import { useEffect, useRef } from 'react'
import type { AlertLevel, TelemetrySample } from '../telemetry/types'

interface TrackMapProps {
  sample: TelemetrySample
  alertLevel: AlertLevel
  stale: boolean
  lap: number
}

const TRACK_PATH = 'M 96 241 C 54 210, 59 133, 108 99 C 145 72, 193 91, 214 61 C 243 20, 332 31, 359 78 C 376 107, 360 137, 402 154 C 462 179, 456 260, 394 280 C 345 296, 307 260, 264 281 C 208 310, 135 290, 96 241 Z'

export function TrackMap({ sample, alertLevel, stale, lap }: TrackMapProps) {
  const pathRef = useRef<SVGPathElement>(null)
  const markerRef = useRef<SVGGElement>(null)

  useEffect(() => {
    const path = pathRef.current
    const marker = markerRef.current
    if (!path || !marker || typeof path.getTotalLength !== 'function' || typeof path.getPointAtLength !== 'function') return
    const point = path.getPointAtLength(path.getTotalLength() * sample.trackProgress)
    const next = path.getPointAtLength(path.getTotalLength() * ((sample.trackProgress + 0.004) % 1))
    const rotation = Math.atan2(next.y - point.y, next.x - point.x) * (180 / Math.PI)
    marker.setAttribute('transform', `translate(${point.x} ${point.y}) rotate(${rotation})`)
  }, [sample.trackProgress])

  const delta = Math.sin(sample.trackProgress * Math.PI * 5) * 0.34 - 0.08

  return (
    <section className={`track-workspace ${stale ? 'is-stale' : ''}`} aria-label="Test Circuit live position">
      <div className="track-heading">
        <div>
          <span className="eyebrow">GPS POSITION</span>
          <h2>Test Circuit</h2>
        </div>
        <div className="lap-delta">
          <span>LAP {lap}</span>
          <strong className={delta > 0 ? 'delta-negative' : 'delta-positive'}>{delta > 0 ? '+' : ''}{delta.toFixed(3)}</strong>
        </div>
      </div>

      <svg className="track-map" viewBox="0 0 500 340" role="img" aria-label={`Car 01 at ${Math.round(sample.trackProgress * 100)} percent of the lap`}>
        <defs>
          <filter id="trackGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path className="track-shadow" d={TRACK_PATH} />
        <path ref={pathRef} className="track-line" d={TRACK_PATH} pathLength="100" />
        <circle className="sector-marker" cx="214" cy="61" r="5" />
        <circle className="sector-marker" cx="432" cy="215" r="5" />
        <circle className="sector-marker" cx="205" cy="296" r="5" />
        <text className="sector-label" x="222" y="50">S1</text>
        <text className="sector-label" x="441" y="214">S2</text>
        <text className="sector-label" x="205" y="323">S3</text>
        <g ref={markerRef} className={`car-marker alert-${alertLevel}`} filter="url(#trackGlow)">
          <circle r="12" />
          <path d="M 10 0 L -7 -6 L -4 0 L -7 6 Z" />
        </g>
      </svg>

      <div className="primary-readout">
        <div><span>GEAR</span><strong>{sample.gear}</strong></div>
        <div><span>SPEED</span><strong>{Math.round(sample.speed)}</strong><small>MPH</small></div>
        <div><span>ENGINE</span><strong>{Math.round(sample.rpm / 10) * 10}</strong><small>RPM</small></div>
      </div>
    </section>
  )
}
