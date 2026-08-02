import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1))
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null)
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('discloses simulated data and presents engineer status', () => {
    render(<App />)
    expect(screen.getByText('SIMULATED DATA')).toBeInTheDocument()
    expect(screen.getByText('POWERTRAIN NOMINAL')).toBeInTheDocument()
    expect(screen.getByText('Test Circuit')).toBeInTheDocument()
  })

  it('provides keyboard-accessible scenario and link controls', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /demo/i }))
    fireEvent.click(screen.getByRole('button', { name: 'WARNING' }))
    expect(screen.getByText('COOLANT TEMPERATURE HIGH')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('checkbox', { name: /simulate link loss/i }))
    expect(screen.getByText('TELEMETRY LINK LOST')).toBeInTheDocument()
    expect(screen.getByText('STALE')).toBeInTheDocument()
  })
})
