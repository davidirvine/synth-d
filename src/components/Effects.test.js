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

  it('renders nine knobs', () => {
    const { container } = render(Effects)
    expect(container.querySelectorAll('.knob-hit')).toHaveLength(9)
  })

  it('renders three toggle buttons', () => {
    const { container } = render(Effects)
    expect(container.querySelectorAll('.toggle-btn')).toHaveLength(3)
  })

  it('reverb mix knob defaults to 0.50', () => {
    const { container } = render(Effects)
    const knobValues = container.querySelectorAll('.knob-value')
    expect(knobValues[5].textContent).toBe('0.50')
  })

  it('shimmer knob is absent from the rendered effects panel', () => {
    const { container } = render(Effects)
    const labels = container.querySelectorAll('.knob-label')
    const labelTexts = Array.from(labels).map((el) => el.textContent.trim().toLowerCase())
    expect(labelTexts).not.toContain('shimmer')
  })

  it('LPF knob is absent from the rendered effects panel', () => {
    const { container } = render(Effects)
    const labels = container.querySelectorAll('.knob-label')
    const labelTexts = Array.from(labels).map((el) => el.textContent.trim().toLowerCase())
    expect(labelTexts).not.toContain('lpf')
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

  it('delay toggle becomes active and shows on after click', async () => {
    const { container } = render(Effects)
    const btn = container.querySelectorAll('.toggle-btn')[0]
    await fireEvent.click(btn)
    expect(btn.classList.contains('active')).toBe(true)
    expect(btn.textContent.trim()).toBe('on')
  })
})

describe('Effects — MOD toggle', () => {
  it('MOD toggle defaults to off', () => {
    const { container } = render(Effects)
    const btn = container.querySelectorAll('.toggle-btn')[1]
    expect(btn.classList.contains('active')).toBe(false)
    expect(btn.textContent.trim()).toBe('off')
  })

  it('clicking MOD toggle dispatches delayModOn = 1', async () => {
    const onchange = vi.fn()
    const { container } = render(Effects, { props: { onchange } })
    await fireEvent.click(container.querySelectorAll('.toggle-btn')[1])
    expect(onchange).toHaveBeenCalledWith({ param: 'delayModOn', value: 1 })
  })

  it('second click on MOD toggle dispatches delayModOn = 0', async () => {
    const onchange = vi.fn()
    const { container } = render(Effects, { props: { onchange } })
    const btn = container.querySelectorAll('.toggle-btn')[1]
    await fireEvent.click(btn)
    await fireEvent.click(btn)
    const calls = onchange.mock.calls.filter((c) => c[0].param === 'delayModOn')
    expect(calls[calls.length - 1][0].value).toBe(0)
  })

  it('delayModOn resets to 0 and dispatches when reset counter increments', async () => {
    const onchange = vi.fn()
    const { container, rerender } = render(Effects, { props: { onchange, reset: 0 } })
    const btn = container.querySelectorAll('.toggle-btn')[1]
    await fireEvent.click(btn)
    expect(btn.classList.contains('active')).toBe(true)
    await rerender({ onchange, reset: 1 })
    const calls = onchange.mock.calls.filter((c) => c[0].param === 'delayModOn')
    expect(calls[calls.length - 1][0].value).toBe(0)
    expect(btn.classList.contains('active')).toBe(false)
  })
})

