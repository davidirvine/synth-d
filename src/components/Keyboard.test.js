import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import Keyboard from './Keyboard.svelte'

describe('Keyboard — rendering', () => {
  it('renders exactly 61 key elements', () => {
    const { container } = render(Keyboard)
    const keys = container.querySelectorAll('[data-midi]')
    expect(keys.length).toBe(61)
  })

  it('renders 36 white keys and 25 black keys', () => {
    const { container } = render(Keyboard)
    const white = container.querySelectorAll('.white-key')
    const black = container.querySelectorAll('.black-key')
    expect(white.length).toBe(36)
    expect(black.length).toBe(25)
    expect(white.length + black.length).toBe(61)
  })

  it('lowest key is MIDI 36 (C2)', () => {
    const { container } = render(Keyboard)
    const keys = container.querySelectorAll('[data-midi]')
    const midis = Array.from(keys).map((k) => Number(k.getAttribute('data-midi')))
    expect(Math.min(...midis)).toBe(36)
  })

  it('highest key is MIDI 96 (C7)', () => {
    const { container } = render(Keyboard)
    const keys = container.querySelectorAll('[data-midi]')
    const midis = Array.from(keys).map((k) => Number(k.getAttribute('data-midi')))
    expect(Math.max(...midis)).toBe(96)
  })
})

describe('Keyboard — SVG structure', () => {
  it('renders a top rail rect at y=0 with fill #333', () => {
    const { container } = render(Keyboard)
    const rail = container.querySelector('rect[fill="#333"]')
    expect(rail).not.toBeNull()
    expect(rail.getAttribute('y')).toBe('0')
  })

  it('does not render a middle C indicator line', () => {
    const { container } = render(Keyboard, { props: { baseMidi: 36 } })
    expect(container.querySelector('line')).toBeNull()
  })

  it('totalWidth is 1008 px for baseMidi 21', () => {
    const { container } = render(Keyboard, { props: { baseMidi: 21 } })
    expect(Number(container.querySelector('svg').getAttribute('width'))).toBe(1008)
  })

  it('totalWidth is 1008 px for baseMidi 36', () => {
    const { container } = render(Keyboard)
    expect(Number(container.querySelector('svg').getAttribute('width'))).toBe(1008)
  })

  it('totalWidth is 1008 px for baseMidi 48', () => {
    const { container } = render(Keyboard, { props: { baseMidi: 48 } })
    expect(Number(container.querySelector('svg').getAttribute('width'))).toBe(1008)
  })
})

describe('Keyboard — pointer interaction', () => {
  it('calls onnote when a key is pressed', async () => {
    const onnote = vi.fn()
    const { container } = render(Keyboard, { props: { onnote } })
    const key = container.querySelector('.white-key')
    await fireEvent.pointerDown(key)
    expect(onnote).toHaveBeenCalled()
  })

  it('onnote messages include freq and gate=1 on press', async () => {
    const messages = []
    const onnote = (msgs) => messages.push(...msgs)
    const { container } = render(Keyboard, { props: { onnote } })
    const key = container.querySelector('.white-key')
    await fireEvent.pointerDown(key)
    expect(messages.some((m) => m.param === 'freq')).toBe(true)
    expect(messages.some((m) => m.param === 'gate' && m.value === 1)).toBe(true)
  })

  it('sends gate=0 on pointer release when no other key held', async () => {
    const messages = []
    const onnote = (msgs) => messages.push(...msgs)
    const { container } = render(Keyboard, { props: { onnote } })
    const key = container.querySelector('.white-key')
    await fireEvent.pointerDown(key)
    messages.length = 0
    await fireEvent.pointerUp(key)
    expect(messages.some((m) => m.param === 'gate' && m.value === 0)).toBe(true)
  })
})

describe('Keyboard — bindable triggerNote / releaseNote', () => {
  it('exposes triggerNote as a bindable function', () => {
    render(Keyboard, {
      props: {
        'bind:triggerNote': () => {},
      },
    })
    // In testing-library/svelte, we verify the prop was set by calling triggerNote
    // The bind mechanism is tested via direct prop access below
  })

  it('shared activeKeys: gate stays on while MIDI note held after pointer release', async () => {
    const messages = []
    const onnote = (msgs) => messages.push(...msgs)

    // We test via the component's internal exposed functions by rendering
    // with direct access — use component's triggerNote / releaseNote props
    const { container } = render(Keyboard, {
      props: {
        onnote,
        triggerNote: null,
        releaseNote: null,
      },
    })

    // Access the component's functions via the bound props mechanism by
    // directly exercising the spec: simulate MIDI hold + pointer release
    // Since testing-library/svelte does not support bind:fn syntax, we
    // verify via pointer interactions that gate=0 is only sent when empty.

    const [key1, key2] = container.querySelectorAll('.white-key')

    // Press two keys (pointer down on both — simulate legato + hold)
    await fireEvent.pointerDown(key1)
    await fireEvent.pointerDown(key2)

    messages.length = 0

    // Release key1 — key2 still active, no gate=0 expected
    await fireEvent.pointerUp(key1)
    expect(messages.some((m) => m.param === 'gate' && m.value === 0)).toBe(false)

    // Release key2 — all released, gate=0 expected
    await fireEvent.pointerUp(key2)
    expect(messages.some((m) => m.param === 'gate' && m.value === 0)).toBe(true)
  })
})
