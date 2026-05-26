// The parameter schema: the single source of truth for what the subtractive
// instrument exposes, and the explicit seam between the generic chassis and
// this specific instrument (design.md D1). One entry per parameter carries
// everything the chassis needs to treat the parameter generically.
//
// This module is instrument-owned (Tier 3 — a different instrument supplies a
// different schema) but it is the ONE sanctioned cross-tier import: the store
// and the Shell import the schema-derived collections from here by design. It
// is the contract interface both tiers depend on, not a boundary violation.
//
// Previously these values were smeared across two hand-synchronised tables:
// CONTINUOUS_DEFAULTS / SWITCH_DEFAULTS (state/synth.svelte.js) and
// KNOB_PARAMS / BIPOLAR_PARAMS (App.svelte). Consolidating them here removes
// the manual-sync hazard.

/**
 * A single parameter descriptor.
 * @typedef {object} ParamDescriptor
 * @property {number} [min] lower bound; required for any ccScalable descriptor
 *   (it is a scaling bound), present on switches only where meaningful.
 * @property {number} [max] upper bound; same rule as `min`.
 * @property {number} [default] factory-default value; absent for controllers,
 *   which are not store-backed (D6).
 * @property {boolean} bipolar whether the parameter is centred (affects the
 *   power-off rest value: bipolar → midpoint, else → min).
 * @property {'knob' | 'switch' | 'controller'} kind UI/role classification.
 *   `knob` and `switch` are store-backed; `controller` is not (D6).
 * @property {boolean} ccScalable whether a MIDI CC can be scaled into this
 *   parameter's range. Independent of `kind`: `keyTrack` is a CC-mappable
 *   switch and `modWheel` is a CC-scalable controller (D2/D6).
 */

/**
 * Ordered map of every parameter the subtractive instrument exposes.
 *
 * Order is load-bearing: filtering to the store-backed descriptors
 * (kind ∈ {knob, switch}) must reproduce the pre-refactor PARAM_NAMES order,
 * which was `{ ...CONTINUOUS_DEFAULTS, ...SWITCH_DEFAULTS }` — i.e. all
 * continuous knobs (in their original order) followed by all switches (in
 * theirs). `modWheel` (a controller) is excluded from that filter, so its
 * position here does not affect store membership.
 * @type {Record<string, ParamDescriptor>}
 */
