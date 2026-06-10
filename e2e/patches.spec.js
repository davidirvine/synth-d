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

  test('save controls are disabled while powered off', async ({ page }) => {
    await page.goto('/')
    await page.locator('.patch-control .trigger').click()
    await expect(page.locator('.name-input')).toBeDisabled()
    await expect(page.locator('.save-btn')).toBeDisabled()
  })

  // Seed two patches so list operations (rename/delete) can be exercised while
  // powered off, where saving is disabled.
  async function seedPatches(/** @type {import('@playwright/test').Page} */ page) {
    await page.addInitScript(() => {
      localStorage.setItem('synth-d:patches', JSON.stringify(['ONE', 'TWO']))
      localStorage.setItem(
        'synth-d:patch:ONE',
        JSON.stringify({ name: 'ONE', version: 1, params: { cutoff: 1000 } })
      )
      localStorage.setItem(
        'synth-d:patch:TWO',
        JSON.stringify({ name: 'TWO', version: 1, params: { cutoff: 2000 } })
      )
    })
  }

  test('rename a saved patch from the list', async ({ page }) => {
    await seedPatches(page)
    await page.goto('/')
    await page.locator('.patch-control .trigger').click()
    await expect(page.locator('.patch-load', { hasText: 'ONE' })).toBeVisible()

    await page.locator('[aria-label="rename ONE"]').click()
    await page.locator('.rename-input').fill('RENAMED')
    await page.locator('[aria-label="confirm rename"]').click()

    await expect(page.locator('.patch-load', { hasText: 'RENAMED' })).toBeVisible()
    await expect(page.locator('.patch-load', { hasText: 'ONE' })).toHaveCount(0)
  })

  test('deleting a patch removes it from the list', async ({ page }) => {
    await seedPatches(page)
    await page.goto('/')
    await page.locator('.patch-control .trigger').click()
    await expect(page.locator('.patch-row')).toHaveCount(2)

    await page.locator('[aria-label="delete ONE"]').click()
    await page.locator('[aria-label="confirm delete"]').click()

    await expect(page.locator('.patch-load', { hasText: 'ONE' })).toHaveCount(0)
    await expect(page.locator('.patch-row')).toHaveCount(1)
  })

  test('a legacy lower-case patch can be deleted from the list', async ({ page }) => {
    // Seed a patch saved before names were normalized to upper-case.
    await page.addInitScript(() => {
      localStorage.setItem('synth-d:patches', JSON.stringify(['my-sound']))
      localStorage.setItem(
        'synth-d:patch:my-sound',
        JSON.stringify({ name: 'my-sound', version: 1, params: { cutoff: 1234 } })
      )
    })
    await page.goto('/')
    await page.locator('.patch-control .trigger').click()
    // Listed under its migrated upper-case name.
    await expect(page.locator('.patch-load', { hasText: 'MY-SOUND' })).toBeVisible()
    await page.locator('[aria-label="delete MY-SOUND"]').click()
    await page.locator('[aria-label="confirm delete"]').click()
    await expect(page.locator('.patch-row')).toHaveCount(0)
    await expect(page.getByText('no patches saved yet')).toBeVisible()
  })

  // Export/import need no audio, so they run powered off (and in CI). Importing
  // is the untrusted-input boundary; these cover the happy round-trip with a
  // collision auto-suffix and a rejection.
  test('export then import round-trips with a collision auto-suffix', async ({ page }) => {
    await seedPatches(page)
    await page.goto('/')
    await page.locator('.patch-control .trigger').click()

    // Load ONE so it becomes the active patch and Export is enabled.
    await page.locator('.patch-load', { hasText: 'ONE' }).click()
    await expect(page.locator('[aria-label="export active patch"]')).toBeEnabled()

    // Export → capture the downloaded file.
    const downloadPromise = page.waitForEvent('download')
    await page.locator('[aria-label="export active patch"]').click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('ONE.json')
    const path = await download.path()

    // Import the same file: its name collides with ONE, so it is auto-suffixed
    // to ONE 2 rather than overwriting the original.
    await page.locator('.file-input').setInputFiles(path)
    await expect(page.locator('.patch-load', { hasText: 'ONE 2' })).toBeVisible()
    // Original ONE and TWO are intact; exactly one new row was added.
    await expect(page.locator('.patch-row')).toHaveCount(3)
  })

  test('importing an invalid file shows a reason and adds no patch', async ({ page }) => {
    await page.goto('/')
    await page.locator('.patch-control .trigger').click()
    await expect(page.getByText('no patches saved yet')).toBeVisible()

    // A non-JSON file is rejected by the structural gate; the reason surfaces in
    // the popover and nothing is stored.
    await page.locator('.file-input').setInputFiles({
      name: 'bad.json',
      mimeType: 'application/json',
      buffer: Buffer.from('this is not valid json'),
    })
    await expect(page.locator('.popover .error')).toContainText(/json/i)
    await expect(page.locator('.patch-row')).toHaveCount(0)
    await expect(page.getByText('no patches saved yet')).toBeVisible()
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
      // Type lower-case to exercise normalization; the stored/listed name is upper-cased.
      await page.locator('.name-input').fill('my-sound')
      await page.locator('.save-btn').click()
      await expect(page.locator('.patch-load', { hasText: 'MY-SOUND' })).toBeVisible()

      // Reload — the patch persists in localStorage; the synth boots to factory
      // defaults until a patch is applied.
      await page.reload()
      await page.getByRole('button', { name: /power/i }).click()
      await expect(page.locator('.synth')).not.toHaveClass(/dimmed/, { timeout: 5000 })
      await expect(page.locator('.glide-btn')).toContainText('off')
      await expect(page.locator('.noise-btn', { hasText: 'pink' })).not.toHaveClass(/active/)

      // Load the saved patch — tweaked params are restored.
      await page.locator('.patch-control .trigger').click()
      await page.locator('.patch-load', { hasText: 'MY-SOUND' }).click()
      await expect(page.locator('.glide-btn')).toContainText('on')
      await expect(page.locator('.noise-btn', { hasText: 'pink' })).toHaveClass(/active/)
    })
  })
})
