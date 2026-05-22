// Spring-back physics for the on-screen wheels: a damped-harmonic-oscillator
// integrator that returns a wheel's cursor to its 0.5 rest position with a
// tunable mass-laden feel. Pure math, extracted so Stryker can mutate it
// without crawling the Svelte component that drives it on requestAnimationFrame.
//
// Model (displacement x = value − 0.5, measured from the 0.5 center):
//   a = (−spring·x − c·v) / mass        c = ζ · 2·√(spring·mass)
//   v += a · dt
//   x += v · dt
//   value = clamp(0.5 + x, 0, 1)
//
// ζ (damping *ratio*) keeps the third knob meaningful regardless of mass/spring:
// ζ<1 overshoots and settles, ζ=1 is critical (no overshoot). dt is clamped to a
// safe maximum so the explicit-Euler step stays stable on tab-resume / low FPS.

/** The position both wheels rest at and spring back to. */
export const REST = 0.5

/** Maximum integration step (≈ three dropped frames at 60 Hz), in seconds. */
export const MAX_DT = 0.05

/** Below these magnitudes the cursor is treated as at rest and the loop stops. */
export const REST_VALUE_EPSILON = 0.001
export const REST_VELOCITY_EPSILON = 0.001

/**
 * Allowed range and default for each physics parameter. Ranges bound the
 * discrete Euler step so it cannot go unstable; the ζ lower bound is >0 so the
 * system can never be perfectly undamped (perpetual oscillation).
 */
export const PHYSICS_RANGES = /** @type {const} */ ({
  mass: { min: 0.1, max: 5, default: 1 },
  spring: { min: 1, max: 50, default: 20 },
  damping: { min: 0.05, max: 1, default: 0.3 },
})

/** Default per-wheel physics: underdamped (ζ=0.3) for a pronounced settle. */
export const DEFAULT_PHYSICS = /** @type {const} */ ({
  mass: PHYSICS_RANGES.mass.default,
  spring: PHYSICS_RANGES.spring.default,
  damping: PHYSICS_RANGES.damping.default,
})

/** @param {number} v @param {number} min @param {number} max */
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

/**
 * Advance the damped oscillator one step.
 *
 * @param {{ value: number, velocity: number, mass: number, spring: number, dampingRatio: number, dt: number }} state
 * @returns {{ value: number, velocity: number }} the next value/velocity
 */
export function stepSpring({ value, velocity, mass, spring, dampingRatio, dt }) {
  const step = clamp(dt, 0, MAX_DT)
  // c = ζ · 2·√(k·m): critical damping at ζ=1.
  const c = dampingRatio * 2 * Math.sqrt(spring * mass)
  const x = value - REST
  const a = (-spring * x - c * velocity) / mass
  const nextVelocity = velocity + a * step
  const nextValue = clamp(REST + (x + nextVelocity * step), 0, 1)
  return { value: nextValue, velocity: nextVelocity }
}

/**
 * True once the cursor is within a small threshold of REST with negligible
 * velocity — the loop stops here so a settled wheel emits no further frames.
 *
 * @param {number} value
 * @param {number} velocity
 * @returns {boolean}
 */
export function isAtRest(value, velocity) {
  return Math.abs(value - REST) < REST_VALUE_EPSILON && Math.abs(velocity) < REST_VELOCITY_EPSILON
}