describe('Effects — reverb toggle', () => {
  it('reverb toggle defaults to off', () => {
    const { container } = render(Effects)
    const btn = container.querySelectorAll('.toggle-btn')[2]
    expect(btn.classList.contains('active')).toBe(false)
    expect(btn.textContent.trim()).toBe('off')
  })

  it('clicking reverb toggle dispatches reverbOn = 1', async () => {
    const onchange = vi.fn()
    const { container } = render(Effects, { props: { onchange } })
    await fireEvent.click(container.querySelectorAll('.toggle-btn')[2])
    expect(onchange).toHaveBeenCalledWith({ param: 'reverbOn', value: 1 })
  })

  it('second click on reverb toggle dispatches reverbOn = 0', async () => {
    const onchange = vi.fn()
    const { container } = render(Effects, { props: { onchange } })
    const btn = container.querySelectorAll('.toggle-btn')[2]
    await fireEvent.click(btn)
    await fireEvent.click(btn)
    const calls = onchange.mock.calls.filter((c) => c[0].param === 'reverbOn')
    expect(calls[calls.length - 1][0].value).toBe(0)
  })

  it('reverb toggle becomes active and shows on after click', async () => {
    const { container } = render(Effects)
    const btn = container.querySelectorAll('.toggle-btn')[2]
    await fireEvent.click(btn)
    expect(btn.classList.contains('active')).toBe(true)
    expect(btn.textContent.trim()).toBe('on')
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

describe('Effects — MOD knob param names', () => {
  it('rate knob dispatches delayModRate on change', async () => {
    const onchange = vi.fn()
    const { container } = render(Effects, { props: { onchange } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.dblClick(hits[3])
    const params = onchange.mock.calls.map((c) => c[0].param)
    expect(params).toContain('delayModRate')
  })

  it('depth knob dispatches delayModDepth on change', async () => {
    const onchange = vi.fn()
    const { container } = render(Effects, { props: { onchange } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.dblClick(hits[4])
    const params = onchange.mock.calls.map((c) => c[0].param)
    expect(params).toContain('delayModDepth')
  })
})

describe('Effects — reverb knob param names', () => {
  it('reverb mix knob double-click dispatches reverbMix', async () => {
    const onchange = vi.fn()
    const { container } = render(Effects, { props: { onchange } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.dblClick(hits[5])
    const params = onchange.mock.calls.map((c) => c[0].param)
    expect(params).toContain('reverbMix')
  })

  it('damp knob double-click dispatches reverbDamp', async () => {
    const onchange = vi.fn()
    const { container } = render(Effects, { props: { onchange } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.dblClick(hits[6])
    const params = onchange.mock.calls.map((c) => c[0].param)
    expect(params).toContain('reverbDamp')
  })

  it('decay knob double-click dispatches reverbDecay', async () => {
    const onchange = vi.fn()
    const { container } = render(Effects, { props: { onchange } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.dblClick(hits[7])
    const params = onchange.mock.calls.map((c) => c[0].param)
    expect(params).toContain('reverbDecay')
  })

  it('pre-delay knob double-click dispatches reverbPreDelay', async () => {
    const onchange = vi.fn()
    const { container } = render(Effects, { props: { onchange } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.dblClick(hits[8])
    const params = onchange.mock.calls.map((c) => c[0].param)
    expect(params).toContain('reverbPreDelay')
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

  it('right-click on rate knob calls onknobcontextmenu with delayModRate', async () => {
    const onknobcontextmenu = vi.fn()
    const { container } = render(Effects, { props: { onknobcontextmenu } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.contextMenu(hits[3])
    expect(onknobcontextmenu).toHaveBeenCalledWith('delayModRate')
  })

  it('right-click on depth knob calls onknobcontextmenu with delayModDepth', async () => {
    const onknobcontextmenu = vi.fn()
    const { container } = render(Effects, { props: { onknobcontextmenu } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.contextMenu(hits[4])
    expect(onknobcontextmenu).toHaveBeenCalledWith('delayModDepth')
  })

  it('right-click on reverb mix knob calls onknobcontextmenu with reverbMix', async () => {
    const onknobcontextmenu = vi.fn()
    const { container } = render(Effects, { props: { onknobcontextmenu } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.contextMenu(hits[5])
    expect(onknobcontextmenu).toHaveBeenCalledWith('reverbMix')
  })

  it('right-click on damp knob calls onknobcontextmenu with reverbDamp', async () => {
    const onknobcontextmenu = vi.fn()
    const { container } = render(Effects, { props: { onknobcontextmenu } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.contextMenu(hits[6])
    expect(onknobcontextmenu).toHaveBeenCalledWith('reverbDamp')
  })

  it('right-click on decay knob calls onknobcontextmenu with reverbDecay', async () => {
    const onknobcontextmenu = vi.fn()
    const { container } = render(Effects, { props: { onknobcontextmenu } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.contextMenu(hits[7])
    expect(onknobcontextmenu).toHaveBeenCalledWith('reverbDecay')
  })

  it('right-click on pre-delay knob calls onknobcontextmenu with reverbPreDelay', async () => {
    const onknobcontextmenu = vi.fn()
    const { container } = render(Effects, { props: { onknobcontextmenu } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.contextMenu(hits[8])
    expect(onknobcontextmenu).toHaveBeenCalledWith('reverbPreDelay')
  })
})

describe('Effects — reverb knob defaults', () => {
  it('damp knob defaults to 0.5', () => {
    const { container } = render(Effects)
    const knobValues = container.querySelectorAll('.knob-value')
    expect(knobValues[6].textContent).toBe('0.50')
  })

  it('reverb decay knob defaults to 0.50', () => {
    const { container } = render(Effects)
    const knobValues = container.querySelectorAll('.knob-value')
    expect(knobValues[7].textContent).toBe('0.50')
  })

  it('pre-delay knob defaults to 0', () => {
    const { container } = render(Effects)
    const knobValues = container.querySelectorAll('.knob-value')
    expect(knobValues[8].textContent).toBe('0 ms')
  })
})

describe('Effects — damp knob showValue', () => {
  it('damp knob value element is invisible (showValue={false})', () => {
    const { container } = render(Effects)
    const knobValues = container.querySelectorAll('.knob-value')
    expect(knobValues[6].classList.contains('invisible')).toBe(true)
  })
})

describe('Effects — midiCcMap reverbTone absent', () => {
  it('reverbTone has no CC assigned on a fresh map', async () => {
    const { MidiCcMap } = await import('../audio/midiCcMap.js')
    const map = new MidiCcMap()
    expect(map.getAssignedCc('reverbTone')).toBeNull()
  })

  it('assign reverbDamp to a CC and getAssignedCc returns that CC', async () => {
    const { MidiCcMap } = await import('../audio/midiCcMap.js')
    const map = new MidiCcMap()
    map.assign(74, 'reverbDamp', 0, 1)
    expect(map.getAssignedCc('reverbDamp')).toBe(74)
  })
})

describe('Effects — midiState externalValue', () => {
  it('midiState.delayTime.externalValue drives time knob display', () => {
    const midiState = {
      delayTime: { externalValue: 0.6, learningMidi: false, assignedCc: null },
      delayFeedback: { externalValue: undefined, learningMidi: false, assignedCc: null },
      delayMix: { externalValue: undefined, learningMidi: false, assignedCc: null },
      delayModRate: { externalValue: undefined, learningMidi: false, assignedCc: null },
      delayModDepth: { externalValue: undefined, learningMidi: false, assignedCc: null },
      reverbMix: { externalValue: undefined, learningMidi: false, assignedCc: null },
      reverbDamp: { externalValue: undefined, learningMidi: false, assignedCc: null },
      reverbDecay: { externalValue: undefined, learningMidi: false, assignedCc: null },
      reverbPreDelay: { externalValue: undefined, learningMidi: false, assignedCc: null },
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
      delayModRate: { externalValue: undefined, learningMidi: false, assignedCc: null },
      delayModDepth: { externalValue: undefined, learningMidi: false, assignedCc: null },
      reverbMix: { externalValue: 0.25, learningMidi: false, assignedCc: null },
      reverbDamp: { externalValue: undefined, learningMidi: false, assignedCc: null },
      reverbDecay: { externalValue: undefined, learningMidi: false, assignedCc: null },
      reverbPreDelay: { externalValue: undefined, learningMidi: false, assignedCc: null },
    }
    const { container } = render(Effects, { props: { midiState } })
    const knobValues = container.querySelectorAll('.knob-value')
    expect(knobValues[5].textContent).toBe('0.25')
  })

  it('midiState.reverbDecay.externalValue drives decay knob display', () => {
    const midiState = {
      delayTime: { externalValue: undefined, learningMidi: false, assignedCc: null },
      delayFeedback: { externalValue: undefined, learningMidi: false, assignedCc: null },
      delayMix: { externalValue: undefined, learningMidi: false, assignedCc: null },
      delayModRate: { externalValue: undefined, learningMidi: false, assignedCc: null },
      delayModDepth: { externalValue: undefined, learningMidi: false, assignedCc: null },
      reverbMix: { externalValue: undefined, learningMidi: false, assignedCc: null },
      reverbDamp: { externalValue: undefined, learningMidi: false, assignedCc: null },
      reverbDecay: { externalValue: 0.3, learningMidi: false, assignedCc: null },
      reverbPreDelay: { externalValue: undefined, learningMidi: false, assignedCc: null },
    }
    const { container } = render(Effects, { props: { midiState } })
    const knobValues = container.querySelectorAll('.knob-value')
    expect(knobValues[7].textContent).toBe('0.30')
  })

  it('midiState.reverbDamp.externalValue drives damp knob onchange', () => {
    const onchange = vi.fn()
    const midiState = {
      delayTime: { externalValue: undefined, learningMidi: false, assignedCc: null },
      delayFeedback: { externalValue: undefined, learningMidi: false, assignedCc: null },
      delayMix: { externalValue: undefined, learningMidi: false, assignedCc: null },
      delayModRate: { externalValue: undefined, learningMidi: false, assignedCc: null },
      delayModDepth: { externalValue: undefined, learningMidi: false, assignedCc: null },
      reverbMix: { externalValue: undefined, learningMidi: false, assignedCc: null },
      reverbDamp: { externalValue: 0.75, learningMidi: false, assignedCc: null },
      reverbDecay: { externalValue: undefined, learningMidi: false, assignedCc: null },
      reverbPreDelay: { externalValue: undefined, learningMidi: false, assignedCc: null },
    }
    render(Effects, { props: { midiState, onchange } })
    const dampCalls = onchange.mock.calls.filter((c) => c[0].param === 'reverbDamp')
    expect(dampCalls.length).toBeGreaterThan(0)
    expect(dampCalls[dampCalls.length - 1][0].value).toBe(0.75)
  })

  it('midiState.reverbPreDelay.externalValue drives pre-delay knob display', () => {
    const midiState = {
      delayTime: { externalValue: undefined, learningMidi: false, assignedCc: null },
      delayFeedback: { externalValue: undefined, learningMidi: false, assignedCc: null },
      delayMix: { externalValue: undefined, learningMidi: false, assignedCc: null },
      delayModRate: { externalValue: undefined, learningMidi: false, assignedCc: null },
      delayModDepth: { externalValue: undefined, learningMidi: false, assignedCc: null },
      reverbMix: { externalValue: undefined, learningMidi: false, assignedCc: null },
      reverbDamp: { externalValue: undefined, learningMidi: false, assignedCc: null },
      reverbDecay: { externalValue: undefined, learningMidi: false, assignedCc: null },
      reverbPreDelay: { externalValue: 0.05, learningMidi: false, assignedCc: null },
    }
    const { container } = render(Effects, { props: { midiState } })
    const knobValues = container.querySelectorAll('.knob-value')
    expect(knobValues[8].textContent).toBe('50 ms')
  })
})

describe('Effects — delay time knob props', () => {
  it('delay time knob defaults to 300 ms', () => {
    const { container } = render(Effects)
    const knobValues = container.querySelectorAll('.knob-value')
    expect(knobValues[0].textContent).toBe('300 ms')
  })

  it('delay time knob accepts externalValue of 2.0 s (max = 2.0)', () => {
    const midiState = {
      delayTime: { externalValue: 2.0, learningMidi: false, assignedCc: null },
      delayFeedback: { externalValue: undefined, learningMidi: false, assignedCc: null },
      delayMix: { externalValue: undefined, learningMidi: false, assignedCc: null },
      reverbMix: { externalValue: undefined, learningMidi: false, assignedCc: null },
      reverbDamp: { externalValue: undefined, learningMidi: false, assignedCc: null },
      reverbDecay: { externalValue: undefined, learningMidi: false, assignedCc: null },
      reverbPreDelay: { externalValue: undefined, learningMidi: false, assignedCc: null },
    }
    const { container } = render(Effects, { props: { midiState } })
    const knobValues = container.querySelectorAll('.knob-value')
    expect(knobValues[0].textContent).toBe('2.00 s')
  })

  it('delay time knob double-click resets to 0.3 s default (linear scale, default unchanged)', async () => {
    const onchange = vi.fn()
    const { container } = render(Effects, { props: { onchange } })
    const hit = container.querySelectorAll('.knob-hit')[0]
    await fireEvent.dblClick(hit)
    const call = onchange.mock.calls.find((c) => c[0].param === 'delayTime')
    expect(call[0].value).toBeCloseTo(0.3, 5)
  })
})

describe('Effects — section-header restructure', () => {
  it('delay knob row contains exactly 3 knobs and no toggle button', () => {
    const { container } = render(Effects)
    const delayRow = container.querySelector('.effects-row:not(.reverb-row)')
    expect(delayRow.querySelectorAll('.knob-hit')).toHaveLength(3)
    expect(delayRow.querySelector('.toggle-btn')).toBeNull()
  })

  it('reverb knob row contains exactly 4 knobs and no toggle button', () => {
    const { container } = render(Effects)
    const reverbRow = container.querySelector('.reverb-row')
    expect(reverbRow.querySelectorAll('.knob-hit')).toHaveLength(4)
    expect(reverbRow.querySelector('.toggle-btn')).toBeNull()
  })
})
