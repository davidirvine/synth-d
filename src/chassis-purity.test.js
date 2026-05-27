import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join, relative, sep } from 'path'
import { PARAM_SCHEMA } from './param-schema.js'

// The executable form of the chassis-architecture capability (design.md D4): the
// generic chassis must reference instrument parameters only via the schema and
// the universal engine contract. This test fails the build if any chassis source
// file names an instrument-specific parameter as a literal, guarding against
// re-entanglement. The blocklist is DERIVED from the schema, so it stays
// self-updating rather than hand-maintained.

const SRC_DIR = dirname(fileURLToPath(import.meta.url))

// The five universal engine params the chassis legitimately knows (D4). Of these
// only `modWheel` is a schema key (a controller); the other four are engine
// contract names that never appear in the schema.
const UNIVERSAL_ENGINE_PARAMS = new Set(['freq', 'gate', 'modWheel', 'mixerPeak', 'outputPeak'])

// Every instrument-specific parameter name = schema names minus the universal set.
const INSTRUMENT_PARAM_NAMES = Object.keys(PARAM_SCHEMA).filter(
  (name) => !UNIVERSAL_ENGINE_PARAMS.has(name)
)

// Tier-3 instrument source files, excluded from the chassis scan: the panels, the
// instrument panel layout (SubtractivePanels), the SEM filter morph, the dead
// Volume control, and the schema module itself (which by definition declares all
// the names). Everything else under src/ is chassis.
const INSTRUMENT_FILES = new Set(
  [
    'components/Oscillator.svelte',
    'components/Mixer.svelte',
    'components/Filter.svelte',
    'components/AmpEnv.svelte',
    'components/Effects.svelte',
    'components/Modulation.svelte',
    'components/Glide.svelte',
    'components/Volume.svelte',
    'components/SubtractivePanels.svelte',
    'audio/filterGains.js',
    'param-schema.js',
  ].map((p) => p.split('/').join(sep))
)

// Benign common-word collisions to ignore (a chassis identifier that happens to
// equal an instrument param name without being one). Empty today — the chassis is
// clean — but kept as the sanctioned escape hatch so a future legitimate collision
// is an explicit, reviewed entry rather than a reason to weaken the scan.
const ALLOWLIST = new Set()

/** Strip JS line/block comments and HTML comments so only code is scanned. */
function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ') // JS block comments
    .replace(/<!--[\s\S]*?-->/g, ' ') // HTML/Svelte comments
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1') // JS line comments (keep :// in URLs)
}

/** Recursively list chassis source files (.js/.svelte, excluding tests/instrument). */
function chassisFiles() {
  return readdirSync(SRC_DIR, { recursive: true })
    .map((p) => p.toString())
    .filter((p) => /\.(js|svelte)$/.test(p))
    .filter((p) => !/\.test\.js$/.test(p) && !/\.test\.harness\.svelte$/.test(p))
    .filter((p) => !INSTRUMENT_FILES.has(p))
}

describe('chassis purity: no instrument param-name literals in chassis code', () => {
  it('scans a non-trivial set of chassis files', () => {
    // Guards against the scan silently matching nothing because the glob broke.
    expect(chassisFiles().length).toBeGreaterThan(10)
  })

  it('derives the blocklist from the schema and excludes the universal engine params', () => {
    expect(INSTRUMENT_PARAM_NAMES).toContain('cutoff')
    expect(INSTRUMENT_PARAM_NAMES).toContain('reverbSend')
    expect(INSTRUMENT_PARAM_NAMES).not.toContain('modWheel')
    expect(INSTRUMENT_PARAM_NAMES).not.toContain('freq')
  })

  it('contains no instrument-specific parameter name in any chassis file', () => {
    /** @type {Array<{ file: string, names: string[] }>} */
    const violations = []
    for (const rel of chassisFiles()) {
      const code = stripComments(readFileSync(join(SRC_DIR, rel), 'utf8'))
      const names = INSTRUMENT_PARAM_NAMES.filter(
        (name) => !ALLOWLIST.has(name) && new RegExp(`\\b${name}\\b`).test(code)
      )
      if (names.length) violations.push({ file: relative(SRC_DIR, join(SRC_DIR, rel)), names })
    }
    expect(
      violations,
      `instrument param literals found in chassis: ${JSON.stringify(violations)}`
    ).toEqual([])
  })
})

describe('chassis purity: Shell imports no Tier-3 instrument module except the schema', () => {
  const shellSource = readFileSync(join(SRC_DIR, 'components', 'Shell.svelte'), 'utf8')
  // The Tier-3 modules the Shell must NOT import. param-schema.js is the one
  // sanctioned cross-tier import (D1) and is deliberately absent from this list.
  const FORBIDDEN_IMPORTS = [
    './Oscillator.svelte',
    './Mixer.svelte',
    './Filter.svelte',
    './AmpEnv.svelte',
    './Effects.svelte',
    './Modulation.svelte',
    './Glide.svelte',
    './Volume.svelte',
    './SubtractivePanels.svelte',
    '../audio/filterGains.js',
  ]

  it.each(FORBIDDEN_IMPORTS)('does not import %s', (mod) => {
    expect(shellSource).not.toContain(mod)
  })

  it('does import the sanctioned param-schema contract module', () => {
    expect(shellSource).toContain('../param-schema.js')
  })
})
