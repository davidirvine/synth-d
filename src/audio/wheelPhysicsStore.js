// Persistence for the PITCH wheel's spring physics. A single localStorage key
// holds the PITCH wheel's { mass, spring, damping }. On load every field is
// validated as a finite number within its range and falls back to its own
// default, so a partial or corrupt entry never breaks the wheels (the
// validate-and-default resilience pattern from midiCcMap, in the `synth-d:`
// namespace from storage.js).
//
// The MOD wheel is a non-spring control with no tunable physics, so it is not
// persisted. A legacy blob from before that change may still carry a `mod`
// object alongside `pitch`; the load path ignores it (it is neither read nor
// re-saved), migrating the stored shape to `{ pitch }` on the next save.

import { PHYSICS_RANGES, DEFAULT_PHYSICS } from './wheelPhysics.js'

/** localStorage key (in the established `synth-d:` namespace). */
export const STORAGE_KEY = 'synth-d:wheel-physics'

/** Default PITCH physics (a fresh object per call — never shared). */
export function defaultWheelPhysics() {
  return {
    pitch: { ...DEFAULT_PHYSICS },
  }
}

/** @param {string} key @returns {string | null} */
function safeGet(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

/** @param {string} key @param {string} value @returns {boolean} success */
function safeSet(key, value) {
  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

/**
 * Validate one physics field against its range, falling back to the default
 * when missing or out of range. NaN/Infinity fail `Number.isFinite`.
 * @param {unknown} v
 * @param {{ min: number, max: number, default: number }} range
 * @returns {number}
 */
function validateField(v, range) {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < range.min || v > range.max) {
    return range.default
  }
  return v
}

/**
 * Validate a single wheel's params, falling back per-field to defaults.
 * @param {unknown} raw
 * @returns {{ mass: number, spring: number, damping: number }}
 */
function validateWheel(raw) {
  const w = raw && typeof raw === 'object' ? /** @type {Record<string, unknown>} */ (raw) : {}
  return {
    mass: validateField(w.mass, PHYSICS_RANGES.mass),
    spring: validateField(w.spring, PHYSICS_RANGES.spring),
    damping: validateField(w.damping, PHYSICS_RANGES.damping),
  }
}

/**
 * Load the PITCH wheel's physics. Absent, partial, or corrupt data resolves to
 * per-field defaults so the wheels always function. A legacy `mod` field is
 * ignored (not read, not re-saved).
 * @returns {{ pitch: { mass: number, spring: number, damping: number } }}
 */
export function loadWheelPhysics() {
  const raw = safeGet(STORAGE_KEY)
  /** @type {Record<string, unknown>} */
  let parsed = {}
  if (raw) {
    try {
      const obj = JSON.parse(raw)
      if (obj && typeof obj === 'object') parsed = obj
    } catch {
      // Corrupt JSON reads as absent → all defaults below.
    }
  }
  return {
    pitch: validateWheel(parsed.pitch),
  }
}

/**
 * Persist the PITCH wheel's physics. Each field is validated/clamped through
 * the same path as load, so only in-range numbers are written; any `mod` field
 * on the input is dropped. Storage failure is non-fatal.
 * @param {{ pitch?: unknown }} [physics]
 * @returns {boolean} success
 */
export function saveWheelPhysics(physics = {}) {
  const clean = { pitch: validateWheel(physics?.pitch) }
  return safeSet(STORAGE_KEY, JSON.stringify(clean))
}

/**
 * Reset the PITCH wheel to default physics and persist it.
 * @returns {{ pitch: { mass: number, spring: number, damping: number } }}
 */
export function resetWheelPhysics() {
  const defaults = defaultWheelPhysics()
  saveWheelPhysics(defaults)
  return defaults
}
