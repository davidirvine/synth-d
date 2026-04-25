import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import Effects from './Effects.svelte'

describe('Effects — rendering', () => {
  it('renders the panel label', () => {
    const { getByText } = render(Effects)
    expect(getByText('effects')).toBeTruthy()
  })

  it('renders the DELAY sub-label', () => {
    const { getAllByText } = render(Effects)
    const labels = getAllByText('delay')
    expect(labels.length).toBeGreaterThanOrEqual(1)
  })

  it('renders the REVERB sub-label', () => {
    const { getAllByText } = render(Effects)
    const labels = getAllByText('reverb')
    expect(labels.length).toBeGreaterThanOrEqual(1)
  })

  it('renders six knobs', () => {
    const { container } = render(Effects)
    expect(container.querySelectorAll('.knob-hit')).toHaveLength(6)
  })

  it('renders two toggle buttons', () => {
    const { container } = render(Effects)
    expect(container.querySelectorAll('.toggle-btn')).toHaveLength(2)
  })
})

describe('Effects — delay toggle', () => {
  it('delay toggle defaults to off', () => {
    const { container } = render(Effects)
    const btn = container.querySelectorAll('.toggle-btn')[0]
    expect(btn.classList.contains('active')).toBe(false)
    expect(btn.textContent.trim()).toBe('off')
  })

  it('clicking delay toggle dispatches delayOn = 1', async () => {
    const onchange = vi.fn()
    const { container } = render(Effects, { props: { onchange } })
    await fireEvent.click(container.querySelectorAll('.toggle-btn')[0])
    expect(onchange).toHaveBeenCalledWith({ param: 'delayOn', value: 1 })
  })

  it('second click on delay toggle dispatches delayOn = 0', async () => {
    const onchange = vi.fn()
    const { container } = render(Effects, { props: { onchange } })
    const btn = container.querySelectorAll('.toggle-btn')[0]
    await fireEvent.click(btn)
    await fireEvent.click(btn)
    const calls = onchange.mock.calls.filter((c) => c[0].param === 'delayOn')
    expect(calls[calls.length - 1][0].value).toBe(0)
  })
})

describe('Effects — reverb toggle', () => {
  it('reverb toggle defaults to off', () => {
    const { container } = render(Effects)
    const btn = container.querySelectorAll('.toggle-btn')[1]
    expect(btn.classList.contains('active')).toBe(false)
    expect(btn.textContent.trim()).toBe('off')
  })

  it('clicking reverb toggle dispatches reverbOn = 1', async () => {
    const onchange = vi.fn()
    const { container } = render(Effects, { props: { onchange } })
    await fireEvent.click(container.querySelectorAll('.toggle-btn')[1])
    expect(onchange).toHaveBeenCalledWith({ param: 'reverbOn', value: 1 })
  })

  it('second click on reverb toggle dispatches reverbOn = 0', async () => {
    const onchange = vi.fn()
    const { container } = render(Effects, { props: { onchange } })
    const btn = container.querySelectorAll('.toggle-btn')[1]
    await fireEvent.click(btn)
    await fireEvent.click(btn)
    const calls = onchange.mock.calls.filter((c) => c[0].param === 'reverbOn')
    expect(calls[calls.length - 1][0].value).toBe(0)
  })
})

