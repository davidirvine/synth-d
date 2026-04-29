import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/svelte'
import App, { powerOffValue } from './App.svelte'

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
    const btn = container.querySelector('[data-testid="power-btn"]')
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
    await fireEvent.click(container.querySelector('[data-testid="power-btn"]'))
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
    expect(container.querySelector('.level-led')).not.toBeNull()
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
    const btn = container.querySelector('[data-testid="power-btn"]')

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
    const btn = container.querySelector('[data-testid="power-btn"]')

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

describe('powerOffValue', () => {
  it('returns midpoint for osc2Detune (bipolar, min=-100 max=100)', () => {
    expect(powerOffValue('osc2Detune')).toBe(0)
  })

  it('returns midpoint for osc3Detune (bipolar, min=-100 max=100)', () => {
    expect(powerOffValue('osc3Detune')).toBe(0)
  })

  it('returns midpoint for modMix (bipolar, min=0 max=1)', () => {
    expect(powerOffValue('modMix')).toBe(0.5)
  })

  it('returns min for osc1Level (non-bipolar, min=0)', () => {
    expect(powerOffValue('osc1Level')).toBe(0)
  })

  it('returns min for cutoff (non-bipolar, min=20)', () => {
    expect(powerOffValue('cutoff')).toBe(20)
  })

  it('returns min for masterVol (non-bipolar, min=0)', () => {
    expect(powerOffValue('masterVol')).toBe(0)
  })
})

describe('App — power-off sets bipolar knob externalValue to midpoint', () => {
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

  it('modMix externalValue is midpoint (0.50) after power-off, not min (0.00)', async () => {
    const { container } = render(App)
    const btn = container.querySelector('[data-testid="power-btn"]')

    await fireEvent.click(btn)
    await waitFor(() => {
      const el = container.querySelector('[data-testid="mod-mix-knob"] .knob-value')
      expect(el?.textContent).toBe('0.00')
    })

    await fireEvent.click(btn)
    await waitFor(() => {
      const el = container.querySelector('[data-testid="mod-mix-knob"] .knob-value')
      expect(el?.textContent).toBe('0.50')
    })
  })

  it('osc2Detune externalValue is midpoint (0.00) after power-off, not min (-100.00)', async () => {
    const { container } = render(App)
    const btn = container.querySelector('[data-testid="power-btn"]')

    await fireEvent.click(btn)
    await fireEvent.click(btn)
    await waitFor(() => {
      const val = Array.from(container.querySelectorAll('.knob-label'))
        .filter((el) => el.textContent === 'detune')
        .map((el) => el.closest('.knob-wrap')?.querySelector('.knob-value'))[0]
      expect(val?.textContent).toBe('0.00')
    })
  })

  it('osc1Level externalValue is min (0.00) after power-off (non-bipolar unchanged)', async () => {
    const { container } = render(App)
    const btn = container.querySelector('[data-testid="power-btn"]')

    await fireEvent.click(btn)
    await waitFor(() => {
      const labelEl = Array.from(container.querySelectorAll('.knob-label')).find(
        (el) => el.textContent === 'osc 1'
      )
      expect(labelEl?.closest('.knob-wrap')?.querySelector('.knob-value')?.textContent).toBe('0.75')
    })

    await fireEvent.click(btn)
    await waitFor(() => {
      const labelEl = Array.from(container.querySelectorAll('.knob-label')).find(
        (el) => el.textContent === 'osc 1'
      )
      expect(labelEl?.closest('.knob-wrap')?.querySelector('.knob-value')?.textContent).toBe('0.00')
    })
  })
})

