import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import WheelPanel from './WheelPanel.svelte'

describe('WheelPanel — rendering', () => {
  it('renders the panel label', () => {
    const { getByText } = render(WheelPanel)
    expect(getByText('wheel')).toBeTruthy()
  })

  it('renders the wheel track', () => {
    const { container } = render(WheelPanel)
    expect(container.querySelector('.wheel-track')).not.toBeNull()
  })

  it('renders the wheel fill', () => {
    const { container } = render(WheelPanel)
    expect(container.querySelector('.wheel-fill')).not.toBeNull()
  })
})

describe('WheelPanel — drag interaction', () => {
  it('dragging wheel upward emits modWheel with positive value', async () => {
    const onchange = vi.fn()
    const { container } = render(WheelPanel, { props: { onchange } })
    const track = container.querySelector('.wheel-track')
    await fireEvent.pointerDown(track, { clientY: 100 })
    await fireEvent.pointerMove(track, { clientY: 20 })
    await fireEvent.pointerUp(track)
    const wheelCalls = onchange.mock.calls.filter((c) => c[0].param === 'modWheel')
    expect(wheelCalls.length).toBeGreaterThan(0)
    expect(wheelCalls[wheelCalls.length - 1][0].value).toBeGreaterThan(0)
  })

  it('wheel value is clamped to 0-1', async () => {
    const onchange = vi.fn()
    const { container } = render(WheelPanel, { props: { onchange } })
    const track = container.querySelector('.wheel-track')
    await fireEvent.pointerDown(track, { clientY: 500 })
    await fireEvent.pointerMove(track, { clientY: -5000 })
    await fireEvent.pointerUp(track)
    const wheelCalls = onchange.mock.calls.filter((c) => c[0].param === 'modWheel')
    expect(wheelCalls.length).toBeGreaterThan(0)
    const lastVal = wheelCalls[wheelCalls.length - 1][0].value
    expect(lastVal).toBeLessThanOrEqual(1)
    expect(lastVal).toBeGreaterThanOrEqual(0)
  })
})

describe('WheelPanel — externalValue prop', () => {
  it('externalValue updates wheel fill height', () => {
    const { container } = render(WheelPanel, { props: { externalValue: 0.75 } })
    const fill = container.querySelector('.wheel-fill')
    expect(fill).not.toBeNull()
    expect(fill.style.height).toBe('75%')
  })
})
