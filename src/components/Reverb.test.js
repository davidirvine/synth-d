import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import Reverb from './Reverb.svelte'

describe('Reverb — rendering', () => {
  it('renders the panel label', () => {
    const { getByText } = render(Reverb)
    expect(getByText('reverb')).toBeTruthy()
  })

  it('renders the reverb toggle button', () => {
    const { container } = render(Reverb)
    expect(container.querySelector('.reverb-btn')).not.toBeNull()
  })

  it('toggle defaults to off', () => {
    const { container } = render(Reverb)
    const btn = container.querySelector('.reverb-btn')
    expect(btn.classList.contains('active')).toBe(false)
    expect(btn.textContent.trim()).toBe('off')
  })

  it('renders three knobs', () => {
    const { container } = render(Reverb)
    expect(container.querySelectorAll('svg')).toHaveLength(3)
  })

  it('mix knob defaults to 0.5', () => {
    const { container } = render(Reverb)
    const knobValues = container.querySelectorAll('.knob-value')
    const mixValue = Array.from(knobValues).find((el) => el.textContent.includes('0.5'))
    expect(mixValue).toBeTruthy()
  })
})

describe('Reverb — toggle', () => {
  it('clicking toggle dispatches reverbOn = 1', async () => {
    const onchange = vi.fn()
    const { container } = render(Reverb, { props: { onchange } })
    await fireEvent.click(container.querySelector('.reverb-btn'))
    expect(onchange).toHaveBeenCalledWith({ param: 'reverbOn', value: 1 })
  })

  it('button becomes active after click', async () => {
    const { container } = render(Reverb)
    await fireEvent.click(container.querySelector('.reverb-btn'))
    expect(container.querySelector('.reverb-btn').classList.contains('active')).toBe(true)
  })

  it('button shows on after click', async () => {
    const { container } = render(Reverb)
    await fireEvent.click(container.querySelector('.reverb-btn'))
    expect(container.querySelector('.reverb-btn').textContent.trim()).toBe('on')
  })

  it('second click dispatches reverbOn = 0', async () => {
    const onchange = vi.fn()
    const { container } = render(Reverb, { props: { onchange } })
    const btn = container.querySelector('.reverb-btn')
    await fireEvent.click(btn)
    await fireEvent.click(btn)
    const calls = onchange.mock.calls.filter((c) => c[0].param === 'reverbOn')
    expect(calls[calls.length - 1][0].value).toBe(0)
  })
})

describe('Reverb — knob param names', () => {
  it('mix knob double-click dispatches reverbMix', async () => {
    const onchange = vi.fn()
    const { container } = render(Reverb, { props: { onchange } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.dblClick(hits[0])
    const params = onchange.mock.calls.map((c) => c[0].param)
    expect(params).toContain('reverbMix')
  })

  it('decay knob double-click dispatches reverbDecay', async () => {
    const onchange = vi.fn()
    const { container } = render(Reverb, { props: { onchange } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.dblClick(hits[1])
    const params = onchange.mock.calls.map((c) => c[0].param)
    expect(params).toContain('reverbDecay')
  })

  it('shimmer knob double-click dispatches reverbShimmer', async () => {
    const onchange = vi.fn()
    const { container } = render(Reverb, { props: { onchange } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.dblClick(hits[2])
    const params = onchange.mock.calls.map((c) => c[0].param)
    expect(params).toContain('reverbShimmer')
  })
})

describe('Reverb — onknobcontextmenu', () => {
  it('right-click on mix knob calls onknobcontextmenu with reverbMix', async () => {
    const onknobcontextmenu = vi.fn()
    const { container } = render(Reverb, { props: { onknobcontextmenu } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.contextMenu(hits[0])
    expect(onknobcontextmenu).toHaveBeenCalledWith('reverbMix')
  })

  it('right-click on decay knob calls onknobcontextmenu with reverbDecay', async () => {
    const onknobcontextmenu = vi.fn()
    const { container } = render(Reverb, { props: { onknobcontextmenu } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.contextMenu(hits[1])
    expect(onknobcontextmenu).toHaveBeenCalledWith('reverbDecay')
  })

  it('right-click on shimmer knob calls onknobcontextmenu with reverbShimmer', async () => {
    const onknobcontextmenu = vi.fn()
    const { container } = render(Reverb, { props: { onknobcontextmenu } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.contextMenu(hits[2])
    expect(onknobcontextmenu).toHaveBeenCalledWith('reverbShimmer')
  })
})

describe('Reverb — midiState externalValue', () => {
  it('midiState.reverbShimmer.externalValue drives shimmer knob display', async () => {
    const midiState = {
      reverbMix: { externalValue: undefined, learningMidi: false, assignedCc: null },
      reverbDecay: { externalValue: undefined, learningMidi: false, assignedCc: null },
      reverbShimmer: { externalValue: 0.75, learningMidi: false, assignedCc: null },
    }
    const { container } = render(Reverb, { props: { midiState } })
    const knobValues = container.querySelectorAll('.knob-value')
    const shimmerValue = Array.from(knobValues).find((el) => el.textContent.includes('0.75'))
    expect(shimmerValue).toBeTruthy()
  })
})
