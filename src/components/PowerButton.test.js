import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import PowerButton from './PowerButton.svelte'

describe('PowerButton', () => {
  it('renders with power OFF by default', () => {
    const { container } = render(PowerButton, { props: { powered: false, loading: false, ontoggle: vi.fn() } })
    const icon = container.querySelector('.power-icon')
    expect(icon).not.toBeNull()
    expect(icon.classList.contains('lit')).toBe(false)
  })

  it('renders without a visible text label', () => {
    const { container } = render(PowerButton, { props: { powered: false, loading: false, ontoggle: vi.fn() } })
    expect(container.querySelector('.label')).toBeNull()
  })

  it('power icon is lit when powered on', () => {
    const { container } = render(PowerButton, { props: { powered: true, loading: false, ontoggle: vi.fn() } })
    expect(container.querySelector('.power-icon').classList.contains('lit')).toBe(true)
  })

  it('power icon is not lit when loading even if powered', () => {
    const { container } = render(PowerButton, { props: { powered: true, loading: true, ontoggle: vi.fn() } })
    expect(container.querySelector('.power-icon').classList.contains('lit')).toBe(false)
  })

  it('calls ontoggle when button is clicked', async () => {
    const ontoggle = vi.fn()
    const { container } = render(PowerButton, { props: { powered: false, loading: false, ontoggle } })
    await fireEvent.click(container.querySelector('button'))
    expect(ontoggle).toHaveBeenCalledOnce()
  })

  it('button is disabled while loading', () => {
    const { container } = render(PowerButton, { props: { powered: false, loading: true, ontoggle: vi.fn() } })
    expect(container.querySelector('button').disabled).toBe(true)
  })

  it('button is not disabled when not loading', () => {
    const { container } = render(PowerButton, { props: { powered: false, loading: false, ontoggle: vi.fn() } })
    expect(container.querySelector('button').disabled).toBe(false)
  })
})
