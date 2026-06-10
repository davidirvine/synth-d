import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import Ajv from 'ajv'
import { FILE_FORMAT_VERSION, validatePatchFile } from './file.js'

// The hand-rolled validator is the runtime gate; the JSON Schema document is
// reference documentation. This test compiles the schema with ajv (a test-only
// devDependency — the no-runtime-dependency constraint applies to the bundle,
// not the test toolchain) and asserts the two agree on every fixture, so the
// document cannot silently drift from the validator.
const schema = JSON.parse(
  readFileSync(join(process.cwd(), 'src', 'patches', 'patch-file.schema.json'), 'utf8')
)
const ajvValidate = new Ajv({ allErrors: true }).compile(schema)

const validFile = () => ({ fileFormat: FILE_FORMAT_VERSION, name: 'LEAD', version: 1, params: {} })

/** @type {{ label: string, file: unknown, valid: boolean }[]} */
const fixtures = [
  { label: 'a structurally valid file', file: validFile(), valid: true },
  {
    label: 'a valid file with numeric params',
    file: { ...validFile(), params: { cutoff: 2000, osc1Wave: 3 } },
    valid: true,
  },
  { label: 'missing fileFormat', file: { name: 'X', version: 1, params: {} }, valid: false },
  {
    label: 'unrecognized (higher) fileFormat',
    file: { ...validFile(), fileFormat: FILE_FORMAT_VERSION + 1 },
    valid: false,
  },
  { label: 'non-string name', file: { ...validFile(), name: 42 }, valid: false },
  { label: 'non-object params', file: { ...validFile(), params: [1, 2] }, valid: false },
  {
    label: 'non-number param value',
    file: { ...validFile(), params: { cutoff: 'loud' } },
    valid: false,
  },
]

describe('patch-file schema vs. hand-rolled validator', () => {
  it.each(fixtures)('agree on $label (expected valid=$valid)', ({ file, valid }) => {
    const schemaValid = ajvValidate(file)
    const handRolledValid = validatePatchFile(file).ok
    // Both gates must reach the same verdict, and it must be the expected one.
    expect(schemaValid).toBe(valid)
    expect(handRolledValid).toBe(valid)
    expect(schemaValid).toBe(handRolledValid)
  })
})
