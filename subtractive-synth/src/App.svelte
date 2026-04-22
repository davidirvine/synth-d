<script>
  import { powerOn, powerOff, setParam } from './audio/engine.js'
  import Oscillator from './components/Oscillator.svelte'
  import Filter from './components/Filter.svelte'
  import FilterEnv from './components/FilterEnv.svelte'
  import AmpEnv from './components/AmpEnv.svelte'
  import Volume from './components/Volume.svelte'
  import Keyboard from './components/Keyboard.svelte'
  import PowerButton from './components/PowerButton.svelte'

  let powered = $state(false)
  let loading = $state(false)

  async function handleToggle() {
    if (powered) {
      await powerOff()
      powered = false
    } else {
      loading = true
      await powerOn()
      loading = false
      powered = true
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
</script>

<div class="app">
  <header class="header">
    <span class="title">SYNTH-1</span>
    <PowerButton {powered} {loading} ontoggle={handleToggle} />
  </header>

  <main inert={!powered || undefined}>
    <div class="panels" class:dimmed={!powered}>
      <Oscillator onchange={onParamChange} />
      <Filter onchange={onParamChange} />
      <FilterEnv onchange={onParamChange} />
      <AmpEnv onchange={onParamChange} />
      <Volume onchange={onParamChange} />
    </div>
    <Keyboard onnote={onKeyboardNote} />
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
