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
</script>

<div class="panel">
  <span class="panel-label">filter</span>
  <div class="knob-row">
    <Knob
      label="cutoff"
      min={20}
      max={20000}
      default={2000}
      scale="log"
      unit="Hz"
      externalValue={midiState?.cutoff?.externalValue}
      learningMidi={midiState?.cutoff?.learningMidi ?? false}
      assignedCc={midiState?.cutoff?.assignedCc ?? null}
      onchange={(e) => onchange?.({ param: 'cutoff', value: e.value })}
      oncontextmenu={() => onknobcontextmenu?.('cutoff')}
    />
    <Knob
      label="res"
      min={0}
      max={1}
      default={0.3}
      scale="linear"
      externalValue={midiState?.resonance?.externalValue}
      learningMidi={midiState?.resonance?.learningMidi ?? false}
      assignedCc={midiState?.resonance?.assignedCc ?? null}
      onchange={(e) => onchange?.({ param: 'resonance', value: e.value })}
      oncontextmenu={() => onknobcontextmenu?.('resonance')}
    />
    <Knob
      label="mode"
      min={0}
      max={2}
      default={0}
      scale="linear"
      showLabel={false}
      showValue={false}
      showArc={false}
      ticks={[
        { pos: 0, label: 'lp' },
        { pos: 0.5, label: 'bp' },
        { pos: 1, label: 'hp' },
      ]}
      externalValue={midiState?.filterMode?.externalValue}
      learningMidi={midiState?.filterMode?.learningMidi ?? false}
      assignedCc={midiState?.filterMode?.assignedCc ?? null}
      onchange={(e) => onchange?.({ param: 'filterMode', value: e.value })}
      oncontextmenu={() => onknobcontextmenu?.('filterMode')}
    />
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
</style>
