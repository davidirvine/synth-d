import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte'
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

describe('Filter — bipolar amount knob', () => {
  /** @param {Element} container */
  function amountWrap(container) {
    return /** @type {Element} */ (
      Array.from(container.querySelectorAll('.knob-wrap')).find(
        (el) => el.querySelector('.knob-label')?.textContent === 'amount'
      )
    )
  }

  it('accepts the full bipolar range: -10000 reads "-10.0 kHz"', async () => {
    const { container } = render(Filter, {
      props: { midiState: { filterEnvAmt: { externalValue: -10000 } } },
    })
    await waitFor(() => {
      expect(amountWrap(container).querySelector('.knob-value')?.textContent).toBe('-10.0 kHz')
    })
  })

  it('accepts the full bipolar range: +10000 reads "10.0 kHz"', async () => {
    const { container } = render(Filter, {
      props: { midiState: { filterEnvAmt: { externalValue: 10000 } } },
    })
    await waitFor(() => {
      expect(amountWrap(container).querySelector('.knob-value')?.textContent).toBe('10.0 kHz')
    })
  })

  it('renders in bipolar mode: centre detent at default 0 shows no arc fill', () => {
    const { container } = render(Filter)
    // value 0 maps to pos 0.5; a non-bipolar knob would draw a half arc here.
    expect(amountWrap(container).querySelector('path.arc')).toBeNull()
  })

  it('fills the arc once the amount leaves centre', async () => {
    const { container } = render(Filter, {
      props: { midiState: { filterEnvAmt: { externalValue: 5000 } } },
    })
    await waitFor(() => {
      expect(amountWrap(container).querySelector('path.arc')).not.toBeNull()
    })
  })
})

describe('Filter — amount value display reserve', () => {
  it('renders the full negative reading and reserves it as the row last-child', async () => {
    const { container } = render(Filter, {
      props: { midiState: { filterEnvAmt: { externalValue: -10000 } } },
    })
    const amount = /** @type {Element} */ (
      Array.from(container.querySelectorAll('.knob-wrap')).find(
        (el) => el.querySelector('.knob-label')?.textContent === 'amount'
      )
    )
    // The width-reserve CSS targets `.knob-row :last-child .knob-value`, so the
    // amount knob must be the final child of its row for the reserve to apply.
    expect(amount.parentElement?.lastElementChild).toBe(amount)
    await waitFor(() => {
      // The leading minus sign is preserved in full, with no truncation.
      expect(amount.querySelector('.knob-value')?.textContent).toBe('-10.0 kHz')
    })
  })
})

describe('Filter — Key Track switch', () => {
  it('Key Track defaults to off', () => {
    render(Filter)
    const keyTrackButton = screen.getByRole('button', { name: /key track/i })
    expect(keyTrackButton.classList.contains('active')).toBe(false)
    expect(keyTrackButton.getAttribute('aria-pressed')).toBe('false')
  })

  it('clicking while off emits keyTrack 1', async () => {
    const onchange = vi.fn()
    render(Filter, { props: { keyTrack: 0, onchange } })
    await fireEvent.click(screen.getByRole('button', { name: /key track/i }))
    expect(onchange).toHaveBeenCalledWith({ param: 'keyTrack', value: 1 })
  })

  it('reflects keyTrack prop = 1 (active) and clicking emits keyTrack 0', async () => {
    const onchange = vi.fn()
    render(Filter, { props: { keyTrack: 1, onchange } })
    const keyTrackButton = screen.getByRole('button', { name: /key track/i })
    expect(keyTrackButton.classList.contains('active')).toBe(true)
    await fireEvent.click(keyTrackButton)
    expect(onchange).toHaveBeenCalledWith({ param: 'keyTrack', value: 0 })
  })
})
