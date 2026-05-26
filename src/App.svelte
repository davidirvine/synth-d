<script>
  // App: the thin composition of the generic Shell wrapping the subtractive
  // instrument's panel layout. The panel markup below is injected into the Shell
  // as its `children` snippet; the Shell hands back the chassis contract
  // (midiStateFor, the param/knob chokepoints, powered, meter readbacks, and the
  // Shell-owned scope snippet). Every instrument param-name literal lives here,
  // on the instrument side of the seam (design.md D4).
  import Shell from './components/Shell.svelte'
  import Oscillator from './components/Oscillator.svelte'
  import Mixer from './components/Mixer.svelte'
  import Filter from './components/Filter.svelte'
  import Effects from './components/Effects.svelte'
  import AmpEnv from './components/AmpEnv.svelte'
  import Modulation from './components/Modulation.svelte'
  import Glide from './components/Glide.svelte'
  import { synthParams } from './state/synth.svelte.js'
</script>

<Shell>
  {#snippet children({
    midiStateFor,
    onParamChange,
    onKnobContextMenu,
    powered,
    getMixerPeak,
    getOutputPeak,
    scope,
  })}
    {@const oscMidiState = midiStateFor('osc2Detune', 'osc3Detune', 'osc3LfoRate')}
    {@const mixerMidiState = midiStateFor('osc1Level', 'osc2Level', 'osc3Level', 'noiseLevel')}
    {@const filterMidiState = midiStateFor(
      'cutoff',
      'resonance',
      'filterAttack',
      'filterDecay',
      'filterSustain',
      'filterRelease',
      'filterEnvAmt'
    )}
    {@const ampEnvMidiState = midiStateFor(
      'ampAttack',
      'ampDecay',
      'ampSustain',
      'ampRelease',
      'masterVol'
    )}
    {@const modMidiState = midiStateFor('modMix')}
    {@const glideMidiState = midiStateFor('glideRate')}
    {@const effectsMidiState = midiStateFor(
      'reverbSend',
      'reverbDamp',
      'reverbDecay',
      'reverbPreDelay',
      'delayTime',
      'delayFeedback',
      'delayMix',
      'delayModRate',
      'delayModDepth'
    )}
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
  {/snippet}
</Shell>

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
