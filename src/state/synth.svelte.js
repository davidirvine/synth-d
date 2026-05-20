// Central synth-parameter store: the single source of truth for the synth's
// sound. Every continuous (knob) parameter and every discrete (switch) parameter
// lives here. User interaction, MIDI CC input, patch loads, and power-on all
// write to this store, and the store is the sole driver of `setParam` to the DSP
// (see writeParam in the DSP-subscriber section).
//
// The mod-wheel is intentionally NOT a store parameter: it is performance/
// controller state, excluded from patches, and owned directly by App.svelte.
// Likewise the keyboard register and MIDI CC assignments are not stored here.

import { setParam } from '../audio/engine.js'

/**
 * Continuous (knob) parameters and their factory-default values.
 * Mirrors App.svelte's KNOB_PARAMS minus `modWheel` (controller state).
 * @type {Record<string, number>}
 */
const CONTINUOUS_DEFAULTS = {
  // Oscillators
  osc2Detune: 0,
  osc3Detune: 0,
  osc3LfoRate: 1,
  // Mixer
  osc1Level: 0.75,
  osc2Level: 0,
  osc3Level: 0,
  noiseLevel: 0,
  // Filter
  cutoff: 2000,
  resonance: 0.3,
  filterAttack: 0.01,
  filterDecay: 0.3,
  filterSustain: 0.5,
  filterRelease: 0.3,
  filterEnvAmt: 0,
  // Amp envelope
  ampAttack: 0.01,
  ampDecay: 0.5,
  ampSustain: 0.7,
  ampRelease: 0.3,
  // Master
  masterVol: 0.75,
  // Modulation
  modMix: 0,
  // Glide
  glideRate: 0.2,
  // Delay
  delayTime: 0.3,
  delayFeedback: 0.3,
  delayMix: 0.3,
  delayModRate: 0.5,
  delayModDepth: 0,
  // Reverb
  reverbSend: 0.3,
  reverbDamp: 0.5,
  reverbDecay: 0.5,
  reverbPreDelay: 0.015,
}

/**
 * Discrete (switch/toggle/stepper) parameters and their factory-default values.
 * These previously lived as local `$state` inside each panel component and were
 * zeroed by a numeric `reset` prop on power-on. They are now part of the store.
 * @type {Record<string, number>}
 */
const SWITCH_DEFAULTS = {
  // Oscillator waveform selections (index into the waveform list)
  osc1Wave: 0,
  osc2Wave: 0,
  osc3Wave: 0,
  // Oscillator octave ranges (-2..+2)
  osc1Range: 0,
  osc2Range: 0,
  osc3Range: 0,
  // OSC3 LFO mode
  osc3LfoMode: 0,
  // Filter key tracking
  keyTrack: 0,
  // Mixer noise colour (0 = white, 1 = pink)
  noiseType: 0,
  // Amp decay/release lock (defaults on)
  drLock: 1,
  // Modulation routing
  modToOsc1: 0,
  modToOsc2: 0,
  modToFilter: 0,
  // Glide
  glideOn: 0,
  // Effects routing
  delayOn: 0,
  delayModOn: 0,
  reverbOn: 0,
}

/**
 * Factory defaults for every in-scope synth parameter (the initial active patch).
 * @type {Record<string, number>}
 */
export const PARAM_DEFAULTS = Object.freeze({ ...CONTINUOUS_DEFAULTS, ...SWITCH_DEFAULTS })

/**
 * The names of every in-scope synth parameter, i.e. exactly what a patch captures.
 * Excludes the mod-wheel, keyboard register, and MIDI CC assignments.
 * @type {string[]}
 */
export const PARAM_NAMES = Object.freeze(Object.keys(PARAM_DEFAULTS))

/**
 * The set of parameters forwarded to the DSP via `engine.setParam`. Every store
 * parameter is an audio parameter; names outside this set (e.g. `modWheel`,
 * keyboard register) are not store parameters and are never forwarded by the store.
 * @type {ReadonlySet<string>}
 */
// eslint-disable-next-line svelte/prefer-svelte-reactivity -- frozen, never-mutated constant; not reactive state
export const AUDIO_PARAMS = Object.freeze(new Set(PARAM_NAMES))

