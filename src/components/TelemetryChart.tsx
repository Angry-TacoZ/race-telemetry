import { useEffect, useRef } from 'react'
import type { TelemetrySample } from '../telemetry/types'

export interface ChartSeries {
  label: string
  color: string
  min: number
  max: number
  unit: string
  value: (sample: TelemetrySample) => number
  decimals?: number
  warning?: number
}

interface TelemetryChartProps {
  title: string
  history: readonly TelemetrySample[]
  series: readonly ChartSeries[]
  stale?: boolean
}

export function TelemetryChart({ title, history, series, stale = false }: TelemetryChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    const rect = canvas.getBoundingClientRect()
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    const width = Math.max(1, Math.round(rect.width * ratio))
    const height = Math.max(1, Math.round(rect.height * ratio))
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    const cssWidth = width / ratio
    const cssHeight = height / ratio
    context.clearRect(0, 0, cssWidth, cssHeight)

    context.strokeStyle = 'rgba(255,255,255,0.07)'
    context.lineWidth = 1
    for (let row = 1; row < 4; row += 1) {
      const y = Math.round((cssHeight * row) / 4) + 0.5
      context.beginPath()
      context.moveTo(0, y)
      context.lineTo(cssWidth, y)
      context.stroke()
    }
    for (let column = 1; column < 6; column += 1) {
      const x = Math.round((cssWidth * column) / 6) + 0.5
      context.beginPath()
      context.moveTo(x, 0)
      context.lineTo(x, cssHeight)
      context.stroke()
    }

    const sampleStep = Math.max(1, Math.ceil(history.length / Math.max(cssWidth, 1)))
    series.forEach((item) => {
      if (item.warning !== undefined) {
        const warningY = cssHeight - ((item.warning - item.min) / (item.max - item.min)) * cssHeight
        context.fillStyle = 'rgba(255, 59, 48, 0.08)'
        context.fillRect(0, 0, cssWidth, Math.max(0, warningY))
        context.strokeStyle = 'rgba(255, 91, 80, 0.35)'
        context.setLineDash([5, 5])
        context.beginPath()
        context.moveTo(0, warningY)
        context.lineTo(cssWidth, warningY)
        context.stroke()
        context.setLineDash([])
      }

      context.beginPath()
      context.strokeStyle = item.color
      context.globalAlpha = stale ? 0.42 : 0.96
      context.lineWidth = 1.7
      let plotted = 0
      for (let index = 0; index < history.length; index += sampleStep) {
        const sample = history[index]
        const normalized = Math.min(1, Math.max(0, (item.value(sample) - item.min) / (item.max - item.min)))
        const x = history.length <= 1 ? cssWidth : (index / (history.length - 1)) * cssWidth
        const y = cssHeight - normalized * (cssHeight - 4) - 2
        if (plotted === 0) context.moveTo(x, y)
        else context.lineTo(x, y)
        plotted += 1
      }
      context.stroke()
      context.globalAlpha = 1
    })
  }, [history, series, stale])

  const current = history.at(-1)

  return (
    <section className="telemetry-chart" aria-label={`${title} telemetry plot`}>
      <div className="chart-heading">
        <h2>{title}</h2>
        <div className="chart-values">
          {series.map((item) => (
            <span key={item.label} style={{ '--series-color': item.color } as React.CSSProperties}>
              <i aria-hidden="true" />
              {item.label}{' '}
              <strong>{current ? item.value(current).toFixed(item.decimals ?? 0) : '—'}</strong>
              <small>{item.unit}</small>
            </span>
          ))}
        </div>
      </div>
      <canvas ref={canvasRef} aria-hidden="true" />
    </section>
  )
}

