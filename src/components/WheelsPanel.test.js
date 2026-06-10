import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import WheelsPanel from './WheelsPanel.svelte'
import { STORAGE_KEY, defaultWheelPhysics } from '../audio/wheelPhysicsStore.js'
import { DEFAULT_PHYSICS } from '../audio/wheelPhysics.js'

beforeEach(() => {
  localStorage.clear()
})

/** Open the physics popup and return its container. */
async function openPopup(container) {
  const gear = /** @type {Element} */ (container.querySelector('.gear'))
  await fireEvent.click(gear)
  return /** @type {Element} */ (container.querySelector('.popup'))
}

describe('WheelsPanel — layout', () => {
  it('renders two labeled wheels (MOD, PITCH) and no "WHEEL" label', () => {
    const { container } = render(WheelsPanel)
    const labels = [...container.querySelectorAll('.wheel-label')].map((el) => el.textContent)
    expect(labels).toEqual(['MOD', 'PITCH'])
    expect(container.textContent).not.toContain('WHEEL')
  })

  it('shows a gear button in the top-left', () => {
    const { container } = render(WheelsPanel)
    const gear = container.querySelector('.gear')
    expect(gear).not.toBeNull()
    expect(gear?.getAttribute('aria-label')).toBe('wheel physics settings')
  })

  it('does not render the popup until the gear is activated', () => {
    const { container } = render(WheelsPanel)
    expect(container.querySelector('.popup')).toBeNull()
  })
})

describe('WheelsPanel — physics popup', () => {
  it('the gear opens a popup with exactly three PITCH physics knobs (no MOD knobs)', async () => {
    const { container } = render(WheelsPanel)
    const popup = await openPopup(container)
    expect(popup).not.toBeNull()
    // PITCH-only: mass/spring/damping for the PITCH wheel; the MOD wheel is a
    // non-spring control with no physics to tune.
    expect(popup.querySelectorAll('.knob-hit')).toHaveLength(3)
    const labels = [...popup.querySelectorAll('.knob-label')].map((el) => el.textContent)
    expect(labels).toEqual(['MASS', 'SPRING', 'DAMP'])
    expect(popup.textContent).not.toContain('MOD PHYSICS')
    expect(popup.textContent).toContain('PITCH PHYSICS')
  })

  it('dismisses on Escape', async () => {
    const { container } = render(WheelsPanel)
    await openPopup(container)
    await fireEvent.keyDown(window, { key: 'Escape' })
    expect(container.querySelector('.popup')).toBeNull()
  })

  it('dismisses on an outside click', async () => {
    const { container } = render(WheelsPanel)
    await openPopup(container)
    await fireEvent.pointerDown(document.body)
    expect(container.querySelector('.popup')).toBeNull()
  })
})

describe('WheelsPanel — physics persistence', () => {
  it('persists an edited PITCH physics knob to localStorage', async () => {
    const { container } = render(WheelsPanel)
    const popup = await openPopup(container)
    // First (and only first) knob is PITCH MASS; dragging up raises it above its default.
    const massKnob = /** @type {Element} */ (popup.querySelector('.knob-hit'))
    await fireEvent.pointerDown(massKnob, { clientY: 100 })
    await fireEvent.pointerMove(massKnob, { clientY: 50 })
    await fireEvent.pointerUp(massKnob)

    const stored = JSON.parse(/** @type {string} */ (localStorage.getItem(STORAGE_KEY)))
    expect(stored.pitch.mass).toBeGreaterThan(DEFAULT_PHYSICS.mass)
  })

  it('reset restores defaults and saves them', async () => {
    const { container, getByText } = render(WheelsPanel)
    const popup = await openPopup(container)
    const massKnob = /** @type {Element} */ (popup.querySelector('.knob-hit'))
    await fireEvent.pointerDown(massKnob, { clientY: 100 })
    await fireEvent.pointerMove(massKnob, { clientY: 50 })
    await fireEvent.pointerUp(massKnob)

    await fireEvent.click(getByText('reset'))

    const stored = JSON.parse(/** @type {string} */ (localStorage.getItem(STORAGE_KEY)))
    expect(stored).toEqual(defaultWheelPhysics())
  })

  it('loads previously saved PITCH physics on mount', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        pitch: { mass: 0.5, spring: 5, damping: 0.1 },
      })
    )
    const { container } = render(WheelsPanel)
    const popup = await openPopup(container)
    // The first (PITCH MASS) knob shows the loaded 0.5 (formatted to 2 dp).
    const firstValue = popup.querySelector('.knob-value')
    expect(firstValue?.textContent).toBe('0.50')
  })

  it('reset restores the three PITCH physics defaults', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ pitch: { mass: 0.5, spring: 5, damping: 0.1 } })
    )
    const { container, getByText } = render(WheelsPanel)
    const popup = await openPopup(container)
    await fireEvent.click(getByText('reset'))
    const values = [...popup.querySelectorAll('.knob-value')].map((el) => el.textContent)
    expect(values).toEqual([
      DEFAULT_PHYSICS.mass.toFixed(2),
      DEFAULT_PHYSICS.spring.toFixed(2),
      DEFAULT_PHYSICS.damping.toFixed(2),
    ])
  })
})

