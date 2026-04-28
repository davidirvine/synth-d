<script>
  import { onDestroy } from 'svelte'

  let { getPeak = () => 0, powered = false } =
    /** @type {{ getPeak?: () => number, powered?: boolean }} */ ($props())

  let clipLit = $state(false)
  let rafHandle = 0
  let latchHandle = 0

  function tick() {
    if (!powered) {
      clipLit = false
      rafHandle = 0
      return
    }
    const peak = getPeak()
    if (peak > 1.0) {
      clipLit = true
      clearTimeout(latchHandle)
      latchHandle = setTimeout(() => {
        clipLit = false
      }, 1500)
    }
    rafHandle = requestAnimationFrame(tick)
  }

  $effect(() => {
    if (powered) {
      if (!rafHandle) rafHandle = requestAnimationFrame(tick)
    } else {
      if (rafHandle) {
        cancelAnimationFrame(rafHandle)
        rafHandle = 0
      }
      clipLit = false
      clearTimeout(latchHandle)
      latchHandle = 0
    }
  })

  onDestroy(() => {
    cancelAnimationFrame(rafHandle)
    clearTimeout(latchHandle)
  })
</script>

<div class="clip-led" class:clip={clipLit}></div>

<style>
  .clip-led {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #4a1010;
    box-shadow: none;
    /* fade-out: decay back to dark */
    transition:
      background 200ms ease-out,
      box-shadow 200ms ease-out;
  }

  .clip-led.clip {
    background: #ff3333;
    box-shadow: 0 0 4px #ff3333;
    /* fade-in: snap up quickly when clipping starts */
    transition:
      background 80ms ease-in,
      box-shadow 80ms ease-in;
  }
</style>
