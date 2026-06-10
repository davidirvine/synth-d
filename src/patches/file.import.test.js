import { describe, it, expect, beforeEach } from 'vitest'
import { FILE_FORMAT_VERSION, serializePatch, importPatch } from './file.js'
import { listPatches, loadPatch, savePatch } from './storage.js'

beforeEach(() => {
  localStorage.clear()
})

/** Snapshot the entire localStorage as a plain object for before/after equality. */
function snapshotStorage() {
  /** @type {Record<string, string | null>} */
  const snap = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = /** @type {string} */ (localStorage.key(i))
    snap[key] = localStorage.getItem(key)
  }
  return snap
}

const validText = (name = 'IMPORTED', params = { cutoff: 1234 }) =>
  JSON.stringify(serializePatch({ name, version: 1, params }))

describe('importPatch — successful commit', () => {
  it('commits a valid file exactly once and lists it', () => {
    const before = listPatches().length
    const res = importPatch(validText('LEAD', { cutoff: 8000 }))
    expect(res.ok).toBe(true)
    expect(res.ok && res.name).toBe('LEAD')
    // Appears in the list, exactly one new entry.
    expect(listPatches()).toEqual(['LEAD'])
    expect(listPatches().length).toBe(before + 1)
    // And is loadable with its coerced params.
    expect(loadPatch('LEAD')?.params.cutoff).toBe(8000)
  })

  it('coerces out-of-range values as it commits', () => {
    importPatch(validText('WILD', { cutoff: 999999, osc1Wave: 99 }))
    const patch = loadPatch('WILD')
    expect(patch?.params.cutoff).toBe(20000) // clamped to max
    expect(patch?.params.osc1Wave).toBe(0) // out-of-domain → default
  })

  it('auto-suffixes a colliding name without overwriting the original', () => {
    savePatch('LEAD', { cutoff: 1111 })
    const res = importPatch(validText('LEAD', { cutoff: 2222 }))
    expect(res.ok && res.name).toBe('LEAD 2')
    expect(listPatches()).toEqual(['LEAD', 'LEAD 2'])
    // The original is untouched; the import landed in the suffixed slot.
    expect(loadPatch('LEAD')?.params.cutoff).toBe(1111)
    expect(loadPatch('LEAD 2')?.params.cutoff).toBe(2222)
  })
})

describe('importPatch — atomicity (rejection writes nothing)', () => {
  /** @param {string} text @param {RegExp} reason */
  function assertRejectedNoWrite(text, reason) {
    // Seed a preexisting patch so we can prove it is left exactly as it was.
    savePatch('EXISTING', { cutoff: 5000 })
    const before = snapshotStorage()

    const res = importPatch(text)
    expect(res.ok).toBe(false)
    expect(res.ok === false && res.error).toMatch(reason)

    // Nothing added, removed, or changed.
    expect(snapshotStorage()).toEqual(before)
    expect(listPatches()).toEqual(['EXISTING'])
  }

  it('rejects unparseable JSON and writes nothing', () => {
    assertRejectedNoWrite('{ not json', /json/i)
  })

  it('rejects a structurally invalid file and writes nothing', () => {
    assertRejectedNoWrite(JSON.stringify({ fileFormat: 1, name: 42, params: {} }), /name/i)
  })

  it('rejects an unrecognized file-format version and writes nothing', () => {
    assertRejectedNoWrite(
      JSON.stringify({ fileFormat: FILE_FORMAT_VERSION + 1, name: 'X', version: 1, params: {} }),
      /file-format/i
    )
  })

  it('rejects an empty name and writes nothing', () => {
    assertRejectedNoWrite(validText('   '), /name/i)
  })
})
