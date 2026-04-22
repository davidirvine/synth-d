<script>
  import { onMount, onDestroy } from 'svelte'
  import { SvelteSet } from 'svelte/reactivity'
  import { QWERTY_MAP, buildNoteOnMessages, midiToFreq } from '../audio/keyboard.js'

  let { octaveOffset = 0, onnote } = $props()

  const BASE_MIDI = 48
  const BLACK_SEMITONES = new Set([1, 3, 6, 8, 10])

  const WHITE_W = 28
  const WHITE_H = 100
  const BLACK_W = 18
  const BLACK_H = 60

  // Build key layout with x positions pre-computed
  const keys = (() => {
    let whiteIdx = 0
    return Array.from({ length: 25 }, (_, i) => {
      const midi = BASE_MIDI + i
      const black = BLACK_SEMITONES.has(midi % 12)
      let x
      if (!black) {
        x = whiteIdx * WHITE_W
        whiteIdx++
      } else {
        x = (whiteIdx - 1) * WHITE_W + WHITE_W - BLACK_W / 2
      }
      return { midi, black, x }
    })
  })()

  const whiteKeys = keys.filter((k) => !k.black)
  const totalWidth = whiteKeys.length * WHITE_W

  const activeKeys = new SvelteSet()
  const pressedQwerty = new SvelteSet()

  function triggerNote(/** @type {number} */ midi) {
    const freq = midiToFreq(midi, octaveOffset)
    const wasActive = activeKeys.size > 0
    activeKeys.add(midi)
    onnote?.(buildNoteOnMessages(freq, wasActive))
  }

  function releaseNote(/** @type {number} */ midi) {
    activeKeys.delete(midi)
    if (activeKeys.size === 0) {
      onnote?.([{ param: 'gate', value: 0 }])
    }
  }

  function onKeyDown(/** @type {KeyboardEvent} */ e) {
    if (e.repeat) return
    const midi = QWERTY_MAP[e.key]
    if (midi === undefined) return
    if (pressedQwerty.has(e.key)) return
    pressedQwerty.add(e.key)
    triggerNote(midi)
  }

  function onKeyUp(/** @type {KeyboardEvent} */ e) {
    const midi = QWERTY_MAP[e.key]
    if (midi === undefined) return
    pressedQwerty.delete(e.key)
    releaseNote(midi)
  }

  onMount(() => {
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
  })

  onDestroy(() => {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
  })
</script>

<div class="keyboard-wrap">
  <svg width={totalWidth} height={WHITE_H + 2}>
    <!-- White keys -->
    {#each whiteKeys as key (key.midi)}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <rect
        x={key.x + 1}
        y={0}
        width={WHITE_W - 2}
        height={WHITE_H}
        class="white-key"
        class:active={activeKeys.has(key.midi)}
        data-midi={key.midi}
        onpointerdown={() => triggerNote(key.midi)}
        onpointerup={() => releaseNote(key.midi)}
        onpointerleave={() => releaseNote(key.midi)}
      />
    {/each}
    <!-- Black keys (rendered on top) -->
    {#each keys.filter((k) => k.black) as key (key.midi)}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <rect
        x={key.x}
        y={0}
        width={BLACK_W}
        height={BLACK_H}
        class="black-key"
        class:active={activeKeys.has(key.midi)}
        data-midi={key.midi}
        onpointerdown={() => triggerNote(key.midi)}
        onpointerup={() => releaseNote(key.midi)}
        onpointerleave={() => releaseNote(key.midi)}
      />
    {/each}
  </svg>
</div>

<style>
  .keyboard-wrap {
    display: flex;
    justify-content: center;
    padding: 12px 0;
  }

  .white-key {
    fill: #dddddd;
    stroke: #888;
    stroke-width: 1;
    cursor: pointer;
    touch-action: none;
  }

  .white-key.active {
    fill: #c87941;
  }

  .black-key {
    fill: #1a1a1a;
    stroke: #000;
    stroke-width: 1;
    cursor: pointer;
    touch-action: none;
  }

  .black-key.active {
    fill: #c87941;
  }
</style>
