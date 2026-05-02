import { test, expect } from '@playwright/test'

// Install a fake `requestMIDIAccess` and a `window.__fakeMidi.send(bytes)`
// helper before any page script runs. The fake exposes one connected input
// port whose `onmidimessage` is invoked synchronously when send() is called.
//
// Unlike the powered-audio specs in `synth.spec.js`, MIDI specs run
// unconditionally in CI: they only assert on DOM state and do not depend on
// the AudioWorklet or audio hardware.
test.describe('MIDI E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const port = {
        id: 'fake',
        name: 'Fake MIDI',
        type: 'input',
        state: 'connected',
        onmidimessage: null,
      }
      const access = { inputs: new Map([['fake', port]]), onstatechange: null }
      window.__fakeMidi = {
        port,
        send: (bytes) => port.onmidimessage && port.onmidimessage({ data: new Uint8Array(bytes) }),
      }
      navigator.requestMIDIAccess = async () => access
    })
  })

  test('page mount populates the MIDI status dot to connected', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.midi-status .dot.connected')).toBeVisible({ timeout: 2000 })
  })

  test('synthetic note-on highlights the key and flips status to active', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.midi-status .dot.connected')).toBeVisible({ timeout: 2000 })

    // 0x90 = note-on channel 1, note 60 (C4), velocity 100.
    await page.evaluate(() => window.__fakeMidi.send([0x90, 60, 100]))

    await expect(page.locator('[data-midi="60"].active')).toBeVisible({ timeout: 1000 })
    await expect(page.locator('.midi-status .dot.active')).toBeVisible({ timeout: 1000 })
  })
})
