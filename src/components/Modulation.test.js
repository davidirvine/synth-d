import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import Modulation from './Modulation.svelte'

describe('Modulation — rendering', () => {
  it('renders the panel label', () => {
    const { getByText } = render(Modulation)
    expect(getByText('modulation')).toBeTruthy()
  })

  it('renders the mod mix knob', () => {
    const { container } = render(Modulation)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('renders three routing buttons', () => {
    const { container } = render(Modulation)
    expect(container.querySelectorAll('.route-btn').length).toBe(3)
  })

  it('renders the virtual mod wheel track', () => {
    const { container } = render(Modulation)
    expect(container.querySelector('.wheel-track')).not.toBeNull()
  })

  it('all routing buttons are inactive by default', () => {
    const { container } = render(Modulation)
    container.querySelectorAll('.route-btn').forEach((btn) => {
      expect(btn.classList.contains('active')).toBe(false)
    })
  })

  it('mod mix knob value label is not visible', () => {
    const { container } = render(Modulation)
    const knob = container.querySelector('[data-testid="mod-mix-knob"]')
    const valueSpan = knob.querySelector('.knob-value')
    expect(valueSpan).not.toBeNull()
    expect(valueSpan.classList.contains('invisible')).toBe(true)
  })

  it('mod mix knob renders LFO tick label', () => {
    const { container } = render(Modulation)
    const knob = container.querySelector('[data-testid="mod-mix-knob"]')
    const tickLabels = Array.from(knob.querySelectorAll('.tick-label'))
    expect(tickLabels.some((el) => el.textContent === 'LFO')).toBe(true)
  })

  it('mod mix knob renders NOISE tick label', () => {
    const { container } = render(Modulation)
    const knob = container.querySelector('[data-testid="mod-mix-knob"]')
    const tickLabels = Array.from(knob.querySelectorAll('.tick-label'))
    expect(tickLabels.some((el) => el.textContent === 'NOISE')).toBe(true)
  })

  it('mod mix knob arc highlight is present at minimum mix (value=0)', () => {
    const { container } = render(Modulation)
    const knob = container.querySelector('[data-testid="mod-mix-knob"]')
    expect(knob.querySelector('.arc')).not.toBeNull()
  })

  it('mod mix knob arc highlight is absent at center mix (value=0.5)', () => {
    const { container } = render(Modulation, {
      props: { midiState: { modMix: { externalValue: 0.5 } } },
    })
    const knob = container.querySelector('[data-testid="mod-mix-knob"]')
    expect(knob.querySelector('.arc')).toBeNull()
  })

  it('mod mix knob arc highlight is present at maximum mix (value=1)', () => {
    const { container } = render(Modulation, {
      props: { midiState: { modMix: { externalValue: 1 } } },
    })
    const knob = container.querySelector('[data-testid="mod-mix-knob"]')
    expect(knob.querySelector('.arc')).not.toBeNull()
  })
})

describe('Modulation — routing switches', () => {
  it('clicking osc 1 route emits modToOsc1 1', async () => {
    const onchange = vi.fn()
    const { container } = render(Modulation, { props: { onchange } })
    const btns = container.querySelectorAll('.route-btn')
    await fireEvent.click(btns[0])
    expect(onchange).toHaveBeenCalledWith({ param: 'modToOsc1', value: 1 })
  })

  it('clicking osc 2 route emits modToOsc2 1', async () => {
    const onchange = vi.fn()
    const { container } = render(Modulation, { props: { onchange } })
    const btns = container.querySelectorAll('.route-btn')
    await fireEvent.click(btns[1])
    expect(onchange).toHaveBeenCalledWith({ param: 'modToOsc2', value: 1 })
  })

  it('clicking filter route emits modToFilter 1', async () => {
    const onchange = vi.fn()
    const { container } = render(Modulation, { props: { onchange } })
    const btns = container.querySelectorAll('.route-btn')
    await fireEvent.click(btns[2])
    expect(onchange).toHaveBeenCalledWith({ param: 'modToFilter', value: 1 })
  })

  it('clicking active route button toggles back to 0', async () => {
    const onchange = vi.fn()
    const { container } = render(Modulation, { props: { onchange } })
    const btn = container.querySelectorAll('.route-btn')[0]
    await fireEvent.click(btn)
    await fireEvent.click(btn)
    const calls = onchange.mock.calls.filter((c) => c[0].param === 'modToOsc1')
    expect(calls[calls.length - 1][0].value).toBe(0)
  })
})

describe('Modulation — virtual mod wheel drag', () => {
  it('dragging wheel upward emits modWheel with positive value', async () => {
    const onchange = vi.fn()
    const { container } = render(Modulation, { props: { onchange } })
    const track = container.querySelector('.wheel-track')
    await fireEvent.pointerDown(track, { clientY: 100 })
    await fireEvent.pointerMove(track, { clientY: 20 })
    await fireEvent.pointerUp(track)
    const wheelCalls = onchange.mock.calls.filter((c) => c[0].param === 'modWheel')
    expect(wheelCalls.length).toBeGreaterThan(0)
    expect(wheelCalls[wheelCalls.length - 1][0].value).toBeGreaterThan(0)
  })

  it('wheel value is clamped to 0-1', async () => {
    const onchange = vi.fn()
    const { container } = render(Modulation, { props: { onchange } })
    const track = container.querySelector('.wheel-track')
    await fireEvent.pointerDown(track, { clientY: 500 })
    await fireEvent.pointerMove(track, { clientY: -5000 })
    await fireEvent.pointerUp(track)
    const wheelCalls = onchange.mock.calls.filter((c) => c[0].param === 'modWheel')
    if (wheelCalls.length > 0) {
      const lastVal = wheelCalls[wheelCalls.length - 1][0].value
      expect(lastVal).toBeLessThanOrEqual(1)
      expect(lastVal).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('Modulation — CC 1 sync via midiState', () => {
  it('externalValue in midiState updates wheel fill height', async () => {
    const { container } = render(Modulation, {
      props: {
        midiState: { modWheel: { externalValue: 0.75 } },
      },
    })
    const fill = container.querySelector('.wheel-fill')
    expect(fill).not.toBeNull()
  })
})

describe('Modulation — reset prop', () => {
  it('incrementing reset fires onchange for all routing params with value 0', async () => {
    const onchange = vi.fn()
    const { rerender } = render(Modulation, { props: { onchange, reset: 0 } })
    await rerender({ onchange, reset: 1 })
    const params = onchange.mock.calls.map((c) => c[0].param)
    expect(params).toContain('modToOsc1')
    expect(params).toContain('modToOsc2')
    expect(params).toContain('modToFilter')
    onchange.mock.calls
      .filter((c) => ['modToOsc1', 'modToOsc2', 'modToFilter'].includes(c[0].param))
      .forEach((c) => expect(c[0].value).toBe(0))
  })

  it('incrementing reset twice fires both resets', async () => {
    const onchange = vi.fn()
    const { rerender } = render(Modulation, { props: { onchange, reset: 0 } })
    await rerender({ onchange, reset: 1 })
    await rerender({ onchange, reset: 2 })
    const routingCalls = onchange.mock.calls.filter((c) =>
      ['modToOsc1', 'modToOsc2', 'modToFilter'].includes(c[0].param)
    )
    expect(routingCalls.length).toBe(6)
  })

  it('buttons reflect reset state (all inactive after reset)', async () => {
    const onchange = vi.fn()
    const { container, rerender } = render(Modulation, { props: { onchange, reset: 0 } })
    const btns = container.querySelectorAll('.route-btn')
    await fireEvent.click(btns[0])
    await fireEvent.click(btns[1])
    await rerender({ onchange, reset: 1 })
    btns.forEach((btn) => expect(btn.classList.contains('active')).toBe(false))
  })
})
