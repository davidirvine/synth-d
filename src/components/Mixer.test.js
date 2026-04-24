import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import Mixer from './Mixer.svelte'

describe('Mixer — rendering', () => {
  it('renders the panel label', () => {
    const { getByText } = render(Mixer)
    expect(getByText('mixer')).toBeTruthy()
  })

  it('renders four knobs (osc1, osc2, osc3, noise)', () => {
    const { container } = render(Mixer)
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBe(4)
  })

  it('renders the noise type toggle button', () => {
    const { container } = render(Mixer)
    expect(container.querySelector('.noise-type-btn')).not.toBeNull()
  })

  it('noise type button defaults to white (wht)', () => {
    const { container } = render(Mixer)
    expect(container.querySelector('.noise-type-btn').textContent.trim()).toBe('wht')
  })
})

describe('Mixer — noise type toggle', () => {
  it('clicking noise type toggles to pink and emits noiseType 1', async () => {
    const onchange = vi.fn()
    const { container } = render(Mixer, { props: { onchange } })
    await fireEvent.click(container.querySelector('.noise-type-btn'))
    expect(onchange).toHaveBeenCalledWith({ param: 'noiseType', value: 1 })
  })

  it('button shows pink after toggle', async () => {
    const { container } = render(Mixer)
    await fireEvent.click(container.querySelector('.noise-type-btn'))
    expect(container.querySelector('.noise-type-btn').textContent.trim()).toBe('pink')
  })

  it('second click toggles back to white and emits noiseType 0', async () => {
    const onchange = vi.fn()
    const { container } = render(Mixer, { props: { onchange } })
    const btn = container.querySelector('.noise-type-btn')
    await fireEvent.click(btn)
    await fireEvent.click(btn)
    const calls = onchange.mock.calls.filter((c) => c[0].param === 'noiseType')
    expect(calls[calls.length - 1][0].value).toBe(0)
  })
})

describe('Mixer — onchange emission', () => {
  it('knob double-click fires onchange for osc1Level', async () => {
    const onchange = vi.fn()
    const { container } = render(Mixer, { props: { onchange } })
    const hit = container.querySelectorAll('.knob-hit')[0]
    await fireEvent.dblClick(hit)
    const params = onchange.mock.calls.map((c) => c[0].param)
    expect(params).toContain('osc1Level')
  })

  it('knob double-click fires onchange for osc2Level', async () => {
    const onchange = vi.fn()
    const { container } = render(Mixer, { props: { onchange } })
    const hit = container.querySelectorAll('.knob-hit')[1]
    await fireEvent.dblClick(hit)
    const params = onchange.mock.calls.map((c) => c[0].param)
    expect(params).toContain('osc2Level')
  })

  it('knob double-click fires onchange for osc3Level', async () => {
    const onchange = vi.fn()
    const { container } = render(Mixer, { props: { onchange } })
    const hit = container.querySelectorAll('.knob-hit')[2]
    await fireEvent.dblClick(hit)
    const params = onchange.mock.calls.map((c) => c[0].param)
    expect(params).toContain('osc3Level')
  })

  it('knob double-click fires onchange for noiseLevel', async () => {
    const onchange = vi.fn()
    const { container } = render(Mixer, { props: { onchange } })
    const hit = container.querySelectorAll('.knob-hit')[3]
    await fireEvent.dblClick(hit)
    const params = onchange.mock.calls.map((c) => c[0].param)
    expect(params).toContain('noiseLevel')
  })
})