describe('WheelsPanel — MOD wheel is non-spring, rests at 0', () => {
  /** @type {Map<number, FrameRequestCallback>} */
  let rafMap
  let nextRafId

  beforeEach(() => {
    rafMap = new Map()
    nextRafId = 1
    vi.stubGlobal('requestAnimationFrame', (/** @type {FrameRequestCallback} */ cb) => {
      const id = nextRafId++
      rafMap.set(id, cb)
      return id
    })
    vi.stubGlobal('cancelAnimationFrame', (/** @type {number} */ id) => {
      rafMap.delete(id)
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('the MOD cursor rests at 0 (bottom of the track) on mount', () => {
    const { container } = render(WheelsPanel)
    const modCursor = /** @type {HTMLElement} */ (container.querySelector('.wheel-cursor'))
    // top = (1 − value) × (trackHeight − thickness) = 1 × 56 = 56
    expect(modCursor.style.top).toBe('56px')
  })

  it('the MOD wheel holds its position on release without scheduling a spring', async () => {
    const { container } = render(WheelsPanel)
    const modTrack = /** @type {Element} */ (container.querySelectorAll('.wheel-track')[0])
    await fireEvent.pointerDown(modTrack, { clientY: 100, pointerId: 1 })
    await fireEvent.pointerMove(modTrack, { clientY: 84, pointerId: 1 }) // 0 + 16/80 = 0.2
    await fireEvent.pointerUp(modTrack, { pointerId: 1 })

    // Non-spring: no animation frame is queued and the cursor holds at 0.2.
    expect(rafMap.size).toBe(0)
    const modCursor = /** @type {HTMLElement} */ (container.querySelector('.wheel-cursor'))
    expect(modCursor.style.top).toBe(`${(1 - 0.2) * 56}px`)
  })

  it('the PITCH wheel still springs back on release', async () => {
    const { container } = render(WheelsPanel)
    const pitchTrack = /** @type {Element} */ (container.querySelectorAll('.wheel-track')[1])
    await fireEvent.pointerDown(pitchTrack, { clientY: 100, pointerId: 2 })
    await fireEvent.pointerMove(pitchTrack, { clientY: 84, pointerId: 2 })
    await fireEvent.pointerUp(pitchTrack, { pointerId: 2 })
    // Spring wheel: a frame is queued to animate the cursor back toward 0.5.
    expect(rafMap.size).toBe(1)
  })
})

describe('WheelsPanel — wheel callbacks', () => {
  it('MOD wheel onchange is tagged with the modWheel param', async () => {
    const onModChange = vi.fn()
    const { container } = render(WheelsPanel, { props: { onModChange } })
    const modTrack = /** @type {Element} */ (container.querySelector('.wheel-track'))
    await fireEvent.pointerDown(modTrack, { clientY: 100, pointerId: 1 })
    await fireEvent.pointerMove(modTrack, { clientY: 84, pointerId: 1 })
    expect(onModChange).toHaveBeenCalled()
    expect(onModChange.mock.calls.at(-1)?.[0].param).toBe('modWheel')
  })

  it('PITCH wheel onchange forwards the value (no param key)', async () => {
    const onPitchChange = vi.fn()
    const { container } = render(WheelsPanel, { props: { onPitchChange } })
    const pitchTrack = /** @type {Element} */ (container.querySelectorAll('.wheel-track')[1])
    await fireEvent.pointerDown(pitchTrack, { clientY: 100, pointerId: 2 })
    await fireEvent.pointerMove(pitchTrack, { clientY: 84, pointerId: 2 })
    expect(onPitchChange).toHaveBeenCalled()
    expect(onPitchChange.mock.calls.at(-1)?.[0]).toHaveProperty('value')
  })
})
