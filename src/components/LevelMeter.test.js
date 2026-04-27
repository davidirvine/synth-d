import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/svelte'
import { flushSync } from 'svelte'
import LevelMeter from './LevelMeter.svelte'

describe('LevelMeter', () => {
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

  it('all segments unlit when powered is false', () => {
    const getPeak = vi.fn().mockReturnValue(0)
    const { container } = render(LevelMeter, { props: { getPeak, powered: false } })

    expect(container.querySelectorAll('.lit').length).toBe(0)
    expect(getPeak).not.toHaveBeenCalled()
    expect(requestAnimationFrame).not.toHaveBeenCalled()
  })

  it('renders without getPeak prop (default returns 0)', () => {
    expect(() => render(LevelMeter, { props: { powered: false } })).not.toThrow()
  })

  it('clip segment lights when peak exceeds 1.0', () => {
    const getPeak = vi.fn().mockReturnValue(1.5)
    const { container } = render(LevelMeter, { props: { getPeak, powered: true } })

    const tick = requestAnimationFrame.mock.calls[0][0]
    flushSync(() => tick())

    const clipSeg = container.querySelector('.seg-clip')
    expect(clipSeg).not.toBeNull()
    expect(clipSeg.classList.contains('lit')).toBe(true)
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1500)
  })

  it('clip latch persists after peak drops below 1.0', () => {
    let peakValue = 1.5
    const getPeak = vi.fn(() => peakValue)
    const { container } = render(LevelMeter, { props: { getPeak, powered: true } })

    const tick = requestAnimationFrame.mock.calls[0][0]

    flushSync(() => tick())
    const clipSeg = container.querySelector('.seg-clip')
    expect(clipSeg).not.toBeNull()
    expect(clipSeg.classList.contains('lit')).toBe(true)

    // Peak drops; setTimeout stub means the clear callback never fires
    peakValue = 0.3
    flushSync(() => tick())

    expect(clipSeg.classList.contains('lit')).toBe(true)
  })

  describe('computeLitCount boundaries', () => {
    function litSegCount(container) {
      return container.querySelectorAll('.seg:not(.seg-clip).lit').length
    }

    it.each([
      [0, 0],
      [0.001, 1],
      [0.125, 2],
      [0.25, 3],
      [0.375, 4],
      [0.5, 5],
      [0.675, 6],
      [0.85, 7],
      [1.0, 7],
    ])('peak %f → %i non-clip segments lit', (peak, expected) => {
      const getPeak = vi.fn().mockReturnValue(peak)
      const { container } = render(LevelMeter, { props: { getPeak, powered: true } })
      const tick = requestAnimationFrame.mock.calls[0][0]
      flushSync(() => tick())
      expect(litSegCount(container)).toBe(expected)
    })
  })

  it('cancels rAF and timeout on unmount', () => {
    const getPeak = vi.fn().mockReturnValue(1.5)
    const { unmount } = render(LevelMeter, { props: { getPeak, powered: true } })

    const tick = requestAnimationFrame.mock.calls[0][0]
    flushSync(() => tick())

    unmount()

    expect(cancelAnimationFrame).toHaveBeenCalled()
    expect(clearTimeout).toHaveBeenCalled()
  })

  it('powered true→false clears clip latch and cancels rAF', () => {
    const getPeak = vi.fn().mockReturnValue(1.5)
    const { container, rerender } = render(LevelMeter, { props: { getPeak, powered: true } })

    const tick = requestAnimationFrame.mock.calls[0][0]
    flushSync(() => tick())

    const clipSeg = container.querySelector('.seg-clip')
    expect(clipSeg).not.toBeNull()
    expect(clipSeg.classList.contains('lit')).toBe(true)

    flushSync(() => rerender({ props: { getPeak, powered: false } }))

    expect(clipSeg.classList.contains('lit')).toBe(false)
    expect(cancelAnimationFrame).toHaveBeenCalled()
    expect(clearTimeout).toHaveBeenCalled()
    expect(container.querySelectorAll('.lit').length).toBe(0)
  })
})
