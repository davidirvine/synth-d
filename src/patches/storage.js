// Patch persistence: named-slot localStorage CRUD for synth patches.
//
// Layout (all under the `synth-d:` namespace):
//   - `synth-d:patches`        → JSON array of patch names (the index/authority
//                                for what exists; a stray slot key cannot create
//                                a phantom entry).
//   - `synth-d:patch:<name>`   → JSON envelope `{ name, version, params }`.
//
// Every localStorage access is wrapped so an unavailable store (private mode),
// a quota error, or corrupt JSON is handled as a non-fatal failure — a missing
// or corrupt slot reads as absent, and a failed write reports an error rather
// than throwing into the audio/UI.

import { PARAM_NAMES } from '../state/synth.svelte.js'

const NS = 'synth-d:'
const INDEX_KEY = NS + 'patches'
const SLOT_PREFIX = NS + 'patch:'

/** Patch envelope schema version (bump when the persisted shape changes). */
export const PATCH_VERSION = 1

/** Maximum patch-name length (longer names are capped). */
export const MAX_NAME_LENGTH = 40

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

/** @param {string} key */
function safeRemove(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* localStorage unavailable — nothing to remove */
  }
}

/**
 * Validate and normalize a patch name: trim surrounding whitespace, reject
 * empty/whitespace-only, and cap the length. Returns the cleaned name, or null
 * if invalid. A name that collides with an existing patch is NOT an error here —
 * the caller routes that through an overwrite confirmation.
 * @param {unknown} name
 * @returns {string | null}
 */
export function validateName(name) {
  if (typeof name !== 'string') return null
  const trimmed = name.trim()
  if (trimmed.length === 0) return null
  return trimmed.slice(0, MAX_NAME_LENGTH)
}

/** @returns {string[]} */
function readIndex() {
  const raw = safeGet(INDEX_KEY)
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.filter((n) => typeof n === 'string') : []
  } catch {
    return []
  }
}

/** @param {string[]} names */
function writeIndex(names) {
  return safeSet(INDEX_KEY, JSON.stringify(names))
}

/**
 * List the names of all saved patches (the index is the authority).
 * @returns {string[]}
 */
export function listPatches() {
  return readIndex()
}

/**
 * Save the current params as a named patch. Only in-scope params (PARAM_NAMES)
 * are serialized; anything else in `params` (e.g. modWheel) is excluded. A name
 * collision overwrites the existing slot. Storage failures are non-fatal.
 * @param {string} name
 * @param {Record<string, number>} params
 * @returns {{ ok: true, name: string } | { ok: false, error: 'invalid-name' | 'storage-unavailable' }}
 */
export function savePatch(name, params) {
  const clean = validateName(name)
  if (clean === null) return { ok: false, error: 'invalid-name' }

  /** @type {Record<string, number>} */
  const filtered = {}
  for (const p of PARAM_NAMES) {
    if (p in params && Number.isFinite(params[p])) filtered[p] = params[p]
  }

  const envelope = { name: clean, version: PATCH_VERSION, params: filtered }
  if (!safeSet(SLOT_PREFIX + clean, JSON.stringify(envelope))) {
    return { ok: false, error: 'storage-unavailable' }
  }

  const index = readIndex()
  if (!index.includes(clean)) {
    index.push(clean)
    if (!writeIndex(index)) {
      // The slot was written but the index update failed (e.g. quota). Roll back
      // the orphaned slot so it can't linger unreferenced by listPatches().
      safeRemove(SLOT_PREFIX + clean)
      return { ok: false, error: 'storage-unavailable' }
    }
  }
  return { ok: true, name: clean }
}

/**
 * Load a saved patch. Returns the envelope with params filtered to in-scope
 * names, or null if the name is invalid or the slot is missing/corrupt.
 * @param {string} name
 * @returns {{ name: string, version: number, params: Record<string, number> } | null}
 */
export function loadPatch(name) {
  const clean = validateName(name)
  if (clean === null) return null

  const raw = safeGet(SLOT_PREFIX + clean)
  if (!raw) return null

  try {
    const env = JSON.parse(raw)
    if (!env || typeof env !== 'object' || typeof env.params !== 'object' || env.params === null) {
      return null
    }
    /** @type {Record<string, number>} */
    const params = {}
    for (const p of PARAM_NAMES) {
      if (p in env.params && Number.isFinite(env.params[p])) params[p] = env.params[p]
    }
    return {
      name: clean,
      version: typeof env.version === 'number' ? env.version : PATCH_VERSION,
      params,
    }
  } catch {
    // Corrupt JSON in the slot reads as absent.
    return null
  }
}

/**
 * Delete a saved patch: remove its slot and drop it from the index.
 * @param {string} name
 * @returns {boolean} true unless the name was invalid
 */
export function deletePatch(name) {
  const clean = validateName(name)
  if (clean === null) return false

  // Update the index first; only remove the slot if that succeeds. A failed
  // index write then leaves the patch fully intact rather than producing a
  // phantom entry that lists but cannot load (symmetric with savePatch).
  const index = readIndex()
  const next = index.filter((n) => n !== clean)
  if (next.length !== index.length && !writeIndex(next)) return false
  safeRemove(SLOT_PREFIX + clean)
  return true
}
