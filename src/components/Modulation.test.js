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

  it('all routing buttons are inactive by default', () => {
    const { container } = render(Modulation)
    container.querySelectorAll('.route-btn').forEach((btn) => {
      expect(btn.classList.contains('active')).toBe(false)
    })
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

  it('clicking an active route button (prop = 1) emits 0', async () => {
    const onchange = vi.fn()
    const { container } = render(Modulation, { props: { modToOsc1: 1, onchange } })
    await fireEvent.click(container.querySelectorAll('.route-btn')[0])
    expect(onchange).toHaveBeenCalledWith({ param: 'modToOsc1', value: 0 })
  })
})

describe('Modulation — controlled routing props', () => {
  it('routing buttons reflect their props (active when 1)', () => {
    const { container } = render(Modulation, {
      props: { modToOsc1: 1, modToOsc2: 0, modToFilter: 1 },
    })
    const btns = container.querySelectorAll('.route-btn')
    expect(btns[0].classList.contains('active')).toBe(true)
    expect(btns[1].classList.contains('active')).toBe(false)
    expect(btns[2].classList.contains('active')).toBe(true)
  })

  it('all buttons are inactive when all props are 0', () => {
    const { container } = render(Modulation, {
      props: { modToOsc1: 0, modToOsc2: 0, modToFilter: 0 },
    })
    container.querySelectorAll('.route-btn').forEach((btn) => {
      expect(btn.classList.contains('active')).toBe(false)
    })
  })
})
