import { describe, it, expect } from 'vitest'
import { uniquePatchName } from './file.js'
import { MAX_NAME_LENGTH } from './storage.js'

describe('uniquePatchName — normalization', () => {
  it('trims, upper-cases, and caps the name', () => {
    expect(uniquePatchName('  lead  ', [])).toBe('LEAD')
    expect(uniquePatchName('PadSound', [])).toBe('PADSOUND')
    expect(uniquePatchName('a'.repeat(40), [])).toHaveLength(MAX_NAME_LENGTH)
  })

  it('returns null for an empty/whitespace-only name', () => {
    expect(uniquePatchName('   ', [])).toBeNull()
    expect(uniquePatchName('', [])).toBeNull()
  })

  it('returns the normalized name unchanged when there is no collision', () => {
    expect(uniquePatchName('LEAD', ['PAD', 'BASS'])).toBe('LEAD')
  })
})

describe('uniquePatchName — collision auto-suffix', () => {
  it('appends " 2" on a first collision', () => {
    expect(uniquePatchName('NAME', ['NAME'])).toBe('NAME 2')
  })

  it('increments past already-taken suffixes', () => {
    expect(uniquePatchName('NAME', ['NAME', 'NAME 2', 'NAME 3'])).toBe('NAME 4')
  })

  it('matches collisions case-insensitively (existing names normalized)', () => {
    expect(uniquePatchName('name', ['NAME'])).toBe('NAME 2')
  })

  it('truncates the base (never the suffix) when the suffix would overflow the cap', () => {
    const base = 'X'.repeat(MAX_NAME_LENGTH) // exactly at the cap
    const result = uniquePatchName(base, [base])
    // Suffix " 2" is preserved; the base is shortened so the whole fits the cap.
    expect(result).toHaveLength(MAX_NAME_LENGTH)
    expect(result?.endsWith(' 2')).toBe(true)
    expect(result).toBe('X'.repeat(MAX_NAME_LENGTH - 2) + ' 2')
  })

  it('keeps the suffix when incrementing forces a wider number', () => {
    // Base fills the cap; " 10" is 3 chars, so the base is trimmed one more.
    const base = 'Y'.repeat(MAX_NAME_LENGTH)
    const taken = [base]
    for (let n = 2; n <= 9; n++) taken.push('Y'.repeat(MAX_NAME_LENGTH - 2) + ` ${n}`)
    const result = uniquePatchName(base, taken)
    expect(result).toHaveLength(MAX_NAME_LENGTH)
    expect(result?.endsWith(' 10')).toBe(true)
  })
})
