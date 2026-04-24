import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import FilterEnv from './FilterEnv.svelte'

describe('FilterEnv — sustain and release knobs', () => {
  it('renders a sustain label', () => {
    const { getByText } = render(FilterEnv)
    expect(getByText('sustain')).toBeTruthy()
  })

  it('renders a release label', () => {
    const { getAllByText } = render(FilterEnv)
    expect(getAllByText('release').length).toBeGreaterThan(0)
  })

  it('renders five knobs total (attack, decay, sustain, release, amount)', () => {
    const { container } = render(FilterEnv)
    expect(container.querySelectorAll('svg').length).toBe(5)
  })
})

describe('FilterEnv — filterEnvAmt is positive-only (no bipolar)', () => {
  it('amount knob double-click emits a non-negative value', async () => {
    const onchange = vi.fn()
    const { container } = render(FilterEnv, { props: { onchange } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.dblClick(hits[4])
    const amtCalls = onchange.mock.calls.filter((c) => c[0].param === 'filterEnvAmt')
    expect(amtCalls.length).toBeGreaterThan(0)
    expect(amtCalls[0][0].value).toBeGreaterThanOrEqual(0)
  })
})

describe('FilterEnv — onchange events', () => {
  it('sustain knob emits filterSustain', async () => {
    const onchange = vi.fn()
    const { container } = render(FilterEnv, { props: { onchange } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.dblClick(hits[2])
    const params = onchange.mock.calls.map((c) => c[0].param)
    expect(params).toContain('filterSustain')
  })

  it('release knob emits filterRelease', async () => {
    const onchange = vi.fn()
    const { container } = render(FilterEnv, { props: { onchange } })
    const hits = container.querySelectorAll('.knob-hit')
    await fireEvent.dblClick(hits[3])
    const params = onchange.mock.calls.map((c) => c[0].param)
    expect(params).toContain('filterRelease')
  })
})
