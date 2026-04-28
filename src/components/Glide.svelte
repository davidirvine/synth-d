<script>
  import Knob from './Knob.svelte'

  let {
    onchange,
    midiState = {},
    onknobcontextmenu,
    reset = 0,
  } = /** @type {{
    onchange?: (e: { param: string, value: number }) => void,
    midiState?: { [key: string]: { externalValue?: number, learningMidi?: boolean, assignedCc?: number | null } },
    onknobcontextmenu?: (param: string) => void,
    reset?: number,
  }} */ ($props())

  let glideOn = $state(0)

  function toggleGlide() {
    glideOn = glideOn === 0 ? 1 : 0
    onchange?.({ param: 'glideOn', value: glideOn })
  }

  $effect(() => {
    if (reset === 0) return
    glideOn = 0
    onchange?.({ param: 'glideOn', value: 0 })
  })
</script>

<div class="panel">
  <span class="panel-label">glide</span>
  <div class="glide-row">
    <button
      class="glide-btn"
      class:active={glideOn === 1}
      onclick={toggleGlide}
      aria-pressed={glideOn === 1}
    >
      {glideOn === 1 ? 'on' : 'off'}
    </button>
    <Knob
      label="rate"
      min={0.001}
      max={5}
      default={0.2}
      scale="log"
      unit="s"
      disabled={glideOn === 0}
      externalValue={midiState?.glideRate?.externalValue}
      learningMidi={midiState?.glideRate?.learningMidi ?? false}
      assignedCc={midiState?.glideRate?.assignedCc ?? null}
      onchange={(e) => onchange?.({ param: 'glideRate', value: e.value })}
      oncontextmenu={() => onknobcontextmenu?.('glideRate')}
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
    flex: 1;
  }

  .panel-label {
    font-size: 10px;
    color: #e8dcc8;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .glide-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .glide-btn {
    font-family: inherit;
    font-size: 9px;
    background: #2a2a2a;
    color: #888;
    border: 1px solid #444;
    padding: 3px 8px;
    cursor: pointer;
    text-transform: uppercase;
    height: 22px;
    width: 32px;
  }

  .glide-btn.active {
    background: #1a2a1a;
    color: #20b040;
    border-color: #20b040;
  }
</style>
