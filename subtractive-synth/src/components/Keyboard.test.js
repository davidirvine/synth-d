import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import Keyboard from './Keyboard.svelte'

describe('Keyboard', () => {
  it('renders exactly 25 key elements', () => {
    const { container } = render(Keyboard)
    const keys = container.querySelectorAll('[data-midi]')
    expect(keys.length).toBe(25)
  })

  it('renders white and black keys', () => {
    const { container } = render(Keyboard)
    const white = container.querySelectorAll('.white-key')
    const black = container.querySelectorAll('.black-key')
    expect(white.length).toBeGreaterThan(0)
    expect(black.length).toBeGreaterThan(0)
    expect(white.length + black.length).toBe(25)
  })

  it('lowest key is MIDI 48 (C3)', () => {
    const { container } = render(Keyboard)
    const keys = container.querySelectorAll('[data-midi]')
    const midis = Array.from(keys).map((k) => Number(k.getAttribute('data-midi')))
    expect(Math.min(...midis)).toBe(48)
  })

  it('highest key is MIDI 72 (C5)', () => {
    const { container } = render(Keyboard)
    const keys = container.querySelectorAll('[data-midi]')
    const midis = Array.from(keys).map((k) => Number(k.getAttribute('data-midi')))
    expect(Math.max(...midis)).toBe(72)
  })

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
