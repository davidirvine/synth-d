import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  loadWheelPhysics,
  saveWheelPhysics,
  resetWheelPhysics,
  defaultWheelPhysics,
  STORAGE_KEY,
} from './wheelPhysicsStore.js'
import { DEFAULT_PHYSICS } from './wheelPhysics.js'

beforeEach(() => {
  localStorage.clear()
})

describe('wheelPhysicsStore — defaults', () => {
  it('defaultWheelPhysics returns the PITCH wheel at the documented defaults', () => {
    expect(defaultWheelPhysics()).toEqual({
      pitch: { ...DEFAULT_PHYSICS },
    })
  })

  it('does not include a mod branch (the MOD wheel has no persisted physics)', () => {
    expect(defaultWheelPhysics()).not.toHaveProperty('mod')
  })

  it('returns a fresh object each call (no shared mutable state)', () => {
    const a = defaultWheelPhysics()
    const b = defaultWheelPhysics()
    expect(a).not.toBe(b)
    expect(a.pitch).not.toBe(b.pitch)
  })
})

describe('wheelPhysicsStore — round trip', () => {
  it('saves and loads custom PITCH physics', () => {
    const physics = { pitch: { mass: 0.5, spring: 10, damping: 0.8 } }
    expect(saveWheelPhysics(physics)).toBe(true)
    expect(loadWheelPhysics()).toEqual(physics)
  })

  it('persists under the synth-d:wheel-physics key', () => {
    saveWheelPhysics(defaultWheelPhysics())
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
  })

  it('never writes a mod field, even if one is passed in', () => {
    // @ts-expect-error deliberately passing a legacy-shaped object
    saveWheelPhysics({ mod: { mass: 2, spring: 30, damping: 0.5 }, pitch: { ...DEFAULT_PHYSICS } })
    const stored = JSON.parse(/** @type {string} */ (localStorage.getItem(STORAGE_KEY)))
    expect(stored).not.toHaveProperty('mod')
    expect(stored).toEqual({ pitch: { ...DEFAULT_PHYSICS } })
  })
})

describe('wheelPhysicsStore — legacy mod field tolerance', () => {
  it('loads a legacy { mod, pitch } blob without error, ignoring mod', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        mod: { mass: 4, spring: 40, damping: 0.9 },
        pitch: { mass: 0.5, spring: 10, damping: 0.8 },
      })
    )
    const loaded = loadWheelPhysics()
    expect(loaded).toEqual({ pitch: { mass: 0.5, spring: 10, damping: 0.8 } })
    expect(loaded).not.toHaveProperty('mod')
  })

  it('migrates the stored shape to { pitch } on the next save', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        mod: { mass: 4, spring: 40, damping: 0.9 },
        pitch: { mass: 0.5, spring: 10, damping: 0.8 },
      })
    )
    // A round trip (load → save) drops the stale mod field.
    saveWheelPhysics(loadWheelPhysics())
    const stored = JSON.parse(/** @type {string} */ (localStorage.getItem(STORAGE_KEY)))
    expect(stored).not.toHaveProperty('mod')
    expect(stored).toEqual({ pitch: { mass: 0.5, spring: 10, damping: 0.8 } })
  })
})

describe('wheelPhysicsStore — fallback on missing/partial/corrupt data', () => {
  it('returns defaults when nothing is stored', () => {
    expect(loadWheelPhysics()).toEqual(defaultWheelPhysics())
  })

  it('fills in per-field defaults when a field is missing', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ pitch: { mass: 3 } }))
    const loaded = loadWheelPhysics()
    expect(loaded.pitch.mass).toBe(3)
    expect(loaded.pitch.spring).toBe(DEFAULT_PHYSICS.spring)
    expect(loaded.pitch.damping).toBe(DEFAULT_PHYSICS.damping)
  })

  it('falls back when a field is out of range', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ pitch: { mass: 999, spring: 0, damping: 5 } })
    )
    const loaded = loadWheelPhysics()
    expect(loaded.pitch.mass).toBe(DEFAULT_PHYSICS.mass)
    expect(loaded.pitch.spring).toBe(DEFAULT_PHYSICS.spring)
    expect(loaded.pitch.damping).toBe(DEFAULT_PHYSICS.damping)
  })

  it('falls back when a field is non-finite (NaN serializes to null)', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ pitch: { mass: null } }))
    expect(loadWheelPhysics().pitch.mass).toBe(DEFAULT_PHYSICS.mass)
  })

  it('does not throw on corrupt JSON, returning defaults', () => {
    localStorage.setItem(STORAGE_KEY, '{ not valid json')
    expect(() => loadWheelPhysics()).not.toThrow()
    expect(loadWheelPhysics()).toEqual(defaultWheelPhysics())
  })

  it('accepts boundary values exactly at min and max', () => {
    saveWheelPhysics({ pitch: { mass: 5, spring: 70, damping: 1 } })
    expect(loadWheelPhysics().pitch).toEqual({ mass: 5, spring: 70, damping: 1 })
    saveWheelPhysics({ pitch: { mass: 0.05, spring: 1, damping: 0.05 } })
    expect(loadWheelPhysics().pitch).toEqual({ mass: 0.05, spring: 1, damping: 0.05 })
  })
})

