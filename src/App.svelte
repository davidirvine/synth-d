<script>
  import { onMount, onDestroy } from 'svelte'
  import { powerOn, powerOff, setParam } from './audio/engine.js'
  import { MidiManager } from './audio/midi.js'
  import { MidiCcMap } from './audio/midiCcMap.js'
  import Oscillator from './components/Oscillator.svelte'
  import Filter from './components/Filter.svelte'
  import FilterEnv from './components/FilterEnv.svelte'
  import AmpEnv from './components/AmpEnv.svelte'
  import Volume from './components/Volume.svelte'
  import Keyboard from './components/Keyboard.svelte'
  import PowerButton from './components/PowerButton.svelte'
  import MidiStatus from './components/MidiStatus.svelte'

  // Knob param registry: param name → { min, max } for CC scaling
  const KNOB_PARAMS = {
    cutoff: { min: 20, max: 20000 },
    resonance: { min: 0, max: 1 },
    filterMode: { min: 0, max: 2 },
    filterAttack: { min: 0.001, max: 4 },
    filterDecay: { min: 0.001, max: 4 },
    filterEnvAmt: { min: -10000, max: 10000 },
    ampAttack: { min: 0.001, max: 4 },
    ampDecay: { min: 0.001, max: 4 },
    masterVol: { min: 0, max: 1 },
  }

  let powered = $state(false)
  let loading = $state(false)

  // MIDI state
  let midiStatus = $state(/** @type {'unavailable'|'connected'|'active'} */ ('unavailable'))
  let midiDevices = $state(/** @type {Array<{id:string,name:string}>} */ ([]))
  let selectedDeviceId = $state(/** @type {string|null} */ (null))
  let learningParam = $state(/** @type {string|null} */ (null))
  let midiActiveNotes = $state(0)

  // Per-param external values driven by incoming CC messages
  let ccExternalValues = $state(/** @type {Record<string,number|undefined>} */ ({}))

  const midiCcMap = new MidiCcMap()

  const midiManager = new MidiManager({
    onNoteOn: (note, freq) => {
      midiActiveNotes++
      if (midiStatus === 'connected') midiStatus = 'active'
      keyboardTriggerNote?.(note)
      // triggerNote uses midiToFreq internally; override freq for pitchbend accuracy
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
    } else {
      loading = true
      await powerOn()
      loading = false
      powered = true
      await midiManager.connect()
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

  // Derived per-panel midiState objects
  let filterMidiState = $derived({
    cutoff: {
      externalValue: ccExternalValues.cutoff,
      learningMidi: learningParam === 'cutoff',
      assignedCc: midiCcMap.getAssignedCc('cutoff'),
    },
    resonance: {
      externalValue: ccExternalValues.resonance,
      learningMidi: learningParam === 'resonance',
      assignedCc: midiCcMap.getAssignedCc('resonance'),
    },
    filterMode: {
      externalValue: ccExternalValues.filterMode,
      learningMidi: learningParam === 'filterMode',
      assignedCc: midiCcMap.getAssignedCc('filterMode'),
    },
  })

  let filterEnvMidiState = $derived({
    filterAttack: {
      externalValue: ccExternalValues.filterAttack,
      learningMidi: learningParam === 'filterAttack',
      assignedCc: midiCcMap.getAssignedCc('filterAttack'),
    },
    filterDecay: {
      externalValue: ccExternalValues.filterDecay,
      learningMidi: learningParam === 'filterDecay',
      assignedCc: midiCcMap.getAssignedCc('filterDecay'),
    },
    filterEnvAmt: {
      externalValue: ccExternalValues.filterEnvAmt,
      learningMidi: learningParam === 'filterEnvAmt',
      assignedCc: midiCcMap.getAssignedCc('filterEnvAmt'),
    },
  })

  let ampEnvMidiState = $derived({
    ampAttack: {
      externalValue: ccExternalValues.ampAttack,
      learningMidi: learningParam === 'ampAttack',
      assignedCc: midiCcMap.getAssignedCc('ampAttack'),
    },
    ampDecay: {
      externalValue: ccExternalValues.ampDecay,
      learningMidi: learningParam === 'ampDecay',
      assignedCc: midiCcMap.getAssignedCc('ampDecay'),
    },
  })

  let volumeMidiState = $derived({
    masterVol: {
      externalValue: ccExternalValues.masterVol,
      learningMidi: learningParam === 'masterVol',
      assignedCc: midiCcMap.getAssignedCc('masterVol'),
    },
  })
</script>

<div class="app">
  <header class="header">
    <span class="title">SYNTH-1</span>
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
  </header>

  <main inert={!powered || undefined}>
    <div class="panels" class:dimmed={!powered}>
      <Oscillator onchange={onParamChange} />
      <Filter
        onchange={onParamChange}
        midiState={filterMidiState}
        onknobcontextmenu={onKnobContextMenu}
      />
      <FilterEnv
        onchange={onParamChange}
        midiState={filterEnvMidiState}
        onknobcontextmenu={onKnobContextMenu}
      />
      <AmpEnv
        onchange={onParamChange}
        midiState={ampEnvMidiState}
        onknobcontextmenu={onKnobContextMenu}
      />
      <Volume
        onchange={onParamChange}
        midiState={volumeMidiState}
        onknobcontextmenu={onKnobContextMenu}
      />
    </div>
    <Keyboard
      onnote={onKeyboardNote}
      bind:triggerNote={keyboardTriggerNote}
      bind:releaseNote={keyboardReleaseNote}
    />
  </main>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    background: #1c1c1c;
    border-bottom: 1px solid #333;
  }

  .title {
    font-family: monospace;
    font-size: 16px;
    font-weight: bold;
    color: #e8dcc8;
    letter-spacing: 0.2em;
  }

  main {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .panels {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    transition: opacity 0.2s;
  }

  .panels.dimmed {
    opacity: 0.4;
  }
</style>
