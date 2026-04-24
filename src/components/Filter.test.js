import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import Filter from './Filter.svelte'

describe('Filter — filterMode removed', () => {
  it('does not render a filterMode knob (no lp/bp/hp ticks)', () => {
    const { queryByText } = render(Filter)
    expect(queryByText('lp')).toBeNull()
    expect(queryByText('bp')).toBeNull()
    expect(queryByText('hp')).toBeNull()
  })

  it('does not render a "mode" label', () => {
    const { queryByText } = render(Filter)
    expect(queryByText('mode')).toBeNull()
  })
})

describe('Filter — keyTrack knob present', () => {
  it('renders a key trk label', () => {
    const { getByText } = render(Filter)
    expect(getByText('key trk')).toBeTruthy()
  })

  it('renders nine knobs total (cutoff, res, key trk + master vol + five env knobs)', () => {
    const { container } = render(Filter)
    expect(container.querySelectorAll('svg').length).toBe(9)
  })
})
