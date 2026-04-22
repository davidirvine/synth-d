<script>
  /** @type {{ powered: boolean, loading: boolean, ontoggle: () => void }} */
  let { powered = false, loading = false, ontoggle } = $props()
</script>

<div class="power-wrap">
  <button
    class="power-btn"
    class:on={powered}
    disabled={loading}
    onclick={ontoggle}
    aria-pressed={powered}
    aria-label={loading ? 'Starting audio' : powered ? 'Power off' : 'Power on'}
    type="button"
  >
    <span class="led" class:lit={powered && !loading}></span>
  </button>
  <span class="label">{loading ? 'STARTING…' : 'POWER'}</span>
</div>

<style>
  .power-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .power-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: #1c1c1c;
    border: 2px solid #333;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    transition: border-color 0.15s;
  }

  .power-btn:hover:not(:disabled) {
    border-color: #555;
  }

  .power-btn:disabled {
    cursor: default;
    opacity: 0.7;
  }

  .led {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #3a3a3a;
    transition: background 0.15s;
  }

  .led.lit {
    background: #c87941;
    box-shadow: 0 0 6px #c87941;
  }

  .label {
    font-family: monospace;
    font-size: 10px;
    color: #e8dcc8;
    letter-spacing: 0.1em;
  }
</style>