describe('Effects — delay knob param names', () => {
  it('time knob double-click dispatches delayTime', async () => {
    const onchange = vi.fn()
    const { container } = render(Effects, { props: { onchange } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.dblClick(hits[0])
    const params = onchange.mock.calls.map((c) => c[0].param)
    expect(params).toContain('delayTime')
  })

  it('feedback knob double-click dispatches delayFeedback', async () => {
    const onchange = vi.fn()
    const { container } = render(Effects, { props: { onchange } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.dblClick(hits[1])
    const params = onchange.mock.calls.map((c) => c[0].param)
    expect(params).toContain('delayFeedback')
  })

  it('delay mix knob double-click dispatches delayMix', async () => {
    const onchange = vi.fn()
    const { container } = render(Effects, { props: { onchange } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.dblClick(hits[2])
    const params = onchange.mock.calls.map((c) => c[0].param)
    expect(params).toContain('delayMix')
  })
})

describe('Effects — reverb knob param names', () => {
  it('reverb mix knob double-click dispatches reverbMix', async () => {
    const onchange = vi.fn()
    const { container } = render(Effects, { props: { onchange } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.dblClick(hits[3])
    const params = onchange.mock.calls.map((c) => c[0].param)
    expect(params).toContain('reverbMix')
  })

  it('decay knob double-click dispatches reverbDecay', async () => {
    const onchange = vi.fn()
    const { container } = render(Effects, { props: { onchange } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.dblClick(hits[4])
    const params = onchange.mock.calls.map((c) => c[0].param)
    expect(params).toContain('reverbDecay')
  })

  it('shimmer knob double-click dispatches reverbShimmer', async () => {
    const onchange = vi.fn()
    const { container } = render(Effects, { props: { onchange } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.dblClick(hits[5])
    const params = onchange.mock.calls.map((c) => c[0].param)
    expect(params).toContain('reverbShimmer')
  })
})

describe('Effects — onknobcontextmenu', () => {
  it('right-click on time knob calls onknobcontextmenu with delayTime', async () => {
    const onknobcontextmenu = vi.fn()
    const { container } = render(Effects, { props: { onknobcontextmenu } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.contextMenu(hits[0])
    expect(onknobcontextmenu).toHaveBeenCalledWith('delayTime')
  })

  it('right-click on feedback knob calls onknobcontextmenu with delayFeedback', async () => {
    const onknobcontextmenu = vi.fn()
    const { container } = render(Effects, { props: { onknobcontextmenu } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.contextMenu(hits[1])
    expect(onknobcontextmenu).toHaveBeenCalledWith('delayFeedback')
  })

  it('right-click on delay mix knob calls onknobcontextmenu with delayMix', async () => {
    const onknobcontextmenu = vi.fn()
    const { container } = render(Effects, { props: { onknobcontextmenu } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.contextMenu(hits[2])
    expect(onknobcontextmenu).toHaveBeenCalledWith('delayMix')
  })

  it('right-click on reverb mix knob calls onknobcontextmenu with reverbMix', async () => {
    const onknobcontextmenu = vi.fn()
    const { container } = render(Effects, { props: { onknobcontextmenu } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.contextMenu(hits[3])
    expect(onknobcontextmenu).toHaveBeenCalledWith('reverbMix')
  })

  it('right-click on decay knob calls onknobcontextmenu with reverbDecay', async () => {
    const onknobcontextmenu = vi.fn()
    const { container } = render(Effects, { props: { onknobcontextmenu } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.contextMenu(hits[4])
    expect(onknobcontextmenu).toHaveBeenCalledWith('reverbDecay')
  })

  it('right-click on shimmer knob calls onknobcontextmenu with reverbShimmer', async () => {
    const onknobcontextmenu = vi.fn()
    const { container } = render(Effects, { props: { onknobcontextmenu } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.contextMenu(hits[5])
    expect(onknobcontextmenu).toHaveBeenCalledWith('reverbShimmer')
  })
})

describe('Effects — midiState externalValue', () => {
  it('midiState.delayTime.externalValue drives time knob display', () => {
    const midiState = {
      delayTime: { externalValue: 0.6, learningMidi: false, assignedCc: null },
      delayFeedback: { externalValue: undefined, learningMidi: false, assignedCc: null },
      delayMix: { externalValue: undefined, learningMidi: false, assignedCc: null },
      reverbMix: { externalValue: undefined, learningMidi: false, assignedCc: null },
      reverbDecay: { externalValue: undefined, learningMidi: false, assignedCc: null },
      reverbShimmer: { externalValue: undefined, learningMidi: false, assignedCc: null },
    }
    const { container } = render(Effects, { props: { midiState } })
    const knobValues = container.querySelectorAll('.knob-value')
    expect(knobValues[0].textContent).toBe('600 ms')
  })

  it('midiState.reverbMix.externalValue drives reverb mix knob display', () => {
    const midiState = {
      delayTime: { externalValue: undefined, learningMidi: false, assignedCc: null },
      delayFeedback: { externalValue: undefined, learningMidi: false, assignedCc: null },
      delayMix: { externalValue: undefined, learningMidi: false, assignedCc: null },
      reverbMix: { externalValue: 0.25, learningMidi: false, assignedCc: null },
      reverbDecay: { externalValue: undefined, learningMidi: false, assignedCc: null },
      reverbShimmer: { externalValue: undefined, learningMidi: false, assignedCc: null },
    }
    const { container } = render(Effects, { props: { midiState } })
    const knobValues = container.querySelectorAll('.knob-value')
    expect(knobValues[3].textContent).toBe('0.25')
  })
})