export const PARAM_SCHEMA = Object.freeze({
  // --- Continuous (knob) parameters --------------------------------------
  // Oscillators
  osc2Detune: { min: -100, max: 100, default: 0, bipolar: true, kind: 'knob', ccScalable: true },
  osc3Detune: { min: -100, max: 100, default: 0, bipolar: true, kind: 'knob', ccScalable: true },
  osc3LfoRate: { min: 0.1, max: 20, default: 1, bipolar: false, kind: 'knob', ccScalable: true },
  // Mixer
  osc1Level: { min: 0, max: 1, default: 0.75, bipolar: false, kind: 'knob', ccScalable: true },
  osc2Level: { min: 0, max: 1, default: 0, bipolar: false, kind: 'knob', ccScalable: true },
  osc3Level: { min: 0, max: 1, default: 0, bipolar: false, kind: 'knob', ccScalable: true },
  noiseLevel: { min: 0, max: 1, default: 0, bipolar: false, kind: 'knob', ccScalable: true },
  // Filter
  cutoff: { min: 20, max: 20000, default: 2000, bipolar: false, kind: 'knob', ccScalable: true },
  resonance: { min: 0, max: 1, default: 0.3, bipolar: false, kind: 'knob', ccScalable: true },
  filterAttack: {
    min: 0.001,
    max: 4,
    default: 0.01,
    bipolar: false,
    kind: 'knob',
    ccScalable: true,
  },
  filterDecay: { min: 0.001, max: 4, default: 0.3, bipolar: false, kind: 'knob', ccScalable: true },
  filterSustain: { min: 0, max: 1, default: 0.5, bipolar: false, kind: 'knob', ccScalable: true },
  filterRelease: {
    min: 0.001,
    max: 8,
    default: 0.3,
    bipolar: false,
    kind: 'knob',
    ccScalable: true,
  },
  filterEnvAmt: {
    min: -10000,
    max: 10000,
    default: 0,
    bipolar: true,
    kind: 'knob',
    ccScalable: true,
  },
  // Amp envelope
  ampAttack: { min: 0.001, max: 4, default: 0.01, bipolar: false, kind: 'knob', ccScalable: true },
  ampDecay: { min: 0.001, max: 4, default: 0.5, bipolar: false, kind: 'knob', ccScalable: true },
  ampSustain: { min: 0, max: 1, default: 0.7, bipolar: false, kind: 'knob', ccScalable: true },
  // Matches ampDecay: the decay/release lock (drLock) defaults on, slaving
  // release to decay, so the factory default release must equal decay or the
  // active patch reads as dirty the instant the synth powers on.
  ampRelease: { min: 0.001, max: 8, default: 0.5, bipolar: false, kind: 'knob', ccScalable: true },
  // Master
  masterVol: { min: 0, max: 1, default: 0.75, bipolar: false, kind: 'knob', ccScalable: true },
  // Modulation
  modMix: { min: 0, max: 1, default: 0, bipolar: true, kind: 'knob', ccScalable: true },
  // modWheel is a controller (D6): CC-scalable, but NOT store-backed — it has no
  // factory default and must be absent from PARAM_DEFAULTS/PARAM_NAMES/AUDIO_PARAMS.
  modWheel: { min: 0, max: 1, bipolar: false, kind: 'controller', ccScalable: true },
  // Glide
  glideRate: { min: 0.001, max: 5, default: 0.2, bipolar: false, kind: 'knob', ccScalable: true },
  // Delay
  delayTime: { min: 0.01, max: 2.0, default: 0.3, bipolar: false, kind: 'knob', ccScalable: true },
  delayFeedback: { min: 0, max: 0.9, default: 0.3, bipolar: false, kind: 'knob', ccScalable: true },
  delayMix: { min: 0, max: 1, default: 0.3, bipolar: false, kind: 'knob', ccScalable: true },
  delayModRate: { min: 0.1, max: 10, default: 0.5, bipolar: false, kind: 'knob', ccScalable: true },
  delayModDepth: {
    min: 0,
    max: 0.025,
    default: 0,
    bipolar: false,
    kind: 'knob',
    ccScalable: true,
  },
  // Reverb
  reverbSend: { min: 0, max: 1, default: 0.3, bipolar: false, kind: 'knob', ccScalable: true },
  reverbDamp: { min: 0, max: 1, default: 0.5, bipolar: false, kind: 'knob', ccScalable: true },
  reverbDecay: { min: 0.01, max: 1, default: 0.5, bipolar: false, kind: 'knob', ccScalable: true },
  reverbPreDelay: {
    min: 0,
    max: 0.1,
    default: 0.015,
    bipolar: false,
    kind: 'knob',
    ccScalable: true,
  },

  // --- Discrete (switch) parameters --------------------------------------
  // Oscillator waveform selections (index into the waveform list)
  osc1Wave: { default: 0, bipolar: false, kind: 'switch', ccScalable: false },
  osc2Wave: { default: 0, bipolar: false, kind: 'switch', ccScalable: false },
  osc3Wave: { default: 0, bipolar: false, kind: 'switch', ccScalable: false },
  // Oscillator octave ranges (-2..+2)
  osc1Range: { default: 0, bipolar: false, kind: 'switch', ccScalable: false },
  osc2Range: { default: 0, bipolar: false, kind: 'switch', ccScalable: false },
  osc3Range: { default: 0, bipolar: false, kind: 'switch', ccScalable: false },
  // OSC3 LFO mode
  osc3LfoMode: { default: 0, bipolar: false, kind: 'switch', ccScalable: false },
  // Filter key tracking — a 0/1 toggle, but MIDI-CC-assignable (D2), so it is a
  // switch with ccScalable: true and carries the CC-scaling bounds.
  keyTrack: { min: 0, max: 1, default: 0, bipolar: false, kind: 'switch', ccScalable: true },
  // Mixer noise colour (0 = white, 1 = pink)
  noiseType: { default: 0, bipolar: false, kind: 'switch', ccScalable: false },
  // Amp decay/release lock (defaults on)
  drLock: { default: 1, bipolar: false, kind: 'switch', ccScalable: false },
  // Modulation routing
  modToOsc1: { default: 0, bipolar: false, kind: 'switch', ccScalable: false },
  modToOsc2: { default: 0, bipolar: false, kind: 'switch', ccScalable: false },
  modToFilter: { default: 0, bipolar: false, kind: 'switch', ccScalable: false },
  // Glide
  glideOn: { default: 0, bipolar: false, kind: 'switch', ccScalable: false },
  // Effects routing
  delayOn: { default: 0, bipolar: false, kind: 'switch', ccScalable: false },
  delayModOn: { default: 0, bipolar: false, kind: 'switch', ccScalable: false },
  reverbOn: { default: 0, bipolar: false, kind: 'switch', ccScalable: false },
})

