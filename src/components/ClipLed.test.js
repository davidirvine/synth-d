import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/svelte'
import { flushSync } from 'svelte'
import ClipLed from './ClipLed.svelte'

describe('ClipLed', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', vi.fn().mockReturnValue(1))
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    vi.stubGlobal('setTimeout', vi.fn().mockReturnValue(1))
    vi.stubGlobal('clearTimeout', vi.fn())
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('LED element is always present in the DOM regardless of peak value', () => {
    const { container } = render(ClipLed, { props: { getPeak: () => 0, powered: false } })
    expect(container.querySelector('.clip-led')).not.toBeNull()
  })

  it('getPeak is not called when powered is false', () => {
    const getPeak = vi.fn().mockReturnValue(0)
    render(ClipLed, { props: { getPeak, powered: false } })
    expect(getPeak).not.toHaveBeenCalled()
    expect(requestAnimationFrame).not.toHaveBeenCalled()
  })

  it('clipLit becomes true when getPeak returns a value above 1.0', () => {
    const getPeak = vi.fn().mockReturnValue(1.5)
    const { container } = render(ClipLed, { props: { getPeak, powered: true } })

    const tick = requestAnimationFrame.mock.calls[0][0]
    flushSync(() => tick())

    expect(container.querySelector('.clip-led').classList.contains('clip')).toBe(true)
  })

  it('clipLit remains false when getPeak returns 1.0 or below', () => {
    const getPeak = vi.fn().mockReturnValue(1.0)
    const { container } = render(ClipLed, { props: { getPeak, powered: true } })

    const tick = requestAnimationFrame.mock.calls[0][0]
    flushSync(() => tick())

    expect(container.querySelector('.clip-led').classList.contains('clip')).toBe(false)
  })

  it('latch expires after 1500 ms with no further clip frames', () => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((cb) => {
        setTimeout(cb, 16)
        return 1
      })
    )

    const getPeak = vi.fn().mockReturnValue(1.5)
    const { container } = render(ClipLed, { props: { getPeak, powered: true } })

    vi.advanceTimersByTime(16)
    flushSync()

    const led = container.querySelector('.clip-led')
    expect(led.classList.contains('clip')).toBe(true)

    getPeak.mockReturnValue(0)
    vi.advanceTimersByTime(1500)
    flushSync()

    expect(led.classList.contains('clip')).toBe(false)

    vi.useRealTimers()
  })

  it('onDestroy teardown cancels rAF and clearTimeout', () => {
    const getPeak = vi.fn().mockReturnValue(1.5)
    const { unmount } = render(ClipLed, { props: { getPeak, powered: true } })

    const tick = requestAnimationFrame.mock.calls[0][0]
    flushSync(() => tick())

    unmount()

    expect(cancelAnimationFrame).toHaveBeenCalled()
    expect(clearTimeout).toHaveBeenCalled()
  })
})
