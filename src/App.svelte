<script module>
  // Knob param registry: param name → { min, max } for CC scaling
  /** @type {Record<string, {min: number, max: number}>} */
  const KNOB_PARAMS = {
    // Oscillators
    osc2Detune: { min: -100, max: 100 },
    osc3Detune: { min: -100, max: 100 },
    osc3LfoRate: { min: 0.1, max: 20 },
    // Mixer
    osc1Level: { min: 0, max: 1 },
    osc2Level: { min: 0, max: 1 },
    osc3Level: { min: 0, max: 1 },
    noiseLevel: { min: 0, max: 1 },
    // Filter
    cutoff: { min: 20, max: 20000 },
    resonance: { min: 0, max: 1 },
    keyTrack: { min: 0, max: 1 },
    // Filter env
    filterAttack: { min: 0.001, max: 4 },
    filterDecay: { min: 0.001, max: 4 },
    filterSustain: { min: 0, max: 1 },
    filterRelease: { min: 0.001, max: 8 },
    filterEnvAmt: { min: -10000, max: 10000 },
    // Amp env
    ampAttack: { min: 0.001, max: 4 },
    ampDecay: { min: 0.001, max: 4 },
    ampSustain: { min: 0, max: 1 },
    ampRelease: { min: 0.001, max: 8 },
    // Modulation
    modMix: { min: 0, max: 1 },
    modWheel: { min: 0, max: 1 },
    // Glide
    glideRate: { min: 0.001, max: 5 },
    // Delay — delayOn and delayModOn are intentionally excluded: they are toggles, not knobs.
    delayTime: { min: 0.01, max: 2.0 },
    delayFeedback: { min: 0, max: 0.9 },
    delayMix: { min: 0, max: 1 },
    delayModRate: { min: 0.1, max: 10 },
    delayModDepth: { min: 0, max: 0.025 },
    // Reverb — reverbOn is intentionally excluded: it is a toggle, not a knob.
    reverbSend: { min: 0, max: 1 },
    reverbDecay: { min: 0.01, max: 1 },
    reverbDamp: { min: 0, max: 1 },
    reverbPreDelay: { min: 0, max: 0.1 },
    // Master
    masterVol: { min: 0, max: 1 },
  }

  // Must stay in sync with the `bipolar` prop on each Knob in the UI.
  export const BIPOLAR_PARAMS = new Set(['osc2Detune', 'osc3Detune', 'modMix', 'filterEnvAmt'])

  /** @param {string} p */
  export function powerOffValue(p) {
    return BIPOLAR_PARAMS.has(p)
      ? (KNOB_PARAMS[p].min + KNOB_PARAMS[p].max) / 2
      : KNOB_PARAMS[p].min
  }
</script>

