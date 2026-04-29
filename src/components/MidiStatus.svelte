<script>
  /** @type {{
    status?: string,
    devices?: Array<{ id: string, name: string }>,
    selectedDeviceId?: string | null,
    ondevicechange?: (id: string) => void,
  }} */
  let { status = 'unavailable', devices = [], selectedDeviceId = null, ondevicechange } = $props()
</script>

<div class="midi-status">
  <span
    class="dot"
    class:unavailable={status === 'unavailable'}
    class:connected={status === 'connected'}
    class:active={status === 'active'}
  ></span>
  <span class="label">MIDI</span>
  {#if devices.length > 1}
    <select
      class="device-select"
      value={selectedDeviceId}
      onchange={(e) => ondevicechange?.(e.currentTarget.value)}
    >
      {#each devices as device (device.id)}
        <option value={device.id}>{device.name}</option>
      {/each}
    </select>
  {/if}
</div>

<style>
  .midi-status {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #555;
    flex-shrink: 0;
  }

  .dot.unavailable {
    background: #555;
  }

  .dot.connected {
    background: #c87941;
  }

  .dot.active {
    background: #5ccc5c;
  }

  .label {
    font-family: monospace;
    font-size: 10px;
    color: #888;
    letter-spacing: 0.1em;
  }

  .device-select {
    font-family: monospace;
    font-size: 10px;
    background: #2a2a2a;
    color: #e8dcc8;
    border: 1px solid #444;
    border-radius: 2px;
    padding: 1px 4px;
    cursor: pointer;
    max-width: 130px;
  }
</style>
