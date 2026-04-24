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
    const btn = container.querySelector('.glide-btn')
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
    await fireEvent.click(container.querySelector('.glide-btn'))
    expect(onchange).toHaveBeenCalledWith({ param: 'glideOn', value: 1 })
  })

  it('button becomes active after click', async () => {
    const { container } = render(Glide)
    await fireEvent.click(container.querySelector('.glide-btn'))
    expect(container.querySelector('.glide-btn').classList.contains('active')).toBe(true)
  })

  it('button shows on after click', async () => {
    const { container } = render(Glide)
    await fireEvent.click(container.querySelector('.glide-btn'))
    expect(container.querySelector('.glide-btn').textContent.trim()).toBe('on')
  })

  it('second click emits glideOn 0', async () => {
    const onchange = vi.fn()
    const { container } = render(Glide, { props: { onchange } })
    const btn = container.querySelector('.glide-btn')
    await fireEvent.click(btn)
    await fireEvent.click(btn)
    const calls = onchange.mock.calls.filter((c) => c[0].param === 'glideOn')
    expect(calls[calls.length - 1][0].value).toBe(0)
  })
})

describe('Glide — rate knob', () => {
  it('rate knob double-click emits glideRate', async () => {
    const onchange = vi.fn()
    const { container } = render(Glide, { props: { onchange } })
    const hit = container.querySelector('.knob-hit')
    await fireEvent.dblClick(hit)
    const params = onchange.mock.calls.map((c) => c[0].param)
    expect(params).toContain('glideRate')
  })

  it('rate knob is disabled when glide is off', () => {
    const { container } = render(Glide)
    expect(container.querySelector('.knob-wrap').classList.contains('disabled')).toBe(true)
  })

  it('rate knob is enabled after glide is toggled on', async () => {
    const { container } = render(Glide)
    await fireEvent.click(container.querySelector('.glide-btn'))
    expect(container.querySelector('.knob-wrap').classList.contains('disabled')).toBe(false)
  })
})
