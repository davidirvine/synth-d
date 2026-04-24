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

  it('renders two noise type buttons (wht and pink)', () => {
    const { container } = render(Mixer)
    expect(container.querySelectorAll('.noise-btn').length).toBe(2)
  })

  it('noise type defaults to white (wht button is active)', () => {
    const { container } = render(Mixer)
    const whtBtn = [...container.querySelectorAll('.noise-btn')].find(
      (b) => b.textContent.trim() === 'wht'
    )
    expect(whtBtn.classList.contains('active')).toBe(true)
  })
})

describe('Mixer — noise type toggle', () => {
  it('clicking pink button emits noiseType 1', async () => {
    const onchange = vi.fn()
    const { container } = render(Mixer, { props: { onchange } })
    const pinkBtn = [...container.querySelectorAll('.noise-btn')].find(
      (b) => b.textContent.trim() === 'pink'
    )
    await fireEvent.click(pinkBtn)
    expect(onchange).toHaveBeenCalledWith({ param: 'noiseType', value: 1 })
  })

  it('pink button has active class after clicking it', async () => {
    const { container } = render(Mixer)
    const pinkBtn = [...container.querySelectorAll('.noise-btn')].find(
      (b) => b.textContent.trim() === 'pink'
    )
    await fireEvent.click(pinkBtn)
    expect(pinkBtn.classList.contains('active')).toBe(true)
  })

  it('clicking wht after pink emits noiseType 0', async () => {
    const onchange = vi.fn()
    const { container } = render(Mixer, { props: { onchange } })
    const btns = container.querySelectorAll('.noise-btn')
    const pinkBtn = [...btns].find((b) => b.textContent.trim() === 'pink')
    const whtBtn = [...btns].find((b) => b.textContent.trim() === 'wht')
    await fireEvent.click(pinkBtn)
    await fireEvent.click(whtBtn)
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
