<script>
  import Knob from './Knob.svelte'

  /** @type {{
    onchange?: (e: { param: string, value: number }) => void,
    midiState?: { [key: string]: { externalValue?: number, learningMidi?: boolean, assignedCc?: number | null } },
    onknobcontextmenu?: (param: string) => void
  }} */
  let { onchange, midiState = {}, onknobcontextmenu } = $props()
</script>

<div class="panel">
  <span class="panel-label">volume</span>
  <Knob
    label="master"
    min={0}
    max={1}
    default={0.75}
    scale="linear"
    showValue={false}
    externalValue={midiState?.masterVol?.externalValue}
    learningMidi={midiState?.masterVol?.learningMidi ?? false}
    assignedCc={midiState?.masterVol?.assignedCc ?? null}
    onchange={(e) => onchange?.({ param: 'masterVol', value: e.value })}
    oncontextmenu={() => onknobcontextmenu?.('masterVol')}
  />
</div>

<style>
  .panel {
    background: #1c1c1c;
    border: 1px solid #333;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .panel-label {
    font-size: 10px;
    color: #e8dcc8;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
</style>
