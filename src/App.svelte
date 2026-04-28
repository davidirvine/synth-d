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
  import PowerButton from './components/PowerButton.svelte'
  import MidiStatus from './components/MidiStatus.svelte'
  import Scope from './components/Scope.svelte'

  const branch = __GIT_BRANCH__
  const versionLabel = branch === 'main' ? `v${__APP_VERSION__}` : `v${__APP_VERSION__} (${branch})`

  // Knob param registry: param name → { min, max } for CC scaling
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
    filterEnvAmt: { min: 0, max: 10000 },
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
    reverbMix: { min: 0, max: 1 },
    reverbDecay: { min: 0.01, max: 1 },
    reverbDamp: { min: 0, max: 1 },
    reverbPreDelay: { min: 0, max: 0.1 },
    // Master
    masterVol: { min: 0, max: 1 },
  }

  // Covers every continuous param that flows through ccExternalValues → Knob externalValue.
  // keyTrack is intentionally excluded: it is a toggle button, not a Knob, so it receives
  // no externalValue. It is reset to 0 by Filter.svelte's reset $effect instead.
  const DEFAULTS = {
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
    modWheel: 0.5,
    // Glide
    glideRate: 0.2,
    // Delay
    delayTime: 0.3,
    delayFeedback: 0.3,
    delayMix: 0.3,
    delayModRate: 0.5,
    delayModDepth: 0,
    // Reverb
    reverbMix: 0.5,
    reverbDamp: 0.5,
    reverbDecay: 0.5,
    reverbPreDelay: 0,
  }

  let powered = $state(false)
  let loading = $state(false)
  let analyser = $state(null)
  let resetCounter = $state(0)

  // MIDI state
  let midiStatus = $state(/** @type {'unavailable'|'connected'|'active'} */ ('unavailable'))
  let midiDevices = $state(/** @type {Array<{id:string,name:string}>} */ ([]))
  let selectedDeviceId = $state(/** @type {string|null} */ (null))
  let learningParam = $state(/** @type {string|null} */ (null))
  let midiActiveNotes = $state(0)

  // Per-param external values driven by incoming CC messages.
  // Initialised with random values so the power-on reset animation is visible on first load.
  let ccExternalValues = $state(
    /** @type {Record<string,number|undefined>} */ (
      Object.fromEntries(
        Object.keys(DEFAULTS).map((p) => {
          const { min, max } = KNOB_PARAMS[p]
          return [p, min + Math.random() * (max - min)]
        })
      )
    )
  )

  const midiCcMap = new MidiCcMap()

  const midiManager = new MidiManager({
    onNoteOn: (note, freq) => {
      midiActiveNotes++
      if (midiStatus === 'connected') midiStatus = 'active'
      keyboardTriggerNote?.(note)
      setParam('freq', freq)
    },
    onNoteOff: (note) => {
      midiActiveNotes = Math.max(0, midiActiveNotes - 1)
      if (midiActiveNotes === 0 && midiStatus === 'active') midiStatus = 'connected'
      keyboardReleaseNote?.(note)
    },
    onPitchBend: (freq) => {
      setParam('freq', freq)
    },
    onCc: ({ cc, value }) => {
      if (learningParam !== null) {
        const knob = KNOB_PARAMS[learningParam]
        if (knob) {
          midiCcMap.assign(cc, learningParam, knob.min, knob.max)
          learningParam = null
          return
        }
      }
      // CC 1 always routes to modWheel
      if (cc === 1) {
        const scaled = value / 127
        ccExternalValues = { ...ccExternalValues, modWheel: scaled }
        setParam('modWheel', scaled)
        return
      }
      const mapping = midiCcMap.resolve(cc)
      if (!mapping) return
      const scaled = midiCcMap.scale(cc, value)
      if (scaled === null) return
      ccExternalValues = { ...ccExternalValues, [mapping.param]: scaled }
    },
    onStatusChange: (status) => {
      midiStatus = status
    },
    onDevicesChange: (devices) => {
      midiDevices = devices
      if (devices.length > 0 && selectedDeviceId === null) {
        selectedDeviceId = devices[0].id
      }
    },
  })

  // Bindable functions exposed by Keyboard
  let keyboardTriggerNote = $state(/** @type {Function|null} */ (null))
  let keyboardReleaseNote = $state(/** @type {Function|null} */ (null))

  async function handleToggle() {
    if (powered) {
      midiManager.destroy()
      await powerOff()
      powered = false
      midiStatus = 'unavailable'
      ccExternalValues = {}
    } else {
      loading = true
      try {
        await powerOn()
        analyser = getAnalyser()
        powered = true
        ccExternalValues = { ...DEFAULTS }
        resetCounter++
        await midiManager.connect()
      } catch (err) {
        console.error('Power on failed:', err)
      } finally {
        loading = false
      }
    }
  }

  /** @param {{ param: string, value: number }} e */
  function onParamChange(e) {
    setParam(e.param, e.value)
  }

  /** @param {Array<{ param: string, value: number }>} messages */
  function onKeyboardNote(messages) {
    for (const msg of messages) {
      setParam(msg.param, msg.value)
    }
  }

  function onKnobContextMenu(/** @type {string} */ param) {
    learningParam = learningParam === param ? null : param
  }

  function onKeyDown(/** @type {KeyboardEvent} */ e) {
    if (e.key === 'Escape' && learningParam !== null) {
      learningParam = null
    }
  }

  onMount(() => window.addEventListener('keydown', onKeyDown))
  onDestroy(() => {
    window.removeEventListener('keydown', onKeyDown)
    midiManager.destroy()
  })

  function midiStateFor(...params) {
    return Object.fromEntries(
      params.map((p) => [
        p,
        {
          externalValue: ccExternalValues[p],
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
      'keyTrack',
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

  let modMidiState = $derived(midiStateFor('modMix', 'modWheel'))

  let glideMidiState = $derived(midiStateFor('glideRate'))

  let effectsMidiState = $derived(
    midiStateFor(
      'reverbMix',
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
    <div class="title-block">
      <a
        class="title"
        href="https://github.com/davidirvine/synth-d"
        target="_blank"
        rel="noopener noreferrer">SYNTH-D</a
      >
      <span class="version-label">{versionLabel}</span>
    </div>
    <div class="header-right">
      <MidiStatus
        status={midiStatus}
        devices={midiDevices}
        {selectedDeviceId}
        ondevicechange={(id) => {
          selectedDeviceId = id
          midiManager.selectDevice(id)
        }}
      />
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
          reset={resetCounter}
        />
        <Mixer
          onchange={onParamChange}
          midiState={mixerMidiState}
          onknobcontextmenu={onKnobContextMenu}
          reset={resetCounter}
          getPeak={getMixerPeak}
          {powered}
        />
        <div class="filter-output-grid">
          <Filter
            onchange={onParamChange}
            midiState={filterMidiState}
            onknobcontextmenu={onKnobContextMenu}
            reset={resetCounter}
          />
          <AmpEnv
            onchange={onParamChange}
            midiState={ampEnvMidiState}
            onknobcontextmenu={onKnobContextMenu}
            reset={resetCounter}
            {getOutputPeak}
            {powered}
          />
          <div class="effects-col">
            <Effects
              onchange={onParamChange}
              midiState={effectsMidiState}
              onknobcontextmenu={onKnobContextMenu}
              reset={resetCounter}
            />
          </div>
          <div class="panel-row">
            <Modulation
              onchange={onParamChange}
              midiState={modMidiState}
              onknobcontextmenu={onKnobContextMenu}
              reset={resetCounter}
            />
            <Glide
              onchange={onParamChange}
              midiState={glideMidiState}
              onknobcontextmenu={onKnobContextMenu}
              reset={resetCounter}
            />
          </div>
          <Scope {analyser} {powered} />
        </div>
      </div>
      <Keyboard
        onnote={onKeyboardNote}
        bind:triggerNote={keyboardTriggerNote}
        bind:releaseNote={keyboardReleaseNote}
      />
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    margin: 0 8px;
    background: #1c1c1c;
    border-bottom: 1px solid #333;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
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
    text-decoration: none;
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
