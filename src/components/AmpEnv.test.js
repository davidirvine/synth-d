import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import AmpEnv from './AmpEnv.svelte'

describe('AmpEnv — sustain and release knobs', () => {
  it('renders a sustain label', () => {
    const { getByText } = render(AmpEnv)
    expect(getByText('sustain')).toBeTruthy()
  })

  it('renders a release label', () => {
    const { getAllByText } = render(AmpEnv)
    expect(getAllByText('release').length).toBeGreaterThan(0)
  })

  it('renders five knobs total (volume, attack, decay, sustain, release)', () => {
    const { container } = render(AmpEnv)
    expect(container.querySelectorAll('svg').length).toBe(5)
  })
})

describe('AmpEnv — D/R lock switch', () => {
  it('renders the D/R lock button', () => {
    const { container } = render(AmpEnv)
    expect(container.querySelector('.drlock-btn')).not.toBeNull()
  })

  it('D/R lock button defaults to on', () => {
    const { container } = render(AmpEnv)
    expect(
      /** @type {Element} */ (container.querySelector('.drlock-btn')).classList.contains('active')
    ).toBe(true)
  })

  it('clicking D/R lock emits drLock 0', async () => {
    const onchange = vi.fn()
    const { container } = render(AmpEnv, { props: { onchange } })
    await fireEvent.click(/** @type {Element} */ (container.querySelector('.drlock-btn')))
    expect(onchange).toHaveBeenCalledWith({ param: 'drLock', value: 0 })
  })

  it('D/R lock button becomes inactive after click', async () => {
    const { container } = render(AmpEnv)
    await fireEvent.click(/** @type {Element} */ (container.querySelector('.drlock-btn')))
    expect(
      /** @type {Element} */ (container.querySelector('.drlock-btn')).classList.contains('active')
    ).toBe(false)
  })

  it('second click emits drLock 1', async () => {
    const onchange = vi.fn()
    const { container } = render(AmpEnv, { props: { onchange } })
    const btn = /** @type {Element} */ (container.querySelector('.drlock-btn'))
    await fireEvent.click(btn)
    await fireEvent.click(btn)
    const calls = onchange.mock.calls.filter((c) => c[0].param === 'drLock')
    expect(calls[calls.length - 1][0].value).toBe(1)
  })

  it('release knob is disabled when D/R lock is on', () => {
    const { container } = render(AmpEnv)
    const releaseWrap = container.querySelectorAll('.knob-wrap')[4]
    expect(releaseWrap.classList.contains('disabled')).toBe(true)
  })

  it('release knob is enabled when D/R lock is off', async () => {
    const { container } = render(AmpEnv)
    await fireEvent.click(/** @type {Element} */ (container.querySelector('.drlock-btn')))
    const releaseWrap = container.querySelectorAll('.knob-wrap')[4]
    expect(releaseWrap.classList.contains('disabled')).toBe(false)
  })

  it('reset emits drLock 1', async () => {
    const onchange = vi.fn()
    const { rerender } = render(AmpEnv, { props: { onchange, reset: 0 } })
    await rerender({ onchange, reset: 1 })
    expect(onchange).toHaveBeenCalledWith({ param: 'drLock', value: 1 })
  })
})

describe('AmpEnv — LevelLed presence', () => {
  it('renders LevelLed inside the panel-header row', () => {
    const { container } = render(AmpEnv)
    expect(container.querySelector('.panel-header .level-led')).not.toBeNull()
  })
})

describe('AmpEnv — onchange events', () => {
  it('sustain knob emits ampSustain', async () => {
    const onchange = vi.fn()
    const { container } = render(AmpEnv, { props: { onchange } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.dblClick(hits[3])
    const params = onchange.mock.calls.map((c) => c[0].param)
    expect(params).toContain('ampSustain')
  })

  it('release knob emits ampRelease', async () => {
    const onchange = vi.fn()
    const { container } = render(AmpEnv, { props: { onchange } })
    const lockBtn = /** @type {Element} */ (container.querySelector('.drlock-btn'))
    expect(lockBtn).not.toBeNull()
    await fireEvent.click(lockBtn)
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.dblClick(hits[4])
    const params = onchange.mock.calls.map((c) => c[0].param)
    expect(params).toContain('ampRelease')
  })
})
