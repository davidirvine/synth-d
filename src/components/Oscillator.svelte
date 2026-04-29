<script>
  import { untrack } from 'svelte'
  import Knob from './Knob.svelte'

  /** @type {{
    onchange?: (e: { param: string, value: number }) => void,
    midiState?: { [key: string]: { externalValue?: number, learningMidi?: boolean, assignedCc?: number | null } },
    onknobcontextmenu?: (param: string) => void,
    reset?: number,
  }} */
  let { onchange, midiState = {}, onknobcontextmenu, reset = 0 } = $props()

  const WAVEFORMS = ['tri', 'rev-saw', 'saw', 'sq', 'wide', 'narrow']

  let osc1Wave = $state(0)
  let osc1Range = $state(0)
  let osc2Wave = $state(0)
  let osc2Range = $state(0)
  let osc3Wave = $state(0)
  let osc3Range = $state(0)
  let osc3LfoMode = $state(0)

  function selectWave(osc, i) {
    const param = `osc${osc}Wave`
    if (osc === 1) osc1Wave = i
    else if (osc === 2) osc2Wave = i
    else osc3Wave = i
    onchange?.({ param, value: i })
  }

  function stepRange(osc, delta) {
    const current = osc === 1 ? osc1Range : osc === 2 ? osc2Range : osc3Range
    const next = Math.max(-2, Math.min(2, current + delta))
    if (next === current) return
    const param = `osc${osc}Range`
    if (osc === 1) osc1Range = next
    else if (osc === 2) osc2Range = next
    else osc3Range = next
    onchange?.({ param, value: next })
  }

  function toggleLfoMode() {
    osc3LfoMode = osc3LfoMode === 0 ? 1 : 0
    onchange?.({ param: 'osc3LfoMode', value: osc3LfoMode })
  }

  $effect(() => {
    if (reset === 0) return
    osc1Wave = 0
    osc2Wave = 0
    osc3Wave = 0
    osc1Range = 0
    osc2Range = 0
    osc3Range = 0
    osc3LfoMode = 0
    untrack(() => {
      onchange?.({ param: 'osc1Wave', value: 0 })
      onchange?.({ param: 'osc2Wave', value: 0 })
      onchange?.({ param: 'osc3Wave', value: 0 })
      onchange?.({ param: 'osc1Range', value: 0 })
      onchange?.({ param: 'osc2Range', value: 0 })
      onchange?.({ param: 'osc3Range', value: 0 })
      onchange?.({ param: 'osc3LfoMode', value: 0 })
    })
  })
</script>

