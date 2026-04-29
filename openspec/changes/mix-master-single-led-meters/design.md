## Context

Two `ClipLed` components currently exist in the UI — one in `Mixer.svelte` (mixer panel header) and one in `AmpEnv.svelte` (output panel header). Both are binary: dark dim red when signal is below 1.0, bright red (latched 1.5 s) when signal exceeds 1.0. No intermediate state is shown.

The existing `getMixerPeak()` and `getOutputPeak()` functions in `engine.js` already deliver continuous peak values (0–4+ range) to the UI via `setOutputParamHandler`. No DSP or engine changes are required.

The archived `2026-04-28-mixer-level-meter` change implemented an 8-segment vertical LED strip. This change deliberately uses a single LED per location — the goal is minimal UI footprint with richer color information, not a full strip meter.

## Goals / Non-Goals

**Goals:**
- Replace `ClipLed` with `LevelLed`: a single circular LED whose color continuously maps peak level to a green → yellow → orange → red spectrum
- Preserve the 1.5-second clip latch (red state) on peak > 1.0
- Both the mixer panel and output panel LEDs use the same component
- No DOM footprint increase — still one element per panel header

**Non-Goals:**
- Multi-segment LED strip (that was the archived approach)
- RMS metering (peak is already exposed)
- Per-oscillator level indicators
- Any DSP or engine changes

## Decisions

**Single LED with continuous color interpolation — over binary clip indicator**

The existing `ClipLed` snaps between two states. `LevelLed` uses CSS `hsl()` interpolation to map a peak value continuously from green (hue 120) through yellow (60) to red (0). This gives the user pre-clip awareness without adding any new UI elements.

Color zones (linear peak scale):
```
0.0 – 0.0 : dark (LED off / very dim)
0.0 – 0.5 : green  (hsl ~120)
0.5 – 0.85: yellow (hsl ~60)
0.85 – 1.0 : orange (hsl ~30)
> 1.0      : red    (hsl 0, latches 1.5 s)
```

Implementation: compute `hue = clamp(120 - peak * 120, 0, 120)` for the 0–1 range; saturate to red on clip. A single `style` binding updates the CSS custom property each rAF frame. The latch logic is identical to the existing `ClipLed`.

**Reuse existing `getPeak` / `powered` prop contract — no API changes**

`LevelLed` accepts the same props as `ClipLed`: `getPeak: () => number` and `powered: boolean`. Drop-in swap in both `Mixer.svelte` and `AmpEnv.svelte` with no prop changes at call sites.

**Delete `ClipLed.svelte` rather than deprecating it**

`ClipLed` is used in only two places and is being fully superseded. Keeping both components in parallel adds maintenance burden without benefit. Both usages are updated in the same PR.

**LED size and shape unchanged**

The visual footprint remains 8×8 px, `border-radius: 50%`. Only the color behavior changes. This avoids any layout reflow in the panel headers.

## Risks / Trade-offs

- [Color perception] Hue-only color mapping may not be distinguishable for users with red-green color deficiency. → Acceptable for now; the clip latch is the primary safety signal and remains red regardless.
- [Peak range above 1.0] `getMixerPeak` can theoretically return up to 4.0 (all sources at unity). Values above 1.0 are clamped to the red/clip state. → No additional color zones needed above the clip threshold.
- [rAF cost unchanged] Polling cadence is identical to the existing `ClipLed`. No new performance concern.
