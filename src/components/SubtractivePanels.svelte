<script>
  // SubtractivePanels: the subtractive instrument's panel layout (Tier 3). It is
  // injected into the generic Shell as its `children` snippet and consumes the
  // chassis contract the Shell hands back. Every instrument param-name literal
  // lives here, on the instrument side of the seam (design.md D4): the per-panel
  // $derived blocks call the Shell's param-name-agnostic midiStateFor with this
  // instrument's own param names, so the Shell carries no instrument literals and
  // the chassis-purity test passes without an exception.
  import Oscillator from './Oscillator.svelte'
  import Mixer from './Mixer.svelte'
  import Filter from './Filter.svelte'
  import Effects from './Effects.svelte'
  import AmpEnv from './AmpEnv.svelte'
  import Modulation from './Modulation.svelte'
  import Glide from './Glide.svelte'
  import { synthParams } from '../state/synth.svelte.js'

  let {
    /** @type {(...params: string[]) => Record<string, object>} */
    midiStateFor,
    /** @type {(e: { param: string, value: number }) => void} */
    onParamChange,
    /** @type {(param: string) => void} */
    onKnobContextMenu,
    /** @type {boolean} */
    powered,
    /** @type {() => number} */
    getMixerPeak,
    /** @type {() => number} */
    getOutputPeak,
    /** @type {import('svelte').Snippet} */
    scope,
  } = $props()

  // Per-panel MIDI state. Reactivity is preserved across the seam because
  // midiStateFor reads the Shell-owned reactive sources at call time (D4).
  let oscMidiState = $derived(midiStateFor('osc2Detune', 'osc3Detune', 'osc3LfoRate'))

  let mixerMidiState = $derived(midiStateFor('osc1Level', 'osc2Level', 'osc3Level', 'noiseLevel'))

  let filterMidiState = $derived(
    midiStateFor(
      'cutoff',
      'resonance',
      'filterAttack',
      'filterDecay',
      'filterSustain',
      'filterRelease',
      'filterEnvAmt'
    )
  )

  let ampEnvMidiState = $derived(
    midiStateFor('ampAttack', 'ampDecay', 'ampSustain', 'ampRelease', 'masterVol')
  )

  let modMidiState = $derived(midiStateFor('modMix'))

  let glideMidiState = $derived(midiStateFor('glideRate'))

  let effectsMidiState = $derived(
    midiStateFor(
      'reverbSend',
      'reverbDamp',
      'reverbDecay',
      'reverbPreDelay',
      'delayTime',
      'delayFeedback',
      'delayMix',
      'delayModRate',
      'delayModDepth'
    )
  )
</script>

<div class="panels">
  <Oscillator
    onchange={onParamChange}
    midiState={oscMidiState}
    onknobcontextmenu={onKnobContextMenu}
    osc1Wave={synthParams.osc1Wave}
    osc2Wave={synthParams.osc2Wave}
    osc3Wave={synthParams.osc3Wave}
    osc1Range={synthParams.osc1Range}
    osc2Range={synthParams.osc2Range}
    osc3Range={synthParams.osc3Range}
    osc3LfoMode={synthParams.osc3LfoMode}
  />
  <Mixer
    onchange={onParamChange}
    midiState={mixerMidiState}
    onknobcontextmenu={onKnobContextMenu}
    noiseType={synthParams.noiseType}
    getPeak={getMixerPeak}
    {powered}
  />
  <div class="filter-output-grid">
    <Filter
      onchange={onParamChange}
      midiState={filterMidiState}
      onknobcontextmenu={onKnobContextMenu}
      keyTrack={synthParams.keyTrack}
    />
    <AmpEnv
      onchange={onParamChange}
      midiState={ampEnvMidiState}
      onknobcontextmenu={onKnobContextMenu}
      drLock={synthParams.drLock}
      {getOutputPeak}
      {powered}
    />
    <div class="effects-col">
      <Effects
        onchange={onParamChange}
        midiState={effectsMidiState}
        onknobcontextmenu={onKnobContextMenu}
        delayOn={synthParams.delayOn}
        delayModOn={synthParams.delayModOn}
        reverbOn={synthParams.reverbOn}
      />
    </div>
    <div class="panel-row">
      <Modulation
        onchange={onParamChange}
        midiState={modMidiState}
        onknobcontextmenu={onKnobContextMenu}
        modToOsc1={synthParams.modToOsc1}
        modToOsc2={synthParams.modToOsc2}
        modToFilter={synthParams.modToFilter}
      />
      <Glide
        onchange={onParamChange}
        midiState={glideMidiState}
        onknobcontextmenu={onKnobContextMenu}
        glideOn={synthParams.glideOn}
      />
    </div>
    {@render scope()}
  </div>
</div>

<style>
  .panels {
    display: grid;
    grid-template-columns: auto auto auto;
    gap: 8px;
    justify-content: start;
  }

  .filter-output-grid {
    display: grid;
    grid-template-columns: auto auto auto;
    gap: 8px;
    justify-content: start;
  }

  .effects-col {
    grid-row: span 2;
    display: flex;
    flex-direction: column;
  }

  .panel-row {
    display: flex;
    gap: 8px;
  }
</style>