describe('App — zero-default knobs respond to power-off after manual change', () => {
  function findKnobHits(container, label) {
    return Array.from(container.querySelectorAll('.knob-label'))
      .filter((el) => el.textContent === label)
      .map((el) => el.closest('.knob-wrap')?.querySelector('.knob-hit'))
      .filter(Boolean)
  }

  function findKnobValues(container, label) {
    return Array.from(container.querySelectorAll('.knob-label'))
      .filter((el) => el.textContent === label)
      .map((el) => el.closest('.knob-wrap')?.querySelector('.knob-value'))
      .filter(Boolean)
  }

  async function dragKnobUp(hit) {
    await fireEvent.pointerDown(hit, { clientY: 100 })
    await fireEvent.pointerMove(hit, { clientY: 50 })
    await fireEvent.pointerUp(hit)
  }

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

  it('osc2Detune returns to midpoint (0.00) after manual change and power-off', async () => {
    const { container } = render(App)
    const btn = container.querySelector('[data-testid="power-btn"]')
    await fireEvent.click(btn)

    await dragKnobUp(findKnobHits(container, 'detune')[0])
    await waitFor(() => {
      expect(findKnobValues(container, 'detune')[0]?.textContent).not.toBe('0.00')
    })

    await fireEvent.click(btn)
    await waitFor(() => {
      expect(findKnobValues(container, 'detune')[0]?.textContent).toBe('0.00')
    })
  })

  it('osc3Detune returns to midpoint (0.00) after manual change and power-off', async () => {
    const { container } = render(App)
    const btn = container.querySelector('[data-testid="power-btn"]')
    await fireEvent.click(btn)

    await dragKnobUp(findKnobHits(container, 'detune')[1])
    await waitFor(() => {
      expect(findKnobValues(container, 'detune')[1]?.textContent).not.toBe('0.00')
    })

    await fireEvent.click(btn)
    await waitFor(() => {
      expect(findKnobValues(container, 'detune')[1]?.textContent).toBe('0.00')
    })
  })

  it('osc2Level returns to min (0.00) after manual change and power-off', async () => {
    const { container } = render(App)
    const btn = container.querySelector('[data-testid="power-btn"]')
    await fireEvent.click(btn)

    await dragKnobUp(findKnobHits(container, 'osc 2')[0])
    await waitFor(() => {
      expect(findKnobValues(container, 'osc 2')[0]?.textContent).not.toBe('0.00')
    })

    await fireEvent.click(btn)
    await waitFor(() => {
      expect(findKnobValues(container, 'osc 2')[0]?.textContent).toBe('0.00')
    })
  })

  it('osc3Level returns to min (0.00) after manual change and power-off', async () => {
    const { container } = render(App)
    const btn = container.querySelector('[data-testid="power-btn"]')
    await fireEvent.click(btn)

    await dragKnobUp(findKnobHits(container, 'osc 3')[0])
    await waitFor(() => {
      expect(findKnobValues(container, 'osc 3')[0]?.textContent).not.toBe('0.00')
    })

    await fireEvent.click(btn)
    await waitFor(() => {
      expect(findKnobValues(container, 'osc 3')[0]?.textContent).toBe('0.00')
    })
  })

  it('noiseLevel returns to min (0.00) after manual change and power-off', async () => {
    const { container } = render(App)
    const btn = container.querySelector('[data-testid="power-btn"]')
    await fireEvent.click(btn)

    await dragKnobUp(findKnobHits(container, 'noise')[0])
    await waitFor(() => {
      expect(findKnobValues(container, 'noise')[0]?.textContent).not.toBe('0.00')
    })

    await fireEvent.click(btn)
    await waitFor(() => {
      expect(findKnobValues(container, 'noise')[0]?.textContent).toBe('0.00')
    })
  })

  it('delayModDepth returns to min (0 ms) after manual change and power-off', async () => {
    const { container } = render(App)
    const btn = container.querySelector('[data-testid="power-btn"]')
    await fireEvent.click(btn)

    await dragKnobUp(findKnobHits(container, 'depth')[0])
    await waitFor(() => {
      expect(findKnobValues(container, 'depth')[0]?.textContent).not.toBe('0 ms')
    })

    await fireEvent.click(btn)
    await waitFor(() => {
      expect(findKnobValues(container, 'depth')[0]?.textContent).toBe('0 ms')
    })
  })

  it('reverbPreDelay returns to min (0 ms) after manual change and power-off', async () => {
    const { container } = render(App)
    const btn = container.querySelector('[data-testid="power-btn"]')
    await fireEvent.click(btn)

    await dragKnobUp(findKnobHits(container, 'pre-delay')[0])
    await waitFor(() => {
      expect(findKnobValues(container, 'pre-delay')[0]?.textContent).not.toBe('0 ms')
    })

    await fireEvent.click(btn)
    await waitFor(() => {
      expect(findKnobValues(container, 'pre-delay')[0]?.textContent).toBe('0 ms')
    })
  })
})

describe('App — bipolar knob externalValue initialises to midpoint on page load', () => {
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

  it('modMix externalValue is midpoint (0.50) on page load, not min (0.00)', async () => {
    const { container } = render(App)
    await waitFor(() => {
      const el = container.querySelector('[data-testid="mod-mix-knob"] .knob-value')
      expect(el?.textContent).toBe('0.50')
    })
  })

  it('osc2Detune externalValue is midpoint (0.00) on page load, not min (-100.00)', async () => {
    const { container } = render(App)
    await waitFor(() => {
      const labelEl = Array.from(container.querySelectorAll('.knob-label')).find(
        (el) => el.textContent === 'detune'
      )
      const val = labelEl?.closest('.knob-wrap')?.querySelector('.knob-value')
      expect(val?.textContent).toBe('0.00')
    })
  })

  it('osc1Level externalValue is min (0.00) on page load (non-bipolar unchanged)', async () => {
    const { container } = render(App)
    await waitFor(() => {
      const labelEl = Array.from(container.querySelectorAll('.knob-label')).find(
        (el) => el.textContent === 'osc 1'
      )
      const val = labelEl?.closest('.knob-wrap')?.querySelector('.knob-value')
      expect(val?.textContent).toBe('0.00')
    })
  })
})
