import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/svelte'
import App from './App.svelte'

vi.mock('./audio/engine.js', () => ({
  powerOn: vi.fn().mockResolvedValue(undefined),
  powerOff: vi.fn().mockResolvedValue(undefined),
  setParam: vi.fn(),
}))

describe('App power state', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the power button', () => {
    const { container } = render(App)
    expect(container.querySelector('button[aria-label]')).not.toBeNull()
  })

  it('main panel inert property is true when powered off on load', () => {
    const { container } = render(App)
    expect(container.querySelector('main').inert).toBe(true)
  })

  it('main panel inert property is falsy after power on', async () => {
    const { container } = render(App)
    const btn = container.querySelector('button')
    await fireEvent.click(btn)
    await waitFor(() => {
      expect(container.querySelector('main').inert).toBeFalsy()
    })
  })

  it('panels are dimmed when powered off', () => {
    const { container } = render(App)
    expect(container.querySelector('.panels').classList.contains('dimmed')).toBe(true)
  })

  it('panels are not dimmed after power on', async () => {
    const { container } = render(App)
    await fireEvent.click(container.querySelector('button'))
    await waitFor(() => {
      expect(container.querySelector('.panels').classList.contains('dimmed')).toBe(false)
    })
  })
})
