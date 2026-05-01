/** @param {number} mode */
export function filterGains(mode) {
  return {
    lpGain: Math.max(0, 1 - mode),
    bpGain: Math.max(0, 1 - Math.abs(mode - 1)),
    hpGain: Math.max(0, mode - 1),
  }
}
