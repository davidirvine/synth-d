<script>
  import { initAudio, setParam } from './audio/engine.js'
  import Oscillator from './components/Oscillator.svelte'
  import Filter from './components/Filter.svelte'
  import FilterEnv from './components/FilterEnv.svelte'
  import AmpEnv from './components/AmpEnv.svelte'
  import Volume from './components/Volume.svelte'
  import Keyboard from './components/Keyboard.svelte'

  let started = $state(false)

  async function start() {
    await initAudio()
    started = true
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

{#if !started}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="overlay" onclick={start}>
    <span class="overlay-text">CLICK TO START</span>
  </div>
{/if}

<main class:hidden={!started}>
  <div class="panels">
    <Oscillator onchange={onParamChange} />
    <Filter onchange={onParamChange} />
    <FilterEnv onchange={onParamChange} />
    <AmpEnv onchange={onParamChange} />
    <Volume onchange={onParamChange} />
  </div>
  <Keyboard onnote={onKeyboardNote} />
</main>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: #111111;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
  }

  .overlay-text {
    font-size: 24px;
    color: #c87941;
    letter-spacing: 0.2em;
    font-family: monospace;
  }

  main {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  main.hidden {
    visibility: hidden;
  }

  .panels {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
</style>
