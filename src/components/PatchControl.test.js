import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import PatchControl from './PatchControl.svelte'
import {
  resetParams,
  setActivePatch,
  writeParam,
  synthParams,
  PARAM_DEFAULTS,
} from '../state/synth.svelte.js'
import { savePatch, listPatches } from '../patches/storage.js'

beforeEach(() => {
  localStorage.clear()
  resetParams()
  setActivePatch(null, PARAM_DEFAULTS)
})

/** @param {HTMLElement} container */
function openPopover(container) {
  return fireEvent.click(/** @type {Element} */ (container.querySelector('.trigger')))
}

/** @param {HTMLElement} container @param {string} value */
async function typeName(container, value) {
  const input = /** @type {HTMLInputElement} */ (container.querySelector('.name-input'))
  await fireEvent.input(input, { target: { value } })
}

describe('PatchControl — trigger and empty state', () => {
  it('shows the active patch name (init when none loaded)', () => {
    const { container } = render(PatchControl)
    expect(/** @type {Element} */ (container.querySelector('.patch-name')).textContent).toBe('init')
  })

  it('shows an empty-state message when no patches exist', async () => {
    const { container, getByText } = render(PatchControl)
    await openPopover(container)
    expect(getByText('no patches saved yet')).toBeTruthy()
  })

  it('does not render the popover until the trigger is clicked', () => {
    const { container } = render(PatchControl)
    expect(container.querySelector('.popover')).toBeNull()
  })

  it('closes the popover on a click outside the control', async () => {
    const { container } = render(PatchControl)
    await openPopover(container)
    expect(container.querySelector('.popover')).not.toBeNull()
    await fireEvent.click(document.body)
    expect(container.querySelector('.popover')).toBeNull()
  })

  it('closes the popover on Escape', async () => {
    const { container } = render(PatchControl)
    await openPopover(container)
    expect(container.querySelector('.popover')).not.toBeNull()
    await fireEvent.keyDown(window, { key: 'Escape' })
    expect(container.querySelector('.popover')).toBeNull()
  })
})

describe('PatchControl — save', () => {
  it('saves a new patch from the current state', async () => {
    const { container } = render(PatchControl)
    await openPopover(container)
    await typeName(container, 'lead')
    await fireEvent.click(/** @type {Element} */ (container.querySelector('.save-btn')))
    expect(listPatches()).toContain('lead')
  })

  it('normalizes the name field to the trimmed name after a successful save', async () => {
    const { container } = render(PatchControl)
    await openPopover(container)
    await typeName(container, '  pad  ')
    await fireEvent.click(/** @type {Element} */ (container.querySelector('.save-btn')))
    expect(listPatches()).toEqual(['pad'])
    expect(/** @type {HTMLInputElement} */ (container.querySelector('.name-input')).value).toBe(
      'pad'
    )
  })

  it('an empty name shows "name required" and saves nothing', async () => {
    const { container, getByText } = render(PatchControl)
    await openPopover(container)
    await typeName(container, '   ')
    await fireEvent.click(/** @type {Element} */ (container.querySelector('.save-btn')))
    expect(getByText('name required')).toBeTruthy()
    expect(listPatches()).toEqual([])
  })

  it('saving over an existing name requires inline confirmation', async () => {
    savePatch('lead', PARAM_DEFAULTS)
    const { container, getByText, getByLabelText } = render(PatchControl)
    await openPopover(container)
    await typeName(container, 'lead')
    await fireEvent.click(/** @type {Element} */ (container.querySelector('.save-btn')))
    // Inline overwrite confirm is shown; nothing written yet beyond the original.
    expect(getByText(/overwrite/i)).toBeTruthy()
    await fireEvent.click(getByLabelText('confirm overwrite'))
    // Still exactly one entry (overwrite, not duplicate).
    expect(listPatches()).toEqual(['lead'])
  })

  it('canceling the overwrite confirm does not write', async () => {
    savePatch('lead', { ...PARAM_DEFAULTS, cutoff: 1111 })
    const { container, getByLabelText } = render(PatchControl)
    // Change the live state so a save would differ from the stored slot.
    writeParam('cutoff', 9999)
    await openPopover(container)
    await typeName(container, 'lead')
    await fireEvent.click(/** @type {Element} */ (container.querySelector('.save-btn')))
    await fireEvent.click(getByLabelText('cancel overwrite'))
    const { loadPatch } = await import('../patches/storage.js')
    expect(loadPatch('lead')?.params.cutoff).toBe(1111)
  })
})

