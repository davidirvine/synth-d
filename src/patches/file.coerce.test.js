import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { coerceParams } from './file.js'
import { PARAM_SCHEMA, PARAM_NAMES, DISCRETE_DOMAINS } from '../param-schema.js'

/**
 * Parse the authoritative `nentry("label", init, min, max, step)` definitions
 * from the FAUST DSP source into `label -> { min, max }`. The DSP — not the UI
 * components, whose constants are not exported — is the source of truth for each
 * discrete parameter's valid range.
 * @returns {Record<string, { min: number, max: number }>}
 */
function parseDspNentryDomains() {
  // Resolve from the repo root (vitest's cwd); import.meta.url is not a file URL.
  const dsp = readFileSync(join(process.cwd(), 'faust', 'synth.dsp'), 'utf8')
  const re =
    /nentry\("(\w+)"\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\)/g
  /** @type {Record<string, { min: number, max: number }>} */
  const domains = {}
  let m
  while ((m = re.exec(dsp)) !== null) {
    domains[m[1]] = { min: Number(m[3]), max: Number(m[4]) }
  }
  return domains
}

describe('coerceParams — knobs', () => {
  it('clamps a value above max to max', () => {
    expect(coerceParams({ cutoff: 99999 }).cutoff).toBe(PARAM_SCHEMA.cutoff.max)
  })

  it('clamps a value below min to min', () => {
    expect(coerceParams({ cutoff: -100 }).cutoff).toBe(PARAM_SCHEMA.cutoff.min)
  })

  it('leaves an in-range value untouched', () => {
    expect(coerceParams({ cutoff: 2000 }).cutoff).toBe(2000)
  })
})

describe('coerceParams — switches', () => {
  it('preserves an integer value within its domain', () => {
    expect(coerceParams({ osc1Wave: 3 }).osc1Wave).toBe(3)
    expect(coerceParams({ osc1Range: -2 }).osc1Range).toBe(-2)
  })

  it('falls back to default on an out-of-range value', () => {
    expect(coerceParams({ osc1Wave: 47 }).osc1Wave).toBe(PARAM_SCHEMA.osc1Wave.default)
    expect(coerceParams({ osc1Range: -3 }).osc1Range).toBe(PARAM_SCHEMA.osc1Range.default)
  })

  it('falls back to default on a non-integer value', () => {
    expect(coerceParams({ osc1Wave: 2.5 }).osc1Wave).toBe(PARAM_SCHEMA.osc1Wave.default)
  })

  it('coerces keyTrack via its PARAM_SCHEMA min/max bounds', () => {
    // keyTrack carries min:0/max:1 in PARAM_SCHEMA (no DISCRETE_DOMAINS entry).
    expect(coerceParams({ keyTrack: 1 }).keyTrack).toBe(1)
    expect(coerceParams({ keyTrack: 5 }).keyTrack).toBe(PARAM_SCHEMA.keyTrack.default)
  })
})

describe('coerceParams — dropping', () => {
  it('drops a parameter name outside PARAM_NAMES', () => {
    const out = coerceParams({ totallyUnknown: 1, cutoff: 2000 })
    expect(out).not.toHaveProperty('totallyUnknown')
    expect(out.cutoff).toBe(2000)
  })

  it('drops a kind: controller param (modWheel) — absent from PARAM_NAMES', () => {
    // modWheel is a controller, not iterated; it never appears in the output.
    expect(coerceParams({ modWheel: 0.5 })).not.toHaveProperty('modWheel')
  })

  it('drops a non-number value defensively', () => {
    // coerceParams runs after the structural gate (which guarantees numbers), but
    // it independently guards typeof so it is safe to call on raw input too.
    // @ts-expect-error exercising the defensive non-number guard
    expect(coerceParams({ cutoff: 'loud', osc1Wave: '3' })).toEqual({})
  })

  it('drops non-finite numeric values', () => {
    expect(coerceParams({ cutoff: Infinity })).not.toHaveProperty('cutoff')
    expect(coerceParams({ cutoff: -Infinity })).not.toHaveProperty('cutoff')
    expect(coerceParams({ cutoff: NaN })).not.toHaveProperty('cutoff')
  })

  it('omits a parameter that is absent from the input', () => {
    expect(coerceParams({})).toEqual({})
  })
})

describe('DISCRETE_DOMAINS — drift guard against the DSP', () => {
  const dspDomains = parseDspNentryDomains()

  it('sanity: the DSP actually parsed some nentry definitions', () => {
    expect(Object.keys(dspDomains).length).toBeGreaterThan(0)
  })

  it('every DISCRETE_DOMAINS entry matches the DSP nentry min/max', () => {
    // Changing a waveform/range count in faust/synth.dsp without updating the
    // import table fails here — the drift risk the design calls out.
    for (const [name, domain] of Object.entries(DISCRETE_DOMAINS)) {
      expect(dspDomains, `${name} missing an nentry definition in faust/synth.dsp`).toHaveProperty(
        name
      )
      expect(domain, `${name} domain drifted from the DSP`).toEqual(dspDomains[name])
    }
  })

  it('every switch param has coercion coverage (schema bounds or DISCRETE_DOMAINS)', () => {
    // A newly added switch with no PARAM_SCHEMA min/max and no DISCRETE_DOMAINS
    // entry would silently have no domain to coerce against — fail loudly.
    const switchParams = PARAM_NAMES.filter((p) => PARAM_SCHEMA[p].kind === 'switch')
    for (const p of switchParams) {
      const hasSchemaBounds =
        typeof PARAM_SCHEMA[p].min === 'number' && typeof PARAM_SCHEMA[p].max === 'number'
      const hasTableEntry = p in DISCRETE_DOMAINS
      expect(hasSchemaBounds || hasTableEntry, `${p} has no coercion coverage`).toBe(true)
      // The two sources are mutually exclusive — keyTrack uses schema bounds and
      // is intentionally absent from the table; the rest are table-only.
      expect(hasSchemaBounds && hasTableEntry, `${p} has duplicated coverage`).toBe(false)
    }
  })

  it('every DISCRETE_DOMAINS entry corresponds to a real switch param', () => {
    for (const name of Object.keys(DISCRETE_DOMAINS)) {
      expect(PARAM_NAMES, `${name} is not a store-backed param`).toContain(name)
      expect(PARAM_SCHEMA[name].kind, `${name} is not a switch`).toBe('switch')
    }
  })
})
