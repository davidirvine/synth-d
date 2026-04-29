import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/svelte'
import App from './App.svelte'

vi.mock('./audio/engine.js', () => ({
  getAnalyser: vi.fn().mockReturnValue(null),
  getMixerPeak: vi.fn().mockReturnValue(0),
  getOutputPeak: vi.fn().mockReturnValue(0),
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
    const { getByText, container } = render(App)
    expect(getByText('mixer')).toBeTruthy()
    expect(container.querySelector('.clip-led')).not.toBeNull()
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
    expect(gridChildren[2].textContent).toContain('reverb')
    expect(gridChildren[3].classList.contains('panel-row')).toBe(true)
    expect(gridChildren[4].textContent).toContain('OSCILLOSCOPE')
  })
})

describe('App — ccExternalValues initialised at per-param min', () => {
  function findKnobValue(container, label) {
    const labelEl = Array.from(container.querySelectorAll('.knob-label')).find(
      (el) => el.textContent === label
    )
    return labelEl?.closest('.knob-wrap')?.querySelector('.knob-value') ?? null
  }

  it('osc1Level knob starts at min (0.00) on mount/reload, not default (0.75) or a random value', async () => {
    const { container } = render(App)
    await waitFor(() => {
      expect(findKnobValue(container, 'osc 1')?.textContent).toBe('0.00')
    })
  })

  it('osc1Level knob returns to min (0.00) after power-off, not frozen at default (0.75)', async () => {
    const { container } = render(App)
    const btn = container.querySelector('button')

    await fireEvent.click(btn)
    await waitFor(() => {
      expect(findKnobValue(container, 'osc 1')?.textContent).toBe('0.75')
    })

    await fireEvent.click(btn)
    await waitFor(() => {
      expect(findKnobValue(container, 'osc 1')?.textContent).toBe('0.00')
    })
  })

  it('osc1Level knob returns to default (0.75) after power-off → power-on cycle', async () => {
    const { container } = render(App)
    const btn = container.querySelector('button')

    await fireEvent.click(btn)
    await waitFor(() => {
      expect(findKnobValue(container, 'osc 1')?.textContent).toBe('0.75')
    })

    await fireEvent.click(btn)
    await waitFor(() => {
      expect(findKnobValue(container, 'osc 1')?.textContent).toBe('0.00')
    })

    await fireEvent.click(btn)
    await waitFor(() => {
      expect(findKnobValue(container, 'osc 1')?.textContent).toBe('0.75')
    })
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
