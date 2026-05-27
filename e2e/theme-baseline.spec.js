// THROWAWAY refactor gate for the tokenize-chassis-theme change.
// Captures the rendered app at power-off and power-on and asserts the
// post-tokenization render matches the pre-tokenization baseline within a
// small pixel threshold (design D5 / task 6.1). Remove this spec and its
// generated baselines before merge (task 6.5).
//
// The power-on capture needs the FAUST WASM module (run `npm run faust:build`)
// and is skipped without it, mirroring e2e/synth.spec.js's powered gate.
import { test, expect } from '@playwright/test'
import { existsSync } from 'fs'
import { join } from 'path'

const wasmBuilt = !process.env.CI && existsSync(join(process.cwd(), 'public', 'dsp-module.wasm'))

// Freeze animations/transitions so a stable frame is captured (no intermediate
// power-on glow/fade frame). Pairs with toMatchSnapshot's own animation freeze.
const FREEZE_MOTION = `
  *, *::before, *::after {
    transition: none !important;
    animation: none !important;
  }
`

const SNAP_OPTS = { maxDiffPixelRatio: 0.01 }

test.describe('theme tokenization pixel-identity baseline', () => {
  test('power-off render matches baseline', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: /power/i })).toBeVisible()
    await expect(page.locator('.synth')).toHaveClass(/dimmed/)
    await page.addStyleTag({ content: FREEZE_MOTION })
    await page.evaluate(() => document.fonts.ready)
    expect(await page.screenshot({ animations: 'disabled' })).toMatchSnapshot(
      'power-off.png',
      SNAP_OPTS
    )
  })

  test('power-on render matches baseline', async ({ page }) => {
    test.skip(!wasmBuilt, 'Requires WASM build: npm run faust:build')
    await page.goto('/')
    await page.getByRole('button', { name: /power/i }).click()
    await expect(page.locator('.synth')).not.toHaveClass(/dimmed/, { timeout: 5000 })
    await page.addStyleTag({ content: FREEZE_MOTION })
    await page.evaluate(() => document.fonts.ready)
    expect(await page.screenshot({ animations: 'disabled' })).toMatchSnapshot(
      'power-on.png',
      SNAP_OPTS
    )
  })
})
