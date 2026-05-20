import { test, expect } from '@playwright/test'
import { existsSync } from 'fs'
import { join } from 'path'

// Mirrors e2e/synth.spec.js: powered interactions need the FAUST WASM build and
// real audio, so they are skipped in CI and when the WASM artifact is absent.
const wasmBuilt = !process.env.CI && existsSync(join(process.cwd(), 'public', 'dsp-module.wasm'))

test.describe('Patch save/load', () => {
  test('patch control is usable while powered off', async ({ page }) => {
    await page.goto('/')
    // The synth is dimmed/inert while off, but the header patch control still works.
    await expect(page.locator('.synth')).toHaveClass(/dimmed/)
    await page.locator('.patch-control .trigger').click()
    await expect(page.locator('.popover')).toBeVisible()
    await expect(page.getByText('no patches saved yet')).toBeVisible()
  })

  test('saving while powered off adds the patch to the list', async ({ page }) => {
    await page.goto('/')
    await page.locator('.patch-control .trigger').click()
    await page.locator('.name-input').fill('off-patch')
    await page.locator('.save-btn').click()
    await expect(page.locator('.patch-load', { hasText: 'off-patch' })).toBeVisible()
  })

  test.describe('powered round-trip (requires WASM)', () => {
    test.skip(!wasmBuilt, 'Requires WASM build: npm run faust:build')

    test('typing in the patch name field does not trigger keyboard notes', async ({ page }) => {
      await page.goto('/')
      await page.getByRole('button', { name: /power/i }).click()
      await expect(page.locator('.synth')).not.toHaveClass(/dimmed/, { timeout: 5000 })

      await page.locator('.patch-control .trigger').click()
      // "asdf" maps to QWERTY note keys; typing them in the field must not play.
      await page.locator('.name-input').fill('asdf')
      await expect(page.locator('.name-input')).toHaveValue('asdf')
      expect(await page.locator('.white-key.active, .black-key.active').count()).toBe(0)
    })

    test('power on → tweak → save → reload → load restores the tweaked params', async ({
      page,
    }) => {
      await page.goto('/')
      await page.getByRole('button', { name: /power/i }).click()
      await expect(page.locator('.synth')).not.toHaveClass(/dimmed/, { timeout: 5000 })

      // Tweak two discrete params so restoration is easy to assert by class/text.
      const glideBtn = page.locator('.glide-btn')
      await glideBtn.click()
      await expect(glideBtn).toContainText('on')
      const pinkBtn = page.locator('.noise-btn', { hasText: 'pink' })
      await pinkBtn.click()
      await expect(pinkBtn).toHaveClass(/active/)

      // Save under a name.
      await page.locator('.patch-control .trigger').click()
      await page.locator('.name-input').fill('my-sound')
      await page.locator('.save-btn').click()
      await expect(page.locator('.patch-load', { hasText: 'my-sound' })).toBeVisible()

      // Reload — the patch persists in localStorage; the synth boots to factory
      // defaults until a patch is applied.
      await page.reload()
      await page.getByRole('button', { name: /power/i }).click()
      await expect(page.locator('.synth')).not.toHaveClass(/dimmed/, { timeout: 5000 })
      await expect(page.locator('.glide-btn')).toContainText('off')
      await expect(page.locator('.noise-btn', { hasText: 'pink' })).not.toHaveClass(/active/)

      // Load the saved patch — tweaked params are restored.
      await page.locator('.patch-control .trigger').click()
      await page.locator('.patch-load', { hasText: 'my-sound' }).click()
      await expect(page.locator('.glide-btn')).toContainText('on')
      await expect(page.locator('.noise-btn', { hasText: 'pink' })).toHaveClass(/active/)
    })
  })
})
