import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import Knob from './Knob.svelte'

describe('Knob', () => {
  it('renders an SVG', () => {
    const { container } = render(Knob, { props: { label: 'test', min: 0, max: 1, default: 0.5 } })
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('displays the label', () => {
    const { getByText } = render(Knob, {
      props: { label: 'cutoff', min: 20, max: 20000, default: 2000, scale: 'log', unit: 'Hz' },
    })
    expect(getByText('cutoff')).toBeTruthy()
  })

  it('double-click resets value to default and fires onchange', async () => {
    const onchange = vi.fn()
    const { container } = render(Knob, {
      props: { label: 'vol', min: 0, max: 1, default: 0.75, onchange },
    })
    const hit = container.querySelector('.knob-hit')
    await fireEvent.dblClick(hit)
    expect(onchange).toHaveBeenCalledWith({ value: 0.75 })
  })

  it('double-click with non-default initial emits default value', async () => {
    const onchange = vi.fn()
    const { container } = render(Knob, {
      props: { label: 'res', min: 0, max: 1, default: 0.3, value: 0.9, onchange },
    })
    const hit = container.querySelector('.knob-hit')
    await fireEvent.dblClick(hit)
    expect(onchange).toHaveBeenCalledWith({ value: 0.3 })
  })

  it('upward pointer drag increases value', async () => {
    const values = []
    const onchange = (e) => values.push(e.value)
    const { container } = render(Knob, {
      props: { label: 'freq', min: 20, max: 20000, default: 2000, scale: 'log', onchange },
    })
    const hit = container.querySelector('.knob-hit')
    await fireEvent.pointerDown(hit, { clientY: 100 })
    await fireEvent.pointerMove(hit, { clientY: 50 })
    await fireEvent.pointerUp(hit)
    expect(values.length).toBeGreaterThan(0)
    expect(values[values.length - 1]).toBeGreaterThan(2000)
  })

  it('downward pointer drag decreases value', async () => {
    const values = []
    const onchange = (e) => values.push(e.value)
    const { container } = render(Knob, {
      props: { label: 'freq', min: 20, max: 20000, default: 2000, scale: 'log', onchange },
    })
    const hit = container.querySelector('.knob-hit')
    await fireEvent.pointerDown(hit, { clientY: 50 })
    await fireEvent.pointerMove(hit, { clientY: 100 })
    await fireEvent.pointerUp(hit)
    expect(values.length).toBeGreaterThan(0)
    expect(values[values.length - 1]).toBeLessThan(2000)
  })

  it('shift+drag produces finer movement than normal drag', async () => {
    const normalValues = []
    const fineValues = []

    const { container: c1 } = render(Knob, {
      props: {
        label: 'test',
        min: 0,
        max: 1,
        default: 0.5,
        onchange: (e) => normalValues.push(e.value),
      },
    })
    const { container: c2 } = render(Knob, {
      props: {
        label: 'test',
        min: 0,
        max: 1,
        default: 0.5,
        onchange: (e) => fineValues.push(e.value),
      },
    })

    const normalDelta = 50
    await fireEvent.pointerDown(c1.querySelector('.knob-hit'), { clientY: 100, shiftKey: false })
    await fireEvent.pointerMove(c1.querySelector('.knob-hit'), {
      clientY: 100 - normalDelta,
      shiftKey: false,
    })

    await fireEvent.pointerDown(c2.querySelector('.knob-hit'), { clientY: 100, shiftKey: true })
    await fireEvent.pointerMove(c2.querySelector('.knob-hit'), {
      clientY: 100 - normalDelta,
      shiftKey: true,
    })

    const normalChange = Math.abs(normalValues[0] - 0.5)
    const fineChange = Math.abs(fineValues[0] - 0.5)
    expect(normalChange).toBeGreaterThan(fineChange)
  })
})
