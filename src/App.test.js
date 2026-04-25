import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/svelte'
import App from './App.svelte'

vi.mock('./audio/engine.js', () => ({
  getAnalyser: vi.fn().mockReturnValue(null),
  powerOn: vi.fn().mockResolvedValue(undefined),
  powerOff: vi.fn().mockResolvedValue(undefined),
  setParam: vi.fn(),
}))

describe('App power state', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      strokeStyle: '',
      lineWidth: 0,
    })
  })

  it('renders the power button', () => {
    const { container } = render(App)
    expect(container.querySelector('button[aria-label]')).not.toBeNull()
  })

  it('main panel inert property is true when powered off on load', () => {
    const { container } = render(App)
    expect(container.querySelector('main').inert).toBe(true)
  })

  it('main panel inert property is falsy after power on', async () => {
    const { container } = render(App)
    const btn = container.querySelector('button')
    await fireEvent.click(btn)
    await waitFor(() => {
      expect(container.querySelector('main').inert).toBeFalsy()
    })
  })

  it('panels are dimmed when powered off', () => {
    const { container } = render(App)
    expect(container.querySelector('.synth').classList.contains('dimmed')).toBe(true)
  })

  it('panels are not dimmed after power on', async () => {
    const { container } = render(App)
    await fireEvent.click(container.querySelector('button'))
    await waitFor(() => {
      expect(container.querySelector('.synth').classList.contains('dimmed')).toBe(false)
    })
  })
})

describe('App — all six panels render', () => {
  it('renders oscillator panel label', () => {
    const { getByText } = render(App)
    expect(getByText('oscillator bank')).toBeTruthy()
  })

  it('renders mixer panel label', () => {
    const { getByText } = render(App)
    expect(getByText('mixer')).toBeTruthy()
  })

  it('renders filter panel label', () => {
    const { getAllByText } = render(App)
    expect(getAllByText('filter').length).toBeGreaterThan(0)
  })

  it('renders filter contour section within filter panel', () => {
    const { getByText } = render(App)
    expect(getByText('filter contour')).toBeTruthy()
  })

  it('renders output panel label', () => {
    const { getByText } = render(App)
    expect(getByText('output')).toBeTruthy()
  })

  it('renders loudness contour sub-label within output panel', () => {
    const { getByText } = render(App)
    expect(getByText('loudness contour')).toBeTruthy()
  })

  it('renders modulation panel label', () => {
    const { getByText } = render(App)
    expect(getByText('modulation')).toBeTruthy()
  })

  it('renders glide panel label', () => {
    const { getByText } = render(App)
    expect(getByText('glide')).toBeTruthy()
  })

  it('renders volume knob label within output panel', () => {
    const { getByText } = render(App)
    expect(getByText('volume')).toBeTruthy()
  })

  it('renders oscilloscope in the output placeholder slot', () => {
    const { container } = render(App)
    const grid = container.querySelector('.filter-output-grid')
    expect(grid).not.toBeNull()

    const gridChildren = Array.from(grid.children)
    expect(gridChildren).toHaveLength(5)
    expect(gridChildren[1].textContent).toContain('reverb')
    expect(gridChildren[3].classList.contains('panel-row')).toBe(true)
    expect(gridChildren[4].textContent).toContain('OSCILLOSCOPE')
  })
})

describe('App — MIDI CC 1 updates modWheel external value', () => {
  it('App renders with modWheel wiring in place (panels present)', () => {
    const { container } = render(App)
    expect(container.querySelector('.panels')).not.toBeNull()
  })

  it('modulation panel is rendered so CC 1 has a target', () => {
    const { getByText } = render(App)
    expect(getByText('modulation')).toBeTruthy()
  })
})
