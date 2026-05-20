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

describe('storage — invalid names on load/delete', () => {
  it('loadPatch returns null for an invalid name', () => {
    expect(loadPatch('   ')).toBeNull()
    expect(loadPatch('')).toBeNull()
  })

  it('deletePatch returns false for an invalid name and true for a valid one', () => {
    expect(deletePatch('   ')).toBe(false)
    savePatch('lead', PARAM_DEFAULTS)
    expect(deletePatch('lead')).toBe(true)
  })
})

describe('storage — malformed slot envelopes read as absent', () => {
  it.each([
    ['a bare number', '123'],
    ['a JSON array', '[]'],
    ['null', 'null'],
    ['an object without params', '{"name":"x","version":1}'],
    ['an object whose params is null', '{"params":null}'],
    ['an object whose params is a string', '{"params":"nope"}'],
  ])('returns null when the slot is %s', (_desc, raw) => {
    localStorage.setItem('synth-d:patch:lead', raw)
    expect(loadPatch('lead')).toBeNull()
  })
})

describe('storage — index integrity', () => {
  it('listPatches drops non-string index entries', () => {
    localStorage.setItem('synth-d:patches', JSON.stringify(['a', 5, null, 'b', { x: 1 }]))
    expect(listPatches()).toEqual(['a', 'b'])
  })
})

describe('storage — exact serialized slot contents', () => {
  it('the stored slot contains only the provided in-scope finite params', () => {
    // Pass a partial params object with one extra key and one non-finite value.
    savePatch('lead', { cutoff: 500, masterVol: NaN, modWheel: 0.9 })
    const env = JSON.parse(/** @type {string} */ (localStorage.getItem('synth-d:patch:lead')))
    expect(env.params).toEqual({ cutoff: 500 })
    expect(env.name).toBe('lead')
    expect(env.version).toBe(PATCH_VERSION)
  })
})

describe('storage — load returns exactly the stored in-scope params', () => {
  it('does not pad the result with absent param names', () => {
    localStorage.setItem(
      'synth-d:patch:partial',
      JSON.stringify({ name: 'partial', version: 1, params: { cutoff: 100, osc1Wave: 2 } })
    )
    const loaded = loadPatch('partial')
    expect(loaded?.params).toEqual({ cutoff: 100, osc1Wave: 2 })
  })

  it('drops non-finite values present in a stored slot', () => {
    localStorage.setItem(
      'synth-d:patch:weird',
      JSON.stringify({ name: 'weird', version: 1, params: { cutoff: 100, resonance: null } })
    )
    expect(loadPatch('weird')?.params).toEqual({ cutoff: 100 })
  })
})

describe('storage — envelope version', () => {
  it('preserves a numeric version and falls back to PATCH_VERSION otherwise', () => {
    localStorage.setItem(
      'synth-d:patch:numbered',
      JSON.stringify({ name: 'numbered', version: 7, params: { cutoff: 100 } })
    )
    expect(loadPatch('numbered')?.version).toBe(7)

    localStorage.setItem(
      'synth-d:patch:stringy',
      JSON.stringify({ name: 'stringy', version: 'v2', params: { cutoff: 100 } })
    )
    expect(loadPatch('stringy')?.version).toBe(PATCH_VERSION)
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

  it('rolls back the slot when the index write fails (no orphaned slot)', () => {
    const realSet = Storage.prototype.setItem
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (key, value) {
      if (key === 'synth-d:patches') throw new DOMException('quota', 'QuotaExceededError')
      return realSet.call(this, key, value)
    })
    const res = savePatch('lead', PARAM_DEFAULTS)
    expect(res).toEqual({ ok: false, error: 'storage-unavailable' })
    vi.restoreAllMocks()
    // The slot must not linger unreferenced by the index.
    expect(localStorage.getItem('synth-d:patch:lead')).toBeNull()
    expect(listPatches()).toEqual([])
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
