// Patch file contract: serialize the active patch to a portable, versioned
// `.json` envelope and import a single patch back through a hardened,
// validate-then-commit pipeline. This sits beside `storage.js` (the localStorage
// contract); `storage.js` owns persistence, this module owns the on-disk file
// shape and the trust boundary for untrusted imported files.
//
// Export is trivial — wrap the existing `{ name, version, params }` envelope in a
// `fileFormat` version. Import is the centre of gravity: a file can be
// hand-edited, produced by an older build, or simply malformed, so it is proven
// good entirely in memory (parse → structural-validate → coerce → unique-name)
// before a single `savePatch()` write commits it. A rejected import writes
// nothing.
//
// Validation is hand-rolled in the `{ ok, error }` house style of `storage.js`;
// there is no runtime schema dependency. A canonical JSON Schema document
// (`patch-file.schema.json`) documents the same contract for humans and external
// tooling, kept honest by a drift test.

import { PARAM_SCHEMA, PARAM_NAMES, DISCRETE_DOMAINS } from '../param-schema.js'
import { validateName, MAX_NAME_LENGTH, listPatches, savePatch } from './storage.js'

/**
 * The file-format contract version. Independent of the patch envelope's own
 * `version`: the on-disk layout and the patch data shape evolve for different
 * reasons, so conflating them would force a file bump every time the patch shape
 * changes and vice-versa. Only this version is accepted on import.
 */
export const FILE_FORMAT_VERSION = 1

/**
 * Wrap a patch envelope in the versioned file object. The inner
 * `{ name, version, params }` is exactly the existing patch envelope, so export
 * is "read the envelope, add `fileFormat`, serialize." No performance/controller
 * state is included — the envelope already excludes it.
 * @param {{ name: string, version: number, params: Record<string, number> }} envelope
 * @returns {{ fileFormat: number, name: string, version: number, params: Record<string, number> }}
 */
export function serializePatch({ name, version, params }) {
  return { fileFormat: FILE_FORMAT_VERSION, name, version, params }
}

// Characters reserved on common filesystems (Windows is the strictest):
// < > : " / \ | ? *. A character is unsafe in a download filename if it is one
// of these, ASCII whitespace, or an ASCII control character (code point < 0x20).
const RESERVED_FILENAME_CHARS = new Set(['<', '>', ':', '"', '/', '\\', '|', '?', '*'])

/**
 * Derive a filesystem-safe `.json` download filename from a patch name. The
 * in-file `name` is untouched — this only sanitizes the *download* filename, so
 * a patch named with characters illegal on common filesystems still downloads
 * cleanly. Unsafe characters (reserved, whitespace, control) become `_`, runs
 * collapse, surrounding `_` is trimmed, and an empty result falls back to
 * `patch` so the name is never bare `.json`.
 * @param {string} name
 * @returns {string}
 */
export function patchFilename(name) {
  let out = ''
  for (const ch of String(name)) {
    const code = ch.codePointAt(0) ?? 0
    out += code < 0x20 || /\s/.test(ch) || RESERVED_FILENAME_CHARS.has(ch) ? '_' : ch
  }
  const safe = out.replace(/_+/g, '_').replace(/^_+|_+$/g, '')
  return `${safe || 'patch'}.json`
}

/**
 * Upper bound on the size of an importable file, in bytes. A real single-patch
 * file is well under a kilobyte; this ceiling (1 MiB) is far above any genuine
 * patch and exists only to cap the cost of `JSON.parse` and the coercion loop on
 * a crafted or accidental large input.
 */
export const MAX_IMPORT_BYTES = 1024 * 1024

const textEncoder = new TextEncoder()

/**
 * Parse untrusted import text into a JSON value, bounding cost first. Rejects
 * input above {@link MAX_IMPORT_BYTES} before parsing, then rejects anything that
 * is not valid JSON. Returns the parsed value on success; never throws — failures
 * come back as `{ ok: false, error }` in the `storage.js` house style.
 * @param {unknown} text
 * @returns {{ ok: true, value: unknown } | { ok: false, error: string }}
 */
