<script>
  import Knob from './Knob.svelte'

  let { onchange } = /** @type {{ onchange?: (e: { param: string, value: number }) => void }} */ (
    $props()
  )
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
      onchange={(e) => onchange?.({ param: 'cutoff', value: e.value })}
    />
    <Knob
      label="res"
      min={0}
      max={1}
      default={0.3}
      scale="linear"
      onchange={(e) => onchange?.({ param: 'resonance', value: e.value })}
    />
    <Knob
      label="mode"
      min={0}
      max={2}
      default={0}
      scale="linear"
      showLabel={false}
      showValue={false}
      ticks={[
        { pos: 0, label: 'lp' },
        { pos: 0.5, label: 'bp' },
        { pos: 1, label: 'hp' },
      ]}
      onchange={(e) => onchange?.({ param: 'filterMode', value: e.value })}
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
