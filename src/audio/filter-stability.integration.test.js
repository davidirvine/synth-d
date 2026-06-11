// @ts-nocheck — uses Node.js built-ins (fs, path, url) not covered without @types/node
import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WASM_PATH = resolve(__dirname, '../../public/dsp-module.wasm')
const META_PATH = resolve(__dirname, '../../public/dsp-meta.json')

const wasmAvailable = existsSync(WASM_PATH) && existsSync(META_PATH)

describe.skipIf(!wasmAvailable)('filter stability — offline WASM integration', () => {
  it('produces finite samples ≤ 1.0 at cutoffMod=18000, res=0.97', async () => {
    const { FaustWasmInstantiator, FaustMonoWebAudioDsp, FaustMonoOfflineProcessor } =
      await import('../../public/faustwasm/index.js')

    const wasmBuffer = readFileSync(WASM_PATH)
    const json = readFileSync(META_PATH, 'utf-8')
    const meta = JSON.parse(json)

    const module = await WebAssembly.compile(wasmBuffer)
    const factory = { cfactory: 0, code: new Uint8Array(wasmBuffer), module, json, poly: false }

    const instance = await FaustWasmInstantiator.createAsyncMonoDSPInstance(factory)
    const sampleSize = meta.compile_options.match('-double') ? 8 : 4
    const sampleRate = 48000
    const bufferSize = 512

    const dsp = new FaustMonoWebAudioDsp(instance, sampleRate, sampleSize, bufferSize, {})
    const processor = new FaustMonoOfflineProcessor(dsp, bufferSize)

    // Set extreme parameters: cutoff at the 18 kHz ceiling, resonance at 0.97 (the resonanceSafe
    // stability ceiling — reached in full, not clamped down). These were the values that caused NaN
    // with ve.moog_vcf; this exercises the spec's "filter stays stable at the resonance ceiling" case.
    dsp.setParamValue('/synth/cutoff', 18000)
    dsp.setParamValue('/synth/resonance', 0.97)
    dsp.setParamValue('/synth/gate', 1)

    // Feed an impulse into the DSP and render four buffer-lengths of output.
    const impulse = new Float32Array(bufferSize)
    impulse[0] = 1.0
    const outputs = processor.render([impulse], bufferSize * 4)

    for (const channel of outputs) {
      for (const s of channel) {
        expect(Number.isFinite(s), `non-finite sample: ${s}`).toBe(true)
        expect(Math.abs(s), `sample out of range: ${s}`).toBeLessThanOrEqual(1.0)
      }
    }
  })
})
