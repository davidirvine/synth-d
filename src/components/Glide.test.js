import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import Glide from './Glide.svelte'

describe('Glide — rendering', () => {
  it('renders the panel label', () => {
    const { getByText } = render(Glide)
    expect(getByText('glide')).toBeTruthy()
  })

  it('renders the glide toggle button', () => {
    const { container } = render(Glide)
    expect(container.querySelector('.glide-btn')).not.toBeNull()
  })

  it('glide button defaults to off', () => {
    const { container } = render(Glide)
    const btn = /** @type {Element} */ (container.querySelector('.glide-btn'))
    expect(btn.classList.contains('active')).toBe(false)
    expect(btn.textContent.trim()).toBe('off')
  })

  it('renders the rate knob', () => {
    const { container } = render(Glide)
    expect(container.querySelector('svg')).not.toBeNull()
  })
})

describe('Glide — toggle', () => {
  it('clicking glide button emits glideOn 1', async () => {
    const onchange = vi.fn()
    const { container } = render(Glide, { props: { onchange } })
    await fireEvent.click(/** @type {Element} */ (container.querySelector('.glide-btn')))
    expect(onchange).toHaveBeenCalledWith({ param: 'glideOn', value: 1 })
  })

  it('button is active and shows on when glideOn prop is 1', () => {
    const { container } = render(Glide, { props: { glideOn: 1 } })
    const btn = /** @type {Element} */ (container.querySelector('.glide-btn'))
    expect(btn.classList.contains('active')).toBe(true)
    expect(btn.textContent.trim()).toBe('on')
  })

  it('clicking while glideOn is 1 emits glideOn 0', async () => {
    const onchange = vi.fn()
    const { container } = render(Glide, { props: { glideOn: 1, onchange } })
    await fireEvent.click(/** @type {Element} */ (container.querySelector('.glide-btn')))
    expect(onchange).toHaveBeenCalledWith({ param: 'glideOn', value: 0 })
  })
})

describe('Glide — rate knob', () => {
  it('rate knob double-click emits glideRate', async () => {
    const onchange = vi.fn()
    const { container } = render(Glide, { props: { onchange } })
    const hit = /** @type {Element} */ (container.querySelector('.knob-hit'))
    await fireEvent.dblClick(hit)
    const params = onchange.mock.calls.map((c) => c[0].param)
    expect(params).toContain('glideRate')
  })

  it('rate knob is disabled when glide is off', () => {
    const { container } = render(Glide)
    expect(
      /** @type {Element} */ (container.querySelector('.knob-wrap')).classList.contains('disabled')
    ).toBe(true)
  })

  it('rate knob is enabled when glideOn prop is 1', () => {
    const { container } = render(Glide, { props: { glideOn: 1 } })
    expect(
      /** @type {Element} */ (container.querySelector('.knob-wrap')).classList.contains('disabled')
    ).toBe(false)
  })
})