describe('PatchControl — load', () => {
  it('loading a patch applies its params to the store and marks it active', async () => {
    savePatch('lead', { ...PARAM_DEFAULTS, cutoff: 8000, osc1Wave: 3 })
    const { container, getByText } = render(PatchControl)
    await openPopover(container)
    await fireEvent.click(getByText('lead'))
    expect(synthParams.cutoff).toBe(8000)
    expect(synthParams.osc1Wave).toBe(3)
    expect(/** @type {Element} */ (container.querySelector('.patch-name')).textContent).toBe('lead')
  })

  it('the active patch is marked in the list', async () => {
    savePatch('lead', PARAM_DEFAULTS)
    savePatch('pad', PARAM_DEFAULTS)
    const { container, getByText } = render(PatchControl)
    await openPopover(container)
    await fireEvent.click(getByText('pad'))
    const rows = container.querySelectorAll('.patch-row')
    const activeRow = /** @type {Element} */ (container.querySelector('.patch-row.active'))
    expect(rows.length).toBe(2)
    expect(activeRow.textContent).toContain('pad')
    expect(activeRow.querySelector('.marker')?.textContent).toBe('▸')
  })
})

describe('PatchControl — delete', () => {
  it('delete requires inline confirmation (never one click)', async () => {
    savePatch('lead', PARAM_DEFAULTS)
    const { container, getByLabelText } = render(PatchControl)
    await openPopover(container)
    await fireEvent.click(getByLabelText('delete lead'))
    // Still present until confirmed.
    expect(listPatches()).toEqual(['lead'])
    await fireEvent.click(getByLabelText('confirm delete'))
    expect(listPatches()).toEqual([])
  })

  it('canceling delete leaves the patch intact', async () => {
    savePatch('lead', PARAM_DEFAULTS)
    const { container, getByLabelText } = render(PatchControl)
    await openPopover(container)
    await fireEvent.click(getByLabelText('delete lead'))
    await fireEvent.click(getByLabelText('cancel delete'))
    expect(listPatches()).toEqual(['lead'])
  })

  it('deleting the active patch clears its name from the trigger', async () => {
    savePatch('lead', PARAM_DEFAULTS)
    const { container, getByText, getByLabelText } = render(PatchControl)
    await openPopover(container)
    await fireEvent.click(getByText('lead'))
    expect(/** @type {Element} */ (container.querySelector('.patch-name')).textContent).toBe('lead')
    await fireEvent.click(getByLabelText('delete lead'))
    await fireEvent.click(getByLabelText('confirm delete'))
    expect(/** @type {Element} */ (container.querySelector('.patch-name')).textContent).toBe('init')
  })
})

describe('PatchControl — dirty marker', () => {
  it('no dirty marker when state matches the active patch', () => {
    const { container } = render(PatchControl)
    expect(container.querySelector('.dirty')).toBeNull()
  })

  it('shows the dirty marker after an in-scope param changes', async () => {
    const { container } = render(PatchControl)
    writeParam('cutoff', 5000)
    await Promise.resolve()
    expect(container.querySelector('.dirty')).not.toBeNull()
  })

  it('saving clears the dirty marker', async () => {
    const { container } = render(PatchControl)
    writeParam('cutoff', 5000)
    await openPopover(container)
    await typeName(container, 'lead')
    await fireEvent.click(/** @type {Element} */ (container.querySelector('.save-btn')))
    await Promise.resolve()
    expect(container.querySelector('.dirty')).toBeNull()
  })

  it('loading clears the dirty marker', async () => {
    savePatch('lead', { ...PARAM_DEFAULTS, cutoff: 8000 })
    const { container, getByText } = render(PatchControl)
    writeParam('cutoff', 5000)
    await openPopover(container)
    await fireEvent.click(getByText('lead'))
    await Promise.resolve()
    expect(container.querySelector('.dirty')).toBeNull()
  })

  it('loading a partial patch (missing keys) is not falsely dirty', async () => {
    // A patch from before a param existed (or with non-finite values dropped):
    // savePatch stores only the provided in-scope keys, so the slot is partial.
    savePatch('old', { cutoff: 8000 })
    const { container, getByText } = render(PatchControl)
    await openPopover(container)
    await fireEvent.click(getByText('old'))
    await Promise.resolve()
    expect(synthParams.cutoff).toBe(8000)
    // Missing params fell back to defaults, and the baseline has every key, so
    // there are no spurious unsaved-change markers.
    expect(container.querySelector('.dirty')).toBeNull()
  })
})

describe('PatchControl — no OS dialogs', () => {
  it('never calls window.prompt or window.confirm for naming/overwrite/delete', async () => {
    savePatch('lead', PARAM_DEFAULTS)
    const promptSpy = vi.spyOn(window, 'prompt')
    const confirmSpy = vi.spyOn(window, 'confirm')
    const { container, getByLabelText } = render(PatchControl)
    await openPopover(container)
    // overwrite flow
    await typeName(container, 'lead')
    await fireEvent.click(/** @type {Element} */ (container.querySelector('.save-btn')))
    await fireEvent.click(getByLabelText('confirm overwrite'))
    // delete flow
    await fireEvent.click(getByLabelText('delete lead'))
    await fireEvent.click(getByLabelText('confirm delete'))
    expect(promptSpy).not.toHaveBeenCalled()
    expect(confirmSpy).not.toHaveBeenCalled()
  })
})
