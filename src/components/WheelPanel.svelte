<script>
  /** @type {{
    externalValue?: number,
    onchange?: (e: { param: string, value: number }) => void,
  }} */
  let { externalValue, onchange } = $props()

  let modWheel = $state(0.5)

  $effect(() => {
    if (externalValue !== undefined) {
      modWheel = externalValue
    }
  })

  let wheelDragging = $state(false)
  let wheelStartY = 0
  let wheelStartVal = 0

  function onWheelPointerDown(e) {
    wheelDragging = true
    wheelStartY = e.clientY
    wheelStartVal = modWheel
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onWheelPointerMove(e) {
    if (!wheelDragging) return
    const dy = wheelStartY - e.clientY
    const delta = dy / 80
    modWheel = Math.max(0, Math.min(1, wheelStartVal + delta))
    onchange?.({ param: 'modWheel', value: modWheel })
  }

  function onWheelPointerUp() {
    wheelDragging = false
  }

  function onWheelKeyDown(e) {
    const step = 0.05
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      modWheel = Math.min(1, modWheel + step)
      onchange?.({ param: 'modWheel', value: modWheel })
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      modWheel = Math.max(0, modWheel - step)
      onchange?.({ param: 'modWheel', value: modWheel })
    } else if (e.key === 'Home') {
      e.preventDefault()
      modWheel = 0
      onchange?.({ param: 'modWheel', value: modWheel })
    } else if (e.key === 'End') {
      e.preventDefault()
      modWheel = 1
      onchange?.({ param: 'modWheel', value: modWheel })
    }
  }
</script>

<div class="panel">
  <span class="panel-label">wheel</span>
  <div class="wheel-container">
    <div
      class="wheel-track"
      role="slider"
      tabindex={0}
      aria-label="mod wheel"
      aria-valuemin={0}
      aria-valuemax={1}
      aria-valuenow={modWheel}
      onpointerdown={onWheelPointerDown}
      onpointermove={onWheelPointerMove}
      onpointerup={onWheelPointerUp}
      onpointercancel={onWheelPointerUp}
      onkeydown={onWheelKeyDown}
    >
      <div class="wheel-fill" style="height: {modWheel * 100}%"></div>
    </div>
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

  .wheel-container {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
  }

  .wheel-track {
    width: 18px;
    height: 60px;
    background: #2a2a2a;
    border: 1px solid #444;
    cursor: ns-resize;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    touch-action: none;
  }

  .wheel-fill {
    background: #c87941;
    width: 100%;
    transition: height 0.05s;
  }
</style>
