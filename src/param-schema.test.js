import { describe, it, expect } from 'vitest'
import {
  PARAM_DEFAULTS,
  PARAM_NAMES,
  AUDIO_PARAMS,
  KNOB_PARAMS,
  BIPOLAR_PARAMS,
  powerOffValue,
} from './param-schema.js'

// The equality gate: the schema-derived collections must EXACTLY reproduce the
// hand-maintained literals that lived in state/synth.svelte.js (defaults) and
// App.svelte (knob metadata) before this refactor. These literals are copied
// verbatim from the pre-refactor source; if a derived value drifts from them,
// the refactor changed behavior and must be corrected, not the test.

// --- Pre-refactor literals (from state/synth.svelte.js) --------------------

const PRE_CONTINUOUS_DEFAULTS = {
  osc2Detune: 0,
  osc3Detune: 0,
  osc3LfoRate: 1,
  osc1Level: 0.75,
  osc2Level: 0,
  osc3Level: 0,
  noiseLevel: 0,
  cutoff: 2000,
  resonance: 0.3,
  filterAttack: 0.01,
  filterDecay: 0.3,
  filterSustain: 0.5,
  filterRelease: 0.3,
  filterEnvAmt: 0,
  ampAttack: 0.01,
  ampDecay: 0.5,
  ampSustain: 0.7,
  ampRelease: 0.5,
  masterVol: 0.75,
  modMix: 0,
  glideRate: 0.2,
  delayTime: 0.3,
  delayFeedback: 0.3,
  delayMix: 0.3,
  delayModRate: 0.5,
  delayModDepth: 0,
  reverbSend: 0.3,
  reverbDamp: 0.5,
  reverbDecay: 0.5,
  reverbPreDelay: 0.015,
}

const PRE_SWITCH_DEFAULTS = {
  osc1Wave: 0,
  osc2Wave: 0,
  osc3Wave: 0,
  osc1Range: 0,
  osc2Range: 0,
  osc3Range: 0,
  osc3LfoMode: 0,
  keyTrack: 0,
  noiseType: 0,
  drLock: 1,
  modToOsc1: 0,
  modToOsc2: 0,
  modToFilter: 0,
  glideOn: 0,
  delayOn: 0,
  delayModOn: 0,
  reverbOn: 0,
}

const PRE_PARAM_DEFAULTS = { ...PRE_CONTINUOUS_DEFAULTS, ...PRE_SWITCH_DEFAULTS }
const PRE_PARAM_NAMES = Object.keys(PRE_PARAM_DEFAULTS)

// --- Pre-refactor literals (from App.svelte) -------------------------------

const PRE_KNOB_PARAMS = {
  osc2Detune: { min: -100, max: 100 },
  osc3Detune: { min: -100, max: 100 },
  osc3LfoRate: { min: 0.1, max: 20 },
  osc1Level: { min: 0, max: 1 },
  osc2Level: { min: 0, max: 1 },
  osc3Level: { min: 0, max: 1 },
  noiseLevel: { min: 0, max: 1 },
  cutoff: { min: 20, max: 20000 },
  resonance: { min: 0, max: 1 },
  keyTrack: { min: 0, max: 1 },
  filterAttack: { min: 0.001, max: 4 },
  filterDecay: { min: 0.001, max: 4 },
  filterSustain: { min: 0, max: 1 },
  filterRelease: { min: 0.001, max: 8 },
  filterEnvAmt: { min: -10000, max: 10000 },
  ampAttack: { min: 0.001, max: 4 },
  ampDecay: { min: 0.001, max: 4 },
  ampSustain: { min: 0, max: 1 },
  ampRelease: { min: 0.001, max: 8 },
  modMix: { min: 0, max: 1 },
  modWheel: { min: 0, max: 1 },
  glideRate: { min: 0.001, max: 5 },
  delayTime: { min: 0.01, max: 2.0 },
  delayFeedback: { min: 0, max: 0.9 },
  delayMix: { min: 0, max: 1 },
  delayModRate: { min: 0.1, max: 10 },
  delayModDepth: { min: 0, max: 0.025 },
  reverbSend: { min: 0, max: 1 },
  reverbDecay: { min: 0.01, max: 1 },
  reverbDamp: { min: 0, max: 1 },
  reverbPreDelay: { min: 0, max: 0.1 },
  masterVol: { min: 0, max: 1 },
}

const PRE_BIPOLAR_PARAMS = new Set(['osc2Detune', 'osc3Detune', 'modMix', 'filterEnvAmt'])

/** Pre-refactor powerOffValue, computed from the pre-refactor literals. */
function prePowerOffValue(p) {
  return PRE_BIPOLAR_PARAMS.has(p)
    ? (PRE_KNOB_PARAMS[p].min + PRE_KNOB_PARAMS[p].max) / 2
    : PRE_KNOB_PARAMS[p].min
}

describe('param-schema derived collections equal pre-refactor literals', () => {
  it('PARAM_DEFAULTS matches the pre-refactor defaults exactly', () => {
    expect(PARAM_DEFAULTS).toEqual(PRE_PARAM_DEFAULTS)
  })

  it('PARAM_NAMES matches the pre-refactor name order exactly', () => {
    expect(PARAM_NAMES).toEqual(PRE_PARAM_NAMES)
  })

  it('AUDIO_PARAMS matches the pre-refactor audio-param set exactly', () => {
    expect(AUDIO_PARAMS).toEqual(new Set(PRE_PARAM_NAMES))
  })

  it('KNOB_PARAMS matches the pre-refactor knob metadata exactly', () => {
    expect(KNOB_PARAMS).toEqual(PRE_KNOB_PARAMS)
  })

  it('BIPOLAR_PARAMS matches the pre-refactor bipolar set exactly', () => {
    expect(BIPOLAR_PARAMS).toEqual(PRE_BIPOLAR_PARAMS)
  })

  it('powerOffValue matches the pre-refactor rule for every CC-scalable param', () => {
    for (const p of Object.keys(PRE_KNOB_PARAMS)) {
      expect(powerOffValue(p)).toBe(prePowerOffValue(p))
    }
  })
})

describe('modWheel controller treatment (D6)', () => {
  it('is absent from PARAM_DEFAULTS', () => {
    expect(PARAM_DEFAULTS).not.toHaveProperty('modWheel')
  })

  it('is absent from PARAM_NAMES', () => {
    expect(PARAM_NAMES).not.toContain('modWheel')
  })

  it('is absent from AUDIO_PARAMS', () => {
    expect(AUDIO_PARAMS.has('modWheel')).toBe(false)
  })

  it('is present in KNOB_PARAMS with its CC-scaling range', () => {
    expect(KNOB_PARAMS.modWheel).toEqual({ min: 0, max: 1 })
  })
})
