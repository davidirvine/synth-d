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

  it('clicking + on OSC 1 with range already +2 emits nothing (clamped)', async () => {
    const onchange = vi.fn()
    const { container } = render(Oscillator, { props: { osc1Range: 2, onchange } })
    const sections = container.querySelectorAll('.osc-section')
    const plusBtn = sections[0].querySelectorAll('.step-btn')[1]
    await fireEvent.click(plusBtn)
    expect(onchange).not.toHaveBeenCalled()
  })

  it('clicking + on OSC 1 with range +1 emits osc1Range 2', async () => {
    const onchange = vi.fn()
    const { container } = render(Oscillator, { props: { osc1Range: 1, onchange } })
    const sections = container.querySelectorAll('.osc-section')
    await fireEvent.click(sections[0].querySelectorAll('.step-btn')[1])
    expect(onchange).toHaveBeenCalledWith({ param: 'osc1Range', value: 2 })
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
    const lfoBtn = /** @type {Element} */ (sections[2].querySelector('.lfo-btn'))
    expect(lfoBtn.classList.contains('active')).toBe(false)
  })

  it('clicking LFO button emits osc3LfoMode 1', async () => {
    const onchange = vi.fn()
    const { container } = render(Oscillator, { props: { onchange } })
    const sections = container.querySelectorAll('.osc-section')
    const lfoBtn = /** @type {Element} */ (sections[2].querySelector('.lfo-btn'))
    await fireEvent.click(lfoBtn)
    expect(onchange).toHaveBeenCalledWith({ param: 'osc3LfoMode', value: 1 })
  })

  it('clicking LFO button while osc3LfoMode is 1 emits 0', async () => {
    const onchange = vi.fn()
    const { container } = render(Oscillator, { props: { osc3LfoMode: 1, onchange } })
    const sections = container.querySelectorAll('.osc-section')
    await fireEvent.click(/** @type {Element} */ (sections[2].querySelector('.lfo-btn')))
    expect(onchange).toHaveBeenCalledWith({ param: 'osc3LfoMode', value: 0 })
  })

  it('renders LFO rate knob in OSC 3 section', () => {
    const { container } = render(Oscillator)
    const sections = container.querySelectorAll('.osc-section')
    const rangeRow = /** @type {Element} */ (sections[2].querySelector('.range-row'))
    expect(rangeRow.querySelector('svg')).not.toBeNull()
  })

  it('LFO rate knob is disabled when LFO mode is off', () => {
    const { container } = render(Oscillator)
    const sections = container.querySelectorAll('.osc-section')
    const rateWrap = /** @type {Element} */ (
      sections[2].querySelector('.range-row')
    ).querySelectorAll('.knob-wrap')[1]
    expect(rateWrap.classList.contains('disabled')).toBe(true)
  })

  it('LFO rate knob is enabled when osc3LfoMode prop is 1', () => {
    const { container } = render(Oscillator, { props: { osc3LfoMode: 1 } })
    const sections = container.querySelectorAll('.osc-section')
    const rateWrap = /** @type {Element} */ (
      sections[2].querySelector('.range-row')
    ).querySelectorAll('.knob-wrap')[1]
    expect(rateWrap.classList.contains('disabled')).toBe(false)
  })

  it('OSC 3 range − button is disabled when osc3LfoMode prop is 1', () => {
    const { container } = render(Oscillator, { props: { osc3LfoMode: 1 } })
    const sections = container.querySelectorAll('.osc-section')
    // buttons[0] = '−', buttons[1] = '+'
    const buttons = /** @type {Element} */ (
      sections[2].querySelector('.range-row')
    ).querySelectorAll('.step-btn')
    expect(/** @type {HTMLButtonElement} */ (buttons[0]).disabled).toBe(true)
  })

  it('OSC 3 range − button is enabled when LFO mode is off', () => {
    const { container } = render(Oscillator)
    const sections = container.querySelectorAll('.osc-section')
    // buttons[0] = '−', buttons[1] = '+'
    const buttons = /** @type {Element} */ (
      sections[2].querySelector('.range-row')
    ).querySelectorAll('.step-btn')
    expect(/** @type {HTMLButtonElement} */ (buttons[0]).disabled).toBe(false)
  })

  it('OSC 3 range + button is disabled when osc3LfoMode prop is 1', () => {
    const { container } = render(Oscillator, { props: { osc3LfoMode: 1 } })
    const sections = container.querySelectorAll('.osc-section')
    // buttons[0] = '−', buttons[1] = '+'
    const buttons = /** @type {Element} */ (
      sections[2].querySelector('.range-row')
    ).querySelectorAll('.step-btn')
    expect(/** @type {HTMLButtonElement} */ (buttons[1]).disabled).toBe(true)
  })

  it('OSC 3 range + button is enabled when LFO mode is off', () => {
    const { container } = render(Oscillator)
    const sections = container.querySelectorAll('.osc-section')
    // buttons[0] = '−', buttons[1] = '+'
    const buttons = /** @type {Element} */ (
      sections[2].querySelector('.range-row')
    ).querySelectorAll('.step-btn')
    expect(/** @type {HTMLButtonElement} */ (buttons[1]).disabled).toBe(false)
  })

  it('OSC 3 detune knob-wrap has disabled class when osc3LfoMode prop is 1', () => {
    const { container } = render(Oscillator, { props: { osc3LfoMode: 1 } })
    const sections = container.querySelectorAll('.osc-section')
    // knob-wrap[0] = detune, knob-wrap[1] = LFO rate
    const detuneWrap = /** @type {Element} */ (
      sections[2].querySelector('.range-row')
    ).querySelectorAll('.knob-wrap')[0]
    expect(detuneWrap.classList.contains('disabled')).toBe(true)
  })

  it('OSC 3 detune knob-wrap does not have disabled class when LFO mode is off', () => {
    const { container } = render(Oscillator)
    const sections = container.querySelectorAll('.osc-section')
    // knob-wrap[0] = detune, knob-wrap[1] = LFO rate
    const detuneWrap = /** @type {Element} */ (
      sections[2].querySelector('.range-row')
    ).querySelectorAll('.knob-wrap')[0]
    expect(detuneWrap.classList.contains('disabled')).toBe(false)
  })
})

describe('Oscillator — controlled wave/range props', () => {
  it('reflects the active waveform from props', () => {
    const { container } = render(Oscillator, { props: { osc1Wave: 2, osc2Wave: 3 } })
    const sections = container.querySelectorAll('.osc-section')
    const osc1Btns = sections[0].querySelectorAll('.wave-btn')
    expect(osc1Btns[2].classList.contains('active')).toBe(true)
    expect(osc1Btns[0].classList.contains('active')).toBe(false)
    const osc2Btns = sections[1].querySelectorAll('.wave-btn')
    expect(osc2Btns[3].classList.contains('active')).toBe(true)
  })

  it('reflects the range values from props', () => {
    const { container } = render(Oscillator, { props: { osc1Range: -2, osc2Range: 1 } })
    const rangeVals = container.querySelectorAll('.range-val')
    expect(rangeVals[0].textContent).toBe('-2')
    expect(rangeVals[1].textContent).toBe('+1')
  })

  it('wave buttons reflect a reset to defaults (all back to tri) via props', () => {
    const { container } = render(Oscillator, { props: { osc1Wave: 0, osc2Wave: 0, osc3Wave: 0 } })
    const sections = container.querySelectorAll('.osc-section')
    sections.forEach((section) => {
      const btns = section.querySelectorAll('.wave-btn')
      expect(btns[0].classList.contains('active')).toBe(true)
    })
  })
})