<div class="panel">
  <span class="panel-label">oscillator bank</span>

  <div class="osc-section">
    <span class="osc-label">osc 1</span>
    <div class="wave-row">
      {#each WAVEFORMS as name, i (i)}
        <button class="wave-btn" class:active={osc1Wave === i} onclick={() => selectWave(1, i)}>
          {name}
        </button>
      {/each}
    </div>
    <div class="range-row">
      <span class="param-label">range</span>
      <button class="step-btn" onclick={() => stepRange(1, -1)}>−</button>
      <span class="range-val">{osc1Range > 0 ? '+' : ''}{osc1Range}</span>
      <button class="step-btn" onclick={() => stepRange(1, 1)}>+</button>
    </div>
  </div>

  <div class="osc-section">
    <span class="osc-label">osc 2</span>
    <div class="wave-row">
      {#each WAVEFORMS as name, i (i)}
        <button class="wave-btn" class:active={osc2Wave === i} onclick={() => selectWave(2, i)}>
          {name}
        </button>
      {/each}
    </div>
    <div class="range-row">
      <span class="param-label">range</span>
      <button class="step-btn" onclick={() => stepRange(2, -1)}>−</button>
      <span class="range-val">{osc2Range > 0 ? '+' : ''}{osc2Range}</span>
      <button class="step-btn" onclick={() => stepRange(2, 1)}>+</button>
      <Knob
        label="detune"
        min={-100}
        max={100}
        default={0}
        scale="linear"
        unit="c"
        bipolar={true}
        externalValue={midiState?.osc2Detune?.externalValue}
        learningMidi={midiState?.osc2Detune?.learningMidi ?? false}
        assignedCc={midiState?.osc2Detune?.assignedCc ?? null}
        onchange={(e) => onchange?.({ param: 'osc2Detune', value: e.value })}
        oncontextmenu={() => onknobcontextmenu?.('osc2Detune')}
      />
    </div>
  </div>

  <div class="osc-section">
    <span class="osc-label">osc 3</span>
    <div class="wave-row">
      {#each WAVEFORMS as name, i (i)}
        <button class="wave-btn" class:active={osc3Wave === i} onclick={() => selectWave(3, i)}>
          {name}
        </button>
      {/each}
    </div>
    <div class="range-row">
      <span class="param-label">range</span>
      <button class="step-btn" disabled={osc3LfoMode === 1} onclick={() => stepRange(3, -1)}
        >−</button
      >
      <span class="range-val">{osc3Range > 0 ? '+' : ''}{osc3Range}</span>
      <button class="step-btn" disabled={osc3LfoMode === 1} onclick={() => stepRange(3, 1)}
        >+</button
      >
      <Knob
        label="detune"
        min={-100}
        max={100}
        default={0}
        scale="linear"
        unit="c"
        bipolar={true}
        disabled={osc3LfoMode === 1}
        externalValue={midiState?.osc3Detune?.externalValue}
        learningMidi={midiState?.osc3Detune?.learningMidi ?? false}
        assignedCc={midiState?.osc3Detune?.assignedCc ?? null}
        onchange={(e) => onchange?.({ param: 'osc3Detune', value: e.value })}
        oncontextmenu={() => onknobcontextmenu?.('osc3Detune')}
      />
      <button
        class="lfo-btn"
        class:active={osc3LfoMode === 1}
        onclick={toggleLfoMode}
        aria-pressed={osc3LfoMode === 1}
      >
        lfo
      </button>
      <Knob
        label="rate"
        min={0.1}
        max={20}
        default={1}
        scale="log"
        unit="Hz"
        disabled={osc3LfoMode === 0}
        externalValue={midiState?.osc3LfoRate?.externalValue}
        learningMidi={midiState?.osc3LfoRate?.learningMidi ?? false}
        assignedCc={midiState?.osc3LfoRate?.assignedCc ?? null}
        onchange={(e) => onchange?.({ param: 'osc3LfoRate', value: e.value })}
        oncontextmenu={() => onknobcontextmenu?.('osc3LfoRate')}
      />
    </div>
  </div>
</div>

<style>
  .panel {
    background: #1c1c1c;
    border: 1px solid #333;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .panel-label {
    font-size: 10px;
    color: #e8dcc8;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .osc-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-bottom: 8px;
    border-bottom: 1px solid #2a2a2a;
  }

  .osc-section:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .osc-label {
    font-size: 9px;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .wave-row {
    display: flex;
    gap: 3px;
  }

  .wave-btn {
    font-family: inherit;
    font-size: 9px;
    background: #2a2a2a;
    color: #888;
    border: 1px solid #444;
    padding: 3px 5px;
    cursor: pointer;
    text-transform: uppercase;
  }

  .wave-btn.active {
    background: #3a2a1a;
    color: #c87941;
    border-color: #c87941;
  }

  .range-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .param-label {
    font-size: 9px;
    color: #666;
    text-transform: uppercase;
  }

  .step-btn {
    font-family: inherit;
    font-size: 14px;
    background: #2a2a2a;
    color: #888;
    border: 1px solid #444;
    width: 20px;
    height: 20px;
    cursor: pointer;
    line-height: 1;
  }

  .step-btn:disabled {
    opacity: 0.35;
    cursor: default;
  }

  .range-val {
    font-size: 11px;
    color: #e8dcc8;
    width: 22px;
    text-align: center;
  }

  .lfo-btn {
    font-family: inherit;
    font-size: 9px;
    background: #2a2a2a;
    color: #888;
    border: 1px solid #444;
    padding: 3px 8px;
    cursor: pointer;
    text-transform: uppercase;
    height: 20px;
  }

  .lfo-btn.active {
    background: #1a2a1a;
    color: #20b040;
    border-color: #20b040;
  }
</style>
