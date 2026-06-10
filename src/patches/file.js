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
