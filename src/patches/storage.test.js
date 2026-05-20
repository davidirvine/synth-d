import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  listPatches,
  savePatch,
  loadPatch,
  deletePatch,
  validateName,
  PATCH_VERSION,
  MAX_NAME_LENGTH,
} from './storage.js'
import { PARAM_DEFAULTS } from '../state/synth.svelte.js'

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('storage — name validation', () => {
  it('trims surrounding whitespace', () => {
    expect(validateName('  lead  ')).toBe('lead')
  })

  it('rejects empty and whitespace-only names', () => {
    expect(validateName('')).toBeNull()
    expect(validateName('   ')).toBeNull()
    expect(validateName(undefined)).toBeNull()
    expect(validateName(null)).toBeNull()
  })

  it('caps the name length', () => {
    const long = 'x'.repeat(MAX_NAME_LENGTH + 20)
    expect(validateName(long)).toHaveLength(MAX_NAME_LENGTH)
  })

  it('savePatch rejects an invalid name without creating a patch', () => {
    expect(savePatch('   ', PARAM_DEFAULTS)).toEqual({ ok: false, error: 'invalid-name' })
    expect(listPatches()).toEqual([])
  })
})

describe('storage — round-trip', () => {
  it('save → list → load → delete', () => {
    const params = { ...PARAM_DEFAULTS, cutoff: 8000, osc1Wave: 3 }
    const res = savePatch('lead', params)
    expect(res).toEqual({ ok: true, name: 'lead' })

    expect(listPatches()).toEqual(['lead'])

    const loaded = loadPatch('lead')
    expect(loaded?.name).toBe('lead')
    expect(loaded?.version).toBe(PATCH_VERSION)
    expect(loaded?.params.cutoff).toBe(8000)
    expect(loaded?.params.osc1Wave).toBe(3)

    expect(deletePatch('lead')).toBe(true)
    expect(listPatches()).toEqual([])
    expect(loadPatch('lead')).toBeNull()
  })

  it('save trims the name before using it as the slot key', () => {
    savePatch('  pad  ', PARAM_DEFAULTS)
    expect(listPatches()).toEqual(['pad'])
    expect(loadPatch('pad')).not.toBeNull()
    // The trimmed name resolves the same slot.
    expect(loadPatch('  pad  ')).not.toBeNull()
  })

  it('keeps the index consistent across multiple saves and a delete', () => {
    savePatch('a', PARAM_DEFAULTS)
    savePatch('b', PARAM_DEFAULTS)
    savePatch('c', PARAM_DEFAULTS)
    expect(listPatches()).toEqual(['a', 'b', 'c'])

    deletePatch('b')
    expect(listPatches()).toEqual(['a', 'c'])
    expect(loadPatch('b')).toBeNull()
    expect(loadPatch('a')).not.toBeNull()
    expect(loadPatch('c')).not.toBeNull()
  })

  it('overwriting an existing name does not duplicate the index entry', () => {
    savePatch('lead', { ...PARAM_DEFAULTS, cutoff: 1000 })
    savePatch('lead', { ...PARAM_DEFAULTS, cutoff: 2000 })
    expect(listPatches()).toEqual(['lead'])
    expect(loadPatch('lead')?.params.cutoff).toBe(2000)
  })
})

describe('storage — excluded params', () => {
  it('does not serialize params outside the in-scope set (e.g. modWheel)', () => {
    savePatch('lead', { ...PARAM_DEFAULTS, modWheel: 0.9, register: 21, notAParam: 5 })
    const loaded = loadPatch('lead')
    expect(loaded?.params).not.toHaveProperty('modWheel')
    expect(loaded?.params).not.toHaveProperty('register')
    expect(loaded?.params).not.toHaveProperty('notAParam')
    expect(loaded?.params).toHaveProperty('cutoff')
  })

  it('skips non-finite param values', () => {
    savePatch('lead', { ...PARAM_DEFAULTS, cutoff: NaN })
    const loaded = loadPatch('lead')
    expect(loaded?.params).not.toHaveProperty('cutoff')
  })
})

describe('storage — corrupt / missing slots', () => {
  it('a corrupt slot reads as absent', () => {
    savePatch('lead', PARAM_DEFAULTS)
    localStorage.setItem('synth-d:patch:lead', '{ not valid json')
    expect(loadPatch('lead')).toBeNull()
  })

  it('a missing slot reads as absent even if named in a corrupt index', () => {
    localStorage.setItem('synth-d:patches', 'not json either')
    // Corrupt index → treated as empty.
    expect(listPatches()).toEqual([])
    expect(loadPatch('ghost')).toBeNull()
  })
})

describe('storage — failures are non-fatal', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('savePatch reports storage-unavailable instead of throwing when setItem throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })
    expect(() => savePatch('lead', PARAM_DEFAULTS)).not.toThrow()
    expect(savePatch('lead', PARAM_DEFAULTS)).toEqual({ ok: false, error: 'storage-unavailable' })
  })

  it('listPatches returns [] instead of throwing when getItem throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('unavailable')
    })
    expect(() => listPatches()).not.toThrow()
    expect(listPatches()).toEqual([])
  })

  it('loadPatch returns null instead of throwing when getItem throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('unavailable')
    })
    expect(() => loadPatch('lead')).not.toThrow()
    expect(loadPatch('lead')).toBeNull()
  })

  it('deletePatch does not throw when removeItem throws', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('unavailable')
    })
    expect(() => deletePatch('lead')).not.toThrow()
  })
})
