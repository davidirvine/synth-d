const STORAGE_PREFIX = 'midiCc:'

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
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (!key?.startsWith(STORAGE_PREFIX)) continue
        const cc = Number(key.slice(STORAGE_PREFIX.length))
        if (isNaN(cc)) continue
        const raw = localStorage.getItem(key)
        if (!raw) continue
        const { param, min, max } = JSON.parse(raw)
        this.#byCC.set(cc, { param, min, max })
        this.#byParam.set(param, cc)
      }
    } catch {
      /* localStorage unavailable */
    }
  }
}
