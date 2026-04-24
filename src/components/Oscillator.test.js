import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import Oscillator from './Oscillator.svelte'

describe('Oscillator — waveform selection', () => {
  it('renders six waveform buttons for each of three oscillators', () => {
    const { container } = render(Oscillator)
    const waveBtns = container.querySelectorAll('.wave-btn')
    expect(waveBtns.length).toBe(18)
  })

  it('OSC 1 first waveform button is active by default', () => {
    const { container } = render(Oscillator)
    const sections = container.querySelectorAll('.osc-section')
    const osc1Btns = sections[0].querySelectorAll('.wave-btn')
    expect(osc1Btns[0].classList.contains('active')).toBe(true)
    expect(osc1Btns[1].classList.contains('active')).toBe(false)
  })

  it('clicking a waveform button emits osc1Wave onchange', async () => {
    const onchange = vi.fn()
    const { container } = render(Oscillator, { props: { onchange } })
    const sections = container.querySelectorAll('.osc-section')
    const sawBtn = sections[0].querySelectorAll('.wave-btn')[2]
    await fireEvent.click(sawBtn)
    expect(onchange).toHaveBeenCalledWith({ param: 'osc1Wave', value: 2 })
  })

  it('clicking OSC 2 waveform emits osc2Wave onchange', async () => {
    const onchange = vi.fn()
    const { container } = render(Oscillator, { props: { onchange } })
    const sections = container.querySelectorAll('.osc-section')
    const triBtn = sections[1].querySelectorAll('.wave-btn')[0]
    await fireEvent.click(triBtn)
    expect(onchange).toHaveBeenCalledWith({ param: 'osc2Wave', value: 0 })
  })

  it('clicking OSC 3 waveform emits osc3Wave onchange', async () => {
    const onchange = vi.fn()
    const { container } = render(Oscillator, { props: { onchange } })
    const sections = container.querySelectorAll('.osc-section')
    const squareBtn = sections[2].querySelectorAll('.wave-btn')[3]
    await fireEvent.click(squareBtn)
    expect(onchange).toHaveBeenCalledWith({ param: 'osc3Wave', value: 3 })
  })
})

describe('Oscillator — octave range', () => {
  it('renders three range steppers', () => {
    const { container } = render(Oscillator)
    const rangeVals = container.querySelectorAll('.range-val')
    expect(rangeVals.length).toBe(3)
  })

  it('all ranges default to 0', () => {
    const { container } = render(Oscillator)
    const rangeVals = container.querySelectorAll('.range-val')
    rangeVals.forEach((v) => expect(v.textContent).toBe('0'))
  })

  it('clicking + on OSC 1 emits osc1Range 1', async () => {
    const onchange = vi.fn()
    const { container } = render(Oscillator, { props: { onchange } })
    const sections = container.querySelectorAll('.osc-section')
    const plusBtn = sections[0].querySelectorAll('.step-btn')[1]
    await fireEvent.click(plusBtn)
    expect(onchange).toHaveBeenCalledWith({ param: 'osc1Range', value: 1 })
  })

  it('clicking - on OSC 2 emits osc2Range -1', async () => {
    const onchange = vi.fn()
    const { container } = render(Oscillator, { props: { onchange } })
    const sections = container.querySelectorAll('.osc-section')
    const minusBtn = sections[1].querySelectorAll('.step-btn')[0]
    await fireEvent.click(minusBtn)
    expect(onchange).toHaveBeenCalledWith({ param: 'osc2Range', value: -1 })
  })

  it('range clamps at +2', async () => {
    const onchange = vi.fn()
    const { container } = render(Oscillator, { props: { onchange } })
    const sections = container.querySelectorAll('.osc-section')
    const plusBtn = sections[0].querySelectorAll('.step-btn')[1]
    await fireEvent.click(plusBtn)
    await fireEvent.click(plusBtn)
    await fireEvent.click(plusBtn)
    const calls = onchange.mock.calls.map((c) => c[0].value)
    expect(Math.max(...calls)).toBe(2)
  })
})

describe('Oscillator — detune knobs', () => {
  it('renders a detune knob in OSC 2 section', () => {
    const { container } = render(Oscillator)
    const sections = container.querySelectorAll('.osc-section')
    expect(sections[1].querySelector('svg')).not.toBeNull()
  })

  it('renders a detune knob in OSC 3 section', () => {
    const { container } = render(Oscillator)
    const sections = container.querySelectorAll('.osc-section')
    expect(sections[2].querySelector('svg')).not.toBeNull()
  })
})

describe('Oscillator — LFO mode', () => {
  it('renders LFO toggle button in OSC 3 section', () => {
    const { container } = render(Oscillator)
    const sections = container.querySelectorAll('.osc-section')
    expect(sections[2].querySelector('.lfo-btn')).not.toBeNull()
  })

  it('LFO button is inactive by default', () => {
    const { container } = render(Oscillator)
    const sections = container.querySelectorAll('.osc-section')
    const lfoBtn = sections[2].querySelector('.lfo-btn')
    expect(lfoBtn.classList.contains('active')).toBe(false)
  })

  it('clicking LFO button emits osc3LfoMode 1', async () => {
    const onchange = vi.fn()
    const { container } = render(Oscillator, { props: { onchange } })
    const sections = container.querySelectorAll('.osc-section')
    const lfoBtn = sections[2].querySelector('.lfo-btn')
    await fireEvent.click(lfoBtn)
    expect(onchange).toHaveBeenCalledWith({ param: 'osc3LfoMode', value: 1 })
  })

  it('clicking LFO button twice toggles back to 0', async () => {
    const onchange = vi.fn()
    const { container } = render(Oscillator, { props: { onchange } })
    const sections = container.querySelectorAll('.osc-section')
    const lfoBtn = sections[2].querySelector('.lfo-btn')
    await fireEvent.click(lfoBtn)
    await fireEvent.click(lfoBtn)
    const calls = onchange.mock.calls.filter((c) => c[0].param === 'osc3LfoMode')
    expect(calls[calls.length - 1][0].value).toBe(0)
  })

  it('renders LFO rate knob in OSC 3 section', () => {
    const { container } = render(Oscillator)
    const sections = container.querySelectorAll('.osc-section')
    const rangeRow = sections[2].querySelector('.range-row')
    expect(rangeRow.querySelector('svg')).not.toBeNull()
  })
})
