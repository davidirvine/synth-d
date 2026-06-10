import { describe, it, expect } from 'vitest'
import { FILE_FORMAT_VERSION, serializePatch, patchFilename } from './file.js'

describe('serializePatch', () => {
  it('wraps the envelope in the versioned file object', () => {
    const file = serializePatch({ name: 'LEAD', version: 1, params: { cutoff: 2000 } })
    expect(file).toEqual({
      fileFormat: FILE_FORMAT_VERSION,
      name: 'LEAD',
      version: 1,
      params: { cutoff: 2000 },
    })
  })

  it('declares a numeric fileFormat distinct from the patch version', () => {
    // A patch envelope can carry any version; the file-format version is its own
    // contract identifier and must not be conflated with it.
    const file = serializePatch({ name: 'X', version: 7, params: {} })
    expect(typeof file.fileFormat).toBe('number')
    expect(file.fileFormat).toBe(FILE_FORMAT_VERSION)
    expect(file.version).toBe(7)
    // The two fields are independent — equality here would be coincidental.
    expect(file.fileFormat).not.toBe(file.version)
  })

  it('carries only name/version/params — no performance or controller fields', () => {
    const file = serializePatch({ name: 'X', version: 1, params: { cutoff: 2000 } })
    expect(Object.keys(file).sort()).toEqual(['fileFormat', 'name', 'params', 'version'])
    // Performance/controller state a saved patch already excludes must not appear.
    expect(file).not.toHaveProperty('register')
    expect(file).not.toHaveProperty('modWheel')
    expect(file).not.toHaveProperty('ccMap')
    expect(file.params).not.toHaveProperty('modWheel')
  })
})

describe('patchFilename', () => {
  it('appends a .json suffix to a simple name', () => {
    expect(patchFilename('LEAD')).toBe('LEAD.json')
  })

  it('replaces filesystem-reserved characters with underscores', () => {
    expect(patchFilename('A/B\\C:D')).toBe('A_B_C_D.json')
    expect(patchFilename('Q?<>|*"X')).toBe('Q_X.json')
  })

  it('collapses runs of unsafe characters and trims surrounding underscores', () => {
    expect(patchFilename('  LEAD * 2  ')).toBe('LEAD_2.json')
    expect(patchFilename('NAME 2')).toBe('NAME_2.json')
  })

  it('replaces control and tab characters', () => {
    // Built via fromCharCode so no literal control bytes live in this source.
    const tab = String.fromCharCode(0x09)
    const bell = String.fromCharCode(0x07)
    expect(patchFilename(`A${tab}B`)).toBe('A_B.json')
    expect(patchFilename(`A${bell}B`)).toBe('A_B.json')
  })

  it('falls back to "patch" when sanitization leaves nothing', () => {
    expect(patchFilename('////')).toBe('patch.json')
    expect(patchFilename('   ')).toBe('patch.json')
    expect(patchFilename('')).toBe('patch.json')
  })
})
