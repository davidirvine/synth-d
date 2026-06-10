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
