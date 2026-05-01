const STORAGE_PREFIX = 'midiCc:'

// Param renames applied to persisted entries on load only. The underlying
// localStorage value is left untouched so a revert keeps existing mappings
// working without further migration.
const PARAM_RENAMES = /** @type {Record<string, string>} */ ({
  reverbMix: 'reverbSend',
})

export class MidiCcMap {
  /** @type {Map<number, { param: string, min: number, max: number }>} */
  #byCC = new Map()
  /** @type {Map<string, number>} */
  #byParam = new Map()

  constructor() {
    this.#load()
  }

  /** @param {number} cc @param {string} param @param {number} min @param {number} max */
  assign(cc, param, min, max) {
    // Remove any old mapping for this param
    const oldCc = this.#byParam.get(param)
    if (oldCc !== undefined) {
      this.#byCC.delete(oldCc)
      try {
        localStorage.removeItem(STORAGE_PREFIX + oldCc)
      } catch {
        /* localStorage unavailable */
      }
    }
    this.#byCC.set(cc, { param, min, max })
    this.#byParam.set(param, cc)
    try {
      localStorage.setItem(STORAGE_PREFIX + cc, JSON.stringify({ param, min, max }))
    } catch {
      /* localStorage unavailable */
    }
  }

  /** @param {number} cc @returns {{ param: string, min: number, max: number } | null} */
  resolve(cc) {
    return this.#byCC.get(cc) ?? null
  }

  /** @param {string} param @returns {number | null} */
  getAssignedCc(param) {
    return this.#byParam.get(param) ?? null
  }

  /** @param {number} cc @param {number} raw 0–127 */
  scale(cc, raw) {
    const mapping = this.#byCC.get(cc)
    if (!mapping) return null
    return mapping.min + (mapping.max - mapping.min) * (raw / 127)
  }

  #load() {
    try {
      // Collect all storage entries first so the second pass can see whether
      // a canonical-named entry exists for any rename target.
      /** @type {Array<{ cc: number, param: string, min: number, max: number }>} */
      const entries = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (!key?.startsWith(STORAGE_PREFIX)) continue
        const cc = Number(key.slice(STORAGE_PREFIX.length))
        if (isNaN(cc)) continue
        const raw = localStorage.getItem(key)
        if (!raw) continue
        const { param, min, max } = JSON.parse(raw)
        entries.push({ cc, param, min, max })
      }

      // Pass 1: load entries whose param is already canonical (not a rename
      // source). These take precedence over any stale renamed entry pointing
      // at the same canonical name.
      for (const { cc, param, min, max } of entries) {
        if (PARAM_RENAMES[param] !== undefined) continue
        this.#byCC.set(cc, { param, min, max })
        this.#byParam.set(param, cc)
      }

      // Pass 2: apply renames only when no canonical entry has already
      // claimed the target param. This prevents a stale `reverbMix` entry
      // and a fresh `reverbSend` entry from racing on iteration order.
      for (const { cc, param, min, max } of entries) {
        const target = PARAM_RENAMES[param]
        if (target === undefined) continue
        if (this.#byParam.has(target)) continue
        this.#byCC.set(cc, { param: target, min, max })
        this.#byParam.set(target, cc)
      }
    } catch {
      /* localStorage unavailable */
    }
  }
}
