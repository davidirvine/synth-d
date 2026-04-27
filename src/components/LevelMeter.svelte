<script>
  import { onDestroy } from 'svelte'

  /** @type {{ getPeak?: () => number, powered: boolean }} */
  let { getPeak = () => 0, powered } = $props()

  // Thresholds for non-clip segments 1–7 (bottom to top)
  const THRESHOLDS = [0.001, 0.125, 0.25, 0.375, 0.5, 0.675, 0.85]

  let litCount = $state(0)
  let clipLit = $state(false)
  let rafHandle = 0
  let clipHandle = 0

  function computeLitCount(peak) {
    let count = 0
    for (const t of THRESHOLDS) {
      if (peak >= t) count++
      else break
    }
    return count
  }

  function tick() {
    if (!powered) {
      litCount = 0
      clipLit = false
      clearTimeout(clipHandle)
      clipHandle = 0
      rafHandle = 0
      return
    }
    const peak = getPeak()
    litCount = computeLitCount(peak)
    if (peak > 1.0) {
      clipLit = true
      clearTimeout(clipHandle)
      clipHandle = setTimeout(() => {
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
      litCount = 0
      clipLit = false
      clearTimeout(clipHandle)
      clipHandle = 0
    }
  })

  onDestroy(() => {
    cancelAnimationFrame(rafHandle)
    clearTimeout(clipHandle)
  })
</script>

<!-- Segments rendered left-to-right: green(1–4), yellow(5–6), orange(7), clip(8) -->
<div class="meter">
  <div class="seg seg-green" class:lit={litCount >= 1}></div>
  <div class="seg seg-green" class:lit={litCount >= 2}></div>
  <div class="seg seg-green" class:lit={litCount >= 3}></div>
  <div class="seg seg-green" class:lit={litCount >= 4}></div>
  <div class="seg seg-yellow" class:lit={litCount >= 5}></div>
  <div class="seg seg-yellow" class:lit={litCount >= 6}></div>
  <div class="seg seg-orange" class:lit={litCount >= 7}></div>
  <div class="seg seg-clip" class:lit={clipLit}></div>
</div>

<style>
  .meter {
    display: flex;
    flex-direction: row;
    gap: 2px;
    align-items: center;
  }

  .seg {
    width: 5px;
    height: 6px;
    background: #1a1a1a;
    border-radius: 1px;
  }

  .seg-green.lit {
    background: #4caf50;
  }

  .seg-yellow.lit {
    background: #c8a641;
  }

  .seg-orange.lit {
    background: #c87941;
  }

  .seg-clip.lit {
    background: #c84141;
  }
</style>
