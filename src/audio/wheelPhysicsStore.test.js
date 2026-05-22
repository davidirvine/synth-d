import { describe, it, expect, beforeEach } from 'vitest'
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
  it('defaultWheelPhysics returns both wheels at the documented defaults', () => {
    expect(defaultWheelPhysics()).toEqual({
      mod: { ...DEFAULT_PHYSICS },
      pitch: { ...DEFAULT_PHYSICS },
    })
  })

  it('returns a fresh object each call (no shared mutable state)', () => {
    const a = defaultWheelPhysics()
    const b = defaultWheelPhysics()
    expect(a).not.toBe(b)
    expect(a.mod).not.toBe(b.mod)
  })
})

describe('wheelPhysicsStore — round trip', () => {
  it('saves and loads custom physics for both wheels', () => {
    const physics = {
      mod: { mass: 2, spring: 30, damping: 0.5 },
      pitch: { mass: 0.5, spring: 10, damping: 0.8 },
    }
    expect(saveWheelPhysics(physics)).toBe(true)
    expect(loadWheelPhysics()).toEqual(physics)
  })

  it('persists under the synth-d:wheel-physics key', () => {
    saveWheelPhysics(defaultWheelPhysics())
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
  })
})

describe('wheelPhysicsStore — fallback on missing/partial/corrupt data', () => {
  it('returns defaults when nothing is stored', () => {
    expect(loadWheelPhysics()).toEqual(defaultWheelPhysics())
  })

  it('fills in per-field defaults when a field is missing', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ mod: { mass: 3 } }))
    const loaded = loadWheelPhysics()
    expect(loaded.mod.mass).toBe(3)
    expect(loaded.mod.spring).toBe(DEFAULT_PHYSICS.spring)
    expect(loaded.mod.damping).toBe(DEFAULT_PHYSICS.damping)
    expect(loaded.pitch).toEqual(DEFAULT_PHYSICS)
  })

  it('falls back when a field is out of range', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ mod: { mass: 999, spring: 0, damping: 5 }, pitch: {} })
    )
    const loaded = loadWheelPhysics()
    expect(loaded.mod.mass).toBe(DEFAULT_PHYSICS.mass)
    expect(loaded.mod.spring).toBe(DEFAULT_PHYSICS.spring)
    expect(loaded.mod.damping).toBe(DEFAULT_PHYSICS.damping)
  })

  it('falls back when a field is non-finite (NaN serializes to null)', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ mod: { mass: null } }))
    expect(loadWheelPhysics().mod.mass).toBe(DEFAULT_PHYSICS.mass)
  })

  it('does not throw on corrupt JSON, returning defaults', () => {
    localStorage.setItem(STORAGE_KEY, '{ not valid json')
    expect(() => loadWheelPhysics()).not.toThrow()
    expect(loadWheelPhysics()).toEqual(defaultWheelPhysics())
  })

  it('accepts boundary values exactly at min and max', () => {
    saveWheelPhysics({
      mod: { mass: 0.1, spring: 1, damping: 0.05 },
      pitch: { mass: 5, spring: 50, damping: 1 },
    })
    const loaded = loadWheelPhysics()
    expect(loaded.mod).toEqual({ mass: 0.1, spring: 1, damping: 0.05 })
    expect(loaded.pitch).toEqual({ mass: 5, spring: 50, damping: 1 })
  })
})

describe('wheelPhysicsStore — reset', () => {
  it('overwrites stored physics with defaults and returns them', () => {
    saveWheelPhysics({
      mod: { mass: 2, spring: 30, damping: 0.5 },
      pitch: { mass: 2, spring: 30, damping: 0.5 },
    })
    const result = resetWheelPhysics()
    expect(result).toEqual(defaultWheelPhysics())
    expect(loadWheelPhysics()).toEqual(defaultWheelPhysics())
  })
})
