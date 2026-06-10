import { describe, it, expect } from 'vitest'
import {
  FILE_FORMAT_VERSION,
  MAX_IMPORT_BYTES,
  serializePatch,
  patchFilename,
  parsePatchFile,
  validatePatchFile,
} from './file.js'

/** A minimal structurally-valid parsed file, spread-and-override in tests. */
const validFile = () => ({ fileFormat: FILE_FORMAT_VERSION, name: 'LEAD', version: 1, params: {} })

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

describe('parsePatchFile', () => {
  it('parses a valid JSON file', () => {
    const res = parsePatchFile(JSON.stringify(validFile()))
    expect(res).toEqual({ ok: true, value: validFile() })
  })

  it('rejects oversized input before parsing', () => {
    // One byte over the ceiling. Reason mentions size; no parse is attempted.
    const huge = 'a'.repeat(MAX_IMPORT_BYTES + 1)
    const res = parsePatchFile(huge)
    expect(res.ok).toBe(false)
    expect(res.ok === false && res.error).toMatch(/large/i)
  })

  it('rejects unparseable JSON with a reason', () => {
    const res = parsePatchFile('{ not valid json')
    expect(res.ok).toBe(false)
    expect(res.ok === false && res.error).toMatch(/json/i)
  })

  it('rejects non-string input', () => {
    // @ts-expect-error exercising the non-string guard
    const res = parsePatchFile(42)
    expect(res.ok).toBe(false)
  })
})

describe('validatePatchFile — structural gate', () => {
  it('accepts a structurally valid file', () => {
    const res = validatePatchFile({ ...validFile(), params: { cutoff: 2000 } })
    expect(res.ok).toBe(true)
  })

  it('accepts an empty params object', () => {
    const res = validatePatchFile({ ...validFile(), params: {} })
    expect(res.ok).toBe(true)
  })

  it('rejects a non-object top level', () => {
    for (const bad of [null, 42, 'str', [1, 2]]) {
      const res = validatePatchFile(bad)
      expect(res.ok).toBe(false)
      expect(res.ok === false && res.error).toMatch(/object/i)
    }
  })

  it('rejects a missing fileFormat', () => {
    const { fileFormat, ...withoutFormat } = validFile()
    void fileFormat
    const res = validatePatchFile(withoutFormat)
    expect(res.ok).toBe(false)
    expect(res.ok === false && res.error).toMatch(/file-format/i)
  })

  it('rejects an unrecognized (higher) fileFormat version', () => {
    const res = validatePatchFile({ ...validFile(), fileFormat: FILE_FORMAT_VERSION + 1 })
    expect(res.ok).toBe(false)
    expect(res.ok === false && res.error).toMatch(/file-format/i)
  })

  it('rejects a non-string name', () => {
    const res = validatePatchFile({ ...validFile(), name: 42 })
    expect(res.ok).toBe(false)
    expect(res.ok === false && res.error).toMatch(/name/i)
  })

  it('rejects a non-object params', () => {
    for (const bad of [null, 5, 'x', [1]]) {
      const res = validatePatchFile({ ...validFile(), params: bad })
      expect(res.ok).toBe(false)
      expect(res.ok === false && res.error).toMatch(/params/i)
    }
  })

  it('rejects a non-number parameter value', () => {
    const res = validatePatchFile({ ...validFile(), params: { cutoff: 'loud' } })
    expect(res.ok).toBe(false)
    expect(res.ok === false && res.error).toMatch(/cutoff/i)
  })
})