<script>
  import { onMount, onDestroy } from 'svelte'
  import {
    getAnalyser,
    getMixerPeak,
    getOutputPeak,
    powerOn,
    powerOff,
    setParam,
  } from './audio/engine.js'
  import { MidiManager } from './audio/midi.js'
  import { MidiCcMap } from './audio/midiCcMap.js'
  import Oscillator from './components/Oscillator.svelte'
  import Mixer from './components/Mixer.svelte'
  import Filter from './components/Filter.svelte'
  import Effects from './components/Effects.svelte'
  import AmpEnv from './components/AmpEnv.svelte'
  import Modulation from './components/Modulation.svelte'
  import Glide from './components/Glide.svelte'
  import Keyboard from './components/Keyboard.svelte'
  import RegisterPanel from './components/RegisterPanel.svelte'
  import WheelPanel from './components/WheelPanel.svelte'
  import PowerButton from './components/PowerButton.svelte'
  import MidiStatus from './components/MidiStatus.svelte'
  import PatchControl from './components/PatchControl.svelte'
  import Scope from './components/Scope.svelte'
  import {
    synthParams,
    writeParam,
    applyParams,
    resetParams,
    setActivePatch,
    activePatch,
    PARAM_DEFAULTS,
  } from './state/synth.svelte.js'

  const branch = __GIT_BRANCH__
  const versionLabel = branch === 'main' ? `v${__APP_VERSION__}` : `v${__APP_VERSION__} (${branch})`

  // The mod-wheel is controller state, not part of the synth store/patch. Its
  // power-on value is its own default; power-off returns it to rest like a knob.
  const MOD_WHEEL_DEFAULT = 0.5

  // Seed the store to factory defaults for this App instance. On page load this
  // shows factory defaults (knobs sit at their power-off rest positions until
  // power-on) and the active patch is the (unsaved) factory defaults. The store
  // is a module singleton, so this also gives tests a clean baseline. No DSP
  // writes happen here — the worklet isn't created yet.
  // NOTE for tests: this runs at instantiation, so a test that wants a specific
  // active patch must call setActivePatch AFTER render(App), not before.
  resetParams()
  setActivePatch(null, PARAM_DEFAULTS)

  let keyboardBase = $state(36)
  const activeRegister = $derived(
    keyboardBase === 21 ? 'bottom' : keyboardBase === 48 ? 'top' : 'mid'
  )

  let powered = $state(false)
  let loading = $state(false)
  let analyser = $state(/** @type {AnalyserNode | null} */ (null))

  // MIDI state
  let midiStatus = $state(/** @type {'unavailable'|'connected'|'active'} */ ('unavailable'))
  let midiDevices = $state(/** @type {Array<{id:string,name:string}>} */ ([]))
  let selectedDeviceId = $state(/** @type {string|null} */ (null))
  let learningParam = $state(/** @type {string|null} */ (null))
  let midiActiveNotes = $state(0)

  // Mod-wheel external (programmatic) value: drives the wheel on power
  // transitions and incoming CC 1. Initialised at the power-off rest position.
  let modWheelExternal = $state(powerOffValue('modWheel'))

  const midiCcMap = new MidiCcMap()

  const midiManager = new MidiManager({
    onNoteOn: (/** @type {number} */ note, /** @type {number} */ freq) => {
      midiActiveNotes++
      if (midiStatus === 'connected') midiStatus = 'active'
      keyboardTriggerNote?.(note)
      setParam('freq', freq)
    },
    onNoteOff: (/** @type {number} */ note) => {
      midiActiveNotes = Math.max(0, midiActiveNotes - 1)
      if (midiActiveNotes === 0 && midiStatus === 'active') midiStatus = 'connected'
      keyboardReleaseNote?.(note)
    },
    onPitchBend: (/** @type {number} */ freq) => {
      setParam('freq', freq)
    },
    onCc: (/** @type {{cc: number, value: number}} */ { cc, value }) => {
      if (learningParam !== null) {
        const knob = KNOB_PARAMS[learningParam]
        if (knob) {
          midiCcMap.assign(cc, learningParam, knob.min, knob.max)
          learningParam = null
          return
        }
      }
      // CC 1 always routes to modWheel (controller state, not the store). It
      // fires regardless of power state; setParam is a safe no-op while off.
      if (cc === 1) {
        const scaled = value / 127
        modWheelExternal = scaled
        setParam('modWheel', scaled)
        return
      }
      // While powered off the synth is reset to the active patch on power-on,
      // so a store write here would be discarded — skip it, matching the
      // `!powered` guard in onParamChange.
      if (!powered) return
      const mapping = midiCcMap.resolve(cc)
      if (!mapping) return
      const scaled = midiCcMap.scale(cc, value)
      if (scaled === null) return
      // MIDI CC writes the store, which drives both the DSP and the knob.
      writeParam(mapping.param, scaled)
    },
    onStatusChange: (/** @type {'unavailable'|'connected'|'active'} */ status) => {
      midiStatus = status
    },
    onDevicesChange: (/** @type {Array<{id: string, name: string}>} */ devices) => {
      midiDevices = devices
      if (devices.length > 0 && selectedDeviceId === null) {
        selectedDeviceId = devices[0].id
      }
    },
  })

  // Bindable functions exposed by Keyboard
  let keyboardTriggerNote = $state(/** @type {((midi: number) => void) | null} */ (null))
  let keyboardReleaseNote = $state(/** @type {((midi: number) => void) | null} */ (null))
  let keyboardReleaseAll = $state(/** @type {(() => void) | null} */ (null))

  async function handleToggle() {
    if (powered) {
      keyboardReleaseAll?.()
      await powerOff()
      powered = false
      modWheelExternal = powerOffValue('modWheel')
    } else {
      loading = true
      try {
        await powerOn()
        analyser = getAnalyser()
        powered = true
        // Apply the active patch to the store, which drives both UI and DSP.
        // The active patch is the most recently loaded patch, or the factory
        // defaults when none has been loaded. `force` re-sends every param to
        // the freshly created worklet node so the DSP and UI agree from the
        // first sample.
        applyParams(activePatch.params, true)
        modWheelExternal = MOD_WHEEL_DEFAULT
        setParam('modWheel', MOD_WHEEL_DEFAULT)
      } catch (err) {
        console.error('Power on failed:', err)
      } finally {
        loading = false
      }
    }
  }

  /** @param {{ param: string, value: number }} e */
  function onParamChange(e) {
    // Only user interaction while powered should write the store. When powered
    // off, the knobs' externalValue animates to rest positions, which fires
    // their onchange — that must NOT be written back to the store.
    if (!powered) return
    writeParam(e.param, e.value)
  }

  /** @param {{ param: string, value: number }} e */
  function onModWheelChange(e) {
    // Guard on power state to match onParamChange: only act on real user
    // interaction while powered.
    if (!powered) return
    // Keep the external value in sync with the wheel's position so a later CC 1
    // carrying this same value still registers as a change and re-renders.
    modWheelExternal = e.value
    setParam(e.param, e.value)
  }

  /** @param {Array<{ param: string, value: number }>} messages */
  function onKeyboardNote(messages) {
    for (const msg of messages) {
      setParam(msg.param, msg.value)
    }
  }

  /** @param {string} param */
  function onKnobContextMenu(param) {
    learningParam = learningParam === param ? null : param
  }

  /** @param {KeyboardEvent} e */
  function onKeyDown(e) {
    if (e.key === 'Escape' && learningParam !== null) {
      learningParam = null
    }
  }

  onMount(() => {
    window.addEventListener('keydown', onKeyDown)
    // MIDI is independent of the audio path: connect on mount so the status
    // indicator and incoming-event wiring work even before the synth is
    // powered on (and in CI, where AudioWorklet init fails for lack of audio
    // hardware). MIDI events while powered-off are safe — engine.setParam
    // and friends are no-ops when the worklet node hasn't been created yet.
    midiManager.connect()
  })
  onDestroy(() => {
    window.removeEventListener('keydown', onKeyDown)
    midiManager.destroy()
  })

  /** @param {...string} params */
  function midiStateFor(...params) {
    return Object.fromEntries(
      params.map((p) => [
        p,
        {
          // The store feeds each knob's externalValue while powered; when
          // powered off, knobs sit at their power-off rest positions.
          externalValue: powered ? synthParams[p] : powerOffValue(p),
          learningMidi: learningParam === p,
          assignedCc: midiCcMap.getAssignedCc(p),
        },
      ])
    )
  }

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

