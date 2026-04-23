<script>
  let { onchange } = /** @type {{ onchange?: (e: { param: string, value: number }) => void }} */ (
    $props()
  )

  const WAVEFORMS = ['sine', 'saw', 'square', 'tri', 'noise']

  let oscType = $state(0)
  let octave = $state(0)

  function selectWave(i) {
    oscType = i
    onchange?.({ param: 'oscType', value: i })
  }

  function stepOctave(delta) {
    const next = Math.max(-2, Math.min(2, octave + delta))
    if (next === octave) return
    octave = next
    onchange?.({ param: 'octave', value: next })
  }
</script>

<div class="panel">
  <span class="panel-label">oscillator</span>
  <div class="wave-row">
    {#each WAVEFORMS as name, i (i)}
      <button class="wave-btn" class:active={oscType === i} onclick={() => selectWave(i)}>
        {name}
      </button>
    {/each}
  </div>
  <div class="octave-row">
    <span class="param-label">octave</span>
    <button class="step-btn" onclick={() => stepOctave(-1)}>−</button>
    <span class="octave-val">{octave > 0 ? '+' : ''}{octave}</span>
    <button class="step-btn" onclick={() => stepOctave(1)}>+</button>
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

  .wave-row {
    display: flex;
    gap: 4px;
  }

  .wave-btn {
    font-family: inherit;
    font-size: 10px;
    background: #2a2a2a;
    color: #888;
    border: 1px solid #444;
    padding: 3px 6px;
    cursor: pointer;
    text-transform: uppercase;
  }

  .wave-btn.active {
    background: #3a2a1a;
    color: #c87941;
    border-color: #c87941;
  }

  .octave-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .param-label {
    font-size: 10px;
    color: #666;
    text-transform: uppercase;
  }

  .step-btn {
    font-family: inherit;
    font-size: 14px;
    background: #2a2a2a;
    color: #888;
    border: 1px solid #444;
    width: 22px;
    height: 22px;
    cursor: pointer;
    line-height: 1;
  }

  .octave-val {
    font-size: 12px;
    color: #e8dcc8;
    width: 24px;
    text-align: center;
  }
</style>
