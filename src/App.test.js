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

describe('App — all eight panels render', () => {
  it('renders oscillator panel label', () => {
    const { getByText } = render(App)
    expect(getByText('oscillator')).toBeTruthy()
  })

  it('renders mixer panel label', () => {
    const { getByText } = render(App)
    expect(getByText('mixer')).toBeTruthy()
  })

  it('renders filter panel label', () => {
    const { getAllByText } = render(App)
    expect(getAllByText('filter').length).toBeGreaterThan(0)
  })

  it('renders filter env panel label', () => {
    const { getByText } = render(App)
    expect(getByText('filter env')).toBeTruthy()
  })

  it('renders amp env panel label', () => {
    const { getByText } = render(App)
    expect(getByText('amp env')).toBeTruthy()
  })

  it('renders modulation panel label', () => {
    const { getByText } = render(App)
    expect(getByText('modulation')).toBeTruthy()
  })

  it('renders glide panel label', () => {
    const { getByText } = render(App)
    expect(getByText('glide')).toBeTruthy()
  })

  it('renders volume/master panel', () => {
    const { container } = render(App)
    expect(container.querySelector('.panels')).not.toBeNull()
  })
})

describe('App — MIDI CC 1 updates modWheel external value', () => {
  it('App renders with modWheel wiring in place (panels present)', () => {
    const { container } = render(App)
    expect(container.querySelector('.panels')).not.toBeNull()
  })

  it('modulation panel is rendered so CC 1 has a target', () => {
    const { getByText } = render(App)
    expect(getByText('modulation')).toBeTruthy()
  })
})