<div class="app">
  <header class="header">
    <svg
      class="header-glyph"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="#2a2a2a"
      aria-hidden="true"
    >
      <path
        fill-rule="evenodd"
        d="M116.589 182.742l-7.405 20.346a4 4 0 0 1-5.125 2.396l-7.525-2.738a4 4 0 0 1-2.386-5.13l7.435-20.427C83.963 167.623 72 148.959 72 127.5 72 96.296 97.296 71 128.5 71c3.877 0 7.663.39 11.32 1.134l6.996-19.222a4 4 0 0 1 5.125-2.396l7.525 2.738a4 4 0 0 1 2.386 5.13l-6.968 19.142C172.796 87.002 185 105.826 185 127.5c0 31.204-25.296 56.5-56.5 56.5-4.086 0-8.071-.434-11.911-1.258zm5.173-14.213A41.32 41.32 0 0 0 128 169c22.644 0 41-18.356 41-41 0-14.855-7.9-27.864-19.727-35.056l-27.51 75.585zm-15.035-5.473l27.51-75.585A41.32 41.32 0 0 0 128 87c-22.644 0-41 18.356-41 41 0 14.855 7.9 27.864 19.727 35.056z"
      />
    </svg>
    <a
      class="github-link"
      href="https://github.com/davidirvine/synth-d"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub repository"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
        />
      </svg>
    </a>
    <div class="title-block">
      <span class="title">SYNTH-D</span>
      <span class="version-label">{versionLabel}</span>
    </div>
    <div class="header-right">
      <div class="status-stack">
        <MidiStatus
          status={midiStatus}
          devices={midiDevices}
          {selectedDeviceId}
          ondevicechange={(id) => {
            selectedDeviceId = id
            midiManager.selectDevice(id)
          }}
        />
        <PatchControl {powered} />
      </div>
      <PowerButton {powered} {loading} ontoggle={handleToggle} />
    </div>
  </header>

  <main inert={!powered || undefined}>
    <div class="synth" class:dimmed={!powered}>
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
          <Scope {analyser} {powered} />
        </div>
      </div>
      <div class="keyboard-row">
        <WheelPanel externalValue={modWheelExternal} onchange={onModWheelChange} />
        <Keyboard
          onnote={onKeyboardNote}
          bind:triggerNote={keyboardTriggerNote}
          bind:releaseNote={keyboardReleaseNote}
          bind:releaseAll={keyboardReleaseAll}
          baseMidi={keyboardBase}
        />
        <RegisterPanel
          ondown={() => (keyboardBase = 21)}
          onup={() => (keyboardBase = 48)}
          {activeRegister}
        />
      </div>
    </div>
  </main>