describe('wheelPhysicsStore — save return value', () => {
  it('returns true when the write succeeds', () => {
    expect(saveWheelPhysics(defaultWheelPhysics())).toBe(true)
  })

  it('only writes in-range values (a non-object pitch becomes all defaults)', () => {
    // @ts-expect-error deliberately malformed input
    saveWheelPhysics({ pitch: 42 })
    expect(loadWheelPhysics().pitch).toEqual(DEFAULT_PHYSICS)
  })

  it('clamps out-of-range numbers to defaults before writing, incl. non-finite', () => {
    saveWheelPhysics({ pitch: { mass: Infinity, spring: 0.5, damping: 0.3 } })
    // mass Infinity → default; spring 0.5 (< min 1) → default; damping 0.3 ok.
    expect(loadWheelPhysics().pitch).toEqual({
      mass: DEFAULT_PHYSICS.mass,
      spring: DEFAULT_PHYSICS.spring,
      damping: 0.3,
    })
  })
})

describe('wheelPhysicsStore — per-field range boundaries', () => {
  it('rejects a value just below min and just above max for each field', () => {
    saveWheelPhysics({ pitch: { mass: 5 + 0.0001, spring: 70 + 0.0001, damping: 1 + 0.0001 } })
    expect(loadWheelPhysics().pitch).toEqual(DEFAULT_PHYSICS)
    saveWheelPhysics({ pitch: { mass: 0.05 - 0.0001, spring: 1 - 0.0001, damping: 0.05 - 0.0001 } })
    expect(loadWheelPhysics().pitch).toEqual(DEFAULT_PHYSICS)
  })

  it('rejects a non-number field (string) in favour of the default', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ pitch: { mass: '3' } }))
    expect(loadWheelPhysics().pitch.mass).toBe(DEFAULT_PHYSICS.mass)
  })

  it('treats a non-object top-level payload as absent', () => {
    localStorage.setItem(STORAGE_KEY, '42')
    expect(loadWheelPhysics()).toEqual(defaultWheelPhysics())
  })

  it('treats a stored JSON null as absent without throwing', () => {
    // `typeof null === 'object'` but null is falsy — the guard must reject it
    // rather than dereference `null.pitch`.
    localStorage.setItem(STORAGE_KEY, 'null')
    expect(() => loadWheelPhysics()).not.toThrow()
    expect(loadWheelPhysics()).toEqual(defaultWheelPhysics())
  })
})

describe('wheelPhysicsStore — key and defensive inputs', () => {
  it('uses the synth-d:wheel-physics storage key', () => {
    expect(STORAGE_KEY).toBe('synth-d:wheel-physics')
  })

  it('saving with no argument falls back to defaults without throwing', () => {
    expect(() => saveWheelPhysics()).not.toThrow()
    expect(loadWheelPhysics()).toEqual(defaultWheelPhysics())
  })

  it('saving an explicit null falls back to defaults without throwing', () => {
    // @ts-expect-error deliberately malformed input
    expect(() => saveWheelPhysics(null)).not.toThrow()
    expect(loadWheelPhysics()).toEqual(defaultWheelPhysics())
  })
})

describe('wheelPhysicsStore — localStorage unavailable', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loadWheelPhysics returns defaults when getItem throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('unavailable')
    })
    expect(loadWheelPhysics()).toEqual(defaultWheelPhysics())
  })

  it('saveWheelPhysics returns false when setItem throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    expect(saveWheelPhysics(defaultWheelPhysics())).toBe(false)
  })
})

describe('wheelPhysicsStore — reset', () => {
  it('overwrites stored physics with defaults and returns them', () => {
    saveWheelPhysics({ pitch: { mass: 2, spring: 30, damping: 0.5 } })
    const result = resetWheelPhysics()
    expect(result).toEqual(defaultWheelPhysics())
    expect(loadWheelPhysics()).toEqual(defaultWheelPhysics())
  })
})
