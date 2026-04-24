<script>
  import Knob from './Knob.svelte'

  let {
    onchange,
    midiState = {},
    onknobcontextmenu,
  } = /** @type {{
    onchange?: (e: { param: string, value: number }) => void,
    midiState?: { [key: string]: { externalValue?: number, learningMidi?: boolean, assignedCc?: number | null } },
    onknobcontextmenu?: (param: string) => void
  }} */ ($props())

  let noiseType = $state(0)

  function toggleNoiseType() {
    noiseType = noiseType === 0 ? 1 : 0
    onchange?.({ param: 'noiseType', value: noiseType })
  }
</script>

<div class="panel">
  <span class="panel-label">mixer</span>
  <div class="knob-row">
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
    <div class="noise-section">
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
      <button
        class="noise-type-btn"
        class:pink={noiseType === 1}
        onclick={toggleNoiseType}
        aria-pressed={noiseType === 1}
      >
        {noiseType === 0 ? 'wht' : 'pink'}
      </button>
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

  .knob-row {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  .noise-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .noise-type-btn {
    font-family: inherit;
    font-size: 9px;
    background: #2a2a2a;
    color: #888;
    border: 1px solid #444;
    padding: 2px 6px;
    cursor: pointer;
    text-transform: uppercase;
  }

  .noise-type-btn.pink {
    background: #3a2a1a;
    color: #c87941;
    border-color: #c87941;
  }
</style>
