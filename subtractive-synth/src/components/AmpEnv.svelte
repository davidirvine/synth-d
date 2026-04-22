<script>
  import Knob from './Knob.svelte'

  let { onchange } = $props()
</script>

<div class="panel">
  <span class="panel-label">amp env</span>
  <div class="knob-row">
    <Knob
      label="attack"
      min={0.001}
      max={4}
      default={0.01}
      scale="log"
      unit="s"
      onchange={(e) => onchange?.({ param: 'ampAttack', value: e.value })}
    />
    <Knob
      label="decay"
      min={0.001}
      max={4}
      default={0.5}
      scale="log"
      unit="s"
      onchange={(e) => onchange?.({ param: 'ampDecay', value: e.value })}
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
  }
</style>
