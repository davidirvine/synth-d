## 1. Rate-limited time slew in the DSP

- [x] 1.1 Add a `slewStep` constant (delay-samples per audio sample) to the Tape Delay section of `faust/synth.dsp`, with an inline comment noting it is listening-tuned and sets both the glide's bend depth and (with jump size) its duration. Start from a modest estimate.
- [x] 1.2 Add a rate-limited slew operating in the sample domain on `delayTime * ma.SR`, using the concrete FAUST feedback expression from Design Decision 3 — `rateLimit(prev, target) = prev + max(-slewStep, min(slewStep, target - prev))` curried via `(rateLimit ~ _)` so the delayed output feeds back into the **first** (`prev`) input — followed by a light `si.smoo` to round the glide corners. Verify the `~` routing feeds back into `prev`, not `target` (wrong routing means no slew or divergence). Name the result `tapeTimeSlewed`.
- [x] 1.3 Rewrite `tapeTime` to use the slewed sample-domain value as the base, keeping the wow and `modLfo` terms riding on the slewed value and keeping the existing `min(maxDelayLen-1, max(1, …))` clamp downstream of the slew.
- [x] 1.4 Validate the DSP compiles: `faust faust/synth.dsp -o /dev/null`. Confirm `build: { minify: false }` is still present in `vite.config.js`.

## 2. Verification against the spec scenarios

- [x] 2.1 Confirm steady-state equivalence: with `delayTime` held constant, the slewed value equals the raw value (no change to held times, defaults, or saved-patch behaviour).
- [x] 2.2 By inspecting the DSP signal flow (not by listening — the ear-test is 3.2), confirm the slew structure yields a continuous read offset with no discontinuity on a `delayTime` step, so the repeats glide rather than teleport, with glide direction following the time change (spec: "Time change glides smoothly with a tape-style pitch slide").
- [ ] 2.3 By inspecting the DSP, confirm the fixed `±slewStep` clamp makes peak bend depth independent of jump size while glide duration scales as `Δsamples / slewStep` (spec: "Larger time changes glide for longer at the same bend depth").
- [ ] 2.4 Confirm the read offset stays within `[1, maxDelayLen-1]` at `delayModDepth` = 0.025 s and `delayTime` = 0.01 s during a slew (spec: "tapeTime remains valid at maximum depth and minimum delay time" still holds).

## 3. Completion gate

- [ ] 3.1 Run the full test suite: `npx vitest run`, `npx stryker run` (mutation ≥ 85%), `npx playwright test`.
- [ ] 3.2 Audio verification by the human: tune `slewStep` by ear so time setting stays responsive while the glide feels musically tape-like; confirm no click at the extremes of the time range.
- [ ] 3.3 Run `/opsx:verify tape-delay-time-glide`, then the roborev refine gate per `CLAUDE.md`.
