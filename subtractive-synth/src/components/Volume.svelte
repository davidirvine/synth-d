<script>
  import Knob from './Knob.svelte'

  let { onchange } = /** @type {{ onchange?: (e: { param: string, value: number }) => void }} */ (
    $props()
  )
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
    onchange={(e) => onchange?.({ param: 'masterVol', value: e.value })}
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