/**
 * The live synth parameter state — the single source of truth for the sound.
 * Seeded from factory defaults; mutated only through writeParam/applyParams.
 * @type {Record<string, number>}
 */
export const synthParams = $state({ ...PARAM_DEFAULTS })

/**
 * The active patch: the patch applied on power-on and the baseline for dirty
 * tracking. `name` is null when the active patch is the (unsaved) factory
 * defaults or freshly-edited state; `params` is the snapshot to (re)apply on the
 * next power-on. Loading a patch updates this; power-on reads `params` from it.
 * @type {{ name: string | null, params: Record<string, number> }}
 */
export const activePatch = $state({ name: null, params: { ...PARAM_DEFAULTS } })

/**
 * Set the active patch (e.g. on load). Stores a copy of params so later store
 * mutations don't retroactively change the dirty-tracking baseline.
 * @param {string | null} name
 * @param {Record<string, number>} params
 */
export function setActivePatch(name, params) {
  activePatch.name = name
  activePatch.params = { ...params }
}

// --- DSP subscriber -------------------------------------------------------
//
// writeParam is the single, central setter wrapper that applies a store change
// to both the store state and the DSP. It is the ONLY path that calls
// engine.setParam, so there is exactly one place where the store drives audio.
// Guards (in order):
//   1. Non-audio / unknown keys (e.g. `modWheel`, register) are skipped entirely
//      — they are not store parameters and must never reach the DSP via the store.
//   2. Non-finite values are skipped — they would corrupt the DSP and the store.
//   3. Redundant writes (value unchanged) do not re-fire setParam, preventing the
//      duplicate/feedback fires that a MIDI ⇄ store ⇄ knob loop could otherwise
//      cause. `force` overrides this for power-on/load, where the freshly created
//      DSP node holds no state and every parameter must be (re)sent.

/**
 * Write a single parameter to the store and forward it to the DSP.
 *
 * Contract: forwarding goes through engine.setParam, which is a safe no-op when
 * the AudioWorklet node has not been created (i.e. while powered off). Callers
 * (interactions, MIDI, patch loads) may therefore write at any time; DSP calls
 * made before power-on simply do nothing, and the values are (re)sent when the
 * active patch is applied on power-on.
 * @param {string} name parameter name
 * @param {number} value new value
 * @param {boolean} [force] when true, call setParam even if the value is unchanged
 */
export function writeParam(name, value, force = false) {
  if (!AUDIO_PARAMS.has(name)) return
  if (!Number.isFinite(value)) return
  const changed = synthParams[name] !== value
  if (changed) synthParams[name] = value
  if (changed || force) setParam(name, value)
}

/**
 * Apply a full or partial set of parameter values to the store at once. Used to
 * apply the active patch on power-on and to load a patch. Unknown keys in the
 * input are ignored by writeParam.
 * @param {Record<string, number>} params
 * @param {boolean} [force] forwarded to writeParam (defaults true: power-on/load
 *   must (re)send every parameter to the freshly created DSP node)
 */
export function applyParams(params, force = true) {
  for (const name of PARAM_NAMES) {
    if (name in params) writeParam(name, params[name], force)
  }
}

/**
 * Apply the factory defaults to the store (the bootstrap "active patch").
 * @param {boolean} [force]
 */
export function resetToDefaults(force = true) {
  applyParams(PARAM_DEFAULTS, force)
}

/**
 * Seed the store state to factory defaults WITHOUT touching the DSP. Used at
 * App initialisation (the worklet isn't created yet, so there is nothing to
 * drive) and to give a clean baseline in tests, where the store is a singleton.
 */
export function resetParams() {
  for (const name of PARAM_NAMES) synthParams[name] = PARAM_DEFAULTS[name]
}

/**
 * Snapshot the in-scope parameter values as a plain object, suitable for
 * serializing into a patch. Only PARAM_NAMES are included.
 * @returns {Record<string, number>}
 */
export function serializeParams() {
  /** @type {Record<string, number>} */
  const out = {}
  for (const name of PARAM_NAMES) out[name] = synthParams[name]
  return out
}