export function parsePatchFile(text) {
  if (typeof text !== 'string') {
    return { ok: false, error: 'file contents are not text' }
  }
  // A UTF-8 string's byte length is always ≥ its character count, so a string
  // already longer than the ceiling in characters is certainly over it in bytes
  // — reject it without measuring. Past this gate the input is ≤ ceiling chars,
  // so the exact byte measurement below is cheap.
  if (text.length > MAX_IMPORT_BYTES || textEncoder.encode(text).length > MAX_IMPORT_BYTES) {
    return { ok: false, error: 'file is too large to import' }
  }
  let value
  try {
    value = JSON.parse(text)
  } catch {
    return { ok: false, error: 'file is not valid JSON' }
  }
  return { ok: true, value }
}

/** The file-format versions this build recognizes. Only the current one. */
const RECOGNIZED_FILE_FORMATS = new Set([FILE_FORMAT_VERSION])

/** @param {unknown} v @returns {v is Record<string, unknown>} plain (non-array) object */
function isPlainObject(v) {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/**
 * The structural gate: the trust boundary for an untrusted, already-parsed file.
 * It rejects a malformed *shape* with a human-readable reason but never coerces
 * values — top-level must be an object, `fileFormat` must be a recognized
 * version, `name` must be a string, `params` must be an object, and every
 * parameter value must be a number. It deliberately checks number-ness ONLY: the
 * integer-domain check for switches and the dropping of non-finite values both
 * belong to the coercion layer, so the two postures (reject shape vs. coerce
 * magnitude) never fight. An empty `params` object is valid. (`JSON.parse` cannot
 * even produce a non-finite number, so the gate never needs to.)
 * @param {unknown} value the parsed file value
 * @returns {{ ok: true, file: { fileFormat: number, name: string, version: unknown, params: Record<string, number> } } | { ok: false, error: string }}
 */
export function validatePatchFile(value) {
  if (!isPlainObject(value)) {
    return { ok: false, error: 'file is not a patch object' }
  }
  if (!RECOGNIZED_FILE_FORMATS.has(value.fileFormat)) {
    return { ok: false, error: 'unsupported or missing file-format version' }
  }
  if (typeof value.name !== 'string') {
    return { ok: false, error: 'patch name must be a string' }
  }
  if (!isPlainObject(value.params)) {
    return { ok: false, error: 'patch params must be an object' }
  }
  for (const [key, paramValue] of Object.entries(value.params)) {
    if (typeof paramValue !== 'number') {
      return { ok: false, error: `parameter "${key}" must be a number` }
    }
  }
  return {
    ok: true,
    file: /** @type {{ fileFormat: number, name: string, version: unknown, params: Record<string, number> }} */ (
      value
    ),
  }
}

/**
 * Coerce an already-structurally-valid `params` map so the resulting patch is
 * always in range. Iterates `PARAM_NAMES` (which excludes the `modWheel`
 * controller, so a `kind: 'controller'` param is never iterated and is dropped
 * as out-of-scope), and branches on the `PARAM_SCHEMA` `kind`:
 *
 * - `knob`: clamp the value to `[min, max]`.
 * - `switch`: take the domain from `PARAM_SCHEMA` `min`/`max` when present (only
 *   `keyTrack`), else from {@link DISCRETE_DOMAINS}; keep the value only if it is
 *   an integer within that domain, else fall back to the parameter's `default`
 *   — always a safe, valid value, so a stale domain table fails closed.
 *
 * Non-finite values and parameter names outside `PARAM_NAMES` are dropped,
 * mirroring the existing `savePatch`/`loadPatch` filtering. Structure is already
 * trusted here; this layer only normalizes magnitude.
 * @param {Record<string, unknown>} params
 * @returns {Record<string, number>}
 */
export function coerceParams(params) {
  /** @type {Record<string, number>} */
  const out = {}
  for (const name of PARAM_NAMES) {
    if (!(name in params)) continue
    const value = params[name]
    // Drop non-numbers and non-finite values (NaN/±Infinity) — never coerced.
    if (typeof value !== 'number' || !Number.isFinite(value)) continue

    const descriptor = PARAM_SCHEMA[name]
    if (descriptor.kind === 'knob') {
      out[name] = Math.min(descriptor.max, Math.max(descriptor.min, value))
      continue
    }
    // Switch: domain from the schema's own bounds (keyTrack) or the import table.
    const domain =
      typeof descriptor.min === 'number' && typeof descriptor.max === 'number'
        ? { min: descriptor.min, max: descriptor.max }
        : DISCRETE_DOMAINS[name]
    const inDomain =
      domain !== undefined && Number.isInteger(value) && value >= domain.min && value <= domain.max
    out[name] = inDomain ? value : descriptor.default
  }
  return out
}

/**
 * Normalize an imported patch name through the same `validateName` gate as save
 * (trim → upper-case → cap at `MAX_NAME_LENGTH`), then make it unique against the
 * existing patch names by auto-suffixing — import is non-destructive, so a
 * colliding name is never overwritten. On collision `" N"` is appended starting
 * at 2 and incremented until free. If `base + " N"` would exceed
 * `MAX_NAME_LENGTH`, the *base* is truncated (never the suffix) so the unique
 * suffix always survives and the result fits the cap.
 * @param {unknown} name the raw imported name
 * @param {string[]} existingNames current patch names (already canonical/upper)
 * @returns {string | null} a unique valid name, or null if the name is invalid
 *   (empty/whitespace-only) — the caller surfaces that as a rejection reason
 */
export function uniquePatchName(name, existingNames) {
  const base = validateName(name)
  if (base === null) return null

  const taken = new Set(existingNames.map((n) => n.toUpperCase()))
  if (!taken.has(base)) return base

  for (let n = 2; ; n++) {
    const suffix = ` ${n}`
    // Truncate the base (not the suffix) when the suffixed name overflows the cap.
    const room = MAX_NAME_LENGTH - suffix.length
    const candidate = (base.length > room ? base.slice(0, room) : base) + suffix
    if (!taken.has(candidate)) return candidate
  }
}

/**
 * Import a single patch from untrusted file text through an atomic
 * validate-then-commit pipeline. The file is parsed, structurally validated,
 * value-coerced, and name-resolved entirely in memory; only then does exactly
 * one `savePatch()` write commit it. Nothing touches `localStorage` until the
 * file is proven good, so a rejected import is inherently a no-op — no rollback
 * machinery is needed because no partial state is ever produced. This function
 * owns the terminal write; the Svelte handler only invokes it and surfaces the
 * result.
 * @param {unknown} text the raw file contents
 * @returns {{ ok: true, name: string, params: Record<string, number> } | { ok: false, error: string }}
 */
export function importPatch(text) {
  const parsed = parsePatchFile(text)
  if (!parsed.ok) return { ok: false, error: parsed.error }

  const validated = validatePatchFile(parsed.value)
  if (!validated.ok) return { ok: false, error: validated.error }

  const params = coerceParams(validated.file.params)

  // Resolve the name against the current index only now that the file is proven
  // good — non-destructive auto-suffix on collision.
  const name = uniquePatchName(validated.file.name, listPatches())
  if (name === null) return { ok: false, error: 'patch name is empty' }

  // The single terminal write. savePatch re-validates the name and re-filters
  // params (a no-op here, since coercion already produced in-scope finite values)
  // and inherits the existing single-save cross-tab behaviour.
  const res = savePatch(name, params)
  if (!res.ok) {
    return {
      ok: false,
      error: res.error === 'invalid-name' ? 'patch name is empty' : 'storage unavailable',
    }
  }
  return { ok: true, name: res.name, params }
}