</div>

<style>
  .app {
    --knob-body-size: 48px;
    display: flex;
    flex-direction: column;
    gap: 0;
    width: fit-content;
  }

  .header {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px 12px 8px;
    margin: 0 8px;
    background: #1c1c1c;
    border-bottom: 1px solid #333;
  }

  /* Decorative brand glyph, centered across the full header width regardless of
     the asymmetric left/right groups. Absolutely positioned so it stays out of
     the flex flow (neither shifts nor is shifted by the side content) and
     pointer-events: none so it never intercepts a click aimed at the header. */
  .header-glyph {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    pointer-events: none;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-left: auto;
  }

  /* Stack the MIDI status and patch control vertically, right-aligned, so the
     patch button sits under the MIDI indicator row. */
  .status-stack {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
  }

  .github-link {
    color: #555;
    text-decoration: none;
    line-height: 0;
    transition: color 0.15s;
  }

  .github-link:hover {
    color: #888;
  }

  .github-link:focus:not(:focus-visible) {
    outline: none;
  }

  .title-block {
    display: flex;
    flex-direction: column;
    align-self: stretch;
    justify-content: space-between;
  }

  .title {
    font-family: monospace;
    font-size: 16px;
    font-weight: bold;
    color: #e8dcc8;
    letter-spacing: 0.2em;
  }

  .version-label {
    font-size: 9px;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  main {
    padding: 8px;
  }

  .synth {
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: opacity 0.2s;
  }

  .synth.dimmed {
    opacity: 0.4;
  }

  .keyboard-row {
    display: flex;
    gap: 8px;
    align-items: stretch;
  }

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
