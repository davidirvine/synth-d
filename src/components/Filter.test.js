import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
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
  it('renders a Key Track button', () => {
    render(Filter)
    expect(screen.getByRole('button', { name: /key track/i })).toBeTruthy()
  })

  it('renders seven knobs total (cutoff, res + five env knobs)', () => {
    const { container } = render(Filter)
    expect(container.querySelectorAll('svg').length).toBe(7)
  })
})

describe('Filter — Key Track switch', () => {
  it('Key Track defaults to off', () => {
    render(Filter)
    const keyTrackButton = screen.getByRole('button', { name: /key track/i })
    expect(keyTrackButton.classList.contains('active')).toBe(false)
    expect(keyTrackButton.getAttribute('aria-pressed')).toBe('false')
  })

  it('toggles on on first click and back off on second click', async () => {
    render(Filter)
    const keyTrackButton = screen.getByRole('button', { name: /key track/i })
    await fireEvent.click(keyTrackButton)
    expect(keyTrackButton.classList.contains('active')).toBe(true)
    await fireEvent.click(keyTrackButton)
    expect(keyTrackButton.classList.contains('active')).toBe(false)
  })
})
