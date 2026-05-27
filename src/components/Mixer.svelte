<script>
  import Knob from './Knob.svelte'
  import LevelLed from './LevelLed.svelte'

  /** @type {{
    onchange?: (e: { param: string, value: number }) => void,
    midiState?: { [key: string]: { externalValue?: number, learningMidi?: boolean, assignedCc?: number | null } },
    onknobcontextmenu?: (param: string) => void,
    noiseType?: number,
    getPeak?: () => number,
    powered?: boolean,
  }} */
  let {
    onchange,
    midiState = {},
    onknobcontextmenu,
    noiseType = 0,
    getPeak = () => 0,
    powered = false,
  } = $props()

  /** @param {number} t */
  function selectNoiseType(t) {
    if (t === noiseType) return
    onchange?.({ param: 'noiseType', value: t })
  }
</script>

<div class="panel">
  <div class="panel-header">
    <span class="panel-label">mixer</span>
    <LevelLed {getPeak} {powered} />
  </div>
  <div class="mixer-col">
    <Knob
      label="osc 1"
      min={0}
      max={1}
      default={0.75}
      scale="linear"
      externalValue={midiState?.osc1Level?.externalValue}
      learningMidi={midiState?.osc1Level?.learningMidi ?? false}
      assignedCc={midiState?.osc1Level?.assignedCc ?? null}
      onchange={(e) => onchange?.({ param: 'osc1Level', value: e.value })}
      oncontextmenu={() => onknobcontextmenu?.('osc1Level')}
    />
    <Knob
      label="osc 2"
      min={0}
      max={1}
      default={0}
      scale="linear"
      externalValue={midiState?.osc2Level?.externalValue}
      learningMidi={midiState?.osc2Level?.learningMidi ?? false}
      assignedCc={midiState?.osc2Level?.assignedCc ?? null}
      onchange={(e) => onchange?.({ param: 'osc2Level', value: e.value })}
      oncontextmenu={() => onknobcontextmenu?.('osc2Level')}
    />
    <Knob
      label="osc 3"
      min={0}
      max={1}
      default={0}
      scale="linear"
      externalValue={midiState?.osc3Level?.externalValue}
      learningMidi={midiState?.osc3Level?.learningMidi ?? false}
      assignedCc={midiState?.osc3Level?.assignedCc ?? null}
      onchange={(e) => onchange?.({ param: 'osc3Level', value: e.value })}
      oncontextmenu={() => onknobcontextmenu?.('osc3Level')}
    />
    <div class="section-divider"></div>
    <div class="noise-row">
      <Knob
        label="noise"
        min={0}
        max={1}
        default={0}
        scale="linear"
        externalValue={midiState?.noiseLevel?.externalValue}
        learningMidi={midiState?.noiseLevel?.learningMidi ?? false}
        assignedCc={midiState?.noiseLevel?.assignedCc ?? null}
        onchange={(e) => onchange?.({ param: 'noiseLevel', value: e.value })}
        oncontextmenu={() => onknobcontextmenu?.('noiseLevel')}
      />
      <div class="noise-type-row">
        <button class="noise-btn" class:active={noiseType === 0} onclick={() => selectNoiseType(0)}>
          wht
        </button>
        <button class="noise-btn" class:active={noiseType === 1} onclick={() => selectNoiseType(1)}>
          pink
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .panel {
    background: var(--panel-bg, #1c1c1c);
    border: 1px solid var(--panel-border, #333);
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .panel-label {
    font-size: 10px;
    color: var(--panel-label-color, #e8dcc8);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .panel-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .mixer-col {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .section-divider {
    height: 1px;
    background: var(--control-bg, #2a2a2a);
  }

  .noise-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .noise-type-row {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .noise-btn {
    font-family: inherit;
    font-size: 9px;
    background: var(--control-bg, #2a2a2a);
    color: var(--control-label-color, #888);
    border: 1px solid var(--control-border, #444);
    padding: 3px 5px;
    cursor: pointer;
    text-transform: uppercase;
  }

  .noise-btn.active {
    background: var(--accent-active-bg, #3a2a1a);
    color: var(--accent-color, #c87941);
    border-color: var(--accent-color, #c87941);
  }
</style>
