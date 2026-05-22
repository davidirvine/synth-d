## 1. Rate-limited time slew in the DSP

- [ ] 1.1 Add a `slewStep` constant (delay-samples per audio sample) to the Tape Delay section of `faust/synth.dsp`, with an inline comment noting it is listening-tuned and sets both the glide's bend depth and (with jump size) its duration. Start from a modest estimate.
- [ ] 1.2 Add a rate-limited slew on the base `delayTime` value using a clamped-integrator recursion (`+~`) that moves toward the target by at most `±slewStep` per sample, followed by a light `si.smoo` to round the glide corners. Name the result (e.g. `delayTimeSlewed`).
- [ ] 1.3 Rewrite `tapeTime` to use the slewed time as the base, keeping the wow and `modLfo` terms riding on the slewed value and keeping the existing `min(maxDelayLen-1, max(1, …))` clamp downstream of the slew.
- [ ] 1.4 Validate the DSP compiles: `faust faust/synth.dsp -o /dev/null`. Confirm `build: { minify: false }` is still present in `vite.config.js`.

## 2. Verification against the spec scenarios

- [ ] 2.1 Confirm steady-state equivalence: with `delayTime` held constant, the slewed value equals the raw value (no change to held times, defaults, or saved-patch behaviour).
- [ ] 2.2 Confirm a `delayTime` change while playing with feedback up produces a continuous pitch glide on the repeats with no click/teleport, gliding down as time increases and up as it decreases (spec: "Time change glides smoothly with a tape-style pitch slide").
- [ ] 2.3 Confirm a larger time change glides for proportionally longer at the same peak bend depth as a smaller change (spec: "Larger time changes glide for longer at the same bend depth").
- [ ] 2.4 Confirm the read offset stays within `[1, maxDelayLen-1]` at `delayModDepth` = 0.025 s and `delayTime` = 0.01 s during a slew (spec: "tapeTime remains valid at maximum depth and minimum delay time" still holds).

## 3. Completion gate

- [ ] 3.1 Run the full test suite: `npx vitest run`, `npx stryker run` (mutation ≥ 85%), `npx playwright test`.
- [ ] 3.2 Audio verification by the human: tune `slewStep` by ear so time setting stays responsive while the glide feels musically tape-like; confirm no click at the extremes of the time range.
- [ ] 3.3 Run `/opsx:verify tape-delay-time-glide`, then the roborev refine gate per `CLAUDE.md`.