// --- Derived collections ---------------------------------------------------
//
// Everything below is computed once from PARAM_SCHEMA, replacing the literal
// tables that previously lived in state/synth.svelte.js and App.svelte. The
// equality-gate test (param-schema.test.js) asserts these exactly match the
// pre-refactor values before the originals are deleted.

const SCHEMA_ENTRIES = Object.entries(PARAM_SCHEMA)

// Store-backed descriptors: knobs and switches (controllers like modWheel are
// excluded — they are not patchable and not forwarded by the store, per D6).
const STORE_ENTRIES = SCHEMA_ENTRIES.filter(([, d]) => d.kind === 'knob' || d.kind === 'switch')

/**
 * Factory defaults for every store-backed synth parameter (the initial active
 * patch). Iteration order is the schema's order, filtered to store-backed
 * descriptors — reproducing the pre-refactor `{ ...CONTINUOUS_DEFAULTS,
 * ...SWITCH_DEFAULTS }` order.
 * @type {Record<string, number>}
 */
export const PARAM_DEFAULTS = Object.freeze(
  Object.fromEntries(STORE_ENTRIES.map(([name, d]) => [name, d.default]))
)

/**
 * The names of every store-backed synth parameter, i.e. exactly what a patch
 * captures. Excludes the mod-wheel (controller), keyboard register, and MIDI CC
 * assignments.
 * @type {string[]}
 */
export const PARAM_NAMES = Object.freeze(Object.keys(PARAM_DEFAULTS))

/**
 * The set of parameters forwarded to the DSP via `engine.setParam`. Every
 * store-backed parameter is an audio parameter; names outside this set (e.g.
 * `modWheel`, keyboard register) are never forwarded by the store.
 * @type {ReadonlySet<string>}
 */

export const AUDIO_PARAMS = Object.freeze(new Set(PARAM_NAMES))

/**
 * CC-scalable knob metadata: param name → { min, max } scaling bounds. Derived
 * from `ccScalable === true` (all knobs plus the CC-mappable switch `keyTrack`
 * and the controller `modWheel`), NOT from `kind === 'knob'` (D2).
 * @type {Record<string, {min: number, max: number}>}
 */
export const KNOB_PARAMS = Object.freeze(
  Object.fromEntries(
    SCHEMA_ENTRIES.filter(([, d]) => d.ccScalable).map(([name, d]) => [
      name,
      { min: d.min, max: d.max },
    ])
  )
)

/**
 * The set of bipolar (centred) parameters. Must stay in sync with the
 * `bipolar` prop on each Knob in the UI — now derived rather than hand-listed.
 * @type {ReadonlySet<string>}
 */

export const BIPOLAR_PARAMS = Object.freeze(
  new Set(SCHEMA_ENTRIES.filter(([, d]) => d.bipolar).map(([name]) => name))
)

/**
 * The value a parameter rests at when the synth is powered off: the midpoint
 * for a bipolar parameter, otherwise its minimum.
 * @param {string} p parameter name
 * @returns {number}
 */
export function powerOffValue(p) {
  return BIPOLAR_PARAMS.has(p) ? (KNOB_PARAMS[p].min + KNOB_PARAMS[p].max) / 2 : KNOB_PARAMS[p].min
}

/**
 * Instrument-specific parameter renames applied to persisted MIDI-CC mappings at
 * load time (old persisted name → current schema name). This is instrument
 * history (e.g. `reverbMix` was renamed to `reverbSend`), so it belongs with the
 * other parameter metadata here, NOT in the generic MIDI-CC map (design.md D4) —
 * the chassis `MidiCcMap` is param-name-agnostic and receives this table by
 * injection. The underlying localStorage value is left untouched so a revert
 * keeps existing mappings working without further migration.
 * @type {Record<string, string>}
 */
export const PARAM_RENAMES = Object.freeze({
  reverbMix: 'reverbSend',
})
