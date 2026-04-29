<script>
  let {
    ondown,
    onup,
    activeRegister = 'mid',
  } = /** @type {{
    ondown?: () => void,
    onup?: () => void,
    activeRegister?: 'bottom' | 'top' | 'mid',
  }} */ ($props())
</script>

<div class="panel">
  <span class="panel-label">keyboard range</span>
  <div class="btn-col">
    <button
      class="reg-btn"
      class:active={activeRegister === 'top'}
      onclick={onup}
      aria-pressed={activeRegister === 'top'}
    >
      Oct ▲
    </button>
    <button
      class="reg-btn"
      class:active={activeRegister === 'bottom'}
      onclick={ondown}
      aria-pressed={activeRegister === 'bottom'}
    >
      Oct ▼
    </button>
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

  .btn-col {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .reg-btn {
    font-family: inherit;
    font-size: 9px;
    background: #2a2a2a;
    color: #888;
    border: 1px solid #444;
    padding: 3px 8px;
    cursor: pointer;
    text-transform: uppercase;
    height: 22px;
  }

  .reg-btn.active {
    background: #3a2a1a;
    color: #c87941;
    border-color: #c87941;
  }
</style>
