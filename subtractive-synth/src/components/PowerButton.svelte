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
    <svg
      class="power-icon"
      class:lit={powered && !loading}
      viewBox="0 0 20 20"
      width="16"
      height="16"
      fill="none"
      stroke-linecap="round"
      stroke-width="2"
      aria-hidden="true"
    >
      <line x1="10" y1="2" x2="10" y2="8" />
      <path d="M 14.5 4.6 A 7 7 0 1 1 5.5 4.6" />
    </svg>
  </button>
  <span class="label">POWER</span>
</div>

<style>
  .power-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .power-btn {
    width: 31px;
    height: 31px;
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

  .power-icon {
    stroke: #3a3a3a;
    transition:
      stroke 0.15s,
      filter 0.15s;
  }

  .power-icon.lit {
    stroke: #c87941;
    filter: drop-shadow(0 0 3px #c87941);
  }

  .label {
    font-family: monospace;
    font-size: 7px;
    color: #e8dcc8;
    letter-spacing: 0.1em;
  }
</style>
