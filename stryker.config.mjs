/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  testRunner: 'vitest',
  mutate: [
    'src/audio/math.js',
    'src/audio/filterGains.js',
    'src/audio/keyboard.js',
    'src/audio/midiCcMap.js',
    'src/audio/pitchbend.js',
    'src/audio/wheelPhysics.js',
    'src/audio/wheelPhysicsStore.js',
    'src/patches/storage.js',
    'src/patches/file.js',
    'src/state/synth.svelte.js',
  ],
  vitest: {
    configFile: 'vite.config.js',
  },
  reporters: ['html', 'clear-text', 'progress'],
  coverageAnalysis: 'perTest',
  thresholds: {
    high: 85,
    low: 60,
    break: 50,
  },
  ignorePatterns: ['dist', 'node_modules', '*.svelte'],
}
